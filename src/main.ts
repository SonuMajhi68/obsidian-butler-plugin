import { Plugin, setIcon } from "obsidian";
import { addBookSearchCommand } from "./commands/bookSearchCommand";
import { addMovieSearchCommand } from "./commands/movieSearchCommand";
import { addHideFolderCommand } from "./commands/hideFolderCommand";
import { addTabCommand } from "./commands/tabCommand";
import { addBookRibbonIcon } from "./ribbonIcon/bookRibbonIcon";
import { addMovieRibbonIcon } from "./ribbonIcon/movieRibbonIcon";
import { addFolderHiderRibbonIcon } from "./ribbonIcon/folderHiderRibbonIcon";
import { registerWikiSearchContext } from "./contexts/wikiSearchContext";
import { FolderHider } from "./modules/folderHider";
import { Tabs } from "./modules/tabs";
import { ButlerSettingTab } from "./settings";
import { ButlerSettings, ButlerPluginLike } from "./types";

const DEFAULT_SETTINGS: ButlerSettings = {
	bookFolderPath: "Books",
	templateFilePath: "Templates/book.md",
	movieFolderPath: "Movies", // Add new default
	movieTemplateFilePath: "Templates/movie.md", // Add new default
	omdbApiKey: "fc4ed631", // Add new default
	hiddenFolders: ["Templates"],
	foldersHidden: true,
	tabsHoverBorder: true,
};

export default class ButlerPlugin extends Plugin implements ButlerPluginLike {
	settings: ButlerSettings;
	folderHider: FolderHider;
	private folderHiderToggleIconEl: HTMLElement;

	async onload() {
		console.log("BookWikiPlugin loaded");

		// Setup Settings
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData(),
		);

		// Settings tab
		this.addSettingTab(new ButlerSettingTab(this.app, this));

		// Ribbon Icon
		addBookRibbonIcon(this);
		addMovieRibbonIcon(this);
		addFolderHiderRibbonIcon(this);

		// Commands
		addBookSearchCommand(this);
		addMovieSearchCommand(this);
		addHideFolderCommand(this);
		addTabCommand(this);
		
		// Wiki context menu
		registerWikiSearchContext(this.app);

		// Initialize FolderHider
		this.folderHider = new FolderHider({
			app: this.app,
			settings: this.settings,
			saveSettings: this.saveSettings.bind(this),
			registerDomEvent: this.registerDomEvent.bind(this),
		});

		// Set correct initial state for icon
		this.updateFolderHiderIcon();

		// Register tab
		this.registerMarkdownCodeBlockProcessor("tab", (source, el, ctx) => {
			const tabs = new Tabs(el, source, ctx, this.app);
			console.log(el.parentElement);
			ctx.addChild(tabs);
		});

		// Register layout watchers
		this.folderHider.registerWatchers();

		// Apply once after load
		this.app.workspace.onLayoutReady(() => {
			window.setTimeout(() => this.folderHider.processFolders(), 120);
		});
	}

	private updateFolderHiderIcon() {
		if (!this.folderHiderToggleIconEl) return;

		const isHidden = this.settings.foldersHidden;
		setIcon(this.folderHiderToggleIconEl, isHidden ? "eye-off" : "eye");
		this.folderHiderToggleIconEl.setAttr(
			"aria-label",
			isHidden ? "Show hidden folders" : "Hide configured folders",
		);
	}

	processFolders() {
		this.folderHider?.processFolders();
	}

	async onunload() {
		console.log("Butler Plugin unloaded");
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
