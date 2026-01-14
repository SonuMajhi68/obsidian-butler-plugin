import { SettingGroup } from "obsidian";
import { ButlerPluginLike } from "../utils/types";

export function renderTabsSettings(
	containerEl: HTMLElement,
	plugin: ButlerPluginLike,
) {
	const settingGroup = new SettingGroup(containerEl).setHeading(
		"Tabs Settings",
	);

	settingGroup.addSetting((setting) =>
		setting
			.setName("Hide Tab border on hover")
			.setDesc("Hide a border around the tabs container when hovering.")
			.addToggle((toggle) =>
				toggle
					.setValue(plugin.settings.tabsHoverBorder)
					.onChange(async (value) => {
						// keep the original class name (note: original used `hide-boder`).
						if (value) {
							document.body.classList.add("hide-boder");
						} else {
							document.body.classList.remove("hide-boder");
						}
						plugin.settings.tabsHoverBorder = value;
						await plugin.saveSettings();
					}),
			),
	);
}
