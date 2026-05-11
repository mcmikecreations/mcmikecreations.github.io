import hikes from '$lib/data/hikes.json';
import type { Map } from '$lib/data/map-info';

export interface ProcessedPost {
    year: number;
    month: number;
    day: number;
    date: Date;
    url: string;
    title: string;
    image?: string;
    description: string;
    tags: string[];
    people: string[] | null;
    anchor: string;
}

interface HikeParams {
    page?: number;
    tag?: string;
    year?: number;
    limit?: number;
}

export function getAllPosts(): ProcessedPost[] {
    const posts = (hikes as Map[]).flatMap(h => h.properties.dates
        .filter(d => !h.properties.draft && d.path)
        .map(d => {
            const date = new Date(d.date);
            const slug = h.route.substring(h.route.lastIndexOf('/') + 1);
            return {
                year: date.getFullYear(),
                month: date.getMonth() + 1,
                day: date.getDate(),
                date: date,
                url: `/hikes/${d.date}-${slug}/`,
                title: d.title ?? h.name,
                image: (d.image ?? h.image)?.replace('/hikes/', '/hikes/thumb/'),
                description: (d.description ? (d.description + ' ') : '') + h.description,
                tags: d.tags,
                people: d.people,
                anchor: `${d.date}-${slug}`
            };
        }));
    posts.sort((a, b) => a.date > b.date ? -1 : (a.date < b.date ? 1 : 0));
    return posts;
}

export const defaultPageSize = 10;

export function getPosts({ page = 1, tag, year, limit = defaultPageSize }: HikeParams) {
    let posts = getAllPosts();

    if (tag) {
        posts = posts.filter(p => p.tags.includes(tag));
    }

    if (year) {
        posts = posts.filter(p => p.year === year);
    }

    const totalPosts = posts.length;
    const totalPages = Math.ceil(totalPosts / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const visiblePosts = posts.slice(startIndex, endIndex);

    return {
        posts: visiblePosts,
        pagination: {
            currentPage: page,
            totalPages,
            totalPosts,
            hasNext: page < totalPages,
            hasPrev: page > 1,
            nextPage: page < totalPages ? page + 1 : null,
            prevPage: page > 1 ? page - 1 : null
        }
    };
}

export async function parseMarkdown(postRaw: string): Promise<string> {
    const { Marked } = await import('marked');

    const markedInstance = new Marked();
    markedInstance.use({
        renderer: {
            paragraph(token: any) {
                const text = (this as any).parser.parseInline(token.tokens);
                if (/^\s*(<figure[\s\S]*?<\/figure>\s*)+$/.test(text)) {
                    return text + '\n';
                }
                return `<p>${text}</p>\n`;
            },
            image(token: any) {
                const href = token.href || '';
                const title = token.title || '';
                const text = token.text || '';

                const safeHref = href.replace(/"/g, '&quot;');
                const safeTitle = title.replace(/"/g, '&quot;');
                const safeText = text.replace(/"/g, '&quot;');
                const renderedText = token.tokens?.length
                    ? (this as any).parser.parseInline(token.tokens)
                    : safeText;

                const isYoutubeLink = href.includes('youtube.com');

                if (isYoutubeLink) {
                    let videoId = '';
                    try {
                        const url = new URL(href);
                        videoId = url.searchParams.get('v') || '';
                    } catch (e) {
                        // ignore invalid url
                    }
                    return `
<figure class="mk-figure">
    <a class="flex justify-center" href="${safeHref}" target="_blank" rel="noopener noreferrer">
        <img src="https://img.youtube.com/vi/${videoId}/0.jpg" ${safeTitle ? `title="${safeTitle}"` : ''} alt="${safeText}" class="mk-img-no-pointer" />
    </a>
    <figcaption class="mk-figcaption">${renderedText}</figcaption>
</figure>`;
                } else if (href.trimEnd().endsWith('.mp4')) {
                    return `
<figure class="mk-figure">
    <video controls ${safeTitle ? `title="${safeTitle}"` : ''}>
        <source src="${safeHref}" type="video/mp4">
    </video>
    <figcaption class="mk-figcaption">${renderedText}</figcaption>
</figure>`;
                } else {
                    return `
<figure class="mk-figure">
    <img src="${safeHref}" ${safeTitle ? `title="${safeTitle}"` : ''} alt="${safeText}" class="mk-img-pointer marked-image" />
    <figcaption class="mk-figcaption">${renderedText}</figcaption>
</figure>`;
                }
            }
        }
    });

    const result = await markedInstance.parse(postRaw, { async: true });
    const styles = `
<style>
.mk-figure { width: 100%; margin-left: auto; margin-right: auto; display: flex; flex-direction: column; justify-content: center; }
@media (min-width: 1280px) { .mk-figure { width: 75%; } }
.mk-figcaption { text-align: center; }
.mk-img-no-pointer { pointer-events: none; margin-top: 0 !important; margin-bottom: 0 !important; }
.mk-img-pointer { cursor: pointer; margin-top: 0 !important; margin-bottom: 0 !important; }
</style>`;
    return result.replace(/<p>\s*<\/p>/g, '') + styles;
}
