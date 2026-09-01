"""Live regression test against the real Immich instance.

Skipped unless IMMICH_API_KEY is set. Expected values were established by
hand during the design spike and independently confirmed with SIFT.

EXPECTED is keyed by the web filename number in `2024-08-31-NN.jpg`, not by
position in the document. This post is not in filename order: `-20.jpg` appears
at position 13 and `-21.jpg` at position 18.
"""

import os
from pathlib import Path

import pytest

from matches import config
from matches.immich import ImmichClient
from matches.matcher import match_post

pytestmark = pytest.mark.skipif(
    not (os.environ.get(config.API_KEY_ENV) and os.environ.get(config.IMMICH_URL_ENV)),
    reason=f"{config.API_KEY_ENV} and {config.IMMICH_URL_ENV} must both be set",
)

EXPECTED = {
    0: "IMG_20240831_112834.jpg",
    1: "IMG_20240831_113318.jpg",
    2: "IMG_20240831_113810.jpg",
    3: "IMG_20240831_120143.jpg",
    4: "IMG_20240831_121309.jpg",
    5: "IMG_20240831_122239.jpg",
    6: "IMG_20240831_125603.jpg",
    7: "IMG_20240831_124535.jpg",
    8: "IMG_20240831_125155.jpg",
    9: "IMG_20240831_130207.jpg",
    10: "IMG_20240831_130211.jpg",
    11: "IMG_20240831_131529.jpg",
    12: "IMG_20240831_132808.jpg",
    13: "IMG_20240831_133942.jpg",
    14: "IMG_20240831_134507.jpg",
    15: "IMG_20240831_135008.jpg",
    16: "IMG_20240831_142438.jpg",
    17: "IMG_20240831_143500.jpg",
    18: "IMG_20240831_145016.jpg",
    19: "IMG_20240831_155506.jpg",
    20: "IMG_3428.HEIC",
    21: "IMG_3445.JPG",
}


@pytest.fixture(scope="module")
def result(tmp_path_factory):
    settings = config.Settings(cache_dir=tmp_path_factory.mktemp("cache"))
    client = ImmichClient(settings)
    post = settings.posts_dir / "2024-08-31-aiplspitz.md"
    return match_post(post, client, settings, client.list_albums())


def test_album_is_guessed_correctly(result):
    assert result.album_choice.album is not None
    assert result.album_choice.album.name == "Germany_Spitzingsee_Aiplspitz"
    assert result.album_choice.source == "guessed"


def test_every_image_is_matched(result):
    unmatched = [d.ref.index for d in result.decisions if d.status == "unmatched"]
    assert unmatched == [], f"unmatched indices: {unmatched}"


def _by_web_number(result):
    """Matched original filename, keyed by the NN in `2024-08-31-NN.jpg`."""
    return {
        int(Path(d.ref.web_path).stem.rsplit("-", 1)[1]): d.best.asset.original_file_name
        for d in result.decisions
        if d.best is not None
    }


def test_matches_are_correct(result):
    actual = _by_web_number(result)
    wrong = {i: (actual.get(i), want) for i, want in EXPECTED.items()
             if actual.get(i) != want}
    assert not wrong, f"web number: (got, want) = {wrong}"


def test_out_of_order_photos_are_not_forced_into_sequence(result):
    """`-06.jpg` is a 12:56 capture and `-07.jpg` a 12:45 one, deliberately."""
    actual = _by_web_number(result)
    assert actual[6] == "IMG_20240831_125603.jpg"
    assert actual[7] == "IMG_20240831_124535.jpg"


def test_document_order_is_not_filename_order(result):
    """Guards the keying above: position 13 really is `-20.jpg`."""
    order = [int(Path(d.ref.web_path).stem.rsplit("-", 1)[1]) for d in result.decisions]
    assert order != sorted(order)
    assert order[13] == 20 and order[18] == 21
