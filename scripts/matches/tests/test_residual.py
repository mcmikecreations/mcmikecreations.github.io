from matches import signatures as sig
from matches.tests.conftest import recompress


def test_true_match_has_low_residual(scene_a):
    r = sig.aligned_residual(recompress(scene_a), scene_a, max_edge=800)
    assert r is not None
    assert r.mae < 5.0
    assert r.ncc > 0.98
    assert r.coverage > 0.9


def test_different_scene_scores_worse_or_fails(scene_a, scene_b):
    same = sig.aligned_residual(recompress(scene_a), scene_a, max_edge=800)
    diff = sig.aligned_residual(recompress(scene_a), scene_b, max_edge=800)
    assert same is not None
    if diff is not None:
        assert diff.mae > same.mae * 2


def test_exposure_shift_does_not_count_as_mismatch(scene_a):
    from PIL import ImageEnhance

    # Brightening the fixture directly blows out ~27% of its pixels to 255, and
    # clipping is not invertible by any linear normalisation. Darken first so
    # there is headroom for a genuine exposure difference to be applied.
    base = ImageEnhance.Brightness(scene_a).enhance(0.6)
    brighter = ImageEnhance.Brightness(base).enhance(1.25)
    baseline = sig.aligned_residual(recompress(base), base, max_edge=800)
    shifted = sig.aligned_residual(recompress(base), brighter, max_edge=800)
    assert baseline is not None and shifted is not None
    # The raw brightness gap is ~25 grey levels; after normalisation it should
    # cost essentially nothing relative to the no-exposure-change baseline.
    assert shifted.mae < baseline.mae * 1.5, "brightness normalisation is not being applied"


def test_returns_none_on_featureless_input(scene_a):
    from PIL import Image

    flat = Image.new("RGB", (900, 700), (128, 128, 128))
    assert sig.aligned_residual(flat, scene_a, max_edge=800) is None
