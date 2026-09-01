"""Pure image-comparison functions. No network, no disk, no config mutation.

Measured behaviour on the real corpus (aiplspitz, 22 web images vs 229 assets):
pHash alone is not sufficient - 8 of 22 queries had a runner-up within 6 bits -
so it is used only to shortlist. Block-mean makes the accept decision.
"""

from dataclasses import dataclass

import cv2
import numpy as np
from PIL import Image
from scipy.fftpack import dct

from . import config


def phash(img: Image.Image) -> np.ndarray:
    """Perceptual hash as a boolean array of PHASH_SIZE**2 - 1 elements.

    JPEG artifacts are high-frequency; keeping only the top-left DCT block
    discards them by construction. The DC term is dropped because it encodes
    only overall brightness.
    """
    n = config.PHASH_SIZE * config.PHASH_FACTOR
    gray = img.convert("L").resize((n, n), Image.Resampling.LANCZOS)
    arr = np.asarray(gray, dtype=float)
    coeffs = dct(dct(arr, axis=0, norm="ortho"), axis=1, norm="ortho")
    block = coeffs[: config.PHASH_SIZE, : config.PHASH_SIZE].flatten()[1:]
    return block > np.median(block)


def hamming(a: np.ndarray, b: np.ndarray) -> int:
    """Number of differing bits between two hashes."""
    return int(np.count_nonzero(a != b))


def block_mean(img: Image.Image) -> np.ndarray:
    """Flattened NxN RGB average, scaled to 0..1.

    Retains spatial colour rather than luminance structure alone, which is what
    separates near-duplicate frames that pHash ties on.
    """
    n = config.BLOCK_MEAN_GRID
    small = img.convert("RGB").resize((n, n), Image.Resampling.LANCZOS)
    return np.asarray(small, dtype=float).flatten() / 255.0


def block_mean_distance(a: np.ndarray, b: np.ndarray) -> float:
    """Mean absolute difference between two block-mean signatures."""
    return float(np.abs(a - b).mean())


def aspect_ratio(width: int, height: int) -> float:
    """Long edge over short edge, so orientation never matters."""
    if width <= 0 or height <= 0:
        return 0.0
    return max(width, height) / min(width, height)


def ar_compatible(a: float, b: float, tol: float) -> bool:
    """True when two aspect ratios agree within a relative tolerance."""
    if a <= 0 or b <= 0:
        return False
    return abs(a - b) / max(a, b) <= tol


@dataclass
class ResidualScore:
    """Photometric agreement between a query and a candidate after alignment."""

    inliers: int
    coverage: float   # fraction of the query covered by the warped candidate
    mae: float        # mean absolute error over the overlap, 0-255 scale
    p95: float        # 95th-percentile absolute error
    ncc: float        # normalised cross-correlation


def _to_gray_array(img: Image.Image, max_edge: int) -> np.ndarray:
    gray = img.convert("L")
    scale = max_edge / max(gray.size)
    if scale < 1:
        gray = gray.resize(
            (max(1, int(gray.width * scale)), max(1, int(gray.height * scale))),
            Image.Resampling.LANCZOS,
        )
    return np.asarray(gray)


def aligned_residual(
    query: Image.Image,
    candidate: Image.Image,
    max_edge: int,
    blur: float = config.DEFAULT_RESIDUAL_BLUR,
) -> ResidualScore | None:
    """Warp `candidate` onto `query` and measure what is left over.

    Recompression and rescaling survive the warp as near-zero residual; scene
    motion and exposure drift between two different exposures do not. Returns
    None when the pair cannot be aligned at all.

    `blur` low-passes both images first, so the comparison happens at a spatial
    frequency both actually contain - see DEFAULT_RESIDUAL_BLUR.
    """
    q = _to_gray_array(query, max_edge)
    c = _to_gray_array(candidate, max_edge)

    detector = cv2.SIFT_create(nfeatures=config.SIFT_FEATURES)
    kq, dq = detector.detectAndCompute(q, None)
    kc, dc = detector.detectAndCompute(c, None)
    if dq is None or dc is None or len(kq) < config.MIN_GOOD_MATCHES or len(kc) < config.MIN_GOOD_MATCHES:
        return None

    matcher = cv2.BFMatcher()
    good = [
        m
        for m, n in matcher.knnMatch(dq, dc, k=2)
        if m.distance < config.SIFT_RATIO * n.distance
    ]
    if len(good) < config.MIN_GOOD_MATCHES:
        return None

    src = np.float32([kc[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
    dst = np.float32([kq[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
    method = getattr(cv2, config.RANSAC_METHOD_NAME, cv2.RANSAC)
    homography, mask = cv2.findHomography(
        src, dst, method, config.RANSAC_REPROJ_THRESHOLD
    )
    if homography is None:
        return None

    size = (q.shape[1], q.shape[0])
    warped = cv2.warpPerspective(c, homography, size)
    valid = cv2.warpPerspective(np.ones_like(c), homography, size) > 0

    q_f = q.astype(float)
    w_f = warped.astype(float)
    if blur > 0:
        q_f = cv2.GaussianBlur(q_f, (0, 0), blur)
        w_f = cv2.GaussianBlur(w_f, (0, 0), blur)
        # The blur drags the zeroed area outside the warp into the border, so
        # drop a margin scaled to the kernel before scoring.
        k = int(max(1, round(2 * blur)))
        valid = cv2.erode(
            valid.astype(np.uint8), np.ones((2 * k + 1, 2 * k + 1), np.uint8)
        ).astype(bool)

    if valid.sum() < 1000:
        return None

    a = q_f[valid]
    b = w_f[valid]
    # Normalise exposure so a brightness or contrast difference alone does not
    # register as a mismatch.
    if b.std() > 1e-6:
        b = (b - b.mean()) * (a.std() / b.std()) + a.mean()
    else:
        b = b - b.mean() + a.mean()

    err = np.abs(a - b)
    return ResidualScore(
        inliers=int(mask.sum()) if mask is not None else 0,
        coverage=float(valid.mean()),
        mae=float(err.mean()),
        p95=float(np.percentile(err, 95)),
        ncc=float(np.corrcoef(a, b)[0, 1]),
    )
