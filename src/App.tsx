import { framer } from "framer-plugin"
import { useState, useEffect } from "react"
import "./styles/index.css"
import { AIProvider } from "./types"
import { AI_PROVIDERS } from "./constants/providers"
import { useSelection, useTheme } from "./hooks"
import { Header, TextGeneratorForm, TextOutput } from "./components"
import { aiService } from "./services"

// Configure UI dimensions
framer.showUI({
    position: "top right",
    width: 300,
    height: 420,
})

// Main App Component
export function App() {
    // Hooks
    const selection = useSelection()
    const { theme, toggleTheme } = useTheme()
    
    // State
    const [topic, setTopic] = useState("")
    const [provider, setProvider] = useState<AIProvider>("gemini")
    const [model, setModel] = useState(AI_PROVIDERS.gemini.defaultModel)
    const [apiKey, setApiKey] = useState("")
    const [contentLength, setContentLength] = useState(500)
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedText, setGeneratedText] = useState("")
    const [error, setError] = useState("")
    const [copySuccess, setCopySuccess] = useState(false)
    const [saveKeyEnabled, setSaveKeyEnabled] = useState(false)
    
    // Load saved API keys on initialization
    useEffect(() => {
        try {
            const savedKeys = JSON.parse(localStorage.getItem('aiTextGenKeys') || '{}')
            if (savedKeys[provider]) {
                setApiKey(savedKeys[provider])
            }
            
            // Check if user enabled saving keys
            const saveEnabled = localStorage.getItem('saveKeysEnabled')
            setSaveKeyEnabled(saveEnabled === 'true')
        } catch (err) {
            console.error("Error loading saved API keys:", err)
        }
    }, [provider])
    
    // Update model when provider changes
    useEffect(() => {
        setModel(AI_PROVIDERS[provider].defaultModel)
        
        // Load the saved API key for this provider if available
        try {
            const savedKeys = JSON.parse(localStorage.getItem('aiTextGenKeys') || '{}')
            if (savedKeys[provider]) {
                setApiKey(savedKeys[provider])
            } else {
                setApiKey("") // Clear API key if none saved for this provider
            }
        } catch (err) {
            console.error("Error loading saved API key for provider:", err)
        }
    }, [provider])
    
    // Save API key
    const saveApiKey = (key = apiKey) => {
        try {
            const savedKeys = JSON.parse(localStorage.getItem('aiTextGenKeys') || '{}')
            savedKeys[provider] = key
            localStorage.setItem('aiTextGenKeys', JSON.stringify(savedKeys))
        } catch (err) {
            console.error("Error saving API key:", err)
        }
    }
    
    // Generate content based on selected provider
    const generateContent = async () => {
        if (!apiKey || !topic) return
        
        setIsGenerating(true)
        setError("")
        setGeneratedText("")
        setCopySuccess(false)
        
        try {
            // Create a contextualized prompt based on user input
            const prompt = `Write some engaging text about ${topic}. The text should be approximately ${contentLength} characters long.`
            
            let result = ""
            
            // Call the appropriate API based on selected provider
            switch (provider) {
                case "gemini":
                    result = await aiService.generateWithGemini(apiKey, model, prompt, contentLength)
                    break
                case "openai":
                    result = await aiService.generateWithOpenAI(apiKey, model, prompt, contentLength)
                    break
                case "anthropic":
                    result = await aiService.generateWithAnthropic(apiKey, model, prompt, contentLength)
                    break
                case "grok":
                    result = await aiService.generateWithGrok(apiKey, model, prompt, contentLength)
                    break
                default:
                    throw new Error("Invalid provider selected")
            }
            
            setGeneratedText(result.trim())
        } catch (err: any) {
            console.error("Error generating content:", err)
            setError(err.message || "Failed to generate content")
        } finally {
            setIsGenerating(false)
        }
    }
    
    // Copy generated text to clipboard
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(generatedText)
            setCopySuccess(true)
            
            // Reset copy success message after 2 seconds
            setTimeout(() => {
                setCopySuccess(false)
            }, 2000)
        } catch (err) {
            console.error("Failed to copy text:", err)
            setError("Failed to copy text to clipboard")
        }
    }
    
    // Add text to selected Framer elements
    const addToDesign = async () => {
        try {
            if (!generatedText) {
                throw new Error("No generated text to add")
            }
            
            if (selection.length === 0) {
                // If no elements are selected, create a new text element
                await framer.addText(generatedText)
                setError("")
                return
            }
            
            // Update each selected node that supports text
            let updatedCount = 0
            
            for (const node of selection) {
                // Check if the node has a text property using type assertion
                const nodeWithText = node as any
                if (typeof nodeWithText.text === "string" || typeof nodeWithText.text === "function") {
                    // Update the text property
                    nodeWithText.text = generatedText
                    updatedCount++
                }
            }
            
            if (updatedCount === 0) {
                // If no text elements were updated, create a new text element
                await framer.addText(generatedText)
            }
            
            setError("")
        } catch (err: any) {
            console.error("Error adding text to design:", err)
            setError(err.message || "Failed to add text to design")
            
            // Fallback to clipboard if adding to design fails
            try {
                await navigator.clipboard.writeText(generatedText)
                setError("Couldn't add text directly. Text copied to clipboard instead.")
            } catch (clipErr) {
                console.error("Clipboard fallback failed:", clipErr)
            }
        }
    }
    
    return (
        <main className={`theme-${theme}`}>
            <Header theme={theme} toggleTheme={toggleTheme} />
            
            <TextGeneratorForm
                topic={topic}
                setTopic={setTopic}
                provider={provider}
                setProvider={setProvider}
                model={model}
                setModel={setModel}
                apiKey={apiKey}
                setApiKey={setApiKey}
                contentLength={contentLength}
                setContentLength={setContentLength}
                saveKeyEnabled={saveKeyEnabled}
                setSaveKeyEnabled={setSaveKeyEnabled}
                saveApiKey={saveApiKey}
                isGenerating={isGenerating}
                generateContent={generateContent}
            />
            
            <TextOutput
                generatedText={generatedText}
                error={error}
                copySuccess={copySuccess}
                copyToClipboard={copyToClipboard}
                addToDesign={addToDesign}
            />
            
            {provider === "grok" && (
                <div className="provider-note">
                    Grok API support is experimental and may change.
                </div>
            )}
        </main>
    )
}
