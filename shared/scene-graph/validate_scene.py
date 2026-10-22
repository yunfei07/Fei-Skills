#!/usr/bin/env python3
import json
import math
import sys
from pathlib import Path

ALLOWED = {"text", "flow", "compare", "network", "chart", "spatial"}


def fail(message: str) -> None:
    print(f"invalid: {message}", file=sys.stderr)
    raise SystemExit(2)


def finite_number(value) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value)


def validate(data: dict) -> None:
    if data.get("version") != "0.3":
        fail("version must be '0.3'")
    for key in ("title", "audience", "chapters"):
        if key not in data:
            fail(f"missing top-level field: {key}")
    if not isinstance(data["chapters"], list) or not data["chapters"]:
        fail("chapters must be a non-empty list")

    ids = set()
    for chapter in data["chapters"]:
        if not isinstance(chapter.get("scenes"), list) or not chapter["scenes"]:
            fail(f"chapter {chapter.get('id', '<unknown>')} has no scenes")
        for scene in chapter["scenes"]:
            for key in ("id", "title", "summary", "kind"):
                if key not in scene:
                    fail(f"scene missing field: {key}")
            if scene["id"] in ids:
                fail(f"duplicate scene id: {scene['id']}")
            ids.add(scene["id"])
            if scene["kind"] not in ALLOWED:
                fail(f"unsupported scene kind: {scene['kind']}")
            if scene["kind"] != "text" and not scene.get("fallback"):
                fail(f"visual scene {scene['id']} requires fallback text")

            if scene["kind"] == "spatial":
                payload = scene.get("data") or {}
                points = payload.get("points")
                meaning = payload.get("meaning")
                if not isinstance(points, list) or not points:
                    fail(f"spatial scene {scene['id']} requires deterministic points")
                if not isinstance(meaning, str) or not meaning.strip():
                    fail(f"spatial scene {scene['id']} requires meaning")
                for index, point in enumerate(points):
                    for axis in ("x", "y", "z"):
                        if not finite_number(point.get(axis)):
                            fail(f"spatial scene {scene['id']} point {index} has invalid {axis}")
                    if "size" in point and (not finite_number(point["size"]) or point["size"] <= 0):
                        fail(f"spatial scene {scene['id']} point {index} has invalid size")


def main() -> None:
    if len(sys.argv) != 2:
        print("usage: validate_scene.py <scene.json>", file=sys.stderr)
        raise SystemExit(2)
    data = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    validate(data)
    count = sum(len(ch["scenes"]) for ch in data["chapters"])
    print(f"valid: {len(data['chapters'])} chapters, {count} scenes")


if __name__ == "__main__":
    main()
