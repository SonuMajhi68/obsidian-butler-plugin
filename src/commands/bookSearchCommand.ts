import { SearchBooksModal } from '../modals/bookSearchModal';

export function addBookSearchCommand(plugin: any) {
	plugin.addCommand({
		id: 'search-books-modal',
		name: 'Search and Create Book Note',
		callback: () => {
			new SearchBooksModal(
				plugin.app,
				plugin.settings.bookFolderPath,
				plugin.settings.templateFilePath
			).open();
		}
	});
}