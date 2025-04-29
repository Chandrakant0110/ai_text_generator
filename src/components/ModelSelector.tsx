import React from 'react'
import { AIProvider } from '../types'
import { AI_PROVIDERS } from '../constants/providers'

interface ModelSelectorProps {
    provider: AIProvider
    model: string
    setModel: (model: string) => void
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ 
    provider, 
    model, 
    setModel 
}) => {
    const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setModel(e.target.value)
    }

    return (
        <div className="form-group">
            <label htmlFor="model-select">Model</label>
            <select 
                id="model-select"
                className="select-input"
                value={model}
                onChange={handleModelChange}
            >
                {AI_PROVIDERS[provider].modelOptions.map((modelOption) => (
                    <option key={modelOption} value={modelOption}>{modelOption}</option>
                ))}
            </select>
        </div>
    )
} 