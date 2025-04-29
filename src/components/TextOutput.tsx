import React from 'react'

interface TextOutputProps {
    generatedText: string
    error: string
    copySuccess: boolean
    copyToClipboard: () => Promise<void>
    addToDesign: () => Promise<void>
}

export const TextOutput: React.FC<TextOutputProps> = ({
    generatedText,
    error,
    copySuccess,
    copyToClipboard,
    addToDesign
}) => {
    if (!generatedText && !error) {
        return null
    }

    return (
        <div className="preview">
            {error && <div className="error">{error}</div>}
            
            {generatedText && (
                <>
                    <h3>Generated Text</h3>
                    <div className="text-preview">{generatedText}</div>
                    
                    <div className="button-group">
                        <button
                            className="framer-button-secondary"
                            onClick={copyToClipboard}
                        >
                            {copySuccess ? "Copied!" : "Copy to Clipboard"}
                        </button>
                        <button
                            className="framer-button-primary"
                            onClick={addToDesign}
                        >
                            Add to Design
                        </button>
                    </div>
                </>
            )}
        </div>
    )
} 