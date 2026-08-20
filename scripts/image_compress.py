#!/usr/bin/env python3
"""
WhatsApp-style JPEG compression.

Replicates WhatsApp's compression pipeline using the exact quantization
tables extracted from WhatsApp-compressed JPEG files.

Supports JPEG, PNG, HEIC (via ImageMagick), and other formats Pillow or
ImageMagick can decode.

Usage:
    python3 wa_compress.py input.jpg                    # default: HD mode
    python3 wa_compress.py input.heic -o output_dir/    # specify output dir
    python3 wa_compress.py input.jpg --mode standard     # standard (1600px)
    python3 wa_compress.py *.heic --max-edge 3000        # custom max edge

Measured against real WhatsApp HD uploads, WhatsApp caps the long edge at
4160px (not 4000) and does NOT downscale images already under that cap.
It also stores a single shared chroma quantization table (2 DQT entries)
rather than Pillow's default 3.
"""

import argparse
import os
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image

# Register HEIC/HEIF support if pillow-heif is installed
try:
    from pillow_heif import register_heif_opener
    register_heif_opener()
except ImportError:
    pass

# WhatsApp's custom quantization tables (extracted from real WhatsApp HD JPEGs).
# These are in zigzag order as stored in the JPEG file.
# Standard libjpeg quality sliders cannot reproduce these exact values.

WHATSAPP_HD_LUMA_ZIGZAG = [
    8, 6, 6, 7, 6, 5, 8, 7,
    7, 7, 9, 9, 8, 10, 12, 20,
    13, 12, 11, 11, 12, 25, 18, 19,
    15, 20, 29, 26, 31, 30, 29, 26,
    28, 28, 32, 36, 46, 39, 32, 34,
    44, 35, 28, 28, 40, 55, 41, 44,
    48, 49, 52, 52, 52, 31, 39, 57,
    61, 56, 50, 60, 46, 51, 52, 50,
]

WHATSAPP_HD_CHROMA_ZIGZAG = [
    9, 9, 9, 12, 11, 12, 24, 13,
    13, 24, 50, 33, 28, 33, 50, 50,
    50, 50, 50, 50, 50, 50, 50, 50,
    50, 50, 50, 50, 50, 50, 50, 50,
    50, 50, 50, 50, 50, 50, 50, 50,
    50, 50, 50, 50, 50, 50, 50, 50,
    50, 50, 50, 50, 50, 50, 50, 50,
    50, 50, 50, 50, 50, 50, 50, 50,
]

# Zigzag scan order -> natural (raster) order mapping
ZIGZAG_TO_NATURAL = [
    0,  1,  8,  16, 9,  2,  3,  10,
    17, 24, 32, 25, 18, 11, 4,  5,
    12, 19, 26, 33, 40, 48, 41, 34,
    27, 20, 13, 6,  7,  14, 21, 28,
    35, 42, 49, 56, 57, 50, 43, 36,
    29, 22, 15, 23, 30, 37, 44, 51,
    58, 59, 52, 45, 38, 31, 39, 46,
    53, 60, 61, 54, 47, 55, 62, 63,
]


def zigzag_to_natural(zigzag_table):
    """Convert a 64-element quantization table from zigzag order to natural order."""
    natural = [0] * 64
    for i, pos in enumerate(ZIGZAG_TO_NATURAL):
        natural[pos] = zigzag_table[i]
    return natural


def open_image(path):
    """Open an image file, falling back to ImageMagick for unsupported formats (HEIC, etc.)."""
    try:
        return Image.open(path), None
    except (Image.UnidentifiedImageError, OSError):
        pass

    # Try ImageMagick as decoder
    for cmd in ("convert", "magick"):
        try:
            tmp = tempfile.NamedTemporaryFile(suffix=".tiff", delete=False)
            tmp.close()
            subprocess.run(
                [cmd, str(path), "-depth", "8", tmp.name],
                check=True, capture_output=True,
            )
            img = Image.open(tmp.name)
            return img, tmp.name
        except (FileNotFoundError, subprocess.CalledProcessError):
            if os.path.exists(tmp.name):
                os.unlink(tmp.name)
            continue

    raise RuntimeError(
        f"Cannot open {path}. Install pillow-heif for HEIC support, "
        "or ensure ImageMagick (convert/magick) is installed."
    )


def compress_whatsapp(input_path, output_path, max_edge=4000, mode="hd"):
    """
    Compress an image using WhatsApp's compression logic.

    Modes:
        hd:       Custom WhatsApp HD quantization tables, 4160px max edge
        standard: More aggressive custom tables, 1600px max edge
    """
    if mode == "hd":
        luma_zigzag = WHATSAPP_HD_LUMA_ZIGZAG
        chroma_zigzag = WHATSAPP_HD_CHROMA_ZIGZAG
        default_max_edge = 4160
    elif mode == "standard":
        luma_zigzag = None
        chroma_zigzag = None
        default_max_edge = 1600
    else:
        raise ValueError(f"Unknown mode: {mode}")

    if max_edge is None:
        max_edge = default_max_edge

    img, tmp_path = open_image(input_path)
    try:
        with img:
            # Convert to RGB (drops alpha, ICC profile handled by Pillow)
            if img.mode in ("RGBA", "LA", "P", "PA"):
                background = Image.new("RGB", img.size, (255, 255, 255))
                if img.mode == "P":
                    img = img.convert("RGBA")
                background.paste(img, mask=img.split()[-1] if "A" in img.mode else None)
                img = background
            elif img.mode != "RGB":
                img = img.convert("RGB")

            # Resize if larger than max_edge (maintain aspect ratio)
            if max(img.size) > max_edge:
                img.thumbnail((max_edge, max_edge), Image.Resampling.LANCZOS)

            # Build save kwargs
            save_kwargs = {
                "format": "JPEG",
                "progressive": True,
                "optimize": False,
            }

            if luma_zigzag is not None:
                luma_natural = zigzag_to_natural(luma_zigzag)
                chroma_natural = zigzag_to_natural(chroma_zigzag)
                # Two DQT entries, matching WhatsApp: chroma shared between
                # Cb/Cr. Pillow writes one DQT per dict key; 3 entries would
                # inflate the file and confuse quality estimators.
                save_kwargs["qtables"] = {
                    0: luma_natural,
                    1: chroma_natural,
                }
            else:
                save_kwargs["quality"] = 75

            img.save(output_path, **save_kwargs)
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)

    return output_path


def main():
    parser = argparse.ArgumentParser(
        description="Compress images using WhatsApp's compression logic.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s photo.heic                          # HD mode, output in same dir
  %(prog)s photo.jpg -o compressed/            # HD mode, output to compressed/
  %(prog)s *.heic --mode standard              # Standard (non-HD) mode
  %(prog)s photo.jpg --max-edge 3000           # Custom max edge size
  %(prog)s photo.jpg --delete                  # Delete input after compression
  %(prog)s photo.jpg -v                        # Verbose output
""",
    )
    parser.add_argument("input", nargs="+", help="Input image file(s)")
    parser.add_argument("-o", "--output-dir", default=".", help="Output directory (default: current dir)")
    parser.add_argument(
        "--mode",
        choices=["hd", "standard"],
        default="hd",
        help="Compression mode (default: hd)",
    )
    parser.add_argument("--max-edge", type=int, default=None, help="Max edge in pixels (default: 4000 for hd, 1600 for standard)")
    parser.add_argument("--delete", action="store_true", help="Delete input files after successful compression")
    parser.add_argument("-v", "--verbose", action="store_true", help="Show compression details")

    args = parser.parse_args()

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    for input_path in args.input:
        input_path = Path(input_path)
        if not input_path.exists():
            print(f"Warning: {input_path} not found, skipping", file=sys.stderr)
            continue

        stem = input_path.stem
        output_path = output_dir / f"{stem}_wa.jpg"

        # Avoid overwriting: append suffix if exists
        counter = 1
        while output_path.exists():
            output_path = output_dir / f"{stem}_wa_{counter}.jpg"
            counter += 1

        original_size = input_path.stat().st_size
        try:
            result = compress_whatsapp(str(input_path), str(output_path), args.max_edge, args.mode)
            compressed_size = Path(result).stat().st_size

            if args.verbose:
                ratio = (1 - compressed_size / original_size) * 100
                print(f"{input_path.name}: {original_size/1024:.0f}K -> {compressed_size/1024:.0f}K ({ratio:.1f}% reduction) -> {output_path}")
            else:
                print(f"{output_path}")

            if args.delete:
                input_path.unlink()
                if args.verbose:
                    print(f"Deleted input: {input_path}")
        except Exception as e:
            print(f"Error compressing {input_path}: {e}", file=sys.stderr)
            if output_path.exists():
                output_path.unlink()


if __name__ == "__main__":
    main()
