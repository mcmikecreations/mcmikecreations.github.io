#!/usr/bin/env python3
"""Map compressed hike-post images to their Immich originals.

Run `scripts/.venv/bin/python scripts/image_match.py --help` for options.
Implementation lives in the `matches` package beside this file.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from matches.cli import main  # noqa: E402

if __name__ == "__main__":
    raise SystemExit(main())
