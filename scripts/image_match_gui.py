#!/usr/bin/env python3
"""Review and correct hike image matches.

    scripts/.venv/bin/python scripts/image_match_gui.py

Shares its configuration with image_match.py, so IMMICH_API_KEY and the same
--immich-url / --posts-dir / --out-dir overrides apply here too. Without a key
the app still opens: local images and JSON editing work, but Immich previews
and re-matching do not.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from matches.cli import build_parser, settings_from_args  # noqa: E402
from matches.gui.app import launch  # noqa: E402


def main(argv=None) -> int:
    parser = build_parser()
    parser.prog = "image_match_gui.py"
    args = parser.parse_args(argv or [])
    launch(settings_from_args(args))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
