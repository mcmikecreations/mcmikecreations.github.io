#!/usr/bin/env python3
"""Browser front-end for reviewing and correcting hike image matches.

    scripts/.venv/bin/python scripts/image_match_web.py
    # then open http://127.0.0.1:8765

Suited to remote development: run it on the machine holding the photos and
forward the port, e.g. ssh -L 8765:localhost:8765 <host>.

Shares configuration with image_match.py. The Immich API key can come from
$IMMICH_API_KEY, from --api-key, or be typed into the app's Settings dialog.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from matches.cli import build_parser, settings_from_args  # noqa: E402
from matches.web.server import serve  # noqa: E402


def main(argv=None) -> int:
    parser = build_parser()
    parser.prog = "image_match_web.py"
    group = parser.add_argument_group("web server")
    group.add_argument("--host", default="127.0.0.1",
                       help="Interface to bind. Localhost by default: the API "
                            "reads local files and holds your Immich key.")
    group.add_argument("--port", type=int, default=8765, help="Port to listen on.")
    args = parser.parse_args(argv)
    serve(settings_from_args(args), args.host, args.port)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
