/* eslint-disable @typescript-eslint/no-explicit-any */

import { SearchMovieModal } from "../modals/movieSearchModal";

export function addMovieSearchCommand(plugin: any) {
	plugin.addCommand({
		id: "butler-search-movies",
		name: "Search and Create Movie Note",
		callback: () => {
			new SearchMovieModal(
				plugin.app,
				plugin.settings.movieFolderPaths,
				plugin.settings.movieTemplates, // Pass the array
				plugin.settings.omdbApiKey,
			).open();
		},
	});
}
