const TagFrontend = 'Frontend';
const TagBackend = 'Backend';
const TagGamedev = 'Gamedev';
type Tag = typeof TagFrontend | typeof TagBackend | typeof TagGamedev;

interface BlogInfo {
	title: string;
	date: string;
	image: string | null;
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
	TagGamedev,
];