import { getPosts, getAllPosts } from '$lib/hikes/hikes-info';

export function load() {
	const { posts, pagination } = getPosts({ page: 1 });
	const allPosts = getAllPosts();
	const yearList = [...new Set(allPosts.map(p => p.year))].sort((a, b) => b - a);
	
	return {
		posts: posts,
		yearList,
		pagination,
		showProgressbar: false,
		showPeople: false,
		footer: {
			pinBottom: false,
			showSocials: true,
		},
		header: {
			showNavbar: false,
			fixedNavbar: true,
		}
	};
}
