import { framer, CanvasNode } from "framer-plugin"
import { useState, useEffect } from "react"
import "./App.css"
import { GoogleGenerativeAI } from "@google/generative-ai"

framer.showUI({
    position: "top right",
    width: 300,
    height: 360,
})

function useSelection() {
    const [selection, setSelection] = useState<CanvasNode[]>([])

    useEffect(() => {
        return framer.subscribeToSelection(setSelection)
    }, [])

    return selection
}

export function App() {
    const selection = useSelection()
    const [topic, setTopic] = useState("")
    const [apiKey, setApiKey] = useState("")
    const [contentLength, setContentLength] = useState(500)
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedText, setGeneratedText] = useState("")
    const [error, setError] = useState("")
    const [copySuccess, setCopySuccess] = useState(false)
    
    const generateContent = async () => {
        if (!topic || !apiKey) {
            setError("Please provide both a topic and API key")
            return
        }
        
        setError("")
        setIsGenerating(true)
        
        try {
            const genAI = new GoogleGenerativeAI(apiKey)
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })
            
            const prompt = `Generate ${contentLength} words of well-formatted text about: ${topic}`
            
            const result = await model.generateContent(prompt)
            const text = result.response.text()
            setGeneratedText(text)
        } catch (err) {
            console.error(err)
            setError("Failed to generate content. Please check your API key.")
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
    
    return (
        <main>
            <h2>AI Text Generator</h2>
            
            <div className="form-group">
                <label htmlFor="apiKey">Gemini API Key</label>
                <input
                    type="password"
                    id="apiKey"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key"
                />
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
