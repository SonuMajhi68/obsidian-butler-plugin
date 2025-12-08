import { App, Setting, Notice } from "obsidian";
import { FolderSuggest } from "../utils/folderSuggest";
import { FileSuggest } from "../utils/fileSuggest";
import { ButlerPluginLike } from "../utils/types";

export function renderMovieSettings(
	containerEl: HTMLElement,
	app: App,
	plugin: ButlerPluginLike,
) {
	containerEl.createEl("h1", { text: "Movie & Series Search Settings" });

	// OMDb API Key
	new Setting(containerEl)
		.setName("OMDb API Key")
		.setDesc("Your personal API key from omdbapi.com")
		.addText((text) =>
			text
				.setPlaceholder("Enter your API key...")
				.setValue(plugin.settings.omdbApiKey)
				.onChange(async (value) => {
					plugin.settings.omdbApiKey = value.trim();
					await plugin.saveSettings();
				}),
		);

	// Movie folder paths list UI (multiple)
	new Setting(containerEl).setName("Movie Folders").setHeading();

	const movieFoldersContainer = containerEl.createDiv({
		cls: "setting-list-container",
	});

	const movieFoldersDiv = movieFoldersContainer.createDiv({
		cls: "setting-template-list",
	});

	const drawMovieFolders = () => {
		movieFoldersDiv.empty();

		if (
			!plugin.settings.movieFolderPaths ||
			plugin.settings.movieFolderPaths.length === 0
		) {
			movieFoldersDiv.createDiv({
				text: "No folder added",
				cls: "setting-template-empty-msg",
			});
			return;
		}

		(plugin.settings.movieFolderPaths ?? []).forEach((path, index) => {
			new Setting(movieFoldersDiv).setName(path).addButton((btn) => {
				btn.setIcon("trash")
					.setTooltip("Remove folder")
					.onClick(async () => {
						plugin.settings.movieFolderPaths.splice(index, 1);
						await plugin.saveSettings();
						drawMovieFolders();
					});
			});
		});
	};

	drawMovieFolders();

	// Add New Movie Folder Section
	const addContainer = movieFoldersContainer.createDiv();
	let newMovieFolderPath = "";

	new Setting(addContainer)
		.setName("Folder Path")
		.setDesc("Add movie folder path to the list.")
		.addSearch((cb) => {
			new FolderSuggest(app, cb.inputEl);
			cb.setPlaceholder("Movies/").onChange(
				(val) => (newMovieFolderPath = val),
			);
		})
		.addButton((btn) =>
			btn
				.setButtonText("Add")
				.setCta()
				.onClick(async () => {
					if (!newMovieFolderPath.trim()) {
						new Notice("Folder path is required.");
						return;
					}
					plugin.settings.movieFolderPaths.push(
						newMovieFolderPath.trim(),
					);
					await plugin.saveSettings();
					newMovieFolderPath = "";
					drawMovieFolders();
				}),
		);

	new Setting(containerEl).setName("Movie/Series Templates").setHeading();

	const movieTemplateContainer = containerEl.createDiv({
		cls: "setting-list-container",
	});

	const movieTemplatesDiv = movieTemplateContainer.createDiv({
		cls: "setting-template-list",
	});

	const drawMovieTemplates = () => {
		movieTemplatesDiv.empty();

		if (
			!plugin.settings.movieTemplates ||
			plugin.settings.movieTemplates.length === 0
		) {
			movieTemplatesDiv.createDiv({
				text: "No template added",
				cls: "setting-template-empty-msg",
			});
			return;
		}

		(plugin.settings.movieTemplates ?? []).forEach(
			(templatePath, index) => {
				new Setting(movieTemplatesDiv)
					.setName(templatePath)
					.addButton((btn) => {
						btn.setIcon("trash")
							.setTooltip("Remove template")
							.onClick(async () => {
								plugin.settings.movieTemplates.splice(index, 1);
								await plugin.saveSettings();
								drawMovieTemplates();
							});
					});
			},
		);
	};

	drawMovieTemplates();

	// Add New Movie Template Section
	const addMovieContainer = movieTemplateContainer.createDiv();
	let newMoviePath = "";

	new Setting(addMovieContainer)
		.setName("Template File")
		.setDesc("Add movie template to the list.")
		.addSearch((cb) => {
			new FileSuggest(app, cb.inputEl);
			cb.setPlaceholder("Templates/movie.md");
			cb.onChange((val) => (newMoviePath = val));
		})
		.addButton((btn) =>
			btn
				.setButtonText("Add")
				.setCta()
				.onClick(async () => {
					if (!newMoviePath.trim()) {
						new Notice("Template path is required.");
						return;
					}
					plugin.settings.movieTemplates.push(newMoviePath.trim());
					await plugin.saveSettings();
					newMoviePath = "";
					drawMovieTemplates();
				}),
		);

	new Setting(containerEl).setName("").setHeading(); // Used as the padding
}
