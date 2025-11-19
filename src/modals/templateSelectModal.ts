import { App, FuzzySuggestModal } from "obsidian";
// Remove BookTemplate import

export class TemplateSelectModal extends FuzzySuggestModal<string> {
	private templates: string[];
	private onChoose: (templatePath: string) => void;

	constructor(
		app: App,
		templates: string[],
		onChoose: (templatePath: string) => void,
	) {
		super(app);
		this.templates = templates;
		this.onChoose = onChoose;
	}

	getItems(): string[] {
		return this.templates;
	}

	getItemText(item: string): string {
		return item; // The item itself is the path string now
	}

	onChooseItem(item: string, evt: MouseEvent | KeyboardEvent): void {
		this.onChoose(item);
	}
}