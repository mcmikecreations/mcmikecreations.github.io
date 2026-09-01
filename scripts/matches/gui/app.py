"""Main window: hikes on the left, the selected hike's media and comparison."""

import tkinter as tk
from pathlib import Path
from tkinter import messagebox, ttk

from .. import config
from ..review import actions
from .dialogs import AddMediaDialog
from ..review.model import HikeIndex, HikePost, MediaEntry, status_color
from ..review.remote import Remote, RemoteUnavailable
from .tasks import TaskRunner
from .widgets import ImagePane, StatusBar

LEGEND = [
    ("matched", "matched"),
    ("ambiguous", "ambiguous"),
    ("unmatched", "unmatched"),
    ("skipped_video", "video / youtube"),
    ("not_in_json", "not in JSON"),
]


class App(ttk.Frame):
    def __init__(self, master, settings: config.Settings):
        super().__init__(master)
        self.settings = settings
        self.index = HikeIndex(settings)
        self.remote = Remote(settings)
        self.tasks = TaskRunner(master)
        self.post: HikePost | None = None
        self.entry: MediaEntry | None = None

        self.pack(fill="both", expand=True)
        self._build()
        self.refresh_hikes()

    # --- layout -------------------------------------------------------------

    def _build(self) -> None:
        self.status = StatusBar(self)
        self.status.pack(side="bottom", fill="x")

        outer = ttk.PanedWindow(self, orient="horizontal")
        outer.pack(fill="both", expand=True)

        # Leftmost: the hikes.
        left = ttk.Frame(outer)
        outer.add(left, weight=0)
        bar = ttk.Frame(left)
        bar.pack(fill="x", padx=4, pady=4)
        ttk.Label(bar, text="Hikes", font=("TkDefaultFont", 10, "bold")).pack(side="left")
        ttk.Button(bar, text="Refresh", width=8,
                   command=self.refresh_hikes).pack(side="right")
        self.hikes = ttk.Treeview(left, columns=("n",), show="tree headings",
                                  selectmode="browse", height=30)
        self.hikes.heading("#0", text="Post")
        self.hikes.heading("n", text="Matched")
        self.hikes.column("#0", width=280)
        self.hikes.column("n", width=80, anchor="e")
        self.hikes.pack(fill="both", expand=True, padx=4, pady=(0, 4))
        self.hikes.bind("<<TreeviewSelect>>", self._on_hike_selected)

        # Right: the hike view.
        right = ttk.PanedWindow(outer, orient="horizontal")
        outer.add(right, weight=1)

        media = ttk.Frame(right)
        right.add(media, weight=0)
        mbar = ttk.Frame(media)
        mbar.pack(fill="x", padx=4, pady=4)
        self.post_label = ttk.Label(mbar, text="No hike selected",
                                    font=("TkDefaultFont", 10, "bold"))
        self.post_label.pack(side="left")
        self.media = ttk.Treeview(media, columns=("match",), show="tree headings",
                                  selectmode="browse")
        self.media.heading("#0", text="Media")
        self.media.heading("match", text="Immich original")
        self.media.column("#0", width=210)
        self.media.column("match", width=210)
        self.media.pack(fill="both", expand=True, padx=4)
        self.media.bind("<<TreeviewSelect>>", self._on_media_selected)
        for status, _ in LEGEND:
            self.media.tag_configure(status, foreground=status_color(status))
        self.media.tag_configure("skipped_youtube",
                                 foreground=status_color("skipped_youtube"))
        self.media.tag_configure("missing_local",
                                 foreground=status_color("missing_local"))

        legend = ttk.Frame(media)
        legend.pack(fill="x", padx=6, pady=4)
        for status, text in LEGEND:
            ttk.Label(legend, text=f"■ {text}",
                      foreground=status_color(status)).pack(anchor="w")

        # Comparison side.
        compare = ttk.Frame(right)
        right.add(compare, weight=1)
        tools = ttk.Frame(compare)
        tools.pack(fill="x", padx=6, pady=6)
        self.add_btn = ttk.Button(tools, text="Add media...", command=self.add_media)
        self.add_btn.pack(side="left")
        self.rerun_btn = ttk.Button(tools, text="Re-run match for this hike",
                                    command=self.rerun_match)
        self.rerun_btn.pack(side="left", padx=6)
        self.status_label = ttk.Label(tools, text="")
        self.status_label.pack(side="left", padx=12)

        panes = ttk.PanedWindow(compare, orient="horizontal")
        panes.pack(fill="both", expand=True)
        self.local_pane = ImagePane(panes, "Local", on_commit=self.commit_local)
        self.remote_pane = ImagePane(panes, "Immich", on_commit=self.commit_remote)
        panes.add(self.local_pane, weight=1)
        panes.add(self.remote_pane, weight=1)

    # --- hikes --------------------------------------------------------------

    def refresh_hikes(self) -> None:
        selected = self.post.name if self.post else None
        self.status.set("Reading posts...")
        posts = self.index.refresh()
        self.hikes.delete(*self.hikes.get_children())
        for p in posts:
            stats = p.stats
            summary = (f"{stats.get('matched', 0)}/{stats.get('total', 0)}"
                       if stats else "-")
            self.hikes.insert("", "end", iid=p.name, text=p.name, values=(summary,))
        if selected and self.hikes.exists(selected):
            self.hikes.selection_set(selected)
        self.status.set(f"{len(posts)} hikes")

    def _on_hike_selected(self, _event=None) -> None:
        sel = self.hikes.selection()
        if not sel:
            return
        self.post = next(p for p in self.index.posts if p.name == sel[0])
        self.post.load()
        self.post_label.configure(text=self.post.name)
        self._fill_media()

    # --- media --------------------------------------------------------------

    def _fill_media(self) -> None:
        self.media.delete(*self.media.get_children())
        self.entry = None
        self.local_pane.show_message("")
        self.remote_pane.show_message("")
        self.local_pane.set_path_text("")
        self.remote_pane.set_path_text("")
        if not self.post:
            return
        for item in self.post.media:
            self.media.insert("", "end", iid=str(item.order), text=item.label,
                              values=(item.matched_name or "-",),
                              tags=(item.status,))

    def _on_media_selected(self, _event=None) -> None:
        sel = self.media.selection()
        if not sel or not self.post:
            return
        self.entry = self.post.media[int(sel[0])]
        self._show_entry()

    def _show_entry(self) -> None:
        item = self.entry
        self.status_label.configure(text=item.status, foreground=item.color)

        self.local_pane.set_path_text(item.web_path)
        if item.kind == "youtube":
            self.local_pane.show_message("YouTube embed - nothing stored locally")
        else:
            self.local_pane.show_image(item.local_path)

        match = (item.entry or {}).get("match")
        if not match:
            self.remote_pane.set_path_text("")
            self.remote_pane.show_message("no Immich match recorded")
            return
        self.remote_pane.set_path_text(match.get("original_file_name", ""))
        scores = match.get("scores") or {}
        caption = "  ".join(
            f"{k}={v}" for k, v in scores.items() if v is not None
        )
        if not self.remote.available:
            self.remote_pane.show_message("Set IMMICH_API_KEY to preview originals")
            return
        asset_id = match.get("asset_id")
        self.status.busy(True)
        self.tasks.run(
            "preview",
            lambda: self.remote.preview_path(asset_id),
            lambda r: self._preview_done(r, caption),
        )

    def _preview_done(self, result, caption) -> None:
        self.status.busy(False)
        if result.ok:
            self.remote_pane.show_image(result.value, caption)
        else:
            self.remote_pane.show_message(f"preview failed:\n{result.error[:200]}")

    # --- editing ------------------------------------------------------------

    def commit_local(self, text: str) -> None:
        """Repoint an entry at a different local file."""
        if not (self.entry and self.post):
            return
        text = text.strip()
        if not text:
            return
        web = text if text.startswith("/") else f"/{text}"
        local = self.settings.static_root / web.lstrip("/")
        entry = self.entry.entry
        if entry is None:
            messagebox.showinfo("No entry",
                                "This reference is not in the JSON yet - "
                                "use Add media to create it.")
            return
        entry["web_path"] = web
        entry["local_path"] = str(local)
        if not local.is_file():
            entry["status"] = "missing_local"
        self._save_and_reload(f"Local path set to {web}")

    def commit_remote(self, text: str) -> None:
        """Repoint an entry at a different Immich asset, by name or id."""
        if not (self.entry and self.post):
            return
        entry = self.entry.entry
        if entry is None:
            messagebox.showinfo("No entry", "This reference is not in the JSON yet.")
            return
        if not text.strip():
            entry["match"] = None
            entry["status"] = "unmatched"
            entry["resolved_by"] = None
            self._save_and_reload("Match cleared")
            return
        if not self.remote.available:
            messagebox.showwarning("No API key",
                                   "Set IMMICH_API_KEY to resolve Immich assets.")
            return
        self.status.busy(True)
        self.status.set(f"Looking up {text}...")
        self.tasks.run(
            "lookup",
            lambda: self.remote.find_asset(self.post, text),
            lambda r: self._lookup_done(r, entry, text),
        )

    def _lookup_done(self, result, entry, text) -> None:
        self.status.busy(False)
        if not result.ok:
            messagebox.showerror("Lookup failed", result.error[:400])
            return
        if result.value is None:
            messagebox.showwarning(
                "Not found",
                f"No asset named {text!r} among this hike's candidates.")
            return
        from ..review.remote import asset_to_dict

        asset = asset_to_dict(result.value)
        asset["scores"] = {"phash": None, "blockmean": None, "mae": None,
                           "ncc": None, "inliers": None, "coverage": None}
        entry["match"] = {**asset, "scores": asset["scores"]}
        entry["match"].pop("asset_id", None)
        entry["match"]["asset_id"] = result.value.id
        entry["status"] = "matched"
        entry["confidence"] = "manual"
        entry["resolved_by"] = "manual"
        self._save_and_reload(f"Matched to {result.value.original_file_name}")

    def _save_and_reload(self, message: str) -> None:
        order = self.entry.order if self.entry else None
        self.post.recount()
        path = self.post.save()
        self.post.load()
        self._fill_media()
        if order is not None and self.media.exists(str(order)):
            self.media.selection_set(str(order))
        self.refresh_hikes_row()
        self.status.set(f"{message} - saved {path.name}")

    def refresh_hikes_row(self) -> None:
        if not self.post or not self.hikes.exists(self.post.name):
            return
        stats = self.post.stats
        self.hikes.item(self.post.name,
                        values=(f"{stats.get('matched', 0)}/{stats.get('total', 0)}",))

    # --- actions ------------------------------------------------------------

    def add_media(self) -> None:
        if not self.post:
            return
        dialog = AddMediaDialog(
            self, self.post,
            actions.stories_dir(self.settings, self.post.slug),
            self._candidates,
        )
        self.wait_window(dialog)
        if not dialog.result:
            return
        spec = dialog.result
        self.status.busy(True)
        self.status.set(f"Adding media ({spec.mode})...")
        self.tasks.run(
            "add",
            lambda: actions.apply_add_spec(self.settings, self.remote,
                                           self.post, spec),
            self._add_done,
        )

    def _candidates(self):
        if not self.remote.available:
            return []
        try:
            return self.remote.candidates_for(self.post)
        except Exception:
            return []

    def _add_done(self, result) -> None:
        self.status.busy(False)
        if not result.ok:
            messagebox.showerror("Add failed", result.error[:600])
            self.status.set("Add failed")
            return
        self.post.upsert_entry(result.value)
        self.post.save()
        self.post.load()
        self._fill_media()
        self.refresh_hikes_row()
        self.status.set(f"Added {result.value['web_path'].rsplit('/', 1)[-1]}")

    def rerun_match(self) -> None:
        if not self.post:
            return
        if not self.remote.available:
            messagebox.showwarning("No API key",
                                   "Set IMMICH_API_KEY before re-running.")
            return
        name = self.post.name
        self.status.busy(True)
        self.status.set(f"Running image_match.py for {name}...")
        self.rerun_btn.state(["disabled"])
        self.tasks.run("rerun", lambda: actions.rerun_match(self.settings, name),
                       self._rerun_done)

    def _rerun_done(self, result) -> None:
        self.status.busy(False)
        self.rerun_btn.state(["!disabled"])
        if not result.ok:
            messagebox.showerror("Match failed", result.error[:800])
            self.status.set("Match failed")
            return
        self.remote.invalidate(self.post)
        self.post.load()
        self._fill_media()
        self.refresh_hikes_row()
        self.status.set(result.value.splitlines()[0] if result.value else "Done")


def launch(settings: config.Settings) -> None:
    root = tk.Tk()
    root.title("Hike image matcher")
    root.geometry("1500x900")
    App(root, settings)
    root.mainloop()
