import { App, Modal, Notice, TFile, normalizePath } from "obsidian";
import { OmdbApi, OMDbSearchItem } from "../apis/omdbApi";
import { SelectorModal } from "./selectorModal"; // Import the shared modal

export class SearchMovieModal extends Modal {
	private savePaths: string[];
	private templates: string[]; // Changed to array
	private api: OmdbApi;

	constructor(
		app: App,
		savePaths: string[],
		templates: string[],
		apiKey: string,
	) {
		super(app);
		this.savePaths = savePaths;
		this.templates = templates;

		const key: string = app.secretStorage.getSecret(apiKey);
		this.api = new OmdbApi(key);
	}

	onOpen() {
		const { contentEl } = this;
		this.modalEl.addClass("movie-search-modal");
		contentEl.empty();

		contentEl.createEl("h2", { text: "Search Movies & Series" });

		const searchContainer = contentEl.createDiv({
			cls: "search-container",
		});

		const input = searchContainer.createEl("input", {
			type: "text",
			placeholder: "Enter movie or series title...",
		});

		// Auto focus
		setTimeout(() => input.focus(), 50);

		const searchBtn = searchContainer.createEl("button", {
			text: "Search",
			cls: "search-btn",
		});

		const resultsEl = contentEl.createDiv({ cls: "results-container" });

		const performSearch = async () => {
			const value = input.value.trim();
			if (!value) {
				new Notice("Please enter a title.");
				return;
			}
			resultsEl.empty();
			resultsEl.createDiv({ text: "Loading..." });

			try {
				const results = await this.api.searchByTitle(value);
				resultsEl.empty();

				if (!results || results.length === 0) {
					resultsEl.createEl("p", {
						text: "No movies or series found.",
					});
					return;
				}

				results.forEach((doc: OMDbSearchItem) => {
					const card = resultsEl.createDiv({ cls: "result-card" });
					const infoEl = card.createDiv({ cls: "result-card-info" });

					infoEl.createEl("div", {
						text: doc.Title,
						cls: "result-card-title",
					});
					infoEl.createEl("div", { text: `Year: ${doc.Year}` });
					infoEl.createEl("div", { text: `Type: ${doc.Type}` });

					card.onclick = async () => {
						if (this.templates.length === 0) {
							new Notice(
								"No movie templates configured in settings.",
							);
							return;
						}

						// proceedSave runs after both template & folder selected
						const proceedSave = async (
							templatePath: string,
							folderPath: string,
						) => {
							new Notice(
								`Fetching details for "${doc.Title}"...`,
							);
							this.close();
							await this.saveMovieDetailsToVault(
								doc.imdbID,
								templatePath,
								folderPath,
							);
						};

						// choose folder then save
						const chooseFolderThenSave = async (
							templatePath: string,
						) => {
							if (
								!this.savePaths ||
								this.savePaths.length === 0
							) {
								new Notice(
									"No save folders configured in settings.",
								);
								return;
							}
							if (this.savePaths.length === 1) {
								await proceedSave(
									templatePath,
									this.savePaths[0],
								);
							} else {
								new SelectorModal(
									this.app,
									this.savePaths,
									(selectedFolder) => {
										proceedSave(
											templatePath,
											selectedFolder,
										);
									},
								).open();
							}
						};

						if (this.templates.length === 1) {
							await chooseFolderThenSave(this.templates[0]);
						} else {
							new SelectorModal(
								this.app,
								this.templates,
								(selectedPath) => {
									chooseFolderThenSave(selectedPath);
								},
							).open();
						}
					};
				});
			} catch (err) {
				console.error("Movie search failed:", err);
				resultsEl.empty();
				resultsEl.createEl("p", {
					text: `Error: ${err.message}. Check console.`,
				});
			}
		};

		searchBtn.onclick = performSearch;
		input.addEventListener("keydown", (e) => {
			if (e.key === "Enter") performSearch();
		});
	}

	// Added templatePath parameter
	async saveMovieDetailsToVault(
		imdbID: string,
		templatePath: string,
		folderPath: string,
	) {
		try {
			const movieData = await this.api.getById(imdbID);

			const replacements: Record<string, string> = {
				title: movieData.Title,
				year: movieData.Year,
				url: `https://www.imdb.com/title/${movieData.imdbID}/`,
				plot: movieData.Plot,
				genres: movieData.Genre,
				director: movieData.Director,
				writer: movieData.Writer,
				studio: movieData.Production,
				duration: movieData.Runtime,
				rating: movieData.imdbRating,
				actor: movieData.Actors,
				image: movieData.Poster,
				premiere: movieData.Released,
				json: JSON.stringify(movieData, null, 2),
			};

			const sanitizedTitle = movieData.Title.replace(
				/[\\/:*?"<>|]/g,
				"_",
			);
			const dirPath = normalizePath(folderPath);
			const filePath = normalizePath(`${dirPath}/${sanitizedTitle}.md`);

			if (!(await this.app.vault.adapter.exists(dirPath))) {
				await this.app.vault.createFolder(dirPath);
			}

			let templateContent = "";
			const defaultTemplate =
				"---\ntitle: {{title}}\nyear: {{year}}\nrating: {{rating}}\n---\n\n# {{title}}\n\n![Poster]({{image}})\n\n## Plot\n{{plot}}\n";

			try {
				// Use the selected templatePath
				const file = this.app.vault.getAbstractFileByPath(templatePath);
				if (file instanceof TFile) {
					templateContent = await this.app.vault.read(file);
				} else {
					new Notice(
						`Invalid movie template path: ${templatePath}. Using default.`,
					);
					templateContent = defaultTemplate;
				}
			} catch (e) {
				console.error("Error reading movie template:", e);
				templateContent = defaultTemplate;
			}

			let filled = templateContent;
			for (const key in replacements) {
				const regex = new RegExp(`{{\\s*${key}\\s*}}`, "gi");
				filled = filled.replace(regex, replacements[key] ?? "");
			}

			const existing = this.app.vault.getAbstractFileByPath(filePath);
			if (existing instanceof TFile) {
				await this.app.vault.modify(existing, filled);
				new Notice(`Updated "${movieData.Title}" in vault.`);
			} else {
				await this.app.vault.create(filePath, filled);
				new Notice(`Saved "${movieData.Title}" to vault.`);
			}

			const fileToOpen = this.app.vault.getAbstractFileByPath(filePath);
			if (fileToOpen instanceof TFile) {
				this.app.workspace.getLeaf(false).openFile(fileToOpen);
			}
		} catch (err) {
			console.error("Error saving movie details:", err);
			new Notice(`Error saving details: ${err.message}.`);
		}
	}

	onClose() {
		this.contentEl.empty();
	}
}
