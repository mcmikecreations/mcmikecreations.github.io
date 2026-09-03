"""Offline tests for AddSpec resolution in review.actions."""

from pathlib import Path
from types import SimpleNamespace

import pytest

from matches import config
from matches.immich import Asset
from matches.review import actions
from matches.review.remote import Remote

ASSET = Asset(
    id="953e18b3-3d1e-4e21-9e31-1f64a6015c14",
    original_path="/originals/IMG_1234.jpg",
    original_file_name="IMG_1234.jpg",
    file_created_at="2024-08-31T00:00:00Z",
    local_date_time="2024-08-31T00:00:00",
    width=100, height=100, latitude=None, longitude=None,
)
URL = ("https://immich.example/albums/"
       "7b14d8c7-f4be-429f-adc2-d35a2e974677/photos/" + ASSET.id)


@pytest.fixture
def remote(monkeypatch):
    r = Remote(config.Settings(api_key="k", immich_url="https://immich.example"))
    monkeypatch.setattr(r, "candidates_for", lambda post: [ASSET])
    return r


def test_remote_mode_resolves_a_pasted_url_to_the_asset_id(remote, monkeypatch):
    """A filename/id-only AddSpec.asset_id is None; the URL lives in asset_name."""
    calls = {}

    def fake_download(settings, remote, post, asset_id, out_name, mode):
        calls["asset_id"] = asset_id
        return Path("out.jpg"), {"web_path": "/x", "status": "matched"}

    monkeypatch.setattr(actions, "download_and_compress", fake_download)
    spec = actions.AddSpec(mode=actions.MODE_REMOTE, asset_name=URL,
                           out_name="out.jpg")
    entry = actions.apply_add_spec(None, remote, SimpleNamespace(), spec)
    assert calls["asset_id"] == ASSET.id
    assert entry["status"] == "matched"


def test_remote_mode_raises_for_an_unresolvable_asset(remote):
    spec = actions.AddSpec(mode=actions.MODE_REMOTE, asset_name="nope.jpg",
                           out_name="out.jpg")
    with pytest.raises(ValueError):
        actions.apply_add_spec(None, remote, SimpleNamespace(), spec)


def test_next_out_name_starts_at_zero_for_an_empty_folder(tmp_path):
    settings = config.Settings(static_root=tmp_path)
    assert actions.next_out_name(settings, "demo", "2026-06-10") == "2026-06-10-00.jpg"


def test_next_out_name_continues_past_the_highest_existing_index(tmp_path):
    settings = config.Settings(static_root=tmp_path)
    folder = actions.stories_dir(settings, "demo")
    folder.mkdir(parents=True)
    (folder / "2026-06-10-00.jpg").touch()
    (folder / "2026-06-10-01.heic").touch()
    (folder / "2026-06-10-17.mp4").touch()
    (folder / "2026-06-11-00.jpg").touch()  # different date, ignored
    assert actions.next_out_name(settings, "demo", "2026-06-10") == "2026-06-10-18.jpg"
    assert actions.next_out_name(settings, "demo", "2026-06-12") == "2026-06-12-00.jpg"
