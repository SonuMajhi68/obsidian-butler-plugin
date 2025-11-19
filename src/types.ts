import { App } from "obsidian";

// Remove the BookTemplate interface entirely

export interface ButlerSettings {
	// Book settings
	bookFolderPath: string;
	bookTemplates: string[]; // Changed from BookTemplate[] to string[]

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

export interface ButlerPluginLike {
	app: App;
	settings: ButlerSettings;
	saveSettings: () => Promise<void>;
	processFolders?: () => void;
}