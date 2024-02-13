const TagFrontend = 'Frontend';
const TagBackend = 'Backend';
type Tag = typeof TagFrontend | typeof TagBackend;

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

export const tags = [
	TagFrontend,
	TagBackend,
];