import { App } from "obsidian";

export interface WikiSearchSettings {
	bookFolderPath: string;
	templateFilePath: string;
	hiddenFolders: string[];
	foldersHidden: boolean;
}

/**
 * Defines the interface for the main plugin class,
 * allowing the settings tab to interact with it abstractly.
 */
export interface WikiSearchPluginLike {
	app: App;
	settings: WikiSearchSettings;
	saveSettings: () => Promise<void>;
	/** * Optional wrapper method (added in main.ts) to trigger
	 * the folderHider to re-process folders.
	 */
	processFolders?: () => void;
}