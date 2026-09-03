"""Offline tests for Remote.find_asset's filename/id/URL resolution."""

import pytest

from matches import config
from matches.immich import Asset
from matches.review.remote import Remote

ASSET = Asset(
    id="953e18b3-3d1e-4e21-9e31-1f64a6015c14",
    original_path="/originals/IMG_1234.jpg",
    original_file_name="IMG_1234.jpg",
    file_created_at="2024-08-31T00:00:00Z",
    local_date_time="2024-08-31T00:00:00",
    width=100, height=100, latitude=None, longitude=None,
)


@pytest.fixture
def remote(monkeypatch):
    r = Remote(config.Settings(api_key="k", immich_url="https://immich.example"))
    monkeypatch.setattr(r, "candidates_for", lambda post: [ASSET])
    return r


def test_finds_by_bare_id(remote):
    assert remote.find_asset(None, ASSET.id) is ASSET


def test_finds_by_filename(remote):
    assert remote.find_asset(None, "IMG_1234.jpg") is ASSET


def test_finds_by_photo_viewer_url(remote):
    url = ("https://immich.example/albums/"
           "7b14d8c7-f4be-429f-adc2-d35a2e974677/photos/" + ASSET.id)
    assert remote.find_asset(None, url) is ASSET


def test_finds_by_url_with_trailing_slash_and_query(remote):
    url = f"https://immich.example/photos/{ASSET.id}/?open=true"
    assert remote.find_asset(None, url) is ASSET


def test_unmatched_url_returns_none(remote):
    url = "https://immich.example/photos/00000000-0000-0000-0000-000000000000"
    assert remote.find_asset(None, url) is None
