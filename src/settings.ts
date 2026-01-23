/* eslint-disable @typescript-eslint/no-explicit-any */

import { App, IconName, PluginSettingTab } from "obsidian";
import { ButlerPluginLike } from "./utils/types";

import { renderBookSettings } from "./settings/bookSettings";
import { renderMovieSettings } from "./settings/movieSettings";
import { renderHiderSettings } from "./settings/hiderSettings";
import { renderTabsSettings } from "./settings/tabsSettings";
import { renderPlotSettings } from "./settings/plotSettings";

export class ButlerSettingTab extends PluginSettingTab {
	plugin: ButlerPluginLike;

	constructor(app: App, plugin: ButlerPluginLike) {
		super(app, plugin as any);
		this.plugin = plugin;
	}

	icon: IconName = "heart-handshake";

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		// Delegated sections
		renderBookSettings(containerEl, this.app, this.plugin);
		renderMovieSettings(containerEl, this.app, this.plugin);
		renderHiderSettings(containerEl, this.plugin);
		renderTabsSettings(containerEl, this.plugin);
		renderPlotSettings(containerEl, this.plugin);
	}
}
