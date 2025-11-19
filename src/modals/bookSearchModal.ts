// modals/bookSearchModal.ts
import { App, Modal, Notice, TFile, normalizePath } from "obsidian";
import { OpenLibraryApi, OpenLibrarySearchItem } from "../apis/openLibraryApi";
import { TemplateSelectModal } from "./templateSelectModal";

export class SearchBooksModal extends Modal {
	private savePath: string;
	private templates: string[]; // Changed to string[]
	private api: OpenLibraryApi;

	constructor(app: App, savePath: string, templates: string[]) {
		super(app);
		this.savePath = savePath;
		this.templates = templates;
		this.api = new OpenLibraryApi();
	}

	onOpen() {
		const { contentEl } = this;
		this.modalEl.addClass("book-search-modal");
		contentEl.empty();

		contentEl.createEl("h2", { text: "Search Books" });

		const searchContainer = contentEl.createDiv({
			cls: "search-container",
		});
		const input = searchContainer.createEl("input", {
			type: "text",
			placeholder: "Enter book title...",
		});

		// Focus input on open
		setTimeout(() => input.focus(), 50);

		const searchBtn = searchContainer.createEl("button", {
			text: "Search",
			cls: "search-btn",
		});

		const resultsEl = contentEl.createDiv({ cls: "results-container" });

		const performSearch = async () => {
			const value = input.value.trim();
			if (!value) {
				new Notice("Please enter a book title.");
				return;
			}
			resultsEl.empty();
			resultsEl.createDiv({ text: "Loading..." });

			try {
				const json = await this.api.searchByTitle(value);
				resultsEl.empty();

				if (!json.docs || json.docs.length === 0) {
					resultsEl.createEl("p", { text: "No books found." });
					return;
				}

				json.docs.forEach((doc: OpenLibrarySearchItem) => {
					const title = doc.title ?? "Unknown Title";
					const authors =
						doc.author_name?.join(", ") ?? "Unknown Author";
					const year = doc.first_publish_year ?? "N/A";
					const key = doc.key ?? "";
					const publishers =
						doc.publisher?.join(", ") ?? "Unknown Publisher";

					const card = resultsEl.createDiv({ cls: "result-card" });

					card.createEl("div", {
						text: title,
						cls: "result-card-title",
					});
					card.createEl("div", { text: `Author: ${authors}` });
					card.createEl("div", { text: `Year: ${year}` });

					card.onclick = async () => {
						// Logic to handle template selection
						if (this.templates.length === 0) {
							new Notice("No templates configured in settings.");
							return;
						}

						const handleSelection = async (
							templatePath: string,
						) => {
							new Notice(`Fetching details for "${title}"...`);
							this.close();
							await this.saveBookDetailsToVault(
								key,
								title,
								authors,
								String(year),
								publishers,
								templatePath,
							);
						};

						if (this.templates.length === 1) {
							await handleSelection(this.templates[0]);
						} else {
							// If multiple, open selection modal
							new TemplateSelectModal(
								this.app,
								this.templates,
								(selectedPath) => {
									handleSelection(selectedPath);
								},
							).open();
						}
					};
				});
			} catch (err) {
				console.error("Book search failed:", err);
				resultsEl.empty();
				resultsEl.createEl("p", { text: `Error: ${err.message}` });
			}
		};

		searchBtn.onclick = performSearch;
		input.addEventListener("keydown", (e) => {
			if (e.key === "Enter") performSearch();
		});
	}

	// Updated to accept templatePath as an argument
	async saveBookDetailsToVault(
		key: string,
		title: string,
		author: string,
		year: string,
		publisher: string,
		templatePath: string,
	) {
		try {
			const bookData = await this.api.getByKey(key);
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
				const file = this.app.vault.getAbstractFileByPath(templatePath);
				if (file instanceof TFile) {
					templateContent = await this.app.vault.read(file);
				} else {
					new Notice(
						`Template not found: ${templatePath}. Using default.`,
					);
					templateContent =
						"---\ntitle: {{title}}\nauthor: {{author}}\n---\n\n{{json}}";
				}
			} catch (e) {
				templateContent =
					"---\ntitle: {{title}}\nauthor: {{author}}\n---\n\n{{json}}";
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
				filled = filled.replace(regex, replacements[key] ?? "");
			}

			const existing = this.app.vault.getAbstractFileByPath(filePath);
			if (existing instanceof TFile) {
				await this.app.vault.modify(existing, filled);
			} else {
				await this.app.vault.create(filePath, filled);
			}

			const fileToOpen = this.app.vault.getAbstractFileByPath(filePath);
			if (fileToOpen instanceof TFile) {
				this.app.workspace.getLeaf(false).openFile(fileToOpen);
				new Notice(`Book note created: ${title}`);
			}
		} catch (err) {
			console.error("Error saving book details:", err);
			new Notice(`Error: ${err.message}`);
		}
	}

	onClose() {
		this.contentEl.empty();
	}
}
