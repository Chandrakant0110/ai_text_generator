import { CanvasNode } from "framer-plugin"

export type AIProvider = "gemini" | "openai" | "anthropic"
export type Theme = "light" | "dark"

export interface AIProviderConfig {
    name: string
    apiKeyPlaceholder: string
    modelOptions: string[]
    defaultModel: string
} 