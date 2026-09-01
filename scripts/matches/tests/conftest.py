"""Synthetic image fixtures.

Random noise survives neither downscaling nor SIFT well, so these images are
built from drawn shapes: strong corners for SIFT, stable low-frequency
structure for pHash.
"""

import io
import random

import pytest
from PIL import Image, ImageDraw


def synthetic_image(seed: int, size: tuple[int, int] = (1200, 900)) -> Image.Image:
    rng = random.Random(seed)
    img = Image.new("RGB", size, (240, 240, 235))
    d = ImageDraw.Draw(img)
    for _ in range(120):
        x0 = rng.randint(0, size[0] - 1)
        y0 = rng.randint(0, size[1] - 1)
        x1 = x0 + rng.randint(20, 260)
        y1 = y0 + rng.randint(20, 260)
        color = (rng.randint(0, 255), rng.randint(0, 255), rng.randint(0, 255))
        if rng.random() < 0.5:
            d.rectangle([x0, y0, x1, y1], fill=color)
        else:
            d.ellipse([x0, y0, x1, y1], fill=color)
    return img


def recompress(img: Image.Image, scale: float = 0.5, quality: int = 60) -> Image.Image:
    """Approximate the web pipeline: downscale then lossy re-encode."""
    w = max(1, int(img.width * scale))
    h = max(1, int(img.height * scale))
    small = img.resize((w, h), Image.Resampling.LANCZOS)
    buf = io.BytesIO()
    small.save(buf, format="JPEG", quality=quality)
    buf.seek(0)
    return Image.open(buf).convert("RGB")


@pytest.fixture
def scene_a() -> Image.Image:
    return synthetic_image(1)


@pytest.fixture
def scene_b() -> Image.Image:
    return synthetic_image(2)
