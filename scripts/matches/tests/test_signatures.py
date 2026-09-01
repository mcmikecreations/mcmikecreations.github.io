import pytest

from matches import config
from matches import signatures as sig
from matches.tests.conftest import recompress


def test_phash_is_63_bits(scene_a):
    assert sig.phash(scene_a).shape == (63,)


def test_phash_survives_recompression(scene_a):
    d = sig.hamming(sig.phash(scene_a), sig.phash(recompress(scene_a)))
    assert d <= 6, f"recompressed copy drifted {d} bits"


def test_phash_separates_different_scenes(scene_a, scene_b):
    same = sig.hamming(sig.phash(scene_a), sig.phash(recompress(scene_a)))
    diff = sig.hamming(sig.phash(scene_a), sig.phash(scene_b))
    assert diff > same + 10


def test_block_mean_survives_recompression(scene_a):
    # Asserted against DEFAULT_BM_ACCEPT rather than a loose literal: Task 7's
    # cascade accepts a stage-2 match below this value, so if the synthetic
    # fixture drifts above it the cascade tests would fail confusingly instead.
    d = sig.block_mean_distance(sig.block_mean(scene_a),
                               sig.block_mean(recompress(scene_a)))
    assert d < config.DEFAULT_BM_ACCEPT


def test_block_mean_separates_different_scenes(scene_a, scene_b):
    same = sig.block_mean_distance(sig.block_mean(scene_a),
                                  sig.block_mean(recompress(scene_a)))
    diff = sig.block_mean_distance(sig.block_mean(scene_a), sig.block_mean(scene_b))
    assert diff > same * 5


def test_aspect_ratio_is_orientation_free():
    assert sig.aspect_ratio(4000, 3000) == pytest.approx(sig.aspect_ratio(3000, 4000))
    assert sig.aspect_ratio(4000, 3000) == pytest.approx(4 / 3)


def test_ar_compatible():
    assert sig.ar_compatible(1.3333, 1.3364, 0.06)
    assert not sig.ar_compatible(1.3333, 0.7483, 0.06)
