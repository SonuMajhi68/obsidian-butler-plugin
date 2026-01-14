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
import { ButlerSettings, ButlerPluginLike } from "./utils/types";

import { addPlotCommand } from "./commands/plotCommand"; // NEW
import { FunctionPlotHandler } from "./modules/functionPlot"; // NEW

const DEFAULT_SETTINGS: ButlerSettings = {
	bookFolderPaths: ["Books"],
	bookTemplates: ["Templates/book.md"],
	useGoogleBooks: false,
	googleBooksApiKey: "",
	movieFolderPaths: ["Movies"],
	movieTemplates: ["Templates/movie.md"], // Changed here
	omdbApiKey: "",
	hiddenFolders: ["Templates"],
	foldersHidden: true,
	tabsHoverBorder: true,
	plotTitleFontSize: 24,
	plotLabelFontSize: 12,
	plotLineWidth: 2,
	plotGraphLineWidth: 2, // NEW: Default graph width
	plotGridWidth: 1,
	plotFontColor: "var(--text-normal)",
	plotLineColor: "gray",
	plotGridColor: "var(--icon-color)",
	plotDisableZoom: false,
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
		addPlotCommand(this); // Register NEW Command

		// Wiki context menu
		registerWikiSearchContext(this.app, this);

		// Initialize FolderHider
		this.folderHider = new FolderHider({
			app: this.app,
			settings: this.settings,
			saveSettings: this.saveSettings.bind(this),
			registerDomEvent: this.registerDomEvent.bind(this),
		});

		// Set correct initial state for icon
		this.updateFolderHiderIcon();
		this.updateTabHoverBorder(this.settings.tabsHoverBorder);

		// Register tab
		this.registerMarkdownCodeBlockProcessor("tab", (source, el, ctx) => {
			const tabs = new Tabs(el, source, ctx, this.app);
			// console.log(el.parentElement);
			ctx.addChild(tabs);
		});

		this.registerMarkdownCodeBlockProcessor("plot", (source, el, ctx) => {
			FunctionPlotHandler.render(source, el, ctx, this.settings);
		});

		// Register layout watchers
		this.folderHider.registerWatchers();

		// Apply once after load
		this.app.workspace.onLayoutReady(() => {
			window.setTimeout(() => this.folderHider.processFolders(), 120);
		});
	}

	updateFolderHiderIcon() {
		if (!this.folderHiderToggleIconEl) return;

		const isHidden = this.settings.foldersHidden;
		setIcon(this.folderHiderToggleIconEl, isHidden ? "eye-off" : "eye");
		this.folderHiderToggleIconEl.setAttr(
			"aria-label",
			isHidden ? "Show hidden folders" : "Hide configured folders",
		);
	}

	private updateTabHoverBorder(value: boolean) {
		if (value) {
			document.body.addClass("hide-boder");
		} else {
			document.body.removeClass("hide-boder");
		}
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
