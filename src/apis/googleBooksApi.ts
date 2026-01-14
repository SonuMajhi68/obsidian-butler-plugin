/* eslint-disable @typescript-eslint/no-explicit-any */

import { requestUrl, RequestUrlParam } from "obsidian";
import { SearchItem, SearchResponse, BookResult } from "./types";

export class GoogleBooksApi {
	private baseUrl = "https://www.googleapis.com/books/v1/volumes";
	private apiKey: string;

	constructor(apiKey: string) {
		this.apiKey = apiKey;
	}

	async searchByTitle(title: string): Promise<SearchResponse> {
		const url = new URL(this.baseUrl);
		url.searchParams.append("q", `intitle:${title}`);
		url.searchParams.append("maxResults", "15");
		if (this.apiKey) {
			url.searchParams.append("key", this.apiKey);
		}

		const response = await this.makeRequest(url);
		const data = response.json;

		// Map Google Books structure to OpenLibrary structure
		const docs: SearchItem[] = (data.items || []).map((item: any) => {
			const info = item.volumeInfo || {};
			const authors = info.authors || ["Unknown Author"];
			const publishedDate = info.publishedDate || "";
			const year = parseInt(publishedDate.substring(0, 4)) || 0;

			return {
				key: item.id, // We use Google's ID as the key
				title: info.title,
				author_name: authors,
				first_publish_year: year,
				publisher: info.publisher ? [info.publisher] : [],
			};
		});

		return {
			docs: docs,
			numFound: data.totalItems || 0,
		};
	}

	async getByKey(key: string): Promise<BookResult> {
		const url = new URL(`${this.baseUrl}/${key}`);
		if (this.apiKey) {
			url.searchParams.append("key", this.apiKey);
		}

		const response = await this.makeRequest(url);
		const data = response.json;
		const info = data.volumeInfo || {};

		// Map details to a flexible object compatible with OpenLibraryBookResult
		// We add a specific 'coverUrl' property which we will handle in the modal
		const bestImage =
			info.imageLinks?.extraLarge ||
			info.imageLinks?.large ||
			info.imageLinks?.medium ||
			info.imageLinks?.small ||
			info.imageLinks?.thumbnail ||
			"";

		// Force HTTPS on image links
		const secureImage = bestImage.replace(/^http:\/\//, "https:////");

		return {
			...info, // Spread all Google props so templates can use {{description}}, {{pageCount}} etc
			covers: [], // Empty because Google doesn't use ID-based covers like OL
			coverUrl: secureImage, // Custom property we will check in the modal
			title: info.title,
			authors: info.authors,
			publish_date: info.publishedDate,
			publishers: info.publisher ? [info.publisher] : [],
		};
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
					`Google Books API request failed with status ${response.status}`,
				);
			}
			return response;
		} catch (error) {
			console.error("Google Books API request error:", error);
			throw new Error("Failed to fetch from Google Books API.");
		}
	}
}
