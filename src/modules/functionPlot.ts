/* eslint-disable @typescript-eslint/no-explicit-any */

import { MarkdownPostProcessorContext, parseYaml } from "obsidian";
import functionPlot from "function-plot";
import { FunctionPlotOptions } from "function-plot/dist/types";
import { EventEmitter } from "events";
import {
	ButlerSettings,
	PlotAxisConfig,
	PlotBlockOptions,
} from "../utils/types";

export const DEFAULT_PLOT_OPTIONS: PlotBlockOptions = {
	width: 800,
	height: 400,
	title: "",
	xAxis: { domain: [-10, 10], type: "linear" },
	yAxis: { domain: [-10, 10], type: "linear" },
	disableZoom: false,
	grid: true,
	scaled: false,
	lines: [],
};

/**
 * Parses a custom axis string format: "[label:hello | type:linear | domain:[-5:5]]"
 * Handles YAML array quirks by joining if necessary.
 */
function parseAxisString(axisStr: any): PlotAxisConfig {
	const config: PlotAxisConfig = {};
	if (!axisStr) return config;

	let content = "";

	// 1. Normalize content
	if (Array.isArray(axisStr)) {
		// YAML might return a mix of strings and objects if spaces were used (e.g. [type: log])
		// We normalize everything to a string to parse it with our pipe logic.
		content = axisStr
			.map((item) => {
				if (typeof item === "object" && item !== null) {
					// Convert {type: log} back to "type:log"
					return Object.entries(item)
						.map(([k, v]) => `${k}:${v}`)
						.join("|");
				}
				return String(item);
			})
			.join(",");
	} else if (typeof axisStr === "object") {
		// Should be handled in render, but as a fallback, return as config
		return axisStr as PlotAxisConfig;
	} else {
		content = String(axisStr);
	}

	content = content.trim();

	// 2. Remove outer brackets if they exist (e.g., explicit string "[...]")
	if (content.startsWith("[") && content.endsWith("]")) {
		content = content.substring(1, content.length - 1);
	}

	// 3. Split by Pipe '|'
	const parts = content.split("|");

	parts.forEach((part) => {
		const splitIndex = part.indexOf(":");
		if (splitIndex === -1) return;

		const key = part.substring(0, splitIndex).trim();
		const value = part.substring(splitIndex + 1).trim();

		switch (key) {
			case "label":
				config.label = value;
				break;
			case "type":
				if (value === "linear" || value === "log") {
					config.type = value;
				}
				break;
			case "domain": {
				// Handle [-5:5], [-5, 5], or -5:5
				const domainInner = value.replace(/^\[|\]$/g, "");
				const bounds = domainInner
					.split(/[:;,]/) // Support colon, semicolon, or comma
					.map((n) => parseFloat(n.trim()))
					.filter((n) => !isNaN(n)); // Filter out garbage

				if (bounds.length === 2) {
					config.domain = [bounds[0], bounds[1]];
				}
				break;
			}
			case "invert":
				config.invert = value === "true";
				break;
		}
	});
	return config;
}

/**
 * Computes the Y-axis domain to preserve aspect ratio based on width, height, and X-axis domain.
 * Centers the Y-axis around 0.
 */
function computeYScale(
	width: number,
	height: number,
	xDomain: [number, number],
): [number, number] {
	const xDiff = xDomain[1] - xDomain[0];
	const yDiff = (height * xDiff) / width;
	return [-yDiff / 2, yDiff / 2];
}

export class FunctionPlotHandler {
	static async render(
		source: string,
		el: HTMLElement,
		ctx: MarkdownPostProcessorContext,
		settings: ButlerSettings,
	) {
		const [header, rawLines] = FunctionPlotHandler.parseCodeBlock(source);

		// --- 1. Initialize Options with Defaults ---
		// We manually merge to avoid deep merge issues with arrays/objects
		const options: PlotBlockOptions = {
			...DEFAULT_PLOT_OPTIONS,
			xAxis: { ...DEFAULT_PLOT_OPTIONS.xAxis },
			yAxis: { ...DEFAULT_PLOT_OPTIONS.yAxis },
		};

		// --- 2. Apply Header Overrides ---
		if (header.width !== undefined) options.width = Number(header.width);
		if (header.height !== undefined) options.height = Number(header.height);
		if (header.title !== undefined) options.title = String(header.title);
		if (header.disableZoom !== undefined)
			options.disableZoom = Boolean(header.disableZoom);
		if (header.grid !== undefined) options.grid = Boolean(header.grid);
		if (header.scaled !== undefined)
			options.scaled = Boolean(header.scaled);

		// Parse xAxis
		if (header.xAxis) {
			if (
				typeof header.xAxis === "object" &&
				!Array.isArray(header.xAxis)
			) {
				// Handle pure YAML object format
				options.xAxis = { ...options.xAxis, ...header.xAxis };
			} else {
				// Handle string or array-of-strings (pipe syntax)
				const parsedX = parseAxisString(header.xAxis);
				options.xAxis = { ...options.xAxis, ...parsedX };
			}
		}

		// Parse yAxis
		if (header.yAxis) {
			if (
				typeof header.yAxis === "object" &&
				!Array.isArray(header.yAxis)
			) {
				options.yAxis = { ...options.yAxis, ...header.yAxis };
			} else {
				const parsedY = parseAxisString(header.yAxis);
				options.yAxis = { ...options.yAxis, ...parsedY };
			}
		}

		// --- 3. Handle Scaled Logic ---
		// Only apply if requested AND axes are linear (log scaling requires different math)
		if (
			options.scaled &&
			options.xAxis.type !== "log" &&
			options.yAxis.type !== "log" &&
			options.xAxis.domain
		) {
			const yDom = computeYScale(
				options.width,
				options.height,
				options.xAxis.domain,
			);
			options.yAxis.domain = yDom;
		}

		// --- 4. Global Settings Overrides ---
		if (settings.plotDisableZoom) {
			options.disableZoom = true;
		}

		// --- 5. Process Data & Annotations ---
		const plotData: any[] = [];
		const plotAnnotations: any[] = [];

		rawLines.forEach((lineStr) => {
			if (!lineStr.trim()) return;

			// Split definition from properties
			const parts = lineStr.split("|");
			const definition = parts[0].trim();

			if (!definition) return;

			const props = FunctionPlotHandler.parseProperties(parts.slice(1));

			// Regex for Annotations: x=2 or x:2
			// const xMatch = definition.match(/^x\s*[=:]\s*([-\d\.]+)$/);
			// const yMatch = definition.match(/^y\s*[=:]\s*([-\d\.]+)$/);
			const xMatch = definition.match(/^x\s*[=:]\s*([-\d.]+)$/);
			const yMatch = definition.match(/^y\s*[=:]\s*([-\d.]+)$/);

			if (xMatch) {
				plotAnnotations.push({
					x: parseFloat(xMatch[1]),
					text: props.text || "",
				});
			} else if (yMatch) {
				plotAnnotations.push({
					y: parseFloat(yMatch[1]),
					text: props.text || "",
				});
			} else {
				// Graph Data
				const datum = FunctionPlotHandler.buildDatum(definition, props);
				if (datum) {
					plotData.push(datum);
				}
			}
		});

		// --- 6. Execute function-plot ---
		try {
			const plotOptions: FunctionPlotOptions = {
				target: el,
				title: options.title,
				grid: options.grid,
				disableZoom: options.disableZoom,
				width: options.width,
				height: options.height,
				xAxis: {
					domain: options.xAxis.domain,
					label: options.xAxis.label,
					type: options.xAxis.type,
					invert: options.xAxis.invert,
				},
				yAxis: {
					domain: options.yAxis.domain,
					label: options.yAxis.label,
					type: options.yAxis.type,
					invert: options.yAxis.invert,
				},
				data: plotData,
				annotations: plotAnnotations,
				plugins: [
					FunctionPlotHandler.createStylingPlugin(settings, plotData),
				],
			};

			functionPlot(plotOptions);
		} catch (e) {
			const errorDiv = el.createDiv({ cls: "butler-plot-error" });
			errorDiv.setText(`Plot Error: ${e.message}`);
			console.error("Plot Error:", e);
		}
	}

	/**
	 * Parses property strings like "color:red" or "range:[0,1]"
	 */
	private static parseProperties(parts: string[]): any {
		const props: any = {};
		parts.forEach((p) => {
			const splitIndex = p.indexOf(":");
			if (splitIndex === -1) return;

			const key = p.substring(0, splitIndex).trim();
			const val = p.substring(splitIndex + 1).trim();

			if (!key) return;

			// Handle Types
			if (val === "true") props[key] = true;
			else if (val === "false") props[key] = false;
			else if (!isNaN(Number(val)) && !val.includes(",")) {
				// Check for comma to avoid parsing "1,2" as a single number (though parseFloat would take 1)
				// Better check: is it a pure number?
				props[key] = Number(val);
			} else if (val.startsWith("[") && val.endsWith("]")) {
				if (key === "scope") {
					props[key] = FunctionPlotHandler.parseScope(val);
				} else {
					// Try JSON parse, fallback to custom split for ranges like [-2:2]
					try {
						props[key] = JSON.parse(val);
					} catch {
						// Fallback: split by comma or colon
						const inner = val.substring(1, val.length - 1);
						const nums = inner
							.split(/[:;,]/)
							.map((n) => parseFloat(n.trim()))
							.filter((n) => !isNaN(n));
						if (nums.length > 0) props[key] = nums;
						else props[key] = val; // fallback to string
					}
				}
			} else {
				props[key] = val;
			}
		});
		return props;
	}

	private static parseScope(scopeStr: string): any {
		const scopeObj: any = {};
		const content = scopeStr.substring(1, scopeStr.length - 1); // remove []
		if (!content.trim()) return scopeObj;

		content.split(",").forEach((pair) => {
			const [k, v] = pair.split(":");
			if (k && v) {
				const val = parseFloat(v.trim());
				if (!isNaN(val)) scopeObj[k.trim()] = val;
			}
		});
		return scopeObj;
	}

	private static buildDatum(definition: string, props: any): any {
		const datum: any = { ...props };
		const fnType = props.fnType || "linear";
		datum.graphType = props.graphType || "polyline";

		if (datum.graphType === "text") {
			if (!datum.text) datum.text = definition;
			return datum;
		}

		// Auto-detect JSON Arrays (Points/Vectors)
		if (definition.startsWith("[")) {
			try {
				const parsed = JSON.parse(definition);
				if (Array.isArray(parsed)) {
					if (Array.isArray(parsed[0])) {
						// [[x,y], [x,y]] -> Points
						datum.fnType = "points";
						datum.points = parsed;
						datum.graphType = props.graphType || "scatter";
					} else {
						// [x,y] -> Vector
						datum.fnType = "vector";
						datum.vector = parsed;
						datum.graphType = "polyline";
					}
					return datum;
				}
			} catch {
				// Not JSON, continue to string defs
			}
		}

		// Handle explicit fnTypes
		switch (fnType) {
			case "parametric": {
				// split "x(t), y(t)"
				// We need a robust split that ignores commas in parens if possible,
				// but simple split matches standard function-plot usage mostly.
				const parts = definition.split(",");
				if (parts.length >= 2) {
					datum.x = parts[0].trim();
					datum.y = parts.slice(1).join(",").trim();
				}
				datum.fnType = "parametric";
				break;
			}
			case "polar":
				datum.r = definition;
				datum.fnType = "polar";
				break;
			case "implicit":
				datum.fn = definition;
				datum.fnType = "implicit";
				// Implicit works best with interval
				datum.graphType = props.graphType || "interval";
				break;
			case "points":
			case "vector":
				// Handled in auto-detect usually, but if explicit:
				datum.fnType = fnType;
				break;
			case "linear":
			default:
				datum.fn = definition;
				break;
		}

		return datum;
	}

	private static parseCodeBlock(content: string): [any, string[]] {
		let header: any = {};
		let body = content;

		const trimmedContent = content.trimStart();
		if (trimmedContent.startsWith("---")) {
			const match = trimmedContent.match(
				/^---\s*[\r\n]+([\s\S]*?)[\r\n]+---/,
			);
			if (match) {
				try {
					header = parseYaml(match[1]) || {};
					body = content.substring(match[0].length);
				} catch (e) {
					console.error("Plot: Invalid Frontmatter", e);
				}
			}
		}

		const lines = body
			.split("\n")
			.map((line) => line.trim())
			.filter(
				(line) =>
					line.length > 0 &&
					!line.startsWith("#") &&
					!line.startsWith("//"),
			);

		return [header, lines];
	}

	private static createStylingPlugin(
		settings: ButlerSettings,
		plotData: any[],
	) {
		return function (instance: any) {
			if (!(instance as EventEmitter).listenerCount("after:draw")) {
				(instance as EventEmitter).on("after:draw", () => {
					// Styling Logic (Kept consistent with original)
					const selection = instance.root.merge(instance.root.enter);
					const color =
						settings.plotFontColor || "var(--text-normal)";
					const lineColor = settings.plotLineColor || "gray";
					// const gridColor =
					// 	settings.plotGridColor || "var(--interactive-hover)";

					// Title
					selection
						.select(".title")
						.style("font-size", `${settings.plotTitleFontSize}px`)
						.style("fill", color);

					// Axis Labels
					selection
						.selectAll(".axis-label")
						.style("font-size", `${settings.plotLabelFontSize}px`)
						.style("fill", color);

					// Origin Lines
					selection
						.selectAll(".origin")
						.style("stroke", lineColor)
						.style("stroke-width", `${settings.plotLineWidth}px`)
						.style("opacity", 1);

					// Grid
					selection
						.selectAll(".tick line")
						// .style("stroke", gridColor)
						.style("stroke", "var(--icon-color)")
						.style("stroke-width", `${settings.plotGridWidth}px`);

					// Text
					selection
						.selectAll(".graph text")
						.style("font-size", "14px")
						.style("font-weight", "500")
						.style("fill", color);

					// Annotations
					selection
						.selectAll(".annotations path")
						// .style("stroke", color)
						.style("stroke", "var(--icon-color)")
						.style("stroke-dasharray", "5,5");
					selection
						.selectAll(".annotations text")
						.style("fill", color)
						.style("font-weight", "500")
						.style("font-size", "14px");

					// Graph Lines Width
					const linePaths = selection.selectAll(".line").nodes();
					linePaths.forEach((path: SVGPathElement, index: number) => {
						const d = plotData[index];
						if (!d || d.graphType === "interval") return;
						path.style.setProperty(
							"stroke-width",
							`${settings.plotGraphLineWidth}px`,
						);
					});

					// Scatter Points
					selection
						.selectAll(".graph circle")
						.style("stroke-width", "2px")
						.style("r", "3px");
				});
				(instance as EventEmitter).emit("after:draw");
			}
		};
	}
}
