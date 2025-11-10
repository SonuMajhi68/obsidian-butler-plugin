import { Plugin, Notice, setIcon } from "obsidian";
import { SearchBooksModal } from "./modals/bookSearchModal";
import { SearchMovieModal } from "./modals/movieSearchModal";
import { addBookSearchCommand } from "./commands/bookSearchCommand";
import { addMovieSearchCommand } from "./commands/movieSearchCommand";
import { registerWikiSearchContext } from "./contexts/wikiSearchContext";
import { ButlerSettingTab } from "./settings";
import { ButlerSettings, ButlerPluginLike } from "./types";
import { FolderHider } from "./features/folderHider";

// Import the new styles
// import "./style.css"; // <-- REMOVE THIS LINE

const DEFAULT_SETTINGS: ButlerSettings = {
	bookFolderPath: "Books",
	templateFilePath: "Templates/book.md",
	movieFolderPath: "Movies", // Add new default
	movieTemplateFilePath: "Templates/movie.md", // Add new default
	omdbApiKey: "fc4ed631", // Add new default
	hiddenFolders: ["Templates"],
	foldersHidden: true,
};

export default class ButlerPlugin extends Plugin implements ButlerPluginLike {
	settings: ButlerSettings;
	folderHider: FolderHider;
	private folderHiderToggleIconEl: HTMLElement;

	async onload() {
		console.log("BookWikiPlugin loaded");

		// Load settings
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());

		// Settings tab
		this.addSettingTab(new ButlerSettingTab(this.app, this));

		// Book Search ribbon
		this.addRibbonIcon("book", "Search Books", () => {
			new SearchBooksModal(
				this.app,
				this.settings.bookFolderPath,
				this.settings.templateFilePath
			).open();
			// This notice seems a bit redundant if the modal opens, but keeping as it was in original
			new Notice("Book Search opened"); 
		});

		// --- New Movie Search Ribbon ---
		this.addRibbonIcon("film", "Search Movies & Series", () => {
			if (!this.settings.omdbApiKey) {
				new Notice("OMDb API key is missing. Please add it in the plugin settings.");
				return;
			}
			new SearchMovieModal(
				this.app,
				this.settings.movieFolderPath,
				this.settings.movieTemplateFilePath,
				this.settings.omdbApiKey
			).open();
			new Notice("Movie Search opened");
		});

		// Wiki context menu
		registerWikiSearchContext(this.app);

		// Initialize FolderHider
		this.folderHider = new FolderHider({
			app: this.app,
			settings: this.settings,
			saveSettings: this.saveSettings.bind(this),
			registerDomEvent: this.registerDomEvent.bind(this),
		});

		// --- 👁️ Create toggleable eye icon ---
		this.folderHiderToggleIconEl = this.addRibbonIcon(
			"eye", // Initial icon, will be updated
			"Toggle hidden folders", // Initial tooltip, will be updated
			async () => {
				// Flip the flag
				this.settings.foldersHidden = !this.settings.foldersHidden;
				// Save and refresh folder visibility
				await this.saveSettings();
				this.folderHider.processFolders();
				this.updateFolderHiderIcon(); // Update the icon
			}
		);
		// Set correct initial state for icon
		this.updateFolderHiderIcon();
		
		
		addBookSearchCommand(this);
		addMovieSearchCommand(this);


		// --- 🧩 Command palette toggle ---
		this.addCommand({
			id: "toggle-hidden-folders",
			name: "Toggle hidden folders",
			callback: async () => {
				this.settings.foldersHidden = !this.settings.foldersHidden;
				await this.saveSettings();
				this.folderHider.processFolders();
				this.updateFolderHiderIcon(); // Update the icon
			},
		});

		// Register layout watchers
		this.folderHider.registerWatchers();

		// Apply once after load
		this.app.workspace.onLayoutReady(() => {
			window.setTimeout(() => this.folderHider.processFolders(), 120);
		});
	}

	/**
	 * Updates the ribbon icon's appearance and tooltip based on the current setting.
	 */
	private updateFolderHiderIcon() {
		if (!this.folderHiderToggleIconEl) return;
		
		const isHidden = this.settings.foldersHidden;
		setIcon(this.folderHiderToggleIconEl, isHidden ? "eye-off" : "eye");
		this.folderHiderToggleIconEl.setAttr(
			"aria-label",
			isHidden ? "Show hidden folders" : "Hide configured folders"
		);
	}

	/**
	 * Exposed method to allow settings tab to trigger a folder refresh.
	 */
	processFolders() {
		this.folderHider?.processFolders();
	}

	async onunload() {
		console.log("BookWikiPlugin unloaded");
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}