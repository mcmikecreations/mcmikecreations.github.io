"""Modal dialogs: picking an Immich asset, and describing a media addition."""

import tkinter as tk
from pathlib import Path
from tkinter import filedialog, ttk

from ..review.actions import (MODE_BOTH, MODE_LOCAL, MODE_REMOTE, AddSpec,
                              validate as _validate)


class AssetPicker(tk.Toplevel):
    """Filterable list of the candidate assets for a post."""

    def __init__(self, master, assets, title="Select Immich asset"):
        super().__init__(master)
        self.title(title)
        self.geometry("620x460")
        self.transient(master)
        self.result = None
        self._assets = list(assets)

        top = ttk.Frame(self)
        top.pack(fill="x", padx=8, pady=8)
        ttk.Label(top, text="Filter:").pack(side="left")
        self.filter_var = tk.StringVar()
        entry = ttk.Entry(top, textvariable=self.filter_var)
        entry.pack(side="left", fill="x", expand=True, padx=6)
        self.filter_var.trace_add("write", lambda *_: self._populate())

        self.tree = ttk.Treeview(self, columns=("when", "size"),
                                 show="tree headings", selectmode="browse")
        self.tree.heading("#0", text="File")
        self.tree.heading("when", text="Taken")
        self.tree.heading("size", text="Pixels")
        self.tree.column("#0", width=300)
        self.tree.column("when", width=160, anchor="w")
        self.tree.column("size", width=110, anchor="e")
        self.tree.pack(fill="both", expand=True, padx=8)
        self.tree.bind("<Double-1>", lambda _e: self._ok())

        buttons = ttk.Frame(self)
        buttons.pack(fill="x", padx=8, pady=8)
        ttk.Button(buttons, text="Cancel", command=self.destroy).pack(side="right")
        ttk.Button(buttons, text="Select", command=self._ok).pack(side="right", padx=6)

        self._populate()
        entry.focus_set()
        self.grab_set()

    def _populate(self) -> None:
        needle = self.filter_var.get().strip().lower()
        self.tree.delete(*self.tree.get_children())
        for a in self._assets:
            if needle and needle not in a.original_file_name.lower():
                continue
            self.tree.insert("", "end", iid=a.id, text=a.original_file_name,
                             values=(a.local_date_time[:19].replace("T", " "),
                                     f"{a.width}x{a.height}"))

    def _ok(self) -> None:
        sel = self.tree.selection()
        if not sel:
            return
        self.result = next(a for a in self._assets if a.id == sel[0])
        self.destroy()


class AddMediaDialog(tk.Toplevel):
    """Collects an AddSpec: local, remote, or both."""

    def __init__(self, master, post, stories_dir: Path, asset_provider):
        super().__init__(master)
        self.title(f"Add media to {post.name}")
        self.geometry("640x330")
        self.transient(master)
        self.result: AddSpec | None = None
        self.stories_dir = stories_dir
        self.asset_provider = asset_provider
        self._asset = None

        self.mode = tk.StringVar(value=MODE_LOCAL)
        box = ttk.LabelFrame(self, text="What do you have?")
        box.pack(fill="x", padx=10, pady=10)
        for value, text in (
            (MODE_LOCAL, "A local image - find its Immich original"),
            (MODE_REMOTE, "An Immich asset - download and compress it locally"),
            (MODE_BOTH, "Both - just record the mapping"),
        ):
            ttk.Radiobutton(box, text=text, value=value, variable=self.mode,
                            command=self._sync).pack(anchor="w", padx=8, pady=2)

        grid = ttk.Frame(self)
        grid.pack(fill="x", padx=10, pady=4)
        grid.columnconfigure(1, weight=1)

        ttk.Label(grid, text="Local file:").grid(row=0, column=0, sticky="w", pady=3)
        self.local_var = tk.StringVar()
        self.local_entry = ttk.Entry(grid, textvariable=self.local_var)
        self.local_entry.grid(row=0, column=1, sticky="ew", padx=6)
        self.local_btn = ttk.Button(grid, text="Browse...", command=self._browse)
        self.local_btn.grid(row=0, column=2)

        ttk.Label(grid, text="Immich asset:").grid(row=1, column=0, sticky="w", pady=3)
        self.asset_var = tk.StringVar()
        self.asset_entry = ttk.Entry(grid, textvariable=self.asset_var)
        self.asset_entry.grid(row=1, column=1, sticky="ew", padx=6)
        self.asset_btn = ttk.Button(grid, text="Pick...", command=self._pick)
        self.asset_btn.grid(row=1, column=2)

        ttk.Label(grid, text="Save as:").grid(row=2, column=0, sticky="w", pady=3)
        self.out_var = tk.StringVar()
        self.out_entry = ttk.Entry(grid, textvariable=self.out_var)
        self.out_entry.grid(row=2, column=1, sticky="ew", padx=6)
        self.compress_var = tk.StringVar(value="hd")
        ttk.Combobox(grid, textvariable=self.compress_var, width=9,
                     values=("hd", "standard"), state="readonly").grid(row=2, column=2)

        self.hint = ttk.Label(self, text="", foreground="#57606a", wraplength=600)
        self.hint.pack(fill="x", padx=12, pady=(6, 0))

        buttons = ttk.Frame(self)
        buttons.pack(fill="x", padx=10, pady=10, side="bottom")
        ttk.Button(buttons, text="Cancel", command=self.destroy).pack(side="right")
        ttk.Button(buttons, text="Add", command=self._ok).pack(side="right", padx=6)

        self._sync()
        self.grab_set()

    def _sync(self) -> None:
        mode = self.mode.get()
        want_local = mode in (MODE_LOCAL, MODE_BOTH)
        want_asset = mode in (MODE_REMOTE, MODE_BOTH)
        for widget in (self.local_entry, self.local_btn):
            widget.state(["!disabled"] if want_local else ["disabled"])
        for widget in (self.asset_entry, self.asset_btn):
            widget.state(["!disabled"] if want_asset else ["disabled"])
        for widget in (self.out_entry,):
            widget.state(["!disabled"] if mode == MODE_REMOTE else ["disabled"])
        self.hint.configure(text={
            MODE_LOCAL: "The image is already on disk; the matcher will search "
                        "Immich for its original.",
            MODE_REMOTE: "The original is downloaded and compressed with "
                         "image_compress.py into the hike's stories folder.",
            MODE_BOTH: "Nothing is downloaded or matched - the mapping is "
                       "written straight into the JSON.",
        }[mode])

    def _browse(self) -> None:
        path = filedialog.askopenfilename(
            parent=self, title="Select local image",
            initialdir=str(self.stories_dir if self.stories_dir.is_dir() else Path.home()),
            filetypes=[("Images", "*.jpg *.jpeg *.png *.webp *.heic *.heif"),
                       ("All files", "*.*")])
        if path:
            self.local_var.set(path)

    def _pick(self) -> None:
        assets = self.asset_provider()
        if not assets:
            self.hint.configure(text="No candidate assets available "
                                     "(no API key, or the window is empty).")
            return
        picker = AssetPicker(self, assets)
        self.wait_window(picker)
        if picker.result:
            self._asset = picker.result
            self.asset_var.set(picker.result.original_file_name)
            if not self.out_var.get():
                self.out_var.set(Path(picker.result.original_file_name).stem + ".jpg")

    def _ok(self) -> None:
        mode = self.mode.get()
        local = Path(self.local_var.get().strip()) if self.local_var.get().strip() else None
        spec = AddSpec(
            mode=mode,
            local_path=local,
            asset_id=self._asset.id if self._asset else None,
            asset_name=self.asset_var.get().strip(),
            out_name=self.out_var.get().strip(),
            compress_mode=self.compress_var.get(),
        )
        problem = _validate(spec)
        if problem:
            self.hint.configure(text=problem, foreground="#cf222e")
            return
        self.result = spec
        self.destroy()
