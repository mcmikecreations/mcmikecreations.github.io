from datetime import date, datetime
from pathlib import Path

from matches.immich import Album
from matches.markdown import MediaRef
from matches.matcher import coverage, date_window, guess_albums, tokenize

ALBUMS = [
    Album("a1", "Germany_Spitzingsee_Aiplspitz", 236),
    Album("a2", "Germany_Spitzingsee_Rosskopf", 167),
    Album("a3", "Croatia_Omis_Duce", 198),
    Album("a4", "Nepal_Annapurna", 761),
    Album("a5", "Germany_Lenggries_Buchstein_Only", 12),
    Album("a6", "Germany_Lenggries_Buchstein_Rossstein", 34),
]


def test_tokenize_splits_on_punctuation():
    assert tokenize("Germany_Spitzingsee_Aiplspitz") == {"germany", "spitzingsee", "aiplspitz"}
    assert tokenize("omis_fort_climb") == {"omis", "fort", "climb"}


def test_coverage_ignores_location_prefix():
    assert coverage("aiplspitz", "Germany_Spitzingsee_Aiplspitz") == 1.0


def test_coverage_is_not_jaccard():
    # Jaccard would be 1/3 here; coverage must be 1.0.
    assert coverage("aiplspitz", "Germany_Spitzingsee_Aiplspitz") > 0.9


def test_guess_returns_ranked_candidates():
    ranked = guess_albums("aiplspitz", ALBUMS, minimum=0.5)
    assert ranked[0][1].name == "Germany_Spitzingsee_Aiplspitz"
    assert ranked[0][0] == 1.0


def test_guess_keeps_ties_for_later_disambiguation():
    ranked = guess_albums("buchstein", ALBUMS, minimum=0.5)
    names = {a.name for _, a in ranked}
    assert names == {
        "Germany_Lenggries_Buchstein_Only",
        "Germany_Lenggries_Buchstein_Rossstein",
    }


def test_guess_drops_low_coverage():
    assert guess_albums("annapurna_bc_1", ALBUMS, minimum=0.5) == []


def test_guess_returns_empty_when_nothing_overlaps():
    assert guess_albums("rotwand", ALBUMS, minimum=0.5) == []


def _ref(name, d):
    return MediaRef(0, f"/x/{name}", Path("/x") / name, "image", d, True)


def test_date_window_spans_image_dates():
    refs = [
        _ref("2026-07-19-00.jpg", date(2026, 7, 19)),
        _ref("2026-07-20-01.jpg", date(2026, 7, 20)),
    ]
    lo, hi = date_window(refs, date(2026, 7, 19), days=3)
    assert lo == datetime(2026, 7, 16, 0, 0, 0)
    assert hi == datetime(2026, 7, 23, 23, 59, 59)


def test_date_window_falls_back_to_post_date():
    refs = [_ref("summit.jpg", None)]
    lo, hi = date_window(refs, date(2024, 8, 31), days=3)
    assert lo == datetime(2024, 8, 28, 0, 0, 0)
    assert hi == datetime(2024, 9, 3, 23, 59, 59)


def _asset(aid, stamp):
    from matches.immich import Asset
    return Asset(aid, f"/lib/{aid}", f"{aid}.CR3", stamp, stamp, 6000, 4000, None, None)


class _RecordingClient:
    """Captures the filters the matcher asks for."""

    def __init__(self):
        self.calls = []

    def search_assets(self, album_ids=None, taken_after=None, taken_before=None):
        self.calls.append({"album_ids": album_ids, "after": taken_after,
                           "before": taken_before})
        return [_asset("a", "2000-01-01T00:07:09Z")]


def test_a_known_album_skips_the_date_window():
    """Wrong timestamps must not hide assets we already know belong here."""
    from matches.matcher import AlbumChoice, candidate_assets
    from matches import config

    client = _RecordingClient()
    choice = AlbumChoice(ALBUMS[0], "guessed")
    assets = candidate_assets(client, choice, (datetime(2025, 5, 8), datetime(2025, 5, 14)),
                              config.Settings())
    assert len(assets) == 1
    assert client.calls[0]["album_ids"] == ["a1"]
    assert client.calls[0]["after"] is None and client.calls[0]["before"] is None


def test_no_album_still_uses_the_window():
    from matches.matcher import AlbumChoice, candidate_assets
    from matches import config

    client = _RecordingClient()
    window = (datetime(2025, 5, 8), datetime(2025, 5, 14))
    candidate_assets(client, AlbumChoice(None, "none"), window, config.Settings())
    assert client.calls[0]["album_ids"] is None
    assert client.calls[0]["after"] == window[0]


def test_trust_album_can_be_turned_off():
    from matches.matcher import AlbumChoice, candidate_assets
    from matches import config

    client = _RecordingClient()
    window = (datetime(2025, 5, 8), datetime(2025, 5, 14))
    candidate_assets(client, AlbumChoice(ALBUMS[0], "guessed"), window,
                     config.Settings(trust_album=False))
    assert client.calls[0]["after"] == window[0]
