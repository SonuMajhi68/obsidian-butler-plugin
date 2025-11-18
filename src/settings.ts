/* eslint-disable @typescript-eslint/no-explicit-any */

import { App, PluginSettingTab, Setting } from "obsidian";
import { FolderSuggest } from "./utils/folderSuggest";
import { FileSuggest } from "./utils/fileSuggest";
import { ButlerPluginLike } from "./types";

export class ButlerSettingTab extends PluginSettingTab {
	plugin: ButlerPluginLike;

	constructor(app: App, plugin: ButlerPluginLike) {
		super(app, plugin as any); 
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
			.setName("Book template file path")
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

		// --- Movie Search Settings ---
		containerEl.createEl("h1", { text: "Movie & Series Search Settings" });

		// OMDb API Key
		new Setting(containerEl)
			.setName("OMDb API Key")
			.setDesc("Your personal API key from omdbapi.com")
			.addText((text) =>
				text
					.setPlaceholder("Enter your API key...")
					.setValue(this.plugin.settings.omdbApiKey)
					.onChange(async (value) => {
						this.plugin.settings.omdbApiKey = value.trim();
						await this.plugin.saveSettings();
					}),
			);

		// Movie folder path
		new Setting(containerEl)
			.setName("Movie folder path")
			.setDesc(
				"Select the folder where new movie/series notes will be created",
			)
			.addSearch((cb) => {
				new FolderSuggest(this.app, cb.inputEl);
				cb.setPlaceholder("Example: Movies/")
					.setValue(this.plugin.settings.movieFolderPath)
					.onChange(async (newValue) => {
						this.plugin.settings.movieFolderPath = newValue;
						await this.plugin.saveSettings();
					});
			});

		// Movie Template file path
		new Setting(containerEl)
			.setName("Movie template file path")
			.setDesc("Select the template to use for new movie/series notes")
			.addSearch((cb) => {
				new FileSuggest(this.app, cb.inputEl);
				cb.setPlaceholder("Example: Templates/movie.md")
					.setValue(this.plugin.settings.movieTemplateFilePath)
					.onChange(async (newValue) => {
						this.plugin.settings.movieTemplateFilePath = newValue;
						await this.plugin.saveSettings();
					});
			});

		containerEl.createEl("h1", { text: "Hide Folder Settings" });

		// Hidden folders textarea
		new Setting(containerEl)
			.setName("Hidden Folders")
			.setDesc(
				"Enter folder names (one per line) that should be hidden from the file explorer. Use startswith:: or endswith:: prefixes for partial matches.",
			)
			.addTextArea((text) => {
				text.setPlaceholder("Templates\nOldBooks\nArchive")
					.setValue(
						(this.plugin.settings.hiddenFolders ?? []).join("\n"),
					)
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
			.setDesc(
				"If enabled, the folders listed above will be hidden until toggled.",
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.foldersHidden)
					.onChange(async (value) => {
						this.plugin.settings.foldersHidden = value;
						await this.plugin.saveSettings();
						this.plugin.processFolders?.();
					}),
			);

		containerEl.createEl("h1", { text: "Tabs Settings" });

		// 1. Hover Border Setting
		new Setting(containerEl)
			.setName("Hide Tab border on hover")
			.setDesc("Hide a border around the tabs container when hovering.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.tabsHoverBorder)
					.onChange(async (value) => {
						if (value) {
							document.body.addClass("hide-boder");
						} else {
							document.body.removeClass("hide-boder");
						}
						this.plugin.settings.tabsHoverBorder = value;
						await this.plugin.saveSettings();
					}),
			);

		// 2. Hide Edit Button Setting
		// new Setting(containerEl)
		// 	.setName("Hide code block edit button")
		// 	.setDesc(
		// 		"Hide the 'Edit' button that appears on top right of the tabs block.",
		// 	)
		// 	.addToggle((toggle) =>
		// 		toggle
		// 			.setValue(this.plugin.settings.hideTabsEditButton)
		// 			.onChange(async (value) => {
		// 				this.plugin.settings.hideTabsEditButton = value;
		// 				await this.plugin.saveSettings();
		// 				// This updates immediately via the body class logic in main.ts
		// 			}),
		// 	);
	}
}
