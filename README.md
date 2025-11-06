# 📚 Butler for Obsidian

This plugin provides a collection of useful tools for your Obsidian vault, integrating external knowledge from **OpenLibrary** and **Wikipedia**, and adding quality-of-life features like a **Folder Hider**.


## ✨ Features

This plugin includes three main features:

### 1. **Book Search**
Quickly search for books on **OpenLibrary** and save them as new, detailed notes in your vault.

### 2. **Wikipedia Linker**
Instantly link your selected text to a relevant **Wikipedia** article.

### 3. **Folder Hider**
Declutter your file explorer by hiding specified folders (like `Templates` or `Assets`) with a simple toggle.


## 🚀 How to Use

### 1. **Book Search**

1. Click the **“Search Books”** (📖 icon) in the left ribbon.  
2. A modal will open. Type in a book title and click **“Search”**.  
3. Browse the list of results. Clicking on a book will:
   - Fetch detailed information from OpenLibrary.  
   - Fill out a new note using your specified template.  
   - Save the new note to your designated **Book Folder**.  
   - Automatically open the new note for you.


### 2. **Wikipedia Linker**

1. In the editor, select any piece of text you want to link.  
2. Right-click on the selected text.  
3. Choose **“Wiki Link”** from the context menu.  
4. A modal will open and automatically search **Wikipedia** for your selected text.  
5. Click on the correct search result — the plugin will instantly format your selected text into a Markdown link:  

   ```markdown
   [Your Text](https://en.wikipedia.org/wiki/Page_Title)
   ```


### 3. **Folder Hider**

1. Click the **“Toggle Hidden Folders”** (👁️ icon) in the left ribbon to show or hide folders you’ve configured in settings.  
2. You can also use the **“Toggle Hidden Folders”** command from the Command Palette (`Ctrl/Cmd + P`).  

Perfect for hiding system folders, template folders, or archives that you don’t need to see every day.

---

## ⚙️ Configuration

To configure the plugin, open Obsidian’s **Settings** and find the **Book & Wiki Utilities** tab.

### 📘 Book Settings

| Setting | Description |
|----------|--------------|
| **Book folder path** | Set the default folder where new book notes are saved (e.g., `Inbox/Books`). |
| **Template file path** | Choose the `.md` file used as a template for new book notes. |

#### Template Placeholders

Use these placeholders inside your template file:

| Placeholder | Description |
|--------------|-------------|
| `{{title}}` | Book title |
| `{{author}}` | Author name |
| `{{year}}` | Year of publication |
| `{{publisher}}` | Publisher name |
| `{{url}}` | Link to the OpenLibrary page |
| `{{cover}}` | Link to the book’s cover image |
| `{{json}}` | Raw JSON block of all data from the API |


### 🗂️ Folder Hider Settings

| Setting | Description |
|----------|-------------|
| **Hidden Folders** | A text area listing all folders to hide (one per line). |
| **Prefix Matching** | Use `startswith::` or `endswith::` for flexible matching (e.g., `startswith::Private-` hides `Private-Notes` and `Private-Projects`). |
| **Hide Folders by Default** | Toggle whether folders are hidden when the vault first loads. |

## Manually installing the plugin

- Run the build command (this is typically set up in the package.json file of the Obsidian sample plugin):
```bash
npm install
npm run build
```
- Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/your-plugin-id/`.