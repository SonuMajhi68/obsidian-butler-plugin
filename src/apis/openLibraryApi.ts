/* eslint-disable @typescript-eslint/no-explicit-any */

import { requestUrl, RequestUrlParam } from "obsidian";

export interface OpenLibrarySearchItem {
	key: string;
	title: string;
	author_name?: string[];
	first_publish_year?: number;
	publisher?: string[];
}

export interface OpenLibrarySearchResponse {
	docs: OpenLibrarySearchItem[];
	numFound: number;
}

export interface OpenLibraryBookResult {
	covers?: number[];
	[key: string]: any; // Allow other properties
}

export class OpenLibraryApi {
	private baseUrl = "https://openlibrary.org";

	constructor() {
		// OpenLibrary doesn't require an API key for this endpoint
	}

	async searchByTitle(title: string): Promise<OpenLibrarySearchResponse> {
		const url = new URL(this.baseUrl);
		url.pathname = "/search.json";
		url.searchParams.append("q", title);
		url.searchParams.append("limit", "15");

		const response = await this.makeRequest(url);
		return response.json as OpenLibrarySearchResponse;
	}

	async getByKey(key: string): Promise<OpenLibraryBookResult> {
		const url = new URL(this.baseUrl);
		url.pathname = `${key}.json`; // The key already includes the leading slash

		const response = await this.makeRequest(url);
		return response.json as OpenLibraryBookResult;
	}

	private async makeRequest(url: URL) {
		const requestParams: RequestUrlParam = {
			url: url.toString(),
			method: "GET",
		};

		try {
			const response = await requestUrl(requestParams);

			if (response.status !== 200) {
				throw new Error(
					`OpenLibrary API request failed with status ${response.status}`,
				);
			}

			if (!response.json) {
				throw new Error(
					"Received empty or invalid JSON response from OpenLibrary.",
				);
			}

			return response;
		} catch (error) {
			console.error("OpenLibrary API request error:", error);
			throw new Error(
				`Failed to fetch from OpenLibrary. Check console for details.`,
			);
		}
	}
}
