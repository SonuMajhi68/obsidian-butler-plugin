import { App, PluginSettingTab, Setting } from "obsidian";
import { FolderSuggest } from "./utils/folderSuggest";
import { FileSuggest } from "./utils/fileSuggest";
import { WikiSearchPluginLike } from "./types";

export class WikiSearchSettingTab extends PluginSettingTab {
	plugin: WikiSearchPluginLike;

	constructor(app: App, plugin: WikiSearchPluginLike) {
		super(app, plugin as any); // The 'as any' is from the original, likely to satisfy PluginSettingTab constructor
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h1", { text: "Add Books Settings" });

		// Book folder path
		new Setting(containerEl)
			.setName("Book folder path")
			.setDesc("Select the folder where new book notes will be created")
			.addSearch((cb) => {
				new FolderSuggest(this.app, cb.inputEl);
				cb.setPlaceholder("Example: Books/")
					.setValue(this.plugin.settings.bookFolderPath)
					.onChange(async (newValue) => {
						this.plugin.settings.bookFolderPath = newValue;
						await this.plugin.saveSettings();
					});
			});

		// Template file path
		new Setting(containerEl)
			.setName("Template file path")
			.setDesc("Select the template to use for new book notes")
			.addSearch((cb) => {
				new FileSuggest(this.app, cb.inputEl);
				cb.setPlaceholder("Example: Templates/book.md")
					.setValue(this.plugin.settings.templateFilePath)
					.onChange(async (newValue) => {
						this.plugin.settings.templateFilePath = newValue;
						await this.plugin.saveSettings();
					});
			});
		
		containerEl.createEl("h1", { text: "Hide Folder Settings" });

		// Hidden folders textarea
		new Setting(containerEl)
			.setName("Hidden Folders")
			.setDesc("Enter folder names (one per line) that should be hidden from the file explorer. Use startswith:: or endswith:: prefixes for partial matches.")
			.addTextArea((text) => {
				text.setPlaceholder("Templates\nOldBooks\nArchive")
					.setValue((this.plugin.settings.hiddenFolders ?? []).join("\n"))
					.onChange(async (value) => {
						this.plugin.settings.hiddenFolders = value
							.split("\n")
							.map((v) => v.trim())
							.filter((v) => v.length > 0);
						await this.plugin.saveSettings();
						this.plugin.processFolders?.();
					});
			});

		// Hide by default toggle
		new Setting(containerEl)
			.setName("Hide Folders by Default")
			.setDesc("If enabled, the folders listed above will be hidden until toggled.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.foldersHidden)
					.onChange(async (value) => {
						this.plugin.settings.foldersHidden = value;
						await this.plugin.saveSettings();
						this.plugin.processFolders?.();
					})
			);
	}
}