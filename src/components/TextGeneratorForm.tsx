import React from 'react'
import { ProviderSelector } from './ProviderSelector'
import { ModelSelector } from './ModelSelector'
import { ApiKeyInput } from './ApiKeyInput'
import { AIProvider } from '../types'

interface TextGeneratorFormProps {
    topic: string
    setTopic: (topic: string) => void
    provider: AIProvider
    setProvider: (provider: AIProvider) => void
    model: string
    setModel: (model: string) => void
    apiKey: string
    setApiKey: (apiKey: string) => void
    contentLength: number
    setContentLength: (contentLength: number) => void
    saveKeyEnabled: boolean
    setSaveKeyEnabled: (saveKeyEnabled: boolean) => void
    saveApiKey: (apiKey?: string) => void
    isGenerating: boolean
    generateContent: () => Promise<void>
}

export const TextGeneratorForm: React.FC<TextGeneratorFormProps> = ({
    topic,
    setTopic,
    provider,
    setProvider,
    model,
    setModel,
    apiKey,
    setApiKey,
    contentLength,
    setContentLength,
    saveKeyEnabled,
    setSaveKeyEnabled,
    saveApiKey,
    isGenerating,
    generateContent
}) => {
    return (
        <>
            <div className="form-group">
                <label htmlFor="topic-input">Topic or Prompt</label>
                <input
                    id="topic-input"
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter a topic for text generation"
                />
            </div>
            
            <ProviderSelector 
                provider={provider}
                setProvider={setProvider}
            />
            
            <ModelSelector 
                provider={provider}
                model={model}
                setModel={setModel}
            />
            
            <ApiKeyInput 
                provider={provider}
                apiKey={apiKey}
                setApiKey={setApiKey}
                saveKeyEnabled={saveKeyEnabled}
                setSaveKeyEnabled={setSaveKeyEnabled}
                saveApiKey={saveApiKey}
            />
            
            <div className="form-group">
                <label htmlFor="length-slider">Content Length ({contentLength} characters)</label>
                <input
                    id="length-slider"
                    type="range"
                    min="100"
                    max="1000"
                    step="50"
                    value={contentLength}
                    onChange={(e) => setContentLength(parseInt(e.target.value))}
                />
            </div>
            
            <button
                className="framer-button-primary"
                onClick={generateContent}
                disabled={!apiKey || !topic || isGenerating}
            >
                {isGenerating ? "Generating..." : "Generate Text"}
            </button>
        </>
    )
} 