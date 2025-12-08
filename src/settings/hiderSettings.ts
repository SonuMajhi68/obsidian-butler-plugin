import { Setting } from "obsidian";
import { ButlerPluginLike } from "../utils/types";

export function renderHiderSettings(
	containerEl: HTMLElement,
	plugin: ButlerPluginLike,
) {
	containerEl.createEl("h1", { text: "Hide Folder Settings" });

	// Hidden folders textarea
	new Setting(containerEl)
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
		});

	// Hide by default toggle
	new Setting(containerEl)
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
					plugin.updateFolderHiderIcon?.(); // <--- Syncs the ribbon icon immediately
				}),
		);

	new Setting(containerEl).setName("").setHeading(); // Used as the padding
}
