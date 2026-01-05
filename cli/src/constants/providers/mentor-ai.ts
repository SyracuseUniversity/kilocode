import type { ProviderSettings } from "../../types/messages.js"
import { createFieldConfig } from "./settings.js"

export const getMentorAiSettings = (config: ProviderSettings) => [
	createFieldConfig("mentorAiApiKey", config),
	createFieldConfig("apiModelId", config, "mentor-ai-code-teacher"),
]
