import { GoogleGenerativeAI } from "@google/generative-ai"
import OpenAI from "openai"
import Anthropic from "@anthropic-ai/sdk"

/**
 * Service for handling AI API calls
 */
export const aiService = {
    // Generate with Google Gemini
    generateWithGemini: async (apiKey: string, model: string, prompt: string, maxTokens: number): Promise<string> => {
        try {
            const genAI = new GoogleGenerativeAI(apiKey)
            const genModel = genAI.getGenerativeModel({ model })
            const result = await genModel.generateContent(prompt)
            return result.response.text()
        } catch (error: any) {
            console.error("Gemini API error:", error)
            throw new Error(error?.message || "Failed to generate with Gemini")
        }
    },
    
    // Generate with OpenAI
    generateWithOpenAI: async (apiKey: string, model: string, prompt: string, maxTokens: number): Promise<string> => {
        try {
            const openai = new OpenAI({ apiKey })
            const response = await openai.chat.completions.create({
                model,
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                max_tokens: maxTokens
            })
            
            return response.choices[0]?.message?.content || ""
        } catch (error: any) {
            console.error("OpenAI API error:", error)
            throw new Error(error?.message || "Failed to generate with OpenAI")
        }
    },
    
    // Generate with Anthropic
    generateWithAnthropic: async (apiKey: string, model: string, prompt: string, maxTokens: number): Promise<string> => {
        try {
            const anthropic = new Anthropic({ apiKey })
            const response = await anthropic.messages.create({
                model,
                max_tokens: maxTokens,
                messages: [{ role: "user", content: prompt }]
            })
            
            // Handle different types of content blocks
            let generatedText = ""
            if (response.content && response.content.length > 0) {
                for (const block of response.content) {
                    if (block.type === 'text') {
                        generatedText += block.text
                    }
                }
            }
            
            return generatedText
        } catch (error: any) {
            console.error("Anthropic API error:", error)
            throw new Error(error?.message || "Failed to generate with Anthropic")
        }
    },
    
    // Generate with Grok (using xAI API)
    generateWithGrok: async (apiKey: string, model: string, prompt: string, maxTokens: number): Promise<string> => {
        try {
            // Note: Grok's official SDK is not available yet, using fetch API
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
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: { message: `HTTP error: ${response.status}` } }))
                throw new Error(errorData.error?.message || `Grok API error: ${response.status}`)
            }
            
            const data = await response.json()
            if (data.choices && data.choices[0]?.message?.content) {
                return data.choices[0].message.content
            } else if (data.completion) {
                return data.completion
            } else if (data.output) {
                return data.output
            } else {
                throw new Error("Unexpected response format from Grok API")
            }
        } catch (error: any) {
            console.error("Grok API error:", error)
            throw new Error(error?.message || "Failed to generate with Grok")
        }
    }
} 