/* eslint-disable @typescript-eslint/no-explicit-any */

import { SearchMovieModal } from '../modals/movieSearchModal';

export function addMovieSearchCommand(plugin: any) {
	plugin.addCommand({
		id: 'butler-search-movies',
		name: 'Search and Create Movie Note',
		callback: () => {
			// Uses the dedicated movie paths from the updated settings interface
			new SearchMovieModal(
				plugin.app,
				plugin.settings.movieFolderPath,
				plugin.settings.movieTemplatePath,
				plugin.settings.omdbApiKey
			).open();
		}
	});
}