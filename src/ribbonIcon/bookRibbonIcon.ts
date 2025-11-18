/* eslint-disable @typescript-eslint/no-explicit-any */

import { Notice } from "obsidian";
import { SearchBooksModal } from "src/modals/bookSearchModal";

export function addBookRibbonIcon(plugin: any) {
	plugin.addRibbonIcon("book", "Search Books", () => {
		new SearchBooksModal(
			plugin.app,
			plugin.settings.bookFolderPath,
			plugin.settings.templateFilePath,
		).open();
		new Notice("Book Search opened");
	});
}