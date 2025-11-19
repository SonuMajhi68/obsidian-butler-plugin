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

	// Movie folder path
	new Setting(containerEl)
		.setName("Movie folder path")
		.setDesc(
			"Select the folder where new movie/series notes will be created",
		)
		.addSearch((cb) => {
			new FolderSuggest(app, cb.inputEl);
			cb.setPlaceholder("Example: Movies/")
				.setValue(plugin.settings.movieFolderPath)
				.onChange(async (newValue) => {
					plugin.settings.movieFolderPath = newValue;
					await plugin.saveSettings();
				});
		});

	new Setting(containerEl).setName("Movie/Series Templates").setHeading();

	const movieTemplatesDiv = containerEl.createDiv({
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
	const addMovieContainer = containerEl.createDiv();
	let newMoviePath = "";

	new Setting(addMovieContainer)
		.setName("Template File")
		.setDesc("Add Template path to the list.")
		.addSearch((cb) => {
			new FileSuggest(app, cb.inputEl);
			cb.setPlaceholder("Templates/movie.md");
			cb.onChange((val) => (newMoviePath = val));
		});

	new Setting(addMovieContainer).addButton((btn) =>
		btn
			.setButtonText("Add Template")
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
}
