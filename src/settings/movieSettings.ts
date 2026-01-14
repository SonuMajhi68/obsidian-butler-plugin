import { App, Setting, SettingGroup, Notice } from "obsidian";
import { FolderSuggest } from "../utils/folderSuggest";
import { FileSuggest } from "../utils/fileSuggest";
import { ButlerPluginLike } from "../utils/types";

export function renderMovieSettings(
	containerEl: HTMLElement,
	app: App,
	plugin: ButlerPluginLike,
) {
	let movieFoldersContainer: HTMLDivElement;
	let movieTemplateContainer: HTMLDivElement;

	let newMovieFolderPath = "";
	let newMoviePath = "";

	const movieSettingGroup = new SettingGroup(containerEl).setHeading(
		"Movie Settings",
	);

	// OMDb API Feild
	movieSettingGroup.addSetting((setting) =>
		setting
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
			),
	);

	// Movie Folder List Container
	movieSettingGroup.addSetting((setting) => {
		setting.infoEl.remove();
		setting.controlEl.remove();

		setting.settingEl.createEl("h1", {
			text: "Movie Folders",
		});

		movieFoldersContainer = setting.settingEl.createDiv({
			cls: "setting-list-container",
		});
	});

	const drawMovieFolders = () => {
		movieFoldersContainer.empty();

		if (
			!plugin.settings.movieFolderPaths ||
			plugin.settings.movieFolderPaths.length === 0
		) {
			movieFoldersContainer.createDiv({
				text: "No folder added",
				cls: "setting-template-empty-msg",
			});
			return;
		}

		(plugin.settings.movieFolderPaths ?? []).forEach((path, index) => {
			new Setting(movieFoldersContainer)
				.setName(path)
				.addButton((btn) => {
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

	// Add Movie Folder
	movieSettingGroup.addSetting((setting) =>
		setting
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
			),
	);

	// Movie Template List
	movieSettingGroup.addSetting((setting) => {
		setting.infoEl.remove();
		setting.controlEl.remove();

		setting.settingEl.createEl("h1", {
			text: "Movie Templates",
		});

		movieTemplateContainer = setting.settingEl.createDiv({
			cls: "setting-list-container",
		});
	});

	const drawMovieTemplates = () => {
		movieTemplateContainer.empty();

		if (
			!plugin.settings.movieTemplates ||
			plugin.settings.movieTemplates.length === 0
		) {
			movieTemplateContainer.createDiv({
				text: "No template added",
				cls: "setting-template-empty-msg",
			});
			return;
		}

		(plugin.settings.movieTemplates ?? []).forEach(
			(templatePath, index) => {
				new Setting(movieTemplateContainer)
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

	// Addd Movie Template
	movieSettingGroup.addSetting((setting) =>
		setting
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
						plugin.settings.movieTemplates.push(
							newMoviePath.trim(),
						);
						await plugin.saveSettings();
						newMoviePath = "";
						drawMovieTemplates();
					}),
			),
	);
}
