import { App, Setting, SettingGroup, Notice, SecretComponent } from "obsidian";
import { FolderSuggest } from "../utils/folderSuggest";
import { FileSuggest } from "../utils/fileSuggest";
import { ButlerPluginLike } from "../utils/types";

export function renderBookSettings(
	containerEl: HTMLElement,
	app: App,
	plugin: ButlerPluginLike,
) {
	let bookFoldersContainer: HTMLDivElement;
	let bookTemplateContainer: HTMLDivElement;

	let newPath = "";
	let newFolderPath = "";

	const bookSettingGroup = new SettingGroup(containerEl).setHeading(
		"Book Settings",
	);

	bookSettingGroup.addSetting((setting) => {
		setting
			.setName("Use Google Book API")
			.setDesc("Select/Create Google Book API key to enable")
			.addToggle((toggle) =>
				toggle
					.setValue(plugin.settings.useGoogleBooks)
					.onChange(async (value) => {
						plugin.settings.useGoogleBooks = value;
						await plugin.saveSettings();
					}),
			)
			.addComponent((el) =>
				new SecretComponent(app, el)
					.setValue(plugin.settings.googleBooksApiKey)
					.onChange((val) => {
						plugin.settings.googleBooksApiKey = val;
						plugin.saveSettings();
					}),
			);
	});

	// Book Folder List container
	bookSettingGroup.addSetting((setting) => {
		setting.infoEl.remove();
		setting.controlEl.remove();

		setting.settingEl.createEl("h1", {
			text: "Book Folders",
		});

		bookFoldersContainer = setting.settingEl.createDiv({
			cls: "setting-list-container",
		});
	});

	const drawBookFolders = () => {
		bookFoldersContainer.empty();

		if (
			!plugin.settings.bookFolderPaths ||
			plugin.settings.bookFolderPaths.length === 0
		) {
			bookFoldersContainer.createDiv({
				text: "No folder added",
				cls: "setting-template-empty-msg",
			});
			return;
		}

		(plugin.settings.bookFolderPaths ?? []).forEach((path, index) => {
			new Setting(bookFoldersContainer).setName(path).addButton((btn) => {
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

	// Add Book Folder
	bookSettingGroup.addSetting((setting) =>
		setting
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
						plugin.settings.bookFolderPaths.push(
							newFolderPath.trim(),
						);
						await plugin.saveSettings();
						newFolderPath = "";
						drawBookFolders();
					}),
			),
	);

	// Book Template List Container
	bookSettingGroup.addSetting((setting) => {
		setting.infoEl.remove();
		setting.controlEl.remove();

		setting.settingEl.createEl("h1", {
			text: "Book Templates",
		});

		bookTemplateContainer = setting.settingEl.createDiv({
			cls: "setting-list-container",
		});
	});

	// Function to render the list
	const drawBookTemplates = () => {
		bookTemplateContainer.empty();

		if (
			!plugin.settings.bookTemplates ||
			plugin.settings.bookTemplates.length === 0
		) {
			bookTemplateContainer.createDiv({
				text: "No template added",
				cls: "setting-template-empty-msg",
			});
			return;
		}

		(plugin.settings.bookTemplates ?? []).forEach((templatePath, index) => {
			new Setting(bookTemplateContainer)
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

	// Add Book Template
	bookSettingGroup.addSetting((setting) =>
		setting
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
			),
	);
}
