/* eslint-disable @typescript-eslint/no-explicit-any */

import { App, Modal, Notice, TFile, normalizePath } from "obsidian";
import { OpenLibraryApi } from "../apis/openLibraryApi";
import { GoogleBooksApi } from "../apis/googleBooksApi";
import { SelectorModal } from "./selectorModal";
import { ButlerSettings } from "../utils/types";
import { SearchItem, SearchResponse } from "../apis/types";

// interface BookApi {
// 	searchByTitle(
// 		title: string,
// 	): Promise<{ docs: SearchItem[]; numFound: number }>;
// 	getByKey(key: string): Promise<any>;
// }

interface BookApi {
	searchByTitle(title: string): Promise<SearchResponse>;
	getByKey(key: string): Promise<any>;
}

export class SearchBooksModal extends Modal {
	private savePaths: string[];
	private templates: string[];
	private api: BookApi;
	private settings: ButlerSettings;

	constructor(
		app: App,
		savePaths: string[],
		templates: string[],
		settings: ButlerSettings,
	) {
		super(app);
		this.savePaths = savePaths;
		this.templates = templates;
		this.api = new OpenLibraryApi();
		this.settings = settings;

		if (this.settings.useGoogleBooks) {
			if (!this.settings.googleBooksApiKey) {
				new Notice(
					"Warning: Google Books API Key is missing in settings.",
				);
			}
			this.api = new GoogleBooksApi(this.settings.googleBooksApiKey);
		} else {
			this.api = new OpenLibraryApi();
		}
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

				json.docs.forEach((doc: SearchItem) => {
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

						// Handle after both template & folder have been selected
						const proceedSave = async (
							templatePath: string,
							folderPath: string,
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
								folderPath,
							);
						};

						// Function to choose folder (if multiple)
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

						// Template selection handling
						if (this.templates.length === 1) {
							await chooseFolderThenSave(this.templates[0]);
						} else {
							new SelectorModal(
								this.app,
								this.templates,
								(selectedTemplate) => {
									chooseFolderThenSave(selectedTemplate);
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
		folderPath: string,
	) {
		try {
			const bookData = await this.api.getByKey(key);
			// const coverUrl = bookData.covers
			// 	? `https://covers.openlibrary.org/b/id/${bookData.covers[0]}-L.jpg`
			// 	: "";

			let coverUrl = "";
			if (bookData.coverUrl) {
				coverUrl = bookData.coverUrl;
			} else if (bookData.covers && bookData.covers.length > 0) {
				coverUrl = `https://covers.openlibrary.org/b/id/${bookData.covers[0]}-L.jpg`;
			}

			// const url = `https://openlibrary.org${key}`;
			const url = this.settings.useGoogleBooks
				? bookData.infoLink ||
					`https://books.google.com/books?id=${key}`
				: `https://openlibrary.org${key}`;

			const sanitizedTitle = title.replace(/[\\/:*?"<>|]/g, "_");
			const dirPath = normalizePath(folderPath);
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
				// description: bookData.description || "", // Google books provides clean description
				// pages: bookData.pageCount ? String(bookData.pageCount) : "",
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
