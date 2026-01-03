// kilocode_change - new file

import type { ModelInfo } from "@roo-code/types"

interface Mentor {
	id: string
	nickname: string
}

/**
 * Fetches the list of available models from the Mentor AI API.
 * @param apiKey The API key for Mentor AI.
 * @param baseUrl The base URL for the Mentor AI API.
 * @returns A promise that resolves to a record of ModelInfo objects.
 */
export async function getMentorAiModels(
 apiKey: string,
 baseUrl?: string,
): Promise<Record<string, ModelInfo>> {
 const url = `${baseUrl ?? "https://mentor.blip.ai"}/api/mentors`
 const headers = {
 	Authorization: `Api-Token ${apiKey}`,
 }

 try {
 	const response = await fetch(url, { headers })
 	if (!response.ok) {
 		throw new Error(`Failed to fetch Mentor AI models: ${response.statusText}`)
 	}

 	const mentors = (await response.json()) as Mentor[]

 	return mentors.reduce(
 		(acc, mentor) => {
 			acc[mentor.id] = {
 				id: mentor.id,
 				name: mentor.nickname,
 				provider: "mentor-ai",
 				contextWindow: 8000,
 				supportsPromptCache: false,
 				inputPrice: 0,
 				outputPrice: 0,
 			} as ModelInfo
 			return acc
 		},
 		{} as Record<string, ModelInfo>,
 	)
 } catch (error) {
 	console.error("Error fetching Mentor AI models:", error)
 	return {}
 }
}