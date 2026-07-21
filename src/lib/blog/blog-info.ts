/**
 * Browser-safe blog types.
 */

export interface ProcessedBlogPost {
	year: number;
	month: number;
	day: number;
	date: Date;
	url: string;
	title: string;
	image?: string | null;
	description: string;
	tags: string[];
	anchor: string;
}
