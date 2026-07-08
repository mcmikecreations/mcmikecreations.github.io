<?php
header('Content-Type: application/x-suggestions+json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$q = isset($_GET['q']) ? trim($_GET['q']) : '';
if ($q === '') {
    echo json_encode([$q, [], [], []]);
    exit;
}

function normalize(string $s): string {
    $t = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $s);
    return strtolower($t !== false ? $t : $s);
}

const NAME_HASH_SALT = 'mykolamor-hikes-people-v1';

function normalize_name(string $s): string {
    // Match the JS any-ascii fold as closely as possible.
    if (class_exists('Transliterator')) {
        $tr = Transliterator::create('Any-Latin; Latin-ASCII');
        if ($tr !== null) {
            $t = $tr->transliterate($s);
            if ($t !== false) {
                return strtolower($t);
            }
        }
    }
    $t = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $s);
    return strtolower($t !== false ? $t : $s);
}

function hash_name_token(string $rawToken): string {
    return substr(hash('sha256', NAME_HASH_SALT . normalize_name($rawToken)), 0, 16);
}

function hash_query_people(string $q): array {
    $tokens = preg_split('/\s+/u', trim($q), -1, PREG_SPLIT_NO_EMPTY);
    if ($tokens === false) {
        return [];
    }
    return array_values(array_unique(array_map('hash_name_token', $tokens)));
}

$indexPath = __DIR__ . '/search-index.json';
if (!file_exists($indexPath)) {
    echo json_encode([$q, [], [], []]);
    exit;
}

$entries = json_decode(file_get_contents($indexPath), true);
if (!is_array($entries)) {
    echo json_encode([$q, [], [], []]);
    exit;
}

$nq = normalize($q);
$queryPeopleHashes = hash_query_people($q);

$scored = [];
foreach ($entries as $entry) {
    $score = 0;

    $nTitle     = normalize($entry['title']);
    $nHikeName  = normalize($entry['hikeName']);
    $nDesc      = normalize($entry['description']);
    $nodeNames  = $entry['nodeNames'] ?? [];
    $tags       = $entry['tags'] ?? [];
    $peopleHashes = $entry['peopleHashes'] ?? [];

    // Full matches
    if ($nHikeName === $nq || $nTitle === $nq) {
        $score += 10000;
    }
    foreach ($nodeNames as $n) {
        if (normalize($n) === $nq) { $score += 5000; break; }
    }
    foreach ($tags as $t) {
        if (normalize($t) === $nq) { $score += 5000; break; }
    }
    if (!empty(array_intersect($queryPeopleHashes, $peopleHashes))) {
        $score += 5000;
    }
    if ($nDesc === $nq) {
        $score += 3000;
    }

    // Partial matches
    if (str_contains($nHikeName, $nq)) {
        $score += 100;
    }
    foreach ($nodeNames as $n) {
        if (str_contains(normalize($n), $nq)) { $score += 40; break; }
    }
    foreach ($tags as $t) {
        if (str_contains(normalize($t), $nq)) { $score += 40; break; }
    }
    if (str_contains($nDesc, $nq)) {
        $score += 1;
    }

    if ($score > 0) {
        $scored[] = ['entry' => $entry, 'score' => $score];
    }
}

usort($scored, fn($a, $b) => $b['score'] - $a['score']);
$scored = array_slice($scored, 0, 8);

$titles = [];
$descs  = [];
$urls   = [];

foreach ($scored as $r) {
    $e = $r['entry'];
    $titles[] = $e['title'];
    $desc = $e['description'];
    $descs[]  = mb_strlen($desc) > 120 ? mb_substr($desc, 0, 119) . '…' : $desc;
    $urls[]   = 'https://mykolamor.com' . $e['url'];
}

echo json_encode([$q, $titles, $descs, $urls], JSON_UNESCAPED_UNICODE);
