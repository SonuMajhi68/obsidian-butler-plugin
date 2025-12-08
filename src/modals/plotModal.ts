import { App, Modal, Setting, Editor } from "obsidian";
import { ButlerSettings } from "../utils/types";

export class CreatePlotModal extends Modal {
	private editor: Editor;
	private settings: ButlerSettings;

	// Local state
	private title = "My Graph";

	// X Axis State
	private xLabel = "x";
	private xMin = "-10";
	private xMax = "10";
	private xType = "linear";

	// Y Axis State
	private yLabel = "y";
	private yMin = "-10";
	private yMax = "10";
	private yType = "linear";

	private functions = "";
	private grid = true;
	private scaled = false;

	constructor(app: App, editor: Editor, settings: ButlerSettings) {
		super(app);
		this.editor = editor;
		this.settings = settings;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.createEl("h2", { text: "Plot" });

		// --- General Options ---
		new Setting(contentEl)
			.setName("Title")
			.addText((text) =>
				text.setValue(this.title).onChange((val) => (this.title = val)),
			);

		// --- X Axis Settings ---
		contentEl.createEl("h3", { text: "X Axis" });
		new Setting(contentEl)
			.setName("Label & Type")
			.addText((text) =>
				text
					.setPlaceholder("Label")
					.setValue(this.xLabel)
					.onChange((val) => (this.xLabel = val)),
			)
			.addDropdown((drop) =>
				drop
					.addOption("linear", "Linear")
					.addOption("log", "Log")
					.setValue(this.xType)
					.onChange((val) => (this.xType = val)),
			);

		new Setting(contentEl)
			.setName("Domain (Min, Max)")
			.addText((text) =>
				text
					.setPlaceholder("Min")
					.setValue(this.xMin)
					.onChange((val) => (this.xMin = val)),
			)
			.addText((text) =>
				text
					.setPlaceholder("Max")
					.setValue(this.xMax)
					.onChange((val) => (this.xMax = val)),
			);

		// --- Y Axis Settings ---
		contentEl.createEl("h3", { text: "Y Axis" });
		new Setting(contentEl)
			.setName("Label & Type")
			.addText((text) =>
				text
					.setPlaceholder("Label")
					.setValue(this.yLabel)
					.onChange((val) => (this.yLabel = val)),
			)
			.addDropdown((drop) =>
				drop
					.addOption("linear", "Linear")
					.addOption("log", "Log")
					.setValue(this.yType)
					.onChange((val) => (this.yType = val)),
			);

		new Setting(contentEl)
			.setName("Domain (Min, Max)")
			.addText((text) =>
				text
					.setPlaceholder("Min")
					.setValue(this.yMin)
					.onChange((val) => (this.yMin = val)),
			)
			.addText((text) =>
				text
					.setPlaceholder("Max")
					.setValue(this.yMax)
					.onChange((val) => (this.yMax = val)),
			);

		// --- View Options ---
		contentEl.createEl("h3", { text: "Options" });
		new Setting(contentEl)
			.setName("Show Grid")
			.addToggle((toggle) =>
				toggle.setValue(this.grid).onChange((val) => (this.grid = val)),
			);

		new Setting(contentEl)
			.setName("Scaled (1:1 Aspect Ratio)")
			.setDesc(
				"Force X and Y scales to be equal (disables Y domain auto-calc).",
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.scaled)
					.onChange((val) => (this.scaled = val)),
			);

		// --- Function Body ---
		const funcDesc = document.createDocumentFragment();
		funcDesc.append(
			"Define equations, points, or annotations.",
			document.createElement("br"),
			createCodeSpan("sin(x) | color:red"),
			document.createElement("br"),
			createCodeSpan("x=2 | text:Label"),
		);

		new Setting(contentEl)
			.setName("Plot Content")
			.setDesc(funcDesc)
			.addTextArea((text) => {
				text.inputEl.rows = 6;
				text.inputEl.style.width = "100%";
				text.inputEl.style.fontFamily = "monospace";
				text.setPlaceholder(
					"x^2 | color:blue\n1/x | nSamples:100 | closed:true\n[2,1] | fnType:vector",
				);
				text.onChange((val) => (this.functions = val));
			});

		// --- Footer ---
		new Setting(contentEl).addButton((btn) =>
			btn
				.setButtonText("Insert Plot")
				.setCta()
				.onClick(() => {
					this.insertPlot();
					this.close();
				}),
		);
	}

	insertPlot() {
		const funcs = this.functions
			.split("\n")
			.map((f) => f.trim())
			.filter((f) => f.length > 0);

		// Construct Axis Strings using pipe syntax
		// Format: [label:x | domain:[-10, 10] | type:linear]

		const buildAxisString = (
			label: string,
			min: string,
			max: string,
			type: string,
		) => {
			const parts = [];
			if (label) parts.push(`label:${label}`);
			parts.push(`domain:[${min}, ${max}]`);
			if (type && type !== "linear") parts.push(`type:${type}`);
			return `[${parts.join(" | ")}]`;
		};

		const xAxisStr = buildAxisString(
			this.xLabel,
			this.xMin,
			this.xMax,
			this.xType,
		);
		const yAxisStr = buildAxisString(
			this.yLabel,
			this.yMin,
			this.yMax,
			this.yType,
		);

		// Construct YAML Header
		const yamlParts = [];
		if (this.title) yamlParts.push(`title: ${this.title}`);

		yamlParts.push(`xAxis: ${xAxisStr}`);
		yamlParts.push(`yAxis: ${yAxisStr}`);

		if (!this.grid) yamlParts.push(`grid: false`);
		if (this.scaled) yamlParts.push(`scaled: true`);

		let content = "```plot\n";
		if (yamlParts.length > 0) {
			content += "---\n";
			content += yamlParts.join("\n");
			content += "\n---\n";
		}

		// Add body content
		if (funcs.length > 0) {
			content += funcs.join("\n");
		} else {
			// Default example if empty
			content += "sin(x) | color:steelblue";
		}

		content += "\n```\n";

		this.editor.replaceSelection(content);
	}

	onClose() {
		this.contentEl.empty();
	}
}

function createCodeSpan(text: string) {
	const span = document.createElement("span");
	span.textContent = text;
	span.style.color = "var(--text-accent)";
	span.style.background = "var(--background-secondary)";
	span.style.padding = "2px 4px";
	span.style.borderRadius = "4px";
	return span;
}
