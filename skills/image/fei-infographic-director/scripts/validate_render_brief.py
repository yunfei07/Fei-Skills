#!/usr/bin/env python3
import json
import sys
from pathlib import Path

try:
    import jsonschema
except ImportError:
    print("jsonschema is required: pip install jsonschema", file=sys.stderr)
    raise SystemExit(2)

ROOT = Path(__file__).resolve().parents[1]
SCHEMA = ROOT / "schemas" / "render-brief.schema.json"


def main() -> int:
    if len(sys.argv) != 2:
        print("usage: validate_render_brief.py <render-brief.json>", file=sys.stderr)
        return 2

    target = Path(sys.argv[1])
    schema = json.loads(SCHEMA.read_text(encoding="utf-8"))
    data = json.loads(target.read_text(encoding="utf-8"))
    jsonschema.validate(instance=data, schema=schema)

    exact = data.get("exact_strings", [])
    prohibited = set(data.get("prohibited_strings", []))
    collisions = [s for s in exact if s in prohibited]
    if collisions:
        raise ValueError(f"strings cannot be both exact and prohibited: {collisions}")

    if data.get("profile") == "beginner-onboarding":
        discouraged = {"小白", "菜鸟"}
        used = [data.get("title", ""), data.get("audience", "")]
        for section in data.get("sections", []):
            used.append(section.get("heading", ""))
            used.extend(section.get("content", []))
        hits = sorted(label for label in discouraged if any(label in text for text in used))
        if hits:
            raise ValueError(f"beginner-onboarding contains discouraged audience labels: {hits}")

    print(f"valid: {target}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
