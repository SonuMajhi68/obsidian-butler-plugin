import { App, Modal, Notice, TFile, normalizePath } from "obsidian";
import { OmdbApi, OMDbSearchItem } from "../apis/omdbApi";

export class SearchMovieModal extends Modal {
	private savePath: string;
	private templatePath: string;
	private api: OmdbApi;

	constructor(app: App, savePath: string, templatePath: string, apiKey: string) {
		super(app);
		this.savePath = savePath;
		this.templatePath = templatePath;
		this.api = new OmdbApi(apiKey);
	}

	onOpen() {
		const { contentEl } = this;
		this.modalEl.addClass('movie-search-modal');
		contentEl.empty();

		contentEl.createEl("h2", { text: "Search Movies & Series" });

		const searchContainer = contentEl.createDiv({
			cls: "search-container"
		});

		const input = searchContainer.createEl("input", {
			type: "text",
			placeholder: "Enter movie or series title...",
		});

		const searchBtn = searchContainer.createEl("button", { 
			text: "Search",
			cls: "search-btn"
		});

		const resultsEl = contentEl.createDiv({
			cls: "results-container"
		});

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
					resultsEl.createEl("p", { text: "No movies or series found." });
					return;
				}

				results.forEach((doc: OMDbSearchItem) => {
					const card = resultsEl.createDiv({
						cls: "result-card"
					});

					// Add poster image
					// if (doc.Poster && doc.Poster !== "N/A") {
					// 	// --- FIX: Move 'src' into the 'attr' object ---
					// 	card.createEl("img", {
					// 		cls: "result-card-poster",
					// 		attr: {
					// 			src: doc.Poster
					// 		}
					// 	});
					// 	// ----------------------------------------------
					// }

					const infoEl = card.createDiv({ cls: "result-card-info" });
					infoEl.createEl("div", { text: doc.Title, cls: "result-card-title" });
					infoEl.createEl("div", { text: `Year: ${doc.Year}` });
					infoEl.createEl("div", { text: `Type: ${doc.Type}` });

					card.onclick = async () => {
						new Notice(`Fetching details for "${doc.Title}"...`);
						this.close(); // Close search modal
						await this.saveMovieDetailsToVault(doc.imdbID);
					};
				});
			} catch (err) {
				console.error("Movie search failed:", err);
				resultsEl.empty();
				resultsEl.createEl("p", { text: `Error: ${err.message}. Check console.` });
			}
		};

		searchBtn.onclick = performSearch;
		input.addEventListener("keydown", (e) => {
			if (e.key === "Enter") performSearch();
		});
	}

	async saveMovieDetailsToVault(imdbID: string) {
		try {
			const movieData = await this.api.getById(imdbID);

			// 1. Create replacements map
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

			// 2. Sanitize file path
			const sanitizedTitle = movieData.Title.replace(/[\\/:*?"<>|]/g, "_");
			const dirPath = normalizePath(this.savePath);
			const filePath = normalizePath(`${dirPath}/${sanitizedTitle}.md`);

			// 3. Create folder if needed
			if (!(await this.app.vault.adapter.exists(dirPath))) {
				await this.app.vault.createFolder(dirPath);
			}

			// 4. Get template content
			let templateContent = "";
			const defaultTemplate = "---\ntitle: {{title}}\nyear: {{year}}\nrating: {{rating}}\ndirector: {{director}}\nimage: {{image}}\nurl: {{url}}\n---\n\n## Plot\n{{plot}}\n\n## Details\n- **Genre**: {{genres}}\n- **Writer**: {{writer}}\n- **Actors**: {{actor}}\n- **Studio**: {{studio}}\n- **Duration**: {{duration}}\n- **Premiere**: {{premiere}}\n\n## JSON\n```json\n{{json}}\n```\n";
			
			try {
				const file = this.app.vault.getAbstractFileByPath(this.templatePath);
				if (file instanceof TFile) {
					templateContent = await this.app.vault.read(file);
				} else {
					new Notice(`Invalid movie template path: ${this.templatePath}. Using default template.`);
					templateContent = defaultTemplate;
				}
			} catch (e) {
				console.error("Error reading movie template:", e);
				new Notice(`Template file not found at: ${this.templatePath}. Using default template.`);
				templateContent = defaultTemplate;
			}

			// 5. Fill template
			let filled = templateContent;
			for (const key in replacements) {
				const regex = new RegExp(`{{\\s*${key}\\s*}}`, "gi");
				filled = filled.replace(regex, replacements[key] ?? ""); // Ensure null/undefined doesn't break replace
			}

			// 6. Create or modify file
			const existing = this.app.vault.getAbstractFileByPath(filePath);
			if (existing instanceof TFile) {
				await this.app.vault.modify(existing, filled);
				new Notice(`Updated "${movieData.Title}" in vault.`);
			} else {
				await this.app.vault.create(filePath, filled);
				new Notice(`Saved "${movieData.Title}" to vault.`);
			}

			// 7. Open the file
			const fileToOpen = this.app.vault.getAbstractFileByPath(filePath);
			if (fileToOpen instanceof TFile) {
				const leaf = this.app.workspace.getLeaf(false); // Open in new leaf if possible
				await leaf.openFile(fileToOpen);
			}

		} catch (err) {
			console.error("Error saving movie details:", err);
			new Notice(`Error saving details: ${err.message}. Check console.`);
		}
	}

	onClose() {
		this.contentEl.empty();
	}
}