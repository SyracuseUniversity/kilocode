// kilocode_change - new file

// kilocode_change start
import type { ApiHandler, ApiHandlerCreateMessageMetadata } from "../index"
import { DEFAULT_HEADERS } from "./constants"
// kilocode_change end
import type { Anthropic } from "@anthropic-ai/sdk"
import type { ApiHandlerOptions } from "../../shared/api"
import { ApiStream, ApiStreamChunk } from "../transform/stream"
import { BaseProvider } from "./base-provider"

// kilocode_change start
enum ApiErrorType {
	Unknown = "unknown",
	InvalidRequest = "invalid_request",
	RateLimit = "rate_limit",
	Authentication = "authentication",
	NotFound = "not_found",
	Permission = "permission",
	ServiceUnavailable = "service_unavailable",
}

class ApiError extends Error {
	public readonly type: ApiErrorType
	public readonly metadata: Record<string, unknown>

	constructor(message: string, type: ApiErrorType, metadata?: Record<string, unknown>) {
		super(message)
		this.type = type
		this.metadata = metadata ?? {}
	}
}

interface Mentor {
	id: string
	name: string
	description: string
}
// kilocode_change end

export class MentorAiHandler extends BaseProvider {
	private options: ApiHandlerOptions

	constructor(options: ApiHandlerOptions) {
		super()
		this.options = options
	}

	// kilocode_change start
	async *createMessage(
		systemPrompt: string,
		messages: Anthropic.Messages.MessageParam[],
		metadata?: ApiHandlerCreateMessageMetadata,
	): ApiStream {
		// @ts-ignore
		const WebSocket = (await import("ws")).default
		const { mentorAiApiKey, mentorAiOrgId, mentorAiBaseUrl, mentorAiToken } = this.options

		if (!mentorAiApiKey) {
			throw new ApiError("Missing API key for IBL Mentor AI", ApiErrorType.Authentication)
		}

		if (!mentorAiOrgId || !mentorAiToken) {
			throw new ApiError(
				"Organization ID and Backend Token are required for IBL Mentor AI",
				ApiErrorType.InvalidRequest,
			)
		}

		// Use user-provided baseUrl or default to IBL Mentor AI base URL
		const baseUrl = mentorAiBaseUrl || "https://base.manager.ai.syr.edu/api"

		// Convert http(s) to ws(s)
		const wsBaseUrl = baseUrl.replace(/^http/, "ws")
		// @ts-ignore
		const sessionId = metadata?.sessionId || Date.now().toString() // Fallback if no session ID
		const wsUrl = `${wsBaseUrl}/api/ai-search/mentors/ws/sessions/`
		const ws = new WebSocket(wsUrl)

		let streamEnded = false
		let error: ApiError | null = null

		ws.on("close", () => {
			streamEnded = true
		})

		ws.on("error", (err: Error) => {
			streamEnded = true
			error = new ApiError(`WebSocket error: ${err.message}`, ApiErrorType.ServiceUnavailable)
		})

		ws.on("open", () => {
			const prompt = messages
				.map((m) => {
					if (typeof m.content === "string") {
						return m.content
					}
					if (Array.isArray(m.content)) {
						return m.content
							.map((block) => {
								if (block.type === "text") {
									return block.text
								}
								return ""
							})
							.join("\n")
					}
					return ""
				})
				.join("\n")

			ws.send(
				JSON.stringify({
					flow: {
						name: this.options.apiModelId,
						tenant: this.options.mentorAiOrgId,
						pathway: this.options.apiModelId,
					},
					session_id: sessionId,
					token: this.options.mentorAiToken,
					prompt: systemPrompt ? `${systemPrompt}\n${prompt}` : prompt,
				}),
			)
		})

		const messageQueue: (ApiStreamChunk | string)[] = []
		ws.on("message", (data: any) => {
			try {
				const message = JSON.parse(data.toString())
				if (message.type === "stream") {
					messageQueue.push({ type: "text", text: message.message })
				} else if (message.type === "end") {
					streamEnded = true
				}
			} catch (e) {
				// Not a JSON message, treat as raw text
				messageQueue.push({ type: "text", text: data.toString() })
			}
		})

		while (!streamEnded) {
			if (error) throw error
			if (messageQueue.length > 0) {
				const message = messageQueue.shift()
				if (typeof message === "string") {
					yield { type: "text", text: message }
				} else if (message) {
					yield message
				}
			} else {
				await new Promise((resolve) => setTimeout(resolve, 50)) // Wait for new messages
			}
		}
		if (error) throw error

		// Yield any remaining messages
		while (messageQueue.length > 0) {
			const message = messageQueue.shift()
			if (typeof message === "string") {
				yield { type: "text", text: message }
			} else if (message) {
				yield message
			}
		}
	}
	// kilocode_change end

	// kilocode_change start
	getModel() {
		return {
			id: this.options.apiModelId ?? "default-mentor",
			info: {
				provider: "IBL Mentor AI",
				family: "mentor-ai",
				contextWindow: 16000,
				inputPrice: 0,
				outputPrice: 0,
				supportsPromptCache: false,
				supportsImages: false,
				supportsComputerUse: false,
			},
		}
	}
	// kilocode_change end

	// kilocode_change start
	async getMentors(): Promise<ApiHandler[]> {
		const { mentorAiApiKey, mentorAiBaseUrl } = this.options
		if (!mentorAiApiKey) {
			throw new ApiError("Missing API key for IBL Mentor AI", ApiErrorType.Authentication)
		}

		if (!mentorAiBaseUrl) {
			throw new ApiError("Missing baseUrl for IBL Mentor AI", ApiErrorType.InvalidRequest)
		}

		try {
			const response = await fetch(mentorAiBaseUrl, {
				method: "GET",
				headers: {
					...DEFAULT_HEADERS,
					Authorization: `Api-Token ${mentorAiApiKey}`,
				},
			})

			if (!response.ok) {
				throw new ApiError(`Failed to fetch mentors: ${response.statusText}`, ApiErrorType.ServiceUnavailable)
			}

			const mentors: Mentor[] = await response.json()

			return mentors.map((mentor) => ({
				id: mentor.id,
				info: {
					provider: "IBL Mentor AI",
					family: "mentor-ai",
					name: mentor.name,
					description: mentor.description,
					contextWindow: 16000,
					inputPrice: 0,
					outputPrice: 0,
				},
				createMessage: this.createMessage.bind(this),
				getModel: () => this.getModel(),
				countTokens: this.countTokens.bind(this),
			})) as unknown as ApiHandler[]
		} catch (error) {
			if (error instanceof ApiError) {
				throw error
			}
			throw new ApiError(`Failed to fetch mentors: ${(error as Error).message}`, ApiErrorType.Unknown)
		}
	}
}
// kilocode_change end
