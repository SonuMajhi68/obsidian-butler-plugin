import { App, Modal, Notice, TFile, normalizePath } from "obsidian";
import { OpenLibraryApi, OpenLibrarySearchItem } from "../apis/openLibraryApi"; // Import new service

export class SearchBooksModal extends Modal {
	private savePath: string;
	private templatePath: string;
	private api: OpenLibraryApi; // Add api property

	constructor(app: App, savePath: string, templatePath: string) {
		super(app);
		this.savePath = savePath;
		this.templatePath = templatePath;
		this.api = new OpenLibraryApi(); // Initialize new service
	}

	onOpen() {
		const { contentEl } = this;
		this.modalEl.addClass('book-search-modal');
		contentEl.empty();

		contentEl.createEl("h2", { text: "Search Books" });

		const searchContainer = contentEl.createDiv({
			cls: "search-container"
		});

		const input = searchContainer.createEl("input", {
			type: "text",
			placeholder: "Enter book title...",
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
				new Notice("Please enter a book title.");
				return;
			}
			resultsEl.empty();
			resultsEl.createDiv({ text: "Loading..." });

			try {
				// --- Refactored API Call ---
				const json = await this.api.searchByTitle(value);
				// --- End Refactor ---

				resultsEl.empty();

				if (!json.docs || json.docs.length === 0) {
					resultsEl.createEl("p", { text: "No books found." });
					return;
				}

				json.docs.forEach((doc: OpenLibrarySearchItem) => {
					const title = doc.title ?? "Unknown Title";
					const authors = doc.author_name?.join(", ") ?? "Unknown Author";
					const year = doc.first_publish_year ?? "N/A";
					const key = doc.key ?? "";
					const publishers = doc.publisher?.join(", ") ?? "Unknown Publisher";

					const card = resultsEl.createDiv({
						cls: "result-card"
					});

					card.createEl("div", { text: title, cls: "result-card-title" });
					card.createEl("div", { text: `Author: ${authors}` });
					card.createEl("div", { text: `Publisher: ${publishers}` });
					card.createEl("div", { text: `Year: ${year}` });

					card.onclick = async () => {
						new Notice(`Fetching details for "${title}"...`);
						this.close(); // Close search modal
						await this.saveBookDetailsToVault(key, title, authors, String(year), publishers);
					};
				});
			} catch (err) {
				console.error("Book search failed:", err);
				resultsEl.empty();
				resultsEl.createEl("p", { text: `Error: ${err.message}. Check console.` });
			}
		};

		searchBtn.onclick = performSearch;
		input.addEventListener("keydown", (e) => {
			if (e.key === "Enter") performSearch();
		});
	}

	async saveBookDetailsToVault(
		key: string,
		title: string,
		author: string,
		year: string,
		publisher: string
	) {
		try {
			// --- Refactored API Call ---
			const bookData = await this.api.getByKey(key);
			// --- End Refactor ---

			const coverUrl = bookData.covers
				? `https://covers.openlibrary.org/b/id/${bookData.covers[0]}-L.jpg`
				: "";
			const url = `https://openlibrary.org${key}`;

			const sanitizedTitle = title.replace(/[\\/:*?"<>|]/g, "_");
			const dirPath = normalizePath(this.savePath);
			const filePath = normalizePath(`${dirPath}/${sanitizedTitle}.md`);

			if (!(await this.app.vault.adapter.exists(dirPath))) {
				await this.app.vault.createFolder(dirPath);
			}

			let templateContent = "";
			try {
				const file = this.app.vault.getAbstractFileByPath(this.templatePath);
				if (file instanceof TFile) {
					templateContent = await this.app.vault.read(file);
				} else {
					new Notice(`Invalid template path: ${this.templatePath}. Using default format.`);
					templateContent = "---\ntitle: {{title}}\nauthor: {{author}}\nyear: {{year}}\npublisher: {{publisher}}\nurl: {{url}}\ncover: {{cover}}\n---\n\n{{json}}";
				}
			} catch (e) {
				console.error("Error reading template:", e);
				new Notice(`Template file not found at: ${this.templatePath}. Using default format.`);
				templateContent = "---\ntitle: {{title}}\nauthor: {{author}}\nyear: {{year}}\npublisher: {{publisher}}\nurl: {{url}}\ncover: {{cover}}\n---\n\n{{json}}";
			}

			const replacements: Record<string, string> = {
				title,
				author,
				year,
				url,
				cover: coverUrl,
				publisher,
				json: JSON.stringify(bookData, null, 2),
			};

			let filled = templateContent;
			for (const key in replacements) {
				const regex = new RegExp(`{{\\s*${key}\\s*}}`, "gi");
				filled = filled.replace(regex, replacements[key] ?? ""); // Ensure null/undefined doesn't break replace
			}

			const existing = this.app.vault.getAbstractFileByPath(filePath);
			if (existing instanceof TFile) {
				await this.app.vault.modify(existing, filled);
				new Notice(`Updated "${title}" in vault.`);
			} else {
				await this.app.vault.create(filePath, filled);
				new Notice(`Saved "${title}" to vault.`);
			}

			// Open the newly created/updated file
			const fileToOpen = this.app.vault.getAbstractFileByPath(filePath);
			if (fileToOpen instanceof TFile) {
				const leaf = this.app.workspace.getLeaf(false);
				await leaf.openFile(fileToOpen);
			}

		} catch (err) {
			console.error("Error saving book details:", err);
			new Notice(`Error saving details: ${err.message}. Check console.`);
		}
	}

	onClose() {
		this.contentEl.empty();
	}
}