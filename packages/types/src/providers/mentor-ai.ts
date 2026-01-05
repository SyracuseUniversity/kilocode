import { ModelInfo } from "../model.js"

export const mentorAiDefaultModelId = "gpt-4o" // Default fallback

export const mentorAiModels: Record<string, ModelInfo> = {
	[mentorAiDefaultModelId]: {
		displayName: "GPT-4o",
		contextWindow: 128000,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
	},
}
