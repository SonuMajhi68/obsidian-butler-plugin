import { App, Notice } from "obsidian";
import { WikiSearchSettings } from "../types";

export interface FolderHiderContext {
	app: App;
	settings: Pick<WikiSearchSettings, 'hiddenFolders' | 'foldersHidden'>; // Only depend on settings we need
	saveSettings: () => Promise<void>;
	registerDomEvent: (el: Document | HTMLElement, event: string, handler: EventListenerOrEventListenerObject) => void;
}

/**
 * FolderHider: hides folders in file explorer according to context.settings
 */
export class FolderHider {
	private ctx: FolderHiderContext;

	constructor(ctx: FolderHiderContext) {
		this.ctx = ctx;
	}

	/** Toggle hide/show and persist setting */
	async toggleHiddenFolders() {
		const s = this.ctx.settings;
		s.foldersHidden = !s.foldersHidden;
		new Notice(s.foldersHidden ? "Configured folders hidden" : "Configured folders shown");
		await this.ctx.saveSettings();
		this.processFolders();
	}

	/** Apply hide/show to currently rendered nav folders */
	processFolders() {
		const s = this.ctx.settings;
		const folders = s.hiddenFolders ?? [];
		// nothing to do
		if (!folders || folders.length === 0) {
			// Ensure all folders are visible if list is empty
			document.querySelectorAll<HTMLElement>(".nav-folder.bw-hidden-folder").forEach(folderEl => {
				folderEl.style.display = "";
				folderEl.classList.remove("bw-hidden-folder");
			});
			return;
		}

		// Nav folder elements in Obsidian file explorer
		const allNavFolders = document.querySelectorAll<HTMLElement>(".nav-folder");

		allNavFolders.forEach((folderEl) => {
			const titleEl = folderEl.querySelector<HTMLElement>(".nav-folder-title");
			if (!titleEl) return;
			
			// Get path from data-path attribute or fall back to text content
			let path = titleEl.getAttribute("data-path");
			if (!path) {
				path = titleEl.dataset.path ?? titleEl.textContent ?? "";
			}
			if (!path) return; // Skip if no path found

			// normalize path and check matches (case-insensitive)
			const normalizedPath = String(path).toLowerCase();
			const shouldHide = folders.some((f) => {
				const name = (f ?? "").trim();
				if (!name) return false;
				const lowerName = name.toLowerCase();

				// support startswith:: and endswith:: prefixes
				if (lowerName.startsWith("startswith::")) {
					const seg = lowerName.substring("startswith::".length).trim();
					if (!seg) return false;
					return normalizedPath.startsWith(seg);
				}
				if (lowerName.startsWith("endswith::")) {
					const seg = lowerName.substring("endswith::".length).trim();
					if (!seg) return false;
					return normalizedPath.endsWith(seg);
				}
				// exact or path-segment match
				const candidate = lowerName;
				return normalizedPath === candidate || // Exact match
					normalizedPath.endsWith(`/${candidate}`) || // Ends with /folder
					normalizedPath.startsWith(`${candidate}/`) || // Starts with folder/
					normalizedPath.includes(`/${candidate}/`); // Contains /folder/
			});

			if (shouldHide && s.foldersHidden) {
				folderEl.style.display = "none";
				folderEl.classList.add("bw-hidden-folder");
			} else {
				folderEl.style.display = "";
				folderEl.classList.remove("bw-hidden-folder");
			}
		});
	}

	/** Register watchers so changes in layout / clicks re-apply hiding */
	registerWatchers() {
		const { app, registerDomEvent } = this.ctx;
		
		// On layout ready, apply hiding once
		// This is now handled in main.ts, but leaving watcher logic here is fine
		app.workspace.onLayoutReady(() => {
			window.setTimeout(() => this.processFolders(), 80);
		});

		// Re-apply when the document is clicked (folder expand/collapse sometimes needs this)
		// Use a slight delay to allow DOM to update first
		registerDomEvent(document, "click", (e: MouseEvent) => {
			// Only process if the click was on a folder title
			if ((e.target as HTMLElement)?.closest(".nav-folder-title")) {
				window.setTimeout(() => this.processFolders(), 30);
			}
		});

		// Re-process on file-explorer layout changes
		this.ctx.app.workspace.on("layout-change", () => {
			window.setTimeout(() => this.processFolders(), 30);
		});
	}
}