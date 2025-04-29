import React from 'react'
import { AIProvider } from '../types'
import { AI_PROVIDERS } from '../constants/providers'

interface ProviderSelectorProps {
    provider: AIProvider
    setProvider: (provider: AIProvider) => void
}

export const ProviderSelector: React.FC<ProviderSelectorProps> = ({ 
    provider, 
    setProvider 
}) => {
    const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setProvider(e.target.value as AIProvider)
    }

    return (
        <div className="form-group">
            <label htmlFor="provider-select">AI Provider</label>
            <select 
                id="provider-select"
                className="select-input"
                value={provider}
                onChange={handleProviderChange}
            >
                {Object.entries(AI_PROVIDERS).map(([key, value]) => (
                    <option key={key} value={key}>{value.name}</option>
                ))}
            </select>
        </div>
    )
} 