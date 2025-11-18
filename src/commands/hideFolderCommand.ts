/* eslint-disable @typescript-eslint/no-explicit-any */

export function addHideFolderCommand(plugin: any) {
	plugin.addCommand({
		id: "butler-toggle-hidden-folders",
		name: "Toggle hidden folders",
		callback: async () => {
			plugin.settings.foldersHidden = !plugin.settings.foldersHidden;
			await plugin.saveSettings();
			plugin.folderHider.processFolders();
			plugin.updateFolderHiderIcon(); // Update the icon
		},
	});
}