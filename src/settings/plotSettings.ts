import { Setting } from "obsidian";
import { ButlerPluginLike } from "../utils/types";

export function renderPlotSettings(
	containerEl: HTMLElement,
	plugin: ButlerPluginLike,
) {
	containerEl.createEl("h1", { text: "Plot Settings" });

	new Setting(containerEl).setName("Title Font Size").addSlider((slider) =>
		slider
			.setLimits(10, 32, 1)
			.setValue(plugin.settings.plotTitleFontSize)
			.onChange(async (val) => {
				plugin.settings.plotTitleFontSize = val;
				await plugin.saveSettings();
			})
			.setDynamicTooltip(),
	);

	// Renamed for clarity (was "Line Width")
	new Setting(containerEl).setName("Axis Line Width").addSlider((slider) =>
		slider
			.setLimits(1, 5, 1)
			.setValue(plugin.settings.plotLineWidth)
			.onChange(async (val) => {
				plugin.settings.plotLineWidth = val;
				await plugin.saveSettings();
			})
			.setDynamicTooltip(),
	);

	// NEW: Graph Stroke Width
	new Setting(containerEl).setName("Graph Stroke Width").addSlider((slider) =>
		slider
			.setLimits(1, 10, 0.5)
			.setValue(plugin.settings.plotGraphLineWidth)
			.onChange(async (val) => {
				plugin.settings.plotGraphLineWidth = val;
				await plugin.saveSettings();
			})
			.setDynamicTooltip(),
	);

	new Setting(containerEl).setName("Grid Line Width").addSlider((slider) =>
		slider
			.setLimits(1, 5, 0.5)
			.setValue(plugin.settings.plotGridWidth)
			.onChange(async (val) => {
				plugin.settings.plotGridWidth = val;
				await plugin.saveSettings();
			})
			.setDynamicTooltip(),
	);

	new Setting(containerEl)
		.setName("Font Color")
		.setDesc("CSS color (e.g. 'red', '#ff0000', or 'var(--text-normal)')")
		.addText((text) =>
			text
				.setValue(plugin.settings.plotFontColor)
				.onChange(async (val) => {
					plugin.settings.plotFontColor = val;
					await plugin.saveSettings();
				}),
		);

	new Setting(containerEl).setName("").setHeading();
}
