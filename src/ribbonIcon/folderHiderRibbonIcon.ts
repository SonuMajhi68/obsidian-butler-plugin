/* eslint-disable @typescript-eslint/no-explicit-any */

export function addFolderHiderRibbonIcon(plugin: any) {
	const isHidden = plugin.settings.foldersHidden;
	const initialIcon = isHidden ? "eye-off" : "eye";
	const initialLabel = isHidden ? "Show hidden folders" : "Hide configured folders";

	plugin.folderHiderToggleIconEl = plugin.addRibbonIcon(
		initialIcon,
		initialLabel,
		async () => {
			plugin.settings.foldersHidden = !plugin.settings.foldersHidden;

			await plugin.saveSettings();

			plugin.folderHider.processFolders();
			plugin.updateFolderHiderIcon();
		},
	);
}