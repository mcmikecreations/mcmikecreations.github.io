"""A tiny in-process job registry for work too slow for one request."""

import threading
import traceback
import uuid
from dataclasses import dataclass, field
from typing import Any, Callable


@dataclass
class Job:
    id: str
    label: str
    state: str = "running"     # running | done | error
    result: Any = None
    error: str = ""
    log: str = ""


class JobRegistry:
    def __init__(self):
        self._jobs: dict[str, Job] = {}
        self._lock = threading.Lock()

    def start(self, label: str, fn: Callable[[], Any]) -> Job:
        job = Job(id=uuid.uuid4().hex[:12], label=label)
        with self._lock:
            self._jobs[job.id] = job

        def worker():
            try:
                value = fn()
                with self._lock:
                    job.result = value
                    job.state = "done"
            except Exception as exc:
                with self._lock:
                    job.error = str(exc) or exc.__class__.__name__
                    job.log = traceback.format_exc()
                    job.state = "error"

        threading.Thread(target=worker, daemon=True).start()
        return job

    def get(self, job_id: str) -> Job | None:
        with self._lock:
            return self._jobs.get(job_id)

    def payload(self, job: Job) -> dict:
        return {"id": job.id, "label": job.label, "state": job.state,
                "result": job.result, "error": job.error}
