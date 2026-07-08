export const getNodeIconDetails = (tags: any) => {
    if (tags.natural === 'peak') return { emoji: '⛰️', color: '#6b7280' };
    if (tags.natural === 'saddle') return { emoji: '〰️', color: '#16a34a' };
    if (tags.tourism === 'alpine_hut' || tags.tourism === 'wilderness_hut' || tags.building === 'hut') return { emoji: '🛖', color: '#b45309' };
    if (tags.amenity === 'restaurant' || tags.amenity === 'cafe' || tags.amenity === 'fast_food' || tags.amenity === 'pub') return { emoji: '🍽️', color: '#ea580c' };
    if (tags.tourism === 'viewpoint') return { emoji: '🔭', color: '#0284c7' };
    if (tags.waterway === 'waterfall') return { emoji: '🌊', color: '#0ea5e9' };
    if (tags.natural === 'water' || tags.natural === 'spring') return { emoji: '💧', color: '#38bdf8' };
    if (tags.natural === 'cave_entrance') return { emoji: '🕳️', color: '#57534e' };
    if (tags.historic === 'ruins' || tags.historic === 'castle') return { emoji: '🏰', color: '#525252' };
    if (tags.historic === 'memorial') return { emoji: '🪦', color: '#78716c' };
    if (tags.amenity === 'place_of_worship') {
        if (tags.religion === 'muslim') return { emoji: '🕌', color: '#9333ea' };
        if (tags.religion === 'jewish') return { emoji: '🕍', color: '#9333ea' };
        if (tags.religion === 'hindu' || tags.religion === 'buddhist') return { emoji: '🛕', color: '#9333ea' };
        return { emoji: '⛪', color: '#9333ea' };
    }
    if (tags.highway === 'bus_stop') return { emoji: '🚌', color: '#2563eb' };
    if (tags.railway === 'station' || tags.railway === 'halt' || tags.public_transport === 'station') return { emoji: '🚉', color: '#dc2626' };
    if (tags.tourism === 'information') return { emoji: 'ℹ️', color: '#2563eb' };
    if (tags.place === 'village' || tags.place === 'town' || tags.place === 'city') return { emoji: '🏘️', color: '#7c3aed' };
    if (tags.aeroway === 'aerodrome') return { emoji: '✈️', color: '#6294ff' };
    return { emoji: '📍', color: '#3b82f6' };
};

export const formatTags = (tags: any): [string, string][] => {
    const formatted = new Map<string, string>();
    const handledKeys = new Set(['name', 'ele']);

    const addHandled = (keys: string[], label: string, formatter: (v: string) => string) => {
        keys.forEach(k => handledKeys.add(k));
        for (const k of keys) {
            if (tags[k] !== undefined && tags[k] !== null) {
                formatted.set(label, formatter(String(tags[k])));
                return;
            }
        }
    };

    addHandled(['contact:phone', 'phone', 'contact:mobile', 'mobile'], 'Phone', v => 
        v.split(';').map(p => {
            const num = p.trim();
            return `<a href="tel:${num}" style="color: #2563eb; text-decoration: none;">${num}</a>`;
        }).join(', ')
    );
    addHandled(['contact:website', 'website', 'url'], 'Website', v => `<a href="${v.startsWith('http') ? v : 'https://' + v}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: none;">Link</a>`);
    addHandled(['contact:email', 'email'], 'Email', v => `<a href="mailto:${v}" style="color: #2563eb; text-decoration: none;">${v}</a>`);

    handledKeys.add('wikipedia');
    if (tags.wikipedia) {
        const parts = String(tags.wikipedia).split(':');
        const lang = parts.length > 1 ? parts[0] : 'en';
        const title = parts.length > 1 ? parts[1] : parts[0];
        formatted.set('Wikipedia', `<a href="https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title)}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: none;">${tags.wikipedia}</a>`);
    }

    handledKeys.add('wikidata');
    if (tags.wikidata) {
        formatted.set('Wikidata', `<a href="https://www.wikidata.org/wiki/${tags.wikidata}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: none;">${tags.wikidata}</a>`);
    }

    for (const [k, v] of Object.entries(tags)) {
        if (!handledKeys.has(k)) {
            const prettyKey = k.replace(/[:_]/g, ' ')
                               .split(' ')
                               .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                               .join(' ');
            formatted.set(prettyKey, String(v));
        }
    }

    return Array.from(formatted.entries());
};


