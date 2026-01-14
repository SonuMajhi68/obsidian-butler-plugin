/* eslint-disable @typescript-eslint/no-explicit-any */

export interface SearchItem {
	key: string;
	title: string;
	author_name?: string[];
	first_publish_year?: number;
	publisher?: string[];
}

export interface SearchResponse {
	docs: SearchItem[];
	numFound: number;
}

export interface BookResult {
	covers?: number[];
	[key: string]: any; // Allow other properties
}
