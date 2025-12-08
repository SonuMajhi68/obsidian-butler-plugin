// src/commands/plotCommand.ts
import { Editor, MarkdownView } from "obsidian";
import { CreatePlotModal } from "../modals/plotModal";

/* eslint-disable @typescript-eslint/no-explicit-any */
export function addPlotCommand(plugin: any) {
	plugin.addCommand({
		id: "butler-insert-plot",
		name: "Insert Function Plot",
		editorCallback: (editor: Editor, view: MarkdownView) => {
			new CreatePlotModal(plugin.app, editor, plugin.settings).open();
		},
	});
}
