import React from 'react'
import { AIProvider } from '../types'
import { AI_PROVIDERS } from '../constants/providers'

interface ApiKeyInputProps {
    provider: AIProvider
    apiKey: string
    setApiKey: (apiKey: string) => void
    saveKeyEnabled: boolean
    setSaveKeyEnabled: (saveKeyEnabled: boolean) => void
    saveApiKey: (apiKey?: string) => void
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ 
    provider, 
    apiKey, 
    setApiKey,
    saveKeyEnabled,
    setSaveKeyEnabled,
    saveApiKey
}) => {
    const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newKey = e.target.value
        setApiKey(newKey)
        
        // If save key is enabled, save the API key whenever it changes
        if (saveKeyEnabled && newKey) {
            saveApiKey(newKey)
        }
    }
    
    const handleSaveKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked
        setSaveKeyEnabled(isChecked)
        localStorage.setItem('saveKeysEnabled', isChecked.toString())
        
        // If enabled and we have an API key, save it
        if (isChecked && apiKey) {
            saveApiKey()
        }
    }

    return (
        <div className="form-group">
            <label htmlFor="api-key-input">API Key</label>
            <input
                id="api-key-input"
                type="password"
                value={apiKey}
                onChange={handleApiKeyChange}
                placeholder={AI_PROVIDERS[provider].apiKeyPlaceholder}
            />
            <div className="checkbox-container">
                <input
                    id="save-key-checkbox"
                    type="checkbox"
                    checked={saveKeyEnabled}
                    onChange={handleSaveKeyChange}
                />
                <label htmlFor="save-key-checkbox" className="checkbox-label">
                    Save API key in browser (not secure)
                </label>
            </div>
        </div>
    )
} 