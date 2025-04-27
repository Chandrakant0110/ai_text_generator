import { framer, CanvasNode } from "framer-plugin"
import { useState, useEffect } from "react"
import "./App.css"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Configure UI dimensions
framer.showUI({
    position: "top right",
    width: 300,
    height: 420,
})

// Types and Interfaces
type AIProvider = "gemini" | "openai" | "anthropic" | "grok"
type Theme = "light" | "dark"

interface AIProviderConfig {
    name: string
    apiKeyPlaceholder: string
    modelOptions: string[]
    defaultModel: string
}

// Constants
const AI_PROVIDERS: Record<AIProvider, AIProviderConfig> = {
    gemini: {
        name: "Google Gemini",
        apiKeyPlaceholder: "Enter Gemini API key",
        modelOptions: ["gemini-1.5-pro", "gemini-1.5-flash"],
        defaultModel: "gemini-1.5-pro"
    },
    openai: {
        name: "OpenAI",
        apiKeyPlaceholder: "Enter OpenAI API key",
        modelOptions: ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"],
        defaultModel: "gpt-4o"
    },
    anthropic: {
        name: "Anthropic",
        apiKeyPlaceholder: "Enter Anthropic API key",
        modelOptions: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
        defaultModel: "claude-3-opus"
    },
    grok: {
        name: "Grok",
        apiKeyPlaceholder: "Enter Grok API key",
        modelOptions: ["grok-1"],
        defaultModel: "grok-1"
    }
}

// Custom Hooks
function useSelection() {
    const [selection, setSelection] = useState<CanvasNode[]>([])

    useEffect(() => {
        return framer.subscribeToSelection(setSelection)
    }, [])

    return selection
}

function useTheme() {
    const [theme, setTheme] = useState<Theme>(() => {
        // First check if there's a saved theme preference
        const savedTheme = localStorage.getItem('aiTextGenTheme')
        if (savedTheme === 'dark' || savedTheme === 'light') {
            return savedTheme
        }
        
        // Then check system preference
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    })
    
    // Save theme preference whenever it changes
    useEffect(() => {
        localStorage.setItem('aiTextGenTheme', theme)
    }, [theme])
    
    // Add listener for theme changes from system if user hasn't set a preference
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = (e: MediaQueryListEvent) => {
            // Only update if the user hasn't explicitly set a preference
            const savedTheme = localStorage.getItem('aiTextGenTheme')
            if (!savedTheme) {
                setTheme(e.matches ? 'dark' : 'light')
            }
        }
        
        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [])
    
    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light')
    }
    
    return { theme, toggleTheme }
}

// API Service Functions
const aiService = {
    // Generate with Google Gemini
    generateWithGemini: async (apiKey: string, model: string, prompt: string, maxTokens: number): Promise<string> => {
        const genAI = new GoogleGenerativeAI(apiKey)
        const genModel = genAI.getGenerativeModel({ model })
        const result = await genModel.generateContent(prompt)
        return result.response.text()
    },
    
    // Generate with OpenAI
    generateWithOpenAI: async (apiKey: string, model: string, prompt: string, maxTokens: number): Promise<string> => {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model,
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                max_tokens: maxTokens
            })
        })
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: { message: `HTTP error: ${response.status}` } }))
            throw new Error(errorData.error?.message || `OpenAI API error: ${response.status}`)
        }
        
        const data = await response.json()
        return data.choices[0].message.content
    },
    
    // Generate with Anthropic
    generateWithAnthropic: async (apiKey: string, model: string, prompt: string, maxTokens: number): Promise<string> => {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01"
            },
            body: JSON.stringify({
                model,
                max_tokens: maxTokens,
                messages: [{ role: "user", content: prompt }]
            })
        })
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: { message: `HTTP error: ${response.status}` } }))
            throw new Error(errorData.error?.message || `Anthropic API error: ${response.status}`)
        }
        
        const data = await response.json()
        if (!data.content || !data.content[0] || !data.content[0].text) {
            throw new Error("Unexpected response format from Anthropic API")
        }
        return data.content[0].text
    },
    
    // Generate with Grok (using xAI API)
    generateWithGrok: async (apiKey: string, model: string, prompt: string, maxTokens: number): Promise<string> => {
        // Note: As of writing, Grok's public API format isn't fully documented
        // This implementation is based on a similar structure to OpenAI's API
        const response = await fetch("https://api.grok.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model,
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                max_tokens: maxTokens
            })
        })
        
        // Grok API might return a different response format
        // This is a fallback implementation based on common patterns
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: { message: `HTTP error: ${response.status}` } }))
            throw new Error(errorData.error?.message || `Grok API error: ${response.status}`)
        }
        
        try {
            const data = await response.json()
            // Try different response formats
            if (data.choices && data.choices[0]?.message?.content) {
                return data.choices[0].message.content
            } else if (data.completion) {
                return data.completion
            } else if (data.output) {
                return data.output
            } else {
                throw new Error("Unexpected response format from Grok API")
            }
        } catch (err) {
            console.error("Error parsing Grok response:", err)
            throw new Error("Failed to parse response from Grok API")
        }
    }
}

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
    
    // Apply theme class to body
    useEffect(() => {
        document.body.classList.remove('theme-light', 'theme-dark')
        document.body.classList.add(`theme-${theme}`)
    }, [theme])
    
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
                setApiKey("")
            }
        } catch (err) {
            console.error("Error loading saved API key for provider:", err)
        }
    }, [provider])
    
    // Event Handlers
    const handleSaveKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isEnabled = e.target.checked
        setSaveKeyEnabled(isEnabled)
        localStorage.setItem('saveKeysEnabled', isEnabled ? 'true' : 'false')
        
        if (isEnabled && apiKey) {
            saveApiKey()
        }
    }
    
    const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newKey = e.target.value
        setApiKey(newKey)
        
        // Save if user has enabled saving keys
        if (saveKeyEnabled && newKey) {
            saveApiKey(newKey)
        }
    }
    
    // Helper Functions
    const saveApiKey = (key = apiKey) => {
        try {
            const savedKeys = JSON.parse(localStorage.getItem('aiTextGenKeys') || '{}')
            savedKeys[provider] = key
            localStorage.setItem('aiTextGenKeys', JSON.stringify(savedKeys))
        } catch (err) {
            console.error("Error saving API key:", err)
        }
    }
    
    // Core Functionality
    const generateContent = async () => {
        if (!topic || !apiKey) {
            setError("Please provide both a topic and API key")
            return
        }
        
        setError("")
        setIsGenerating(true)
        
        try {
            let text = ""
            const prompt = `Generate ${contentLength} words of well-formatted text about: ${topic}`
            const maxTokens = contentLength * 4 // Approximation of tokens needed for the word count
            
            // Generate content based on selected provider
            switch (provider) {
                case "gemini":
                    text = await aiService.generateWithGemini(apiKey, model, prompt, maxTokens)
                    break
                case "openai":
                    text = await aiService.generateWithOpenAI(apiKey, model, prompt, maxTokens)
                    break
                case "anthropic":
                    text = await aiService.generateWithAnthropic(apiKey, model, prompt, maxTokens)
                    break
                case "grok":
                    text = await aiService.generateWithGrok(apiKey, model, prompt, maxTokens)
                    break
                default:
                    throw new Error("Unsupported AI provider")
            }
            
            setGeneratedText(text)
        } catch (err) {
            console.error(err)
            setError(`Failed to generate content. Please check your ${AI_PROVIDERS[provider].name} API key.`)
        } finally {
            setIsGenerating(false)
        }
    }
    
    const copyToClipboard = async () => {
        if (!generatedText) {
            setError("Please generate content first")
            return
        }
        
        try {
            await navigator.clipboard.writeText(generatedText)
            setCopySuccess(true)
            setError("")
            
            // Reset the copy success message after 2 seconds
            setTimeout(() => {
                setCopySuccess(false)
            }, 2000)
        } catch (err) {
            console.error("Error copying to clipboard:", err)
            setError("Failed to copy to clipboard")
            setCopySuccess(false)
        }
    }
    
    const addToDesign = async () => {
        if (!generatedText) {
            setError("Please generate content first")
            return
        }
        
        console.log("Attempting to add text to design:", generatedText.substring(0, 30) + "...")
        
        try {
            // Simply add text to the design, this will create a new text element
            await framer.addText(generatedText)
            
            // Show success message
            console.log("Successfully added text to design")
            setError("")
            
        } catch (err) {
            console.error("Error adding text to design:", err)
            setError("Failed to add text to design: " + (err instanceof Error ? err.message : String(err)))
            
            // Add a convenience function to copy text to clipboard
            try {
                await navigator.clipboard.writeText(generatedText)
                console.log("Copied text to clipboard")
                setError("Could not add text directly. Text has been copied to clipboard - create a text element and paste.")
            } catch (clipboardErr) {
                console.error("Could not copy to clipboard:", clipboardErr)
            }
        }
    }
    
    // Render
    return (
        <main className={`theme-${theme}`}>
            <div className="header">
                <h2>AI Text Generator</h2>
                <button 
                    className="theme-toggle" 
                    onClick={toggleTheme}
                    title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>
            </div>
            
            <div className="form-group">
                <label htmlFor="provider">AI Provider</label>
                <select
                    id="provider"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value as AIProvider)}
                    className="select-input"
                >
                    {Object.entries(AI_PROVIDERS).map(([key, value]) => (
                        <option key={key} value={key}>{value.name}</option>
                    ))}
                </select>
            </div>
            
            <div className="form-group">
                <label htmlFor="model">Model</label>
                <select
                    id="model"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="select-input"
                >
                    {AI_PROVIDERS[provider].modelOptions.map((modelOption) => (
                        <option key={modelOption} value={modelOption}>{modelOption}</option>
                    ))}
                </select>
            </div>
            
            <div className="form-group">
                <label htmlFor="apiKey">{AI_PROVIDERS[provider].name} API Key</label>
                <input
                    type="password"
                    id="apiKey"
                    value={apiKey}
                    onChange={handleApiKeyChange}
                    placeholder={AI_PROVIDERS[provider].apiKeyPlaceholder}
                />
                <div className="checkbox-container">
                    <input
                        type="checkbox"
                        id="saveKey"
                        checked={saveKeyEnabled}
                        onChange={handleSaveKeyChange}
                    />
                    <label htmlFor="saveKey" className="checkbox-label">
                        Save API key (stored in browser)
                    </label>
                </div>
            </div>
            
            <div className="form-group">
                <label htmlFor="topic">Topic</label>
                <input
                    type="text"
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter a topic"
                />
            </div>
            
            <div className="form-group">
                <label htmlFor="contentLength">
                    Content Length: {contentLength} words
                </label>
                <input
                    type="range"
                    id="contentLength"
                    min="200"
                    max="1000"
                    step="50"
                    value={contentLength}
                    onChange={(e) => setContentLength(parseInt(e.target.value))}
                />
            </div>
            
            {error && <div className="error">{error}</div>}
            {copySuccess && <div className="success">Copied to clipboard!</div>}
            
            <div className="button-group">
                <button 
                    className="framer-button-primary"
                    onClick={generateContent}
                    disabled={isGenerating}
                >
                    {isGenerating ? "Generating..." : "Generate Content"}
                </button>
                
                {generatedText && (
                    <>
                        <button 
                            className="framer-button-secondary"
                            onClick={copyToClipboard}
                        >
                            Copy to Clipboard
                        </button>
                        
                        <button 
                            className="framer-button-secondary"
                            onClick={addToDesign}
                        >
                            Add to Design
                        </button>
                    </>
                )}
            </div>
            
            {generatedText && (
                <div className="preview">
                    <h3>Preview</h3>
                    <div className="text-preview">{generatedText.substring(0, 100)}...</div>
                </div>
            )}
        </main>
    )
}
