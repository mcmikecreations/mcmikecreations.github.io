"""Run slow work off the UI thread.

Tkinter is not thread-safe, so workers only ever put results on a queue; the
main loop drains it from an `after` callback and touches the widgets there.
"""

import queue
import threading
import traceback
from dataclasses import dataclass
from typing import Any, Callable

POLL_MS = 80


@dataclass
class Result:
    tag: str
    ok: bool
    value: Any = None
    error: str = ""


class TaskRunner:
    """Fire-and-forget background jobs with main-thread callbacks."""

    def __init__(self, widget):
        self.widget = widget
        self.queue: queue.Queue[tuple[Result, Callable]] = queue.Queue()
        self._running = 0
        self.widget.after(POLL_MS, self._drain)

    @property
    def busy(self) -> bool:
        return self._running > 0

    def run(self, tag: str, fn: Callable[[], Any],
            on_done: Callable[[Result], None]) -> None:
        """Call `fn` on a worker thread, then `on_done` on the main thread."""
        self._running += 1

        def worker():
            try:
                self.queue.put((Result(tag, True, fn()), on_done))
            except Exception as exc:  # surfaced in the UI, not swallowed
                self.queue.put((
                    Result(tag, False, error=f"{exc}\n\n{traceback.format_exc()}"),
                    on_done,
                ))

        threading.Thread(target=worker, daemon=True).start()

    def _drain(self) -> None:
        try:
            while True:
                result, callback = self.queue.get_nowait()
                self._running = max(0, self._running - 1)
                try:
                    callback(result)
                except Exception:
                    traceback.print_exc()
        except queue.Empty:
            pass
        self.widget.after(POLL_MS, self._drain)
