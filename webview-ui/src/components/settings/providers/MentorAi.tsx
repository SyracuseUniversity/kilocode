import { useCallback } from "react"
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react"

import { type ProviderSettings, type OrganizationAllowList, mentorAiDefaultModelId } from "@roo-code/types" // kilocode_change
import type { RouterModels } from "@roo/api"

import { useAppTranslation } from "@src/i18n/TranslationContext"
import { Button } from "@src/components/ui"
import { vscode } from "@src/utils/vscode"

import { inputEventTransform } from "../transforms"
import { ModelPicker } from "../ModelPicker"

type MentorAiProps = {
	apiConfiguration: ProviderSettings
	setApiConfigurationField: (field: keyof ProviderSettings, value: ProviderSettings[keyof ProviderSettings]) => void
	routerModels?: RouterModels
	organizationAllowList: OrganizationAllowList
	modelValidationError?: string
}

export const MentorAi = ({
	apiConfiguration,
	setApiConfigurationField,
	routerModels,
	organizationAllowList,
	modelValidationError,
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

	const handleGetMentors = useCallback(() => {
		vscode.postMessage({ type: "requestRouterModels" })
	}, [])

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

			<VSCodeTextField
				value={apiConfiguration?.mentorAiOrgId || ""}
				onInput={handleInputChange("mentorAiOrgId")}
				placeholder="Enter organization ID"
				className="w-full">
				<label className="block font-medium mb-1">Organization ID</label>
			</VSCodeTextField>

			<VSCodeTextField
				value={apiConfiguration?.mentorAiToken || ""}
				onInput={handleInputChange("mentorAiToken")}
				placeholder="Enter backend token"
				type="password"
				className="w-full">
				<label className="block font-medium mb-1">Backend Token</label>
			</VSCodeTextField>

			<Button variant="outline" onClick={handleGetMentors} className="w-full mt-2">
				Get Mentors
			</Button>

			<ModelPicker
				apiConfiguration={apiConfiguration}
				setApiConfigurationField={setApiConfigurationField}
				defaultModelId={mentorAiDefaultModelId}
				models={routerModels?.["mentor-ai"] ?? {}}
				modelIdKey="apiModelId"
				serviceName="Mentor AI"
				serviceUrl=""
				organizationAllowList={organizationAllowList}
				errorMessage={modelValidationError}
			/>
		</>
	)
}
