/* eslint-disable @typescript-eslint/no-explicit-any */

export function addFolderHiderRibbonIcon(plugin: any) {
	plugin.folderHiderToggleIconEl = plugin.addRibbonIcon(
		"eye",
		"Toggle hidden folders",
		async () => {
			plugin.settings.foldersHidden = !plugin.settings.foldersHidden;

			await plugin.saveSettings();

			plugin.folderHider.processFolders();
			plugin.updateFolderHiderIcon();
		},
	);
}
