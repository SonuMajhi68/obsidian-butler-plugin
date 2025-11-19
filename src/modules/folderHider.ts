import { App, Notice } from "obsidian";
import { ButlerSettings } from "../utils/types";

export interface FolderHiderContext {
	app: App;
	settings: Pick<ButlerSettings, "hiddenFolders" | "foldersHidden">; // Only depend on settings we need
	saveSettings: () => Promise<void>;
	registerDomEvent: (
		el: Document | HTMLElement,
		event: string,
		handler: EventListenerOrEventListenerObject,
	) => void;
}

export class FolderHider {
	private ctx: FolderHiderContext;

	constructor(ctx: FolderHiderContext) {
		this.ctx = ctx;
	}

	async toggleHiddenFolders() {
		const s = this.ctx.settings;
		s.foldersHidden = !s.foldersHidden;
		new Notice(
			s.foldersHidden
				? "Configured folders hidden"
				: "Configured folders shown",
		);
		await this.ctx.saveSettings();
		this.processFolders();
	}

	processFolders() {
		const s = this.ctx.settings;
		const folders = s.hiddenFolders ?? [];
		// nothing to do
		if (!folders || folders.length === 0) {
			// Ensure all folders are visible if list is empty
			document
				.querySelectorAll<HTMLElement>(".nav-folder.bw-hidden-folder")
				.forEach((folderEl) => {
					folderEl.style.display = "";
					folderEl.classList.remove("bw-hidden-folder");
				});
			return;
		}

		// Nav folder elements in Obsidian file explorer
		const allNavFolders =
			document.querySelectorAll<HTMLElement>(".nav-folder");

		allNavFolders.forEach((folderEl) => {
			const titleEl =
				folderEl.querySelector<HTMLElement>(".nav-folder-title");
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
					const seg = lowerName
						.substring("startswith::".length)
						.trim();
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
				return (
					normalizedPath === candidate || // Exact match
					normalizedPath.endsWith(`/${candidate}`) || // Ends with /folder
					normalizedPath.startsWith(`${candidate}/`) || // Starts with folder/
					normalizedPath.includes(`/${candidate}/`)
				); // Contains /folder/
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

	registerWatchers() {
		const { app, registerDomEvent } = this.ctx;

		app.workspace.onLayoutReady(() => {
			window.setTimeout(() => this.processFolders(), 80);
		});

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
