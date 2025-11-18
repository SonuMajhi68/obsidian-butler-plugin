import { App } from "obsidian";

export interface ButlerSettings {
	//Book settings
	bookFolderPath: string;
	templateFilePath: string;

	// Movie settings
	movieFolderPath: string;
	movieTemplateFilePath: string;
	omdbApiKey: string;

	// Folder hider settings
	hiddenFolders: string[];
	foldersHidden: boolean;

	// Tab settings
	tabsHoverBorder: boolean;
}

/**
 * Defines the interface for the main plugin class,
 * allowing the settings tab to interact with it abstractly.
 */
export interface ButlerPluginLike {
	app: App;
	settings: ButlerSettings;
	saveSettings: () => Promise<void>;
	processFolders?: () => void;
}
