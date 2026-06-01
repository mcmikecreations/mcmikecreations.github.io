const TagFrontend = 'Frontend';
const TagBackend = 'Backend';
const TagGamedev = 'Gamedev';
const TagDataViz = 'Data-Viz';
type Tag = typeof TagFrontend | typeof TagBackend | typeof TagGamedev | typeof TagDataViz;

interface BlogInfo {
	title: string;
	date: string;
	image: string | null;
	imageFull: string | null;
	description?: string;
	author: string | null;
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
	TagGamedev,
	TagDataViz,
];