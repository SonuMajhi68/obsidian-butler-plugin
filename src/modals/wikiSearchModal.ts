import { App, Modal, Notice, MarkdownView, Editor } from "obsidian";

export class WikiSearchModal extends Modal {
	private editor: Editor;
	private initialSelection: string;

	constructor(app: App, editor: Editor, selection: string) {
		super(app);
		this.editor = editor;
		this.initialSelection = selection;
	}

	private getCurrentSelection(): string {
		try {
			// Check the editor instance passed during construction first
			if (this.editor && typeof this.editor.getSelection === "function") {
				const s = this.editor.getSelection();
				if (s && String(s).trim() !== "") return String(s);
			}

			// Fallback to initial selection
			if (this.initialSelection && String(this.initialSelection).trim() !== "") {
				return String(this.initialSelection);
			}

			// Final fallback to active view
			const mv = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (mv && mv.editor) {
				const s = mv.editor.getSelection();
				if (s && String(s).trim() !== "") return String(s);
			}
		} catch (e) {
			console.warn("Could not read selection:", e);
		}
		// Return initial selection as last resort if it was empty
		return this.initialSelection;
	}

	onOpen() {
		const { contentEl } = this;
		this.modalEl.addClass('wiki-search-modal');
		contentEl.empty();

		contentEl.createEl("h2", { text: "Search Wikipedia" });

		// Search bar and button
		const container = contentEl.createDiv({ cls: "search-container" });

		const input = container.createEl("input", {
			type: "text",
			placeholder: "Search Wikipedia...",
		});
		input.value = (this.initialSelection || "").toString();

		const searchBtn = container.createEl("button", { 
			text: "Search",
			cls: "search-btn"
		});

		// Results container
		const resultsContainer = contentEl.createDiv({
			cls: "results-container"
		});

		const performSearch = async () => {
			const query = input.value.trim();
			if (!query) {
				new Notice("Please enter a search term.");
				return;
			}

			resultsContainer.empty();
			resultsContainer.createEl("p", { text: "Searching Wikipedia..." });

			try {
				const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
					query
				)}&utf8=&format=json&origin=*`;

				const res = await fetch(url);
				if (!res.ok) {
					throw new Error(`HTTP ${res.status}`);
				}

				const data = await res.json();
				resultsContainer.empty();

				const results = data?.query?.search;
				if (!results || results.length === 0) {
					resultsContainer.createEl("p", { text: "No results found." });
					return;
				}

				results.forEach((item: any) => {
					const title = item.title;
					const snippet = item.snippet
						? item.snippet.replace(/<\/?[^>]+(>|$)/g, "") // Basic snippet cleaning
						: "";

					const row = resultsContainer.createDiv({ cls: "result-row" });

					row.createEl("strong", { text: title });
					row.createEl("div", { text: snippet, cls: "result-row-snippet" });

					row.onclick = () => {
						const selectedText = this.getCurrentSelection().trim();
						if (!selectedText) {
							new Notice("No text selected to link.");
							return;
						}

						const wikiUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;
						const markdownLink = `[${selectedText}](${wikiUrl})`;

						try {
							// Use the editor instance we were given
							if (this.editor && typeof this.editor.replaceSelection === "function") {
								this.editor.replaceSelection(markdownLink);
							} else {
								// Fallback just in case
								const mv = this.app.workspace.getActiveViewOfType(MarkdownView);
								if (mv && mv.editor) mv.editor.replaceSelection(markdownLink);
							}
							new Notice(`Linked "${selectedText}" to ${title}`);
							this.close();
						} catch (e) {
							console.error("Insert failed:", e);
							new Notice("Failed to insert link into editor.");
						}
					};
				});
			} catch (err) {
				console.error("Wikipedia search failed:", err);
				resultsContainer.empty();
				resultsContainer.createEl("p", {
					text: "Error fetching results. Check console for details.",
				});
			}
		};

		searchBtn.onclick = performSearch;
		input.addEventListener("keydown", (e) => {
			if (e.key === "Enter") performSearch();
		});

		// Perform initial search if selection exists
		if (this.initialSelection) {
			performSearch();
		}
	}

	onClose() {
		this.contentEl.empty();
	}
}