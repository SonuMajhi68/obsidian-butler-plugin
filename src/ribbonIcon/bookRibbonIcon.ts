/* eslint-disable @typescript-eslint/no-explicit-any */

import { SearchBooksModal } from "src/modals/bookSearchModal";

export function addBookRibbonIcon(plugin: any) {
	plugin.addRibbonIcon("book", "Search Books", () => {
		new SearchBooksModal(
			plugin.app,
			plugin.settings.bookFolderPath,
			plugin.settings.bookTemplates // Pass the array
		).open();
	});
}