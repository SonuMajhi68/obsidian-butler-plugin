import { requestUrl, RequestUrlParam } from "obsidian";

interface OMDbErrorResponse {
	Response: "False";
	Error: string;
}

export interface OMDbSearchItem {
	Title: string;
	Year: string;
	imdbID: string;
	Type: string; // "movie", "series", "game"
	Poster: string;
}

interface OMDbSearchResponse {
	Response: "True";
	totalResults: string;
	Search: OMDbSearchItem[];
}

export interface OMDbMovieResult {
	Response: "True";
	Title: string;
	Year: string;
	Rated: string;
	Released: string; // This is 'premiere'
	Runtime: string; // This is 'duration'
	Genre: string; // This is 'genres'
	Director: string;
	Writer: string;
	Actors: string; // This is 'actor'
	Plot: string;
	Language: string;
	Country: string;
	Awards: string;
	Poster: string; // This is 'image'
	imdbRating: string; // This is 'rating'
	imdbID: string;
	Type: string;
	Production: string; // This is 'studio'
	Website: string;
	// Other fields...
	[key: string]: string; // Allow other string properties
}

type SearchResponse = OMDbSearchResponse | OMDbErrorResponse;
type IdResponse = OMDbMovieResult | OMDbErrorResponse;

export class OmdbApi {
	private apiKey: string;
	private baseUrl = "https://www.omdbapi.com/";

	constructor(apiKey: string) {
		this.apiKey = apiKey;
	}

	/**
	 * Searches the OMDb API by title.
	 * @param title The title to search for (movie or series).
	 * @returns A promise that resolves to an array of search results.
	 */
	async searchByTitle(title: string): Promise<OMDbSearchItem[]> {
		const url = new URL(this.baseUrl);
		url.searchParams.append("s", title);
		url.searchParams.append("apikey", this.apiKey);

		const response = await this.makeRequest(url);
		const data = response.json as SearchResponse;

		if (data.Response === "False") {
			if (data.Error === "Movie not found!") {
				return []; // Not an error, just no results
			}
			throw new Error(data.Error);
		}

		return data.Search || [];
	}

	/**
	 * Gets detailed information for a specific movie/series by its IMDb ID.
	 * @param id The IMDb ID (e.g., "tt0386676").
	 * @returns A promise that resolves to the detailed movie data.
	 */
	async getById(id: string): Promise<OMDbMovieResult> {
		const url = new URL(this.baseUrl);
		url.searchParams.append("i", id);
		url.searchParams.append("plot", "full"); // Get the full plot
		url.searchParams.append("apikey", this.apiKey);

		const response = await this.makeRequest(url);
		const data = response.json as IdResponse;

		if (data.Response === "False") {
			throw new Error(data.Error);
		}

		return data as OMDbMovieResult;
	}

	/**
	 * A private helper to make requests using Obsidian's requestUrl.
	 * @param url The URL to request.
	 * @returns A promise that resolves to the request response.
	 */
	private async makeRequest(url: URL) {
		const requestParams: RequestUrlParam = {
			url: url.toString(),
			method: "GET",
		};

		try {
			const response = await requestUrl(requestParams);

			if (response.status !== 200) {
				throw new Error(
					`OMDb API request failed with status ${response.status}`,
				);
			}

			if (!response.json) {
				throw new Error(
					"Received empty or invalid JSON response from OMDb.",
				);
			}

			return response;
		} catch (error) {
			console.error("OMDb API request error:", error);
			throw new Error(
				`Failed to fetch from OMDb. Check console for details.`,
			);
		}
	}
}
