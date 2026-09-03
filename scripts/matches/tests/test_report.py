import json
from datetime import datetime
from pathlib import Path

from matches.immich import Album, Asset
from matches.markdown import MediaRef
from matches.matcher import AlbumChoice, Candidate, Decision, PostResult
from matches.report import build_report, report_path, write_report


def _result():
    asset = Asset("id1", "/lib/IMG_1.jpg", "IMG_1.jpg", "2024-08-31T09:28:34.331Z",
                  "2024-08-31T11:28:34.331Z", 4640, 3472, 47.66, 11.88,
                  file_size=7654321)
    ref_img = MediaRef(0, "/images/a/2024-08-31-00.jpg",
                       Path("/s/images/a/2024-08-31-00.jpg"), "image", None, True)
    ref_vid = MediaRef(1, "/images/a/2024-08-31-01.mp4",
                       Path("/s/images/a/2024-08-31-01.mp4"), "video", None, True)
    matched = Decision(ref_img, "matched", "high", "blockmean",
                       Candidate(asset, 0, 0.0012), [])
    skipped = Decision(ref_vid, "skipped_video", None, None, None, [])
    ref_yt = MediaRef(2, "https://www.youtube.com/watch?v=B5yRsnelCsw",
                      None, "youtube", None, False)
    youtube = Decision(ref_yt, "skipped_youtube", None, None, None, [])
    return PostResult("2024-08-31-aiplspitz.md", "aiplspitz",
                      AlbumChoice(Album("a1", "Germany_Spitzingsee_Aiplspitz", 236), "guessed"),
                      datetime(2024, 8, 28), datetime(2024, 9, 3, 23, 59, 59),
                      229, [matched, skipped, youtube])


def test_report_shape():
    r = build_report(_result(), "https://immich.example")
    assert r["post"] == "2024-08-31-aiplspitz.md"
    assert r["album"]["name"] == "Germany_Spitzingsee_Aiplspitz"
    assert r["album"]["source"] == "guessed"
    assert r["candidate_count"] == 229
    assert r["date_window"] == {"from": "2024-08-28", "to": "2024-09-03"}


def test_every_reference_appears():
    r = build_report(_result(), "https://immich.example")
    assert len(r["entries"]) == 3
    assert [e["index"] for e in r["entries"]] == [0, 1, 2]


def test_matched_entry_carries_original_path():
    r = build_report(_result(), "https://immich.example")
    e = r["entries"][0]
    assert e["status"] == "matched"
    assert e["match"]["original_path"] == "/lib/IMG_1.jpg"
    assert e["match"]["file_size"] == 7654321
    assert e["match"]["scores"]["blockmean"] == 0.0012
    assert e["match"]["scores"]["mae"] is None


def test_unmatched_entry_has_null_match():
    r = build_report(_result(), "https://immich.example")
    e = r["entries"][1]
    assert e["status"] == "skipped_video"
    assert e["match"] is None


def test_stats_count_every_status():
    r = build_report(_result(), "https://immich.example")
    assert r["stats"]["total"] == 3
    assert r["stats"]["matched"] == 1
    assert r["stats"]["skipped_video"] == 1
    assert r["stats"]["skipped_youtube"] == 1
    assert r["stats"]["unmatched"] == 0


def test_youtube_entry_has_null_local_path():
    r = build_report(_result(), "https://immich.example")
    e = r["entries"][2]
    assert e["status"] == "skipped_youtube"
    assert e["local_path"] is None
    assert e["match"] is None


def test_write_report_is_valid_json(tmp_path):
    r = build_report(_result(), "https://immich.example")
    p = write_report(r, tmp_path, "2024-08-31-aiplspitz.md")
    assert p == tmp_path / "2024-08-31-aiplspitz.json"
    assert json.loads(p.read_text())["post"] == "2024-08-31-aiplspitz.md"


def test_report_path_swaps_extension(tmp_path):
    assert report_path(tmp_path, "2024-08-31-aiplspitz.md").name == "2024-08-31-aiplspitz.json"
