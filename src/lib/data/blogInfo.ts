type Tag = 'frontend' | 'backend';

interface BlogInfo {
	title: string;
	date: string;
	image?: string;
	description?: string;
	path: string;
	tags: Tag[];
}

export type {
	Tag,
	BlogInfo,
};