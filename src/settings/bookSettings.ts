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
		.setName("Book folder path")
		.setDesc("Where new book notes will be created")
		.addSearch((cb) => {
			new FolderSuggest(app, cb.inputEl);
			cb.setPlaceholder("Example: Books/")
				.setValue(plugin.settings.bookFolderPath)
				.onChange(async (newValue) => {
					plugin.settings.bookFolderPath = newValue;
					await plugin.saveSettings();
				});
		});

	new Setting(containerEl).setName("Book Templates").setHeading();

	const bookTemplatesDiv = containerEl.createDiv({
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
	const addContainer = containerEl.createDiv();
	let newPath = "";

	new Setting(addContainer)
		.setName("Template File")
		.setDesc("Add Template path to the list.")
		.addSearch((cb) => {
			new FileSuggest(app, cb.inputEl);
			cb.setPlaceholder("Templates/book.md");
			cb.onChange((val) => (newPath = val));
		});

	new Setting(addContainer).addButton((btn) =>
		btn
			.setButtonText("Add Template")
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
}
