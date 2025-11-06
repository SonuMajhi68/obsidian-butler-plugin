import { TAbstractFile, TFolder, App } from "obsidian";
import { AbstractInputSuggest } from "obsidian";

/**
 * Suggests TFolders (directories) based on user input.
 */
export class FolderSuggest extends AbstractInputSuggest<TFolder> {
	constructor(app: App, private inputEl: HTMLInputElement) {
		super(app, inputEl);
	}

	getSuggestions(query: string): TFolder[] {
		const lowerQuery = query.toLowerCase();
		const allFiles = this.app.vault.getAllLoadedFiles();
		const folders: TFolder[] = [];

		allFiles.forEach((file: TAbstractFile) => {
			if (
				file instanceof TFolder &&
				file.path.toLowerCase().includes(lowerQuery)
			) {
				folders.push(file);
			}
		});

		// Always include root
		if ("/".includes(lowerQuery) && !folders.find(f => f.path === "/")) {
			const root = this.app.vault.getRoot();
			if (root) folders.unshift(root);
		}

		return folders;
	}

	renderSuggestion(folder: TFolder, el: HTMLElement): void {
		el.setText(folder.path);
	}

	selectSuggestion(folder: TFolder): void {
		this.inputEl.value = folder.path;
		this.inputEl.dispatchEvent(new Event("input")); // Trigger change event
		this.close();
	}
}