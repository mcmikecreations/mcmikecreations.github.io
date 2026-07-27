import { loadHikes } from './load-hikes.js';

const hikesData = loadHikes();

const uniqueNodesMap = new Map();

hikesData.forEach(hike => {
    if (hike.properties?.nodes) {
        hike.properties.nodes.forEach(node => {
            uniqueNodesMap.set(node.id, node);
        });
    }
});

const nodes = Array.from(uniqueNodesMap.values());

const latLonSet = new Map();
const nameSet = new Map();
const wikidataSet = new Map();

for (const node of nodes) {
    const latLonKey = `${node.lat},${node.lon}`;
    if (latLonSet.has(latLonKey)) {
        console.warn('Duplicate lat/lon:', node.id, latLonSet.get(latLonKey).id);
    } else {
        latLonSet.set(latLonKey, node);
    }

    if (node.tags?.name) {
        if (nameSet.has(node.tags.name)) {
            console.warn('Duplicate name:', node.tags.name, 'for ids:', node.id, nameSet.get(node.tags.name).id);
        } else {
            nameSet.set(node.tags.name, node);
        }
    }

    if (node.tags?.wikidata) {
        if (wikidataSet.has(node.tags.wikidata)) {
            console.warn('Duplicate wikidata:', node.tags.wikidata, 'for ids:', node.id, wikidataSet.get(node.tags.wikidata).id);
        } else {
            wikidataSet.set(node.tags.wikidata, node);
        }
    }
}

console.log('Finished checking nodes.');

