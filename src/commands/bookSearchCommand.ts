/* eslint-disable @typescript-eslint/no-explicit-any */

import { SearchBooksModal } from '../modals/bookSearchModal';

export function addBookSearchCommand(plugin: any) {
	plugin.addCommand({
		id: 'butler-search-books',
		name: 'Search and Create Book Note',
		callback: () => {
			new SearchBooksModal(
				plugin.app,
				plugin.settings.bookFolderPath,
				plugin.settings.bookTemplates // Pass the array
			).open();
		}
	});
}