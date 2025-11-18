import {
	App,
	MarkdownPostProcessorContext,
	MarkdownRenderChild,
	MarkdownRenderer,
} from "obsidian";

interface ParsedTab {
	header: string;
	content: string;
}

export class Tabs extends MarkdownRenderChild {
	constructor(
		containerEl: HTMLElement,
		private source: string,
		private ctx: MarkdownPostProcessorContext,
		private app: App,
	) {
		super(containerEl);
	}

	onload() {
		this.render();
	}

	private render() {
		const tabs = this.parseSource(this.source);

		this.containerEl.addClass("butler-tab-container");

		const headerContainer = this.containerEl.createDiv("butler-tab-header");
		const contentContainer = this.containerEl.createDiv(
			"butler-tab-content-container",
		);

		const tabButtons: HTMLElement[] = [];
		const tabContents: HTMLElement[] = [];

		tabs.forEach((tab, index) => {
			const btn = headerContainer.createDiv("butler-tab-btn");
			btn.setText(tab.header);

			const contentEl = contentContainer.createDiv("butler-tab-content");

			if (index !== 0) contentEl.style.display = "none";
			else btn.addClass("active");

			MarkdownRenderer.render(
				this.app,
				tab.content,
				contentEl,
				this.ctx.sourcePath,
				this,
			);

			tabButtons.push(btn);
			tabContents.push(contentEl);

			btn.onclick = () => {
				tabButtons.forEach((b) => b.removeClass("active"));
				tabContents.forEach((c) => (c.style.display = "none"));
				btn.addClass("active");
				contentEl.style.display = "block";
			};
		});
	}

	private parseSource(source: string): ParsedTab[] {
		const lines = source.split("\n");
		const tabs: ParsedTab[] = [];
		let currentHeader = "Tab";
		let currentContent: string[] = [];
		let hasStarted = false;

		for (const line of lines) {
			const match = line.match(/^\s*tab:(.*)/);

			if (match) {
				if (hasStarted) {
					tabs.push({
						header: currentHeader.trim(),
						content: currentContent.join("\n"),
					});
				}
				currentHeader = match[1] || "Untitled";
				currentContent = [];
				hasStarted = true;
			} else {
				if (hasStarted) {
					currentContent.push(line);
				}
			}
		}

		if (hasStarted) {
			tabs.push({
				header: currentHeader.trim(),
				content: currentContent.join("\n"),
			});
		}

		return tabs;
	}
}
