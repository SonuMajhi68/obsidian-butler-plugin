import { SettingGroup } from "obsidian";
import { ButlerPluginLike } from "../utils/types";

export function renderHiderSettings(
	containerEl: HTMLElement,
	plugin: ButlerPluginLike,
) {
	const settingGroup = new SettingGroup(containerEl).setHeading(
		"Folder Hider Settings",
	);

	// Hidden folders textarea
	settingGroup.addSetting((setting) =>
		setting
			.setName("Hidden Folders")
			.setDesc(
				"Enter folder names (one per line) that should be hidden from the file explorer. Use startswith:: or endswith:: prefixes for partial matches.",
			)
			.addTextArea((text) => {
				text.inputEl.rows = 5;
				// text.inputEl.style.width = "100%";
				text.setPlaceholder("Templates\nOldBooks\nArchive")
					.setValue((plugin.settings.hiddenFolders ?? []).join("\n"))
					.onChange(async (value) => {
						plugin.settings.hiddenFolders = value
							.split("\n")
							.map((v) => v.trim())
							.filter((v) => v.length > 0);
						await plugin.saveSettings();
						plugin.processFolders?.();
					});
			}),
	);

	// Hide by default toggle
	settingGroup.addSetting((setting) =>
		setting
			.setName("Hide Folders by Default")
			.setDesc(
				"If enabled, the folders listed above will be hidden until toggled.",
			)
			.addToggle((toggle) =>
				toggle
					.setValue(plugin.settings.foldersHidden) // Sets toggle position based on saved data
					.onChange(async (value) => {
						plugin.settings.foldersHidden = value;
						await plugin.saveSettings();
						plugin.processFolders?.();
						plugin.updateFolderHiderIcon?.(); // Syncs the ribbon icon immediately
					}),
			),
	);
}
