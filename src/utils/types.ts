import { App } from "obsidian";

export interface ButlerSettings {
	// Book settings
	bookFolderPath: string;
	bookTemplates: string[];

	// Movie settings
	movieFolderPath: string;
	movieTemplates: string[]; // Changed from movieTemplateFilePath to string[]
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
	updateFolderHiderIcon?: () => void;
}
