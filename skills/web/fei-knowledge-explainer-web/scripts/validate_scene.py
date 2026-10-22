#!/usr/bin/env python3
import json
import sys
from pathlib import Path

ALLOWED_KINDS = {"text", "flow", "compare", "network"}


def fail(message: str) -> None:
    print(f"invalid: {message}", file=sys.stderr)
    raise SystemExit(2)


def validate(data: dict) -> None:
    if data.get("version") != "0.2":
        fail("version must be '0.2'")
    for key in ("title", "audience", "chapters"):
        if key not in data:
            fail(f"missing top-level field: {key}")
    if not isinstance(data["chapters"], list) or not data["chapters"]:
        fail("chapters must be a non-empty list")

    ids = set()
    for chapter in data["chapters"]:
        for key in ("id", "title", "scenes"):
            if key not in chapter:
                fail(f"chapter missing field: {key}")
        if not chapter["scenes"]:
            fail(f"chapter {chapter['id']} has no scenes")
        for scene in chapter["scenes"]:
            for key in ("id", "title", "summary", "kind"):
                if key not in scene:
                    fail(f"scene missing field: {key}")
            if scene["id"] in ids:
                fail(f"duplicate scene id: {scene['id']}")
            ids.add(scene["id"])
            if scene["kind"] not in ALLOWED_KINDS:
                fail(f"unsupported scene kind: {scene['kind']}")
            if scene["kind"] != "text" and not scene.get("fallback"):
                fail(f"visual scene {scene['id']} requires fallback text")


def main() -> None:
    if len(sys.argv) != 2:
        print("usage: validate_scene.py <scene.json>", file=sys.stderr)
        raise SystemExit(2)
    path = Path(sys.argv[1])
    data = json.loads(path.read_text(encoding="utf-8"))
    validate(data)
    scene_count = sum(len(ch["scenes"]) for ch in data["chapters"])
    print(f"valid: {len(data['chapters'])} chapters, {scene_count} scenes")


if __name__ == "__main__":
    main()
