/* eslint-disable @typescript-eslint/no-explicit-any */

import { Editor, MarkdownView } from "obsidian";

export function addTabCommand(plugin: any) {
	plugin.addCommand({
		id: "butler-create-tab",
		name: "Create a Tab",
		editorCallback: (editor: Editor, view: MarkdownView) => {
			const defaultContent = "```tab\ntab:Header\nContent\n```";
			const line = editor.getCursor().line;
			editor.replaceRange(defaultContent, { line, ch: 0 });
			editor.setCursor({ line: line + 1, ch: 0 });
		},
	});
}
