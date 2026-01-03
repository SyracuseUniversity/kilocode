import { useCallback } from "react"
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react"

import { type ProviderSettings } from "@roo-code/types"

import { useAppTranslation } from "@src/i18n/TranslationContext"

import { inputEventTransform } from "../transforms"

type MentorAiProps = {
	apiConfiguration: ProviderSettings
	setApiConfigurationField: (field: keyof ProviderSettings, value: ProviderSettings[keyof ProviderSettings]) => void
}

export const MentorAi = ({
	apiConfiguration,
	setApiConfigurationField,
}: MentorAiProps) => {
	const { t } = useAppTranslation()

	const handleInputChange = useCallback(
		<K extends keyof ProviderSettings, E>(
			field: K,
			transform: (event: E) => ProviderSettings[K] = inputEventTransform,
		) =>
			(event: E | Event) => {
				setApiConfigurationField(field, transform(event as E))
			},
		[setApiConfigurationField],
	)

	return (
		<>
			<VSCodeTextField
				value={apiConfiguration?.mentorAiApiKey || ""}
				type="password"
				onInput={handleInputChange("mentorAiApiKey")}
				placeholder={t("settings:placeholders.apiKey")}
				className="w-full">
				<label className="block font-medium mb-1">{t("settings:providers.apiKey")}</label>
			</VSCodeTextField>
			<div className="text-sm text-vscode-descriptionForeground -mt-2">
				{t("settings:providers.apiKeyStorageNotice")}
			</div>

			<VSCodeTextField
				value={apiConfiguration?.mentorAiBaseUrl || ""}
				onInput={handleInputChange("mentorAiBaseUrl")}
				placeholder={t("settings:placeholders.baseUrl")}
				className="w-full">
				<label className="block font-medium mb-1">{t("settings:providers.baseUrl")}</label>
			</VSCodeTextField>
		</>
	)
}