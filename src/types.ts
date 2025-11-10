import { App } from "obsidian";

export interface ButlerSettings {
	bookFolderPath: string;
	templateFilePath: string;
	
	// Movie settings
	movieFolderPath: string;
	movieTemplateFilePath: string;
	omdbApiKey: string;

	// Folder hider settings
	hiddenFolders: string[];
	foldersHidden: boolean;
}

/**
 * Defines the interface for the main plugin class,
 * allowing the settings tab to interact with it abstractly.
 */
export interface ButlerPluginLike {
	app: App;
	settings: ButlerSettings;
	saveSettings: () => Promise<void>;
	/** * Optional wrapper method (added in main.ts) to trigger
	 * the folderHider to re-process folders.
	 */
	processFolders?: () => void;
}