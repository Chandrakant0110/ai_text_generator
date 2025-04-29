import { AIProvider, AIProviderConfig } from '../types'

export const AI_PROVIDERS: Record<AIProvider, AIProviderConfig> = {
    gemini: {
        name: "Google Gemini",
        apiKeyPlaceholder: "Enter Gemini API key",
        modelOptions: ["gemini-1.5-pro", "gemini-1.5-flash","gemini-2.0-flash"],
        defaultModel: "gemini-2.0-flash"
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
        modelOptions: ["claude-3-opus-20240229", "claude-3-sonnet-20240229", "claude-3-haiku-20240307"],
        defaultModel: "claude-3-opus-20240229"
    }
} 