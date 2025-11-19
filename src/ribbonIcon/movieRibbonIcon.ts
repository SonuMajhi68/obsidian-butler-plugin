/* eslint-disable @typescript-eslint/no-explicit-any */

import { Notice } from "obsidian";
import { SearchMovieModal } from "src/modals/movieSearchModal";

export function addMovieRibbonIcon(plugin: any) {
	plugin.addRibbonIcon("film", "Search Movies & Series", () => {
		if (!plugin.settings.omdbApiKey) {
			new Notice(
				"OMDb API key is missing. Please add it in the plugin settings.",
			);
			return;
		}
		new SearchMovieModal(
			plugin.app,
			plugin.settings.movieFolderPath,
			plugin.settings.movieTemplates, // Pass the array
			plugin.settings.omdbApiKey,
		).open();
	});
}
