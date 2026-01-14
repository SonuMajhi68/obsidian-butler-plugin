import { App, Setting, Notice } from "obsidian";
import { FolderSuggest } from "../utils/folderSuggest";
import { FileSuggest } from "../utils/fileSuggest";
import { ButlerPluginLike } from "../utils/types";

export function renderBookSettings(
	containerEl: HTMLElement,
	app: App,
	plugin: ButlerPluginLike,
) {
	containerEl.createEl("h1", { text: "Book Search Settings" });

	new Setting(containerEl)
		.setName("Use Google Books API")
		.setDesc(
			"Toggle On to use Google Books. Toggle Off to use Open Library.",
		)
		.addToggle((toggle) =>
			toggle
				.setValue(plugin.settings.useGoogleBooks)
				.onChange(async (value) => {
					plugin.settings.useGoogleBooks = value;
					await plugin.saveSettings();
					// Force refresh of the settings UI to show/hide API key field dynamically if you wanted,
					// but standard practice is just leaving it visible or strict ordering.
				}),
		);

	new Setting(containerEl)
		.setName("Google Books API Key")
		.setDesc("Required if 'Use Google Books API' is enabled.")
		.addText((text) =>
			text
				.setPlaceholder("Enter API Key...")
				.setValue(plugin.settings.googleBooksApiKey)
				.onChange(async (value) => {
					plugin.settings.googleBooksApiKey = value.trim();
					await plugin.saveSettings();
				}),
		);

	new Setting(containerEl).setName("Book Folders").setHeading();

	const bookFoldersContainer = containerEl.createDiv({
		cls: "setting-list-container",
	});

	const bookFoldersDiv = bookFoldersContainer.createDiv({
		cls: "setting-template-list",
	});

	const drawBookFolders = () => {
		bookFoldersDiv.empty();

		if (
			!plugin.settings.bookFolderPaths ||
			plugin.settings.bookFolderPaths.length === 0
		) {
			bookFoldersDiv.createDiv({
				text: "No folder added",
				cls: "setting-template-empty-msg",
			});
			return;
		}

		(plugin.settings.bookFolderPaths ?? []).forEach((path, index) => {
			new Setting(bookFoldersDiv).setName(path).addButton((btn) => {
				btn.setIcon("trash")
					.setTooltip("Remove folder")
					.onClick(async () => {
						plugin.settings.bookFolderPaths.splice(index, 1);
						await plugin.saveSettings();
						drawBookFolders();
					});
			});
		});
	};

	drawBookFolders();

	// Add New Folder Section
	const folderContainer = bookFoldersContainer.createDiv();
	let newFolderPath = "";

	new Setting(folderContainer)
		.setName("Folder Path")
		.setDesc("Add folder path to the list.")
		.addSearch((cb) => {
			new FolderSuggest(app, cb.inputEl);
			cb.setPlaceholder("Books/").onChange(
				(val) => (newFolderPath = val),
			);
		})
		.addButton((btn) =>
			btn
				.setButtonText("Add")
				.setCta()
				.onClick(async () => {
					if (!newFolderPath.trim()) {
						new Notice("Folder path is required.");
						return;
					}
					plugin.settings.bookFolderPaths.push(newFolderPath.trim());
					await plugin.saveSettings();
					newFolderPath = "";
					drawBookFolders();
				}),
		);

	new Setting(containerEl).setName("Book Templates").setHeading();

	const bookTemplateContainer = containerEl.createDiv({
		cls: "setting-list-container",
	});

	const bookTemplatesDiv = bookTemplateContainer.createDiv({
		cls: "setting-template-list",
	});

	// Function to render the list
	const drawBookTemplates = () => {
		bookTemplatesDiv.empty();

		if (
			!plugin.settings.bookTemplates ||
			plugin.settings.bookTemplates.length === 0
		) {
			bookTemplatesDiv.createDiv({
				text: "No template added",
				cls: "setting-template-empty-msg",
			});
			return;
		}

		(plugin.settings.bookTemplates ?? []).forEach((templatePath, index) => {
			new Setting(bookTemplatesDiv)
				.setName(templatePath)
				.addButton((btn) => {
					btn.setIcon("trash")
						.setTooltip("Remove template")
						.onClick(async () => {
							plugin.settings.bookTemplates.splice(index, 1);
							await plugin.saveSettings();
							drawBookTemplates();
						});
				});
		});
	};

	drawBookTemplates();

	// Add New Template Section
	const templateContainer = bookTemplateContainer.createDiv();
	let newPath = "";

	new Setting(templateContainer)
		.setName("Template File")
		.setDesc("Add template to the list.")
		.addSearch((cb) => {
			new FileSuggest(app, cb.inputEl);
			cb.setPlaceholder("Templates/book.md");
			cb.onChange((val) => (newPath = val));
		})
		.addButton((btn) =>
			btn
				.setButtonText("Add")
				.setCta()
				.onClick(async () => {
					if (!newPath.trim()) {
						new Notice("Template path is required.");
						return;
					}
					plugin.settings.bookTemplates.push(newPath.trim());
					await plugin.saveSettings();
					newPath = "";
					drawBookTemplates();
				}),
		);

	new Setting(containerEl).setName("").setHeading(); // Used as the padding
}
