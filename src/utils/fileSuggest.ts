import { TAbstractFile, TFile, App } from "obsidian";
import { AbstractInputSuggest } from "obsidian";

/**
 * Suggests TFiles (markdown, etc.) based on user input.
 */
export class FileSuggest extends AbstractInputSuggest<TFile> {
	constructor(app: App, private inputEl: HTMLInputElement) {
		super(app, inputEl);
	}

	getSuggestions(query: string): TFile[] {
		const lowerQuery = query.toLowerCase();
		const allFiles = this.app.vault.getAllLoadedFiles();
		const files: TFile[] = [];

		allFiles.forEach((file: TAbstractFile) => {
			if (
				file instanceof TFile &&
				file.path.toLowerCase().includes(lowerQuery)
			) {
				files.push(file);
			}
		});

		return files;
	}

	renderSuggestion(file: TFile, el: HTMLElement): void {
		el.setText(file.path);
	}

	selectSuggestion(file: TFile): void {
		this.inputEl.value = file.path;
		this.inputEl.dispatchEvent(new Event("input")); // Trigger change event
		this.close();
	}
}