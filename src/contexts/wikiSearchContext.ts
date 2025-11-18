import { App, Notice, Editor, MarkdownView } from "obsidian";
import { WikiSearchModal } from "../modals/wikiSearchModal";

export function registerWikiSearchContext(app: App) {
	app.workspace.on(
		"editor-menu",
		(menu, editor: Editor, view: MarkdownView) => {
			menu.addItem((item) => {
				item.setTitle("Wiki Link")
					.setIcon("link")
					.onClick(() => {
						const selection = editor.getSelection
							? editor.getSelection()
							: "";
						if (!selection || String(selection).trim() === "") {
							new Notice("No text selected.");
							return;
						}
						new WikiSearchModal(
							app,
							editor,
							String(selection),
						).open();
					});
			});
		},
	);
}
