import { App } from "obsidian";

export interface ButlerSettings {
	// Book settings
	bookFolderPaths: string[];
	bookTemplates: string[];

	// Movie settings
	movieFolderPaths: string[];
	movieTemplates: string[]; // Changed from movieTemplateFilePath to string[]
	omdbApiKey: string;

	// Folder hider settings
	hiddenFolders: string[];
	foldersHidden: boolean;

	// Tab settings
	tabsHoverBorder: boolean;

	plotTitleFontSize: number;
	plotLabelFontSize: number;
	plotLineWidth: number;
	plotGraphLineWidth: number; // NEW (Used for Graph Curves)
	plotGridWidth: number;
	plotFontColor: string;
	plotLineColor: string;
	plotGridColor: string;
	plotDisableZoom: boolean;
}

export interface ButlerPluginLike {
	app: App;
	settings: ButlerSettings;
	saveSettings: () => Promise<void>;
	processFolders?: () => void;
	updateFolderHiderIcon?: () => void;
}

export interface PlotAxisConfig {
	label?: string;
	type?: "linear" | "log";
	domain?: [number, number];
	invert?: boolean;
}

export interface PlotBlockOptions {
	width: number;
	height: number;
	title?: string;
	xAxis: PlotAxisConfig;
	yAxis: PlotAxisConfig;
	disableZoom: boolean;
	grid: boolean;
	scaled: boolean;
	lines: string[];
}
