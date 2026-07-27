# Adding a hike post on a new route

How to publish a hike you have not walked before. For a *second* post on a route that
already exists, skip to [Another date on an existing route](#another-date-on-an-existing-route).

Everything is keyed off one **slug** - a lowercase, underscore-separated name such as
`drachenkopf` or `fockenstein_geierstein`. Pick it once; every file below is named after
it, and every path is derived from it. The route URL becomes
`/projects/data-viz/hikes/<slug>` and the post URL `/hikes/<date>-<slug>/`.

**Nothing needs to be added to `hikes.json`.** It only holds hikes still waiting on a
post. A new route that ships with its post is discovered from the files themselves.

## The six files

| # | File | Required |
| --- | --- | --- |
| 1 | `static/_projects/data-viz/hikes/geojson/<slug>.json` | yes |
| 2 | `static/_projects/data-viz/hikes/gpx/<slug>.gpx` | optional |
| 3 | `static/images/projects/data-viz/hikes/<slug>.jpg` | yes |
| 4 | `static/images/projects/data-viz/hikes/thumb/<slug>.jpg` | yes |
| 5 | `static/_projects/data-viz/hikes/markdown/<slug>.hike.json` | yes |
| 6 | `static/_projects/data-viz/hikes/markdown/<date>-<slug>.md` | yes |

Plus one command to fetch the map tiles. Details below.

### 1. The route GeoJSON

Export the route from [openrouteservice](https://maps.openrouteservice.org/) - the
process is written up in [How I make the hiking routes](/blog/2025-03-28-hiking-routes/).
Save it as `<slug>.json`. The site reads `features[0]` and expects:

```jsonc
{
  "type": "FeatureCollection",
  "features": [{
    "type": "Feature",
    "properties": {
      "ascent": 1505.5,          // metres
      "descent": 1492,           // metres
      "summary": { "distance": 14.853, "duration": 22117 }   // km, seconds
    },
    "geometry": {
      "type": "LineString",
      "coordinates": [[10.93817, 47.387558, 1104], ...]      // lon, lat, elevation
    }
  }]
}
```

The third coordinate is elevation and drives the elevation chart, so keep it. Distance
and duration stay in the GeoJSON's own units (km and seconds); the site converts them.

### 2. The GPX (optional)

Drop the recorded track at `<slug>.gpx`. If present, the post page shows a GPX download
link automatically.

**If you want the track listed in the Web graph popup, name it in the post's front
matter** (`gpx:` - see below). The popup only lists a GPX a post explicitly declares;
the download link on the post page appears from the file's existence alone.

Historically, not all GPX recordings were real, rather converted from GeoJSON.
Manually specified `gpx:` path points to a real recorded GPX route, while non-specified
files are auto-generated.

### 3-4. The images

A full-size photo at `<slug>.jpg` and a thumbnail at `thumb/<slug>.jpg`. Both are
required: listings and social cards use the thumbnail path, which is derived by
inserting `thumb/`, so a missing thumbnail is a broken image rather than a fallback.

The thumbnails are generated from full-size photos using `gen_thumb.sh`.

### 5. The sidecar - `<slug>.hike.json`

This is what makes the hike *exist*: the site enumerates hikes by scanning for these
files. Fields shared by every date on the route live here.

```json
{
  "name": "Drachenkopf",
  "description": "Hike from Ehrwald to Drachenkopf (2302 m).",
  "image": "/images/projects/data-viz/hikes/drachenkopf.jpg",
  "origin": { "lat": 47.37161708892748, "lon": 10.93568801879883 },
  "height": 512,
  "checkpoints": [
    [10.9385542, 47.3874899],
    [10.9352297, 47.3775867]
  ]
}
```

- **`name`** - the hike's title. A post can override it per date with `title`.
- **`description`** - one sentence. The post page shows the post's own `description`
  followed by this one, so write it to read as a continuation.
- **`image`** - full-size path from #3. Do not point at the thumbnail.
- **`origin`** - the map centre, hand-picked. Not the trailhead; the point that frames
  the whole route. Getting it wrong mis-frames the rendered map, so eyeball the result.
- **`height`** - the rendered map size in pixels. Any number works; existing hikes use
  15 distinct values from 256 to 1536, most often `512`, then `384` and `768`. Bigger
  for longer or more sprawling routes.
- **`checkpoints`** - a *coarse* `[lon, lat]` outline of the route. This is not the
  track; it is the simplified line drawn on the Web graph (`/hikes/tag/Web/`). Take a
  handful of points along the GeoJSON - existing hikes use between 2 and 19, typically
  6. Note the order: longitude first, as in GeoJSON.
- **`nodes`** - optional OSM points of interest (peaks, huts, waterfalls). Omit the key
  entirely if there are none; do not write `[]` unless you mean it. 71 of 127 hikes have
  them. Query them with [Overpass](https://overpass-turbo.eu/) and keep the OSM shape:

  ```json
  { "id": 264056175, "lat": 47.6521541, "lon": 11.6431635,
    "tags": { "name": "Seekarkreuz", "natural": "peak", "ele": "1601" } }
  ```

  They render as labelled markers on the 2D map and feed the search index's
  `nodeNames`, so a hut or summit named here becomes searchable. Run
  `node scripts/check-nodes.js` afterwards to catch duplicate ids, names or wikidata
  entries across hikes.

### 6. The post - `<date>-<slug>.md`

Name it `YYYY-MM-DD-<slug>.md`. **The filename is the source of truth** for the date and
the route - there is no `date:` or `path:` key, and the URL is built from it.

Front matter is flat: one key per field, no nesting.

```markdown
---
title: Drying up on Drachenkopf
description: Scorching summer hike to the peak, paired with a social hike back.
tags:
  - Climb
people:
  - Stanislav Kidalau
gpx: /_projects/data-viz/hikes/gpx/drachenkopf.gpx
distance: 14853
duration: 369
ascent: 1566
descent: 1549
---
The body starts here, no blank line after the fence.
```

Every key is optional. What each does:

| Key | Effect |
| --- | --- |
| `title` | post title; falls back to the sidecar's `name` |
| `description` | prepended to the sidecar's `description` |
| `image` | only if this date's photo differs from the hike's; otherwise omit |
| `tags` | tag chips, and membership of `/hikes/tag/<tag>/` - a new tag creates its page |
| `people` | participant cards, matched by name against `src/lib/data/contacts.json` |
| `author` | defaults to the site owner |
| `gpx` | see #2 |
| `distance`, `duration`, `ascent`, `descent` | **metres and minutes** - override the GeoJSON |

Note the units: the GeoJSON stores km and seconds, but front matter is canonical -
metres and minutes. `duration: 369` is 6h 09m. Omit these entirely to let the GeoJSON
speak; write them only to correct it.

For the full list of keys, including the rarely-needed `origin`, `height`,
`checkpoints`, `nodes`, `draft`, `hidden`, `filePath` and `metaPath`, see the
[front matter schema](removing-hikes-json.md#front-matter-schema).

## Fetch the map tiles

The 2D and 3D maps render from tiles committed under
`static/_projects/data-viz/maps/`. Download the ones your new route needs:

```sh
cd scripts
mapboxDEMSKU=... mapboxDEMAccess=... \
mapboxSatelliteSKU=... mapboxSatelliteAccess=... \
nextzenAccess=... \
node map-download.js <slug>
```

It reads the sidecar's `origin` and `height` to work out which tiles are in frame, so
run it *after* step 5, and re-run it if you change either. Existing tiles are skipped,
and it waits a second between downloads to avoid rate limits.

## Participants

A name in `people` is matched against `src/lib/data/contacts.json`:

```json
{ "Stanislav Kidalau": {
    "avatar": "/images/hikes/people/stanislav_kidalau.jpg",
    "links": [{ "network": "Instagram", "url": "https://www.instagram.com/..." }] } }
```

An unlisted name still gets a card, just bare. To give someone details for one post
only, use a `contacts` block in the front matter instead of editing the shared book:

```yaml
contacts:
  - name: Ada Lovelace
    avatar: /images/hikes/people/ada.jpg
    links:
      - { network: Strava, url: 'https://www.strava.com/athletes/1' }
      - { label: Blog, url: 'https://example.com' }
```

A link needs a `url` plus either a known `network` (which picks the icon) or a freeform
`label`.

## Check it

```sh
pnpm build     # prerenders everything; the new pages should appear
pnpm check     # types
```

Then look at:

- `/hikes/<date>-<slug>/` - the post, its map, elevation chart and stats
- `/hikes/` - the card, with the right thumbnail and description
- `/hikes/tag/<tag>/` - if you introduced a tag
- `/hikes/tag/Web/` - the route's outline on the graph, from `checkpoints`

**Watch the build log.** A prerender failure does not fail the build: `svelte.config.js`
sets `prerender.handleHttpError` to `console.warn`, so a broken page is silently dropped
from the output. A clean build prints no warnings from it, so if you see one, a page is
missing. Compare page counts if unsure:

```sh
find build -name '*.html' | wc -l
```

## Another date on an existing route

Add only file #6 - `static/_projects/data-viz/hikes/markdown/<date>-<slug>.md` - using
the existing slug. The sidecar, GeoJSON, images and tiles are already there, and the
date is picked up from the filename.

If that route had the date listed in `hikes.json` as unwritten, delete that entry's date
now; the post supersedes it. If it was the entry's only date, delete the whole entry -
`hikes.json` should only ever describe hikes that are still missing a post.

## A hike with no post yet

To put a route on the map without writing about it, add files #1-#5 and then an entry in
`src/lib/data/hikes.json`, since there is no post to carry the date:

```json
{ "properties": { "dates": [{ "date": "2023-07-16" }] },
  "route": "/projects/data-viz/hikes/herzogstand" }
```

Add `"draft": true` to grey it out on `/projects/data-viz/`, or `"hidden": true` to keep
it off the site entirely. Metric overrides for that date go in the same `properties`
block. When you eventually write the post, move those values into its front matter and
remove the entry.
