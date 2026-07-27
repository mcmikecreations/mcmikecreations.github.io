/**
 * Browser-safe hike post helpers: the shape a listing renders, and the markdown
 * renderer the post page re-runs on client-side navigation.
 *
 * Enumerating posts needs the markdown glob, so `getAllPosts` / `getPosts` live
 * in the server-only `hikes-info.server`.
 */

import { stripFrontmatter } from '$lib/hikes/frontmatter';

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

export async function parseMarkdown(postRaw: string): Promise<string> {
    // Drop any leading YAML front matter before rendering. Uses the
    // dependency-free stripper so this stays safe in the client bundle, which
    // re-renders the body on navigation. Files without front matter are unchanged.
    const post = stripFrontmatter(postRaw);
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
    <a class="mk-video-link" href="${safeHref}" target="_blank" rel="noopener noreferrer">
        <img src="https://img.youtube.com/vi/${videoId}/0.jpg" ${safeTitle ? `title="${safeTitle}"` : ''} alt="${safeText}" class="mk-img-no-pointer" />
        <span class="mk-play-badge" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5.5 4.5v15L18.5 12 5.5 4.5Z"/></svg>
        </span>
    </a>
    <figcaption class="mk-figcaption">${renderedText}</figcaption>
</figure>`;
                } else if (href.trimEnd().endsWith('.mp4')) {
                    // Autoplay silently and loop: these clips carry no audio, so the muted
                    // attribute is what makes browsers allow autoplay at all.
                    return `
<figure class="mk-figure">
    <video controls autoplay muted loop playsinline ${safeTitle ? `title="${safeTitle}"` : ''}>
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

    const result = await markedInstance.parse(post, { async: true });
    const styles = `
<style>
.mk-figure { width: 100%; margin-left: auto; margin-right: auto; display: flex; flex-direction: column; justify-content: center; }
@media (min-width: 1280px) { .mk-figure { width: 75%; } }
.mk-figcaption { text-align: center; }
.mk-img-no-pointer { pointer-events: none; margin-top: 0 !important; margin-bottom: 0 !important; }
.mk-img-pointer { cursor: pointer; margin-top: 0 !important; margin-bottom: 0 !important; }
.mk-video-link { position: relative; display: flex; justify-content: center; }
.mk-play-badge { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); display: flex; align-items: center; justify-content: center; width: 4rem; height: 4rem; border-radius: 9999px; background-color: rgb(17 24 39 / 0.5); color: rgb(255 255 255 / 0.85); pointer-events: none; transition: background-color 150ms ease, transform 150ms ease; }
.mk-play-badge svg { width: 1.75rem; height: 1.75rem; }
.mk-video-link:hover .mk-play-badge, .mk-video-link:focus-visible .mk-play-badge { background-color: rgb(17 24 39 / 0.75); transform: translate(-50%, -50%) scale(1.08); }
</style>`;
    return result.replace(/<p>\s*<\/p>/g, '') + styles;
}
