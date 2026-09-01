"""Reusable widgets: an image pane with an editable path above it."""

import tkinter as tk
from pathlib import Path
from tkinter import ttk

from PIL import Image, ImageTk

try:  # local originals may be HEIC
    from pillow_heif import register_heif_opener

    register_heif_opener()
except ImportError:
    pass

PLACEHOLDER_BG = "#f0f0f0"
RESIZE_DEBOUNCE_MS = 120


class ImagePane(ttk.Frame):
    """A titled, editable path plus the image it points at, scaled to fit."""

    def __init__(self, master, title: str, on_commit=None, **kw):
        super().__init__(master, **kw)
        self.on_commit = on_commit
        self._source: Image.Image | None = None
        self._photo: ImageTk.PhotoImage | None = None
        self._resize_job = None
        self._last_size = (0, 0)

        header = ttk.Frame(self)
        header.pack(fill="x", padx=4, pady=(4, 2))
        ttk.Label(header, text=title, width=8,
                  font=("TkDefaultFont", 9, "bold")).pack(side="left")
        self.path_var = tk.StringVar()
        self.entry = ttk.Entry(header, textvariable=self.path_var)
        self.entry.pack(side="left", fill="x", expand=True, padx=(4, 4))
        self.entry.bind("<Return>", self._commit)
        ttk.Button(header, text="Apply", width=6,
                   command=self._commit).pack(side="left")

        self.info = ttk.Label(self, text="", foreground="#57606a")
        self.info.pack(fill="x", padx=8)

        self.canvas = tk.Label(self, background=PLACEHOLDER_BG, anchor="center")
        self.canvas.pack(fill="both", expand=True, padx=4, pady=4)
        self.canvas.bind("<Configure>", self._on_configure)

    # --- public -------------------------------------------------------------

    def set_path_text(self, text: str) -> None:
        self.path_var.set(text or "")

    def show_message(self, message: str) -> None:
        self._source = None
        self._photo = None
        self.info.configure(text="")
        self.canvas.configure(image="", text=message, foreground="#57606a")

    def show_image(self, path: Path | None, caption: str = "") -> None:
        if path is None or not Path(path).is_file():
            self.show_message("no image" if path is None else f"missing:\n{path}")
            return
        try:
            img = Image.open(path)
            # draft() lets JPEG decode at reduced scale - much faster for the
            # multi-thousand-pixel originals in this corpus.
            img.draft("RGB", (1600, 1600))
            img = img.convert("RGB")
        except Exception as exc:
            self.show_message(f"cannot open:\n{exc}")
            return
        self._source = img
        self.info.configure(text=caption or f"{img.width}x{img.height}")
        self._render()

    # --- internals ----------------------------------------------------------

    def _commit(self, _event=None) -> None:
        if self.on_commit:
            self.on_commit(self.path_var.get().strip())

    def _on_configure(self, event) -> None:
        if (event.width, event.height) == self._last_size:
            return
        self._last_size = (event.width, event.height)
        if self._resize_job:
            self.after_cancel(self._resize_job)
        self._resize_job = self.after(RESIZE_DEBOUNCE_MS, self._render)

    def _render(self) -> None:
        self._resize_job = None
        if self._source is None:
            return
        w = max(self.canvas.winfo_width(), 1)
        h = max(self.canvas.winfo_height(), 1)
        if w < 20 or h < 20:
            return
        scale = min(w / self._source.width, h / self._source.height)
        size = (max(1, int(self._source.width * scale)),
                max(1, int(self._source.height * scale)))
        self._photo = ImageTk.PhotoImage(
            self._source.resize(size, Image.Resampling.LANCZOS)
        )
        self.canvas.configure(image=self._photo, text="")


class StatusBar(ttk.Frame):
    """One-line status with an indeterminate progress bar."""

    def __init__(self, master, **kw):
        super().__init__(master, **kw)
        self.var = tk.StringVar(value="Ready")
        ttk.Label(self, textvariable=self.var, anchor="w").pack(
            side="left", fill="x", expand=True, padx=6)
        self.bar = ttk.Progressbar(self, mode="indeterminate", length=140)

    def set(self, text: str) -> None:
        self.var.set(text)
        self.update_idletasks()

    def busy(self, on: bool) -> None:
        if on:
            self.bar.pack(side="right", padx=6, pady=2)
            self.bar.start(12)
        else:
            self.bar.stop()
            self.bar.pack_forget()
