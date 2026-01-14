import { SettingGroup } from "obsidian";
import { ButlerPluginLike } from "../utils/types";

export function renderPlotSettings(
	containerEl: HTMLElement,
	plugin: ButlerPluginLike,
) {
	const settingGroup = new SettingGroup(containerEl).setHeading(
		"Plot Settings",
	);

	settingGroup.addSetting((setting) =>
		setting.setName("Title Font Size").addSlider((slider) =>
			slider
				.setLimits(10, 32, 1)
				.setValue(plugin.settings.plotTitleFontSize)
				.onChange(async (val) => {
					plugin.settings.plotTitleFontSize = val;
					await plugin.saveSettings();
				})
				.setDynamicTooltip(),
		),
	);

	// Renamed for clarity (was "Line Width")
	settingGroup.addSetting((setting) =>
		setting.setName("Axis Line Width").addSlider((slider) =>
			slider
				.setLimits(1, 5, 1)
				.setValue(plugin.settings.plotLineWidth)
				.onChange(async (val) => {
					plugin.settings.plotLineWidth = val;
					await plugin.saveSettings();
				})
				.setDynamicTooltip(),
		),
	);

	// NEW: Graph Stroke Width
	settingGroup.addSetting((setting) =>
		setting.setName("Graph Stroke Width").addSlider((slider) =>
			slider
				.setLimits(1, 10, 0.5)
				.setValue(plugin.settings.plotGraphLineWidth)
				.onChange(async (val) => {
					plugin.settings.plotGraphLineWidth = val;
					await plugin.saveSettings();
				})
				.setDynamicTooltip(),
		),
	);

	settingGroup.addSetting((setting) =>
		setting.setName("Grid Line Width").addSlider((slider) =>
			slider
				.setLimits(1, 5, 0.5)
				.setValue(plugin.settings.plotGridWidth)
				.onChange(async (val) => {
					plugin.settings.plotGridWidth = val;
					await plugin.saveSettings();
				})
				.setDynamicTooltip(),
		),
	);

	settingGroup.addSetting((setting) =>
		setting
			.setName("Font Color")
			.setDesc(
				"CSS color (e.g. 'red', '#ff0000', or 'var(--text-normal)')",
			)
			.addText((text) =>
				text
					.setValue(plugin.settings.plotFontColor)
					.onChange(async (val) => {
						plugin.settings.plotFontColor = val;
						await plugin.saveSettings();
					}),
			),
	);

	// new Setting(containerEl).setName("").setHeading();
}
