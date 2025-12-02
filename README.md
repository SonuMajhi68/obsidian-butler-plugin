# 🎩 Butler for Obsidian

**Butler** is a comprehensive utility plugin for Obsidian designed to streamline your knowledge management workflow. It bridges the gap between your vault and external databases (OpenLibrary, OMDb, Wikipedia) while providing powerful UI enhancements like folder hiding and tabbed content.

## 🔥 Features

###  Media Fetching
* **Book Search:** Search **OpenLibrary** to instantly create book notes with metadata (authors, publication year, covers).
* **Movie & TV Search:** Query **OMDb** to generate notes for movies and series with posters, ratings, and cast lists.
* **Templating:** Fully customizable templates for both books and movies using dynamic placeholders.

###  Knowledge Integration
* **Wikipedia Linker:** Context-menu integration to search selected text on Wikipedia and insert formatted Markdown links without breaking your writing flow.

###  Vault Management
* **Folder Hider:** Toggle the visibility of specific folders (e.g., `Templates`, `Assets`, `Private`) to keep your file explorer clean. Supports pattern matching.
* **Tabbed Content:** Create clean, clickable tab interfaces within your notes using a simple code block.

---

## 🧩 Usage

### 1. Creating Media Notes
1.  Click the **Book** (📕) or **Film** (🎬) icon in the left ribbon (or use the Command Palette).
2.  Enter the title of the media you are looking for.
3.  Select the correct result from the list.
4.  **Note:** If you have multiple storage folders or templates defined in settings, Butler will prompt you to select the desired destination/style.

### 2. Wikipedia Linking
1.  Highlight any text in your editor.
2.  Right-click and select **"Wiki Link"**.
3.  Choose the matching article from the modal. The text will be converted into a link: `[Selected Text](Wiki_URL)`.

### 3. Hiding Folders
1.  Define folders to hide in **Settings**.
2.  Click the **Eye** (👁️) icon in the ribbon or run the command **"Toggle hidden folders"** to switch visibility.

### 4. Adding Tabs
Insert a `tab` code block to create tabbed interfaces. Use `tab:Header Name` to define new tabs.

~~~
```tab
tab: General
This is the content for the first tab.

tab: Details
This is the content for the second tab.
```
~~~

---

## ⚙️ Configuration & Templates

### API Keys

- **OMDb API:** Required for movie searching. You can get a free key [here](https://www.omdbapi.com/apikey.aspx). Enter this key in the Butler settings tab.


### 🗂️ Folder Hider Patterns

| Setting | Description |
|----------|-------------|
| **Hidden Folders** | A text area listing all folders to hide (one per line). |
| **Prefix Matching** | Use `startswith::` or `endswith::` for flexible matching (e.g., `startswith::Private-` hides `Private-Notes` and `Private-Projects`). |
| **Hide Folders by Default** | Toggle whether folders are hidden when the vault first loads. |

#### 📖 Book Placeholders

| **Placeholder** | **Description**               |
| --------------- | ----------------------------- |
| `{{title}}`     | Book Title                    |
| `{{author}}`    | Author Name(s)                |
| `{{year}}`      | First Publish Year            |
| `{{publisher}}` | Publisher Name                |
| `{{cover}}`     | URL to the book cover image   |
| `{{url}}`       | Link to the OpenLibrary entry |
| `{{json}}`      | Raw JSON data block           |

#### 🎬 Movie/Series Placeholders

|**Placeholder**|**Description**|
|---|---|
|`{{title}}`|Movie Title|
|`{{year}}`|Release Year|
|`{{director}}`|Director Name|
|`{{writer}}`|Writer Name|
|`{{actors}}`|Main Cast|
|`{{plot}}`|Plot Summary|
|`{{rating}}`|IMDb Rating|
|`{{genres}}`|Genres|
|`{{duration}}`|Runtime|
|`{{image}}`|URL to the Poster image|
|`{{premiere}}`|Full Release Date|
|`{{url}}`|Link to the IMDb entry|

---

### Manual Installation

1. Download the latest release from GitHub.
2. Extract the `main.js`, `styles.css`, and `manifest.json` files.
3. Move them to your vault's plugin folder: `<Vault>/.obsidian/plugins/obsidian-butler/`.
4. Reload Obsidian and enable the plugin in Community Plugins settings.

### Development

1. Clone this repository.
2. Run `npm install` to install dependencies.
3. Run `npm run build` to compile the plugin.
