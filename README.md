# 🎩 Butler for Obsidian

**Butler** is a comprehensive utility plugin for Obsidian designed to streamline your knowledge management workflow. It bridges the gap between your vault and external databases (OpenLibrary, OMDb, Wikipedia) while providing powerful UI enhancements like folder hiding, tabbed content, and advanced mathematical plotting.

## 🔥 Features

### 📊 Mathematical Visualization

- **Function Plotting:** Render interactive 2D graphs directly in your notes using the `plot` code block.
- **Versatile Graphing:** Supports explicit, implicit, parametric, and polar functions, as well as vectors and scatter plots.
- **Interactive UI:** Includes a modal generator to create plots without writing code manually.

### 📚 Media Fetching

- **Book Search:** Search **OpenLibrary** to instantly create book notes with metadata (authors, publication year, covers).
- **Movie & TV Search:** Query **OMDb** to generate notes for movies and series with posters, ratings, and cast lists.
- **Templating:** Fully customizable templates for both books and movies using dynamic placeholders.

### 🔗 Knowledge Integration

- **Wikipedia Linker:** Context-menu integration to search selected text on Wikipedia and insert formatted Markdown links without breaking your writing flow.

### 🗂️ Vault Management

- **Folder Hider:** Toggle the visibility of specific folders (e.g., `Templates`, `Assets`, `Private`) to keep your file explorer clean. Supports pattern matching.
- **Tabbed Content:** Create clean, clickable tab interfaces within your notes using a simple code block.

## 🧩 Usage

### 1. Mathematical Plotting

Butler integrates the `function-plot` library to render complex mathematical graphs. You can insert a plot using the command **"Butler: Insert Function Plot"** to open the UI generator, or by manually writing a `plot` code block.

#### Basic Syntax

The plot block consists of a YAML-style header for configuration, followed by the function definitions.

~~~
```plot
---
width: 600
height: 350
title: Example Graph
grid: true
xAxis: [label:x | domain:[-5, 5]]
yAxis: [label:y | domain:[-5, 5]]
---
x^2 | color:red
sin(x) | color:blue
```
~~~
#### Configuration Options (Header)

| **Option**    | **Type**  | **Default** | **Description**                                            |
| ------------- | --------- | ----------- | ---------------------------------------------------------- |
| `width`       | `number`  | `800`       | Width of the SVG canvas in pixels.                         |
| `height`      | `number`  | `400`       | Height of the SVG canvas in pixels.                        |
| `title`       | `string`  | `""`        | The title displayed at the top of the graph.               |
| `grid`        | `boolean` | `true`      | Toggles the visibility of the grid lines.                  |
| `disableZoom` | `boolean` | `false`     | If `true`, disables interactive zooming and panning.       |
| `scaled`      | `boolean` | `false`     | If `true`, forces a 1:1 aspect ratio between X and Y axes. |
| `xAxis`       | `object`  | -           | Configuration for the X-axis (see below).                  |
| `yAxis`       | `object`  | -           | Configuration for the Y-axis (see below).                  |

Axis Configuration Syntax:

Axes are defined using a pipe-separated string format within brackets:

```
xAxis:[label:Label Name | domain:[min, max] | type:linear|log]
```

#### Data Types & Function Syntax

Each line in the body represents a distinct entity on the graph. Use the pipe `|` character to separate the function definition from its properties.

1. Linear Functions (Standard)

Type: fnType: linear (Default)

Format: expression

```
x^2
1/x | nSamples: 500 | graphType: interval
```

2. Parametric Functions

Type: fnType: parametric

Format: x(t), y(t)

```
cos(t), sin(t) | fnType: parametric | graphType: polyline
```

3. Polar Functions

Type: fnType: polar

Format: r(theta)

```
2 * sin(4*theta) | fnType: polar | graphType: polyline
```

4. Implicit Functions

Type: fnType: implicit

Format: equation = 0 (expression in terms of x and y)

```
x^2 + y^2 - 1 | fnType: implicit
cos(PI*x) - cos(PI*y) | fnType: implicit
```

5. Vectors

Type: fnType: vector

Format: [x, y]

```
[2, 2] | fnType: vector | offset: [1, 1] | color: red
```

6. Points (Scatter)

Type: fnType: points

Format: [[x1, y1], [x2, y2], ...]

```
[[0,0], [1,1], [1,0]] | fnType: points | graphType: scatter | color: orange
```

7. Annotations & Text

Format: x=value, y=value, or text string.

```
x=2 | text: limit
(1,1) | graphType: text | location: [1,1] | color: white
```

##### Examples
**Example: 1**
~~~
```plot
---
width: 800
height: 400
title: Eample 1
xAxis: [label:X | domain:[-0.1, 5]]
yAxis: [label:Y | domain:[-1, 5]]
scaled: false
disableZoom: true
grid: true
---
1/sqrt(x)
1/sqrt(x) | nSamples:5 | graphType:interval | range:[0.5,1] | closed:true
sin(x) + cos(x) | color:red | range:[1,3] | closed:true
x=0.5 | text:a
x=1 | text:b
[2,2] | fnType:vector | offset:[1,1] | color:red
x^2 | graphType:text | location:[3,3] | color:yellow
[[0,0], [1,1], [1,0]] | graphType:scatter | color:green | fnType:points
(1,1) | graphType:text | location:[1,1] | color:white
```
~~~

**Example:2**
~~~
```plot
---
width: 800
height: 400
title: My Graph 
xAxis: [label:X | domain:[-0.1, 5]]
yAxis: [label:Y | domain:[-1, 5]]
scaled: false
disableZoom: true
grid: false
---
1/sqrt(x)
1/sqrt(x) | nSamples:5 | graphType:interval | range:[0.5,1] | closed:true
x=0.5 | text:some
something important | graphType:text | location:[1,1] | color:white
x^2 | graphType:text | location:[3,3] | color:yellow
[[0,0], [1,1], [1,0]] | graphType:scatter | color:orange | fnType:points
[2,2] | fnType:vector | offset:[1,1] | color:red
cos(PI*x)-cos(PI*y) | fnType:implicit | nSamples:5 | graphType:interval | range:[0.5,1] | closed:true 
2*sin(4theta) | fnType:polar | graphType:polyline | color:orange
cos(t), sin(t) | fnType:parametric | graphType:polyline 
a*x^2+b*x+1 | closed:true | scope:[a:1, b:2]
```
~~~

#### 🎨 Styling & CSS

Butler uses `function-plot` which generates SVG graphs. You can customize the appearance via the Butler Settings tab (for global defaults) or using CSS snippets for granular control.

##### CSS Selectors

You can target specific elements of the graph using the following CSS classes:

| **Selector**                   | **Description**                               |
| ------------------------------ | --------------------------------------------- |
| `.function-plot`               | The main container SVG.                       |
| `.function-plot .title`        | The graph title text.                         |
| `.function-plot .axis`         | Both X and Y axes containers.                 |
| `.function-plot .x.axis-label` | The X-axis label text.                        |
| `.function-plot .y.axis-label` | The Y-axis label text.                        |
| `.function-plot .line`         | The path elements representing functions.     |
| `.function-plot .scatter`      | The circles representing scatter plot points. |
| `.function-plot .tip`          | The hovering tooltip element.                 |
| `.function-plot .grid .tick`   | The grid lines.                               |

**Example CSS Snippet:**

```
/* Make grid lines subtle */
.function-plot .grid .tick {
    stroke: rgba(255, 255, 255, 0.1) !important;
}

/* Thicken the graph lines */
.function-plot .line {
    stroke-width: 3px !important;
}
```

### 2. Creating Media Notes

1. Click the **Book** (📕) or **Film** (🎬) icon in the left ribbon (or use the Command Palette).
2. Enter the title of the media you are looking for.
3. Select the correct result from the list.
4. **Note:** If you have multiple storage folders or templates defined in settings, Butler will prompt you to select the desired destination/style.

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

| **Placeholder** | **Description**         |
| --------------- | ----------------------- |
| `{{title}}`     | Movie Title             |
| `{{year}}`      | Release Year            |
| `{{director}}`  | Director Name           |
| `{{writer}}`    | Writer Name             |
| `{{actors}}`    | Main Cast               |
| `{{plot}}`      | Plot Summary            |
| `{{rating}}`    | IMDb Rating             |
| `{{genres}}`    | Genres                  |
| `{{duration}}`  | Runtime                 |
| `{{image}}`     | URL to the Poster image |
| `{{premiere}}`  | Full Release Date       |
| `{{url}}`       | Link to the IMDb entry  |
### 3. Wikipedia Linking

1. Highlight any text in your editor.
2. Right-click and select **"Wiki Link"**.
3. Choose the matching article from the modal. The text will be converted into a link: `[Selected Text](Wiki_URL)`.

### 4. Hiding Folders

1. Define folders to hide in **Settings**.
2. Click the **Eye** (👁️) icon in the ribbon or run the command **"Toggle hidden folders"** to switch visibility.

### 5. Adding Tabs

Insert a `tab` code block to create tabbed interfaces. Use `tab:Header Name` to define new tabs.

````
```tab
tab: General
This is the content for the first tab.

tab: Details
This is the content for the second tab.
```
````


## Manual Installation

1. Download the latest release from GitHub.
2. Extract the `main.js`, `styles.css`, and `manifest.json` files.
3. Move them to your vault's plugin folder: `<Vault>/.obsidian/plugins/obsidian-butler/`.
4. Reload Obsidian and enable the plugin in Community Plugins settings.

## Development

1. Clone this repository.
2. Run `npm install` to install dependencies.
3. Run `npm run build` to compile the plugin.
