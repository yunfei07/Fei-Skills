#!/usr/bin/env python3
"""Offline prompt assembly. Python 3.10+, standard library only."""
from __future__ import annotations

import argparse
import json
import math
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
VERSION = "1.0.0"
LOCK_FIELDS = ("identity", "face", "hair", "costume", "props", "silhouette")
SHOT_FIELDS = ("setting", "action", "emotion", "camera", "lighting")
DEFAULTS = {
    "mode": "scene",
    "character_lock": {},
    "emotion": "restrained curiosity",
    "camera": "medium-wide shot, eye-level, readable silhouette",
    "lighting": "soft cinematic key light, motivated practical glow, cool ambient fill",
    "palette": "muted earth tones, restrained warm-cool contrast",
    "aspect_ratio": "16:9",
    "brand_style": "descriptive",
    "historical_accuracy": "stylized",
    "source_notes": [],
    "avoid": [],
}
ENUMS = {
    "mode": ("character", "scene", "storyboard"),
    "aspect_ratio": ("16:9", "9:16", "1:1", "4:3", "3:2", "2.39:1"),
    "brand_style": ("descriptive", "original-test"),
    "historical_accuracy": ("stylized", "inspired", "strict"),
}
STYLE_MATERIALS = (
    "Chinese ancient-world storytelling, stop-motion-inspired character design, "
    "handcrafted clay-like sculptural texture, tactile miniature craftsmanship, "
    "subtly uneven handmade surfaces, expressive stylized anatomy, "
    "cinematic animated-feature visual development, soft cinematic lighting, "
    "motivated practical light sources, gentle atmospheric depth and readable silhouettes."
)
STYLE_PREFIXES = {
    "descriptive": "High-end stylized 3D animated feature film aesthetic. ",
    "original-test": "Pixar stylized 3D animated feature film. ",
}
BASE_AVOID = [
    "live-action photorealism", "flat 2D rendering", "cheap glossy plastic surfaces",
    "modern props", "inconsistent character appearance", "unreadable action",
    "accidental text", "watermarks",
]
MODE_DIRECTIVES = {
    "character": "one character-design frame, one readable pose, clear costume and prop silhouette",
    "scene": "one cinematic scene, one readable primary action",
    "storyboard": "one cinematic storyboard frame, one readable primary action, no panel grid",
}


class InputError(ValueError):
    """A request or resource does not satisfy the input contract."""


def reject_constant(value):
    raise InputError(f"non-finite JSON number: {value}")


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise InputError(f"duplicate JSON key: {key}")
        result[key] = value
    return result


def read_json(path):
    return json.loads(Path(path).read_text(encoding="utf-8"),
                      parse_constant=reject_constant, object_pairs_hook=unique_object)


def object_fields(value, allowed, path):
    if not isinstance(value, dict):
        raise InputError(f"{path}: expected an object")
    unknown = set(value) - set(allowed)
    if unknown:
        raise InputError(f"{path}: unknown fields: {', '.join(sorted(unknown))}")


def string(value, path):
    if not isinstance(value, str) or not value.strip():
        raise InputError(f"{path}: expected a non-empty string")
    return value.strip()


def strings(value, path):
    if not isinstance(value, list):
        raise InputError(f"{path}: expected an array of strings")
    return [string(item, f"{path}[{i}]") for i, item in enumerate(value)]


def load_profiles():
    profiles = read_json(ROOT / "assets/profiles.json")
    if not isinstance(profiles, dict) or not profiles:
        raise InputError("profiles.json: expected a non-empty object")
    for name, item in profiles.items():
        object_fields(item, ("label", "focus", "prompt_en", "avoid"), f"profile.{name}")
        for field in ("label", "focus", "prompt_en"):
            string(item.get(field), f"profile.{name}.{field}")
        strings(item.get("avoid"), f"profile.{name}.avoid")
    return profiles


def normalize(request, profiles):
    object_fields(request, {*DEFAULTS, "profile", "subject", "setting", "action", "shots"}, "request")
    data = {**DEFAULTS, **request}
    for field in ("profile", "subject", "setting", "action", "emotion", "camera", "lighting", "palette"):
        data[field] = string(data.get(field), field)
    for field, allowed in {"profile": tuple(profiles), **ENUMS}.items():
        data[field] = string(data.get(field), field)
        if data[field] not in allowed:
            raise InputError(f"{field}: choose one of {', '.join(allowed)}")
    lock = data["character_lock"]
    object_fields(lock, LOCK_FIELDS, "character_lock")
    data["character_lock"] = {key: string(lock[key], f"character_lock.{key}")
                              for key in LOCK_FIELDS if key in lock}
    for field in ("source_notes", "avoid"):
        data[field] = strings(data[field], field)
    if data["historical_accuracy"] == "strict":
        if data["profile"] != "historical":
            raise InputError("strict historical_accuracy requires historical profile")
        if not data["source_notes"]:
            raise InputError("strict historical_accuracy requires non-empty source_notes; verify facts outside this script")
    if data["mode"] != "storyboard":
        if "shots" in request:
            raise InputError("shots is only allowed in storyboard mode")
        return data
    if not any(field in data["character_lock"] for field in LOCK_FIELDS[1:]):
        raise InputError("storyboard requires at least one visual character_lock anchor beyond identity")
    shots = data.get("shots")
    if not isinstance(shots, list) or not 2 <= len(shots) <= 12:
        raise InputError("storyboard requires 2–12 shots")
    normalized, ids = [], set()
    for i, shot in enumerate(shots):
        path = f"shots[{i}]"
        object_fields(shot, {"id", *SHOT_FIELDS, "duration_seconds"}, path)
        item = {"id": string(shot.get("id"), f"{path}.id")}
        if item["id"] in ids:
            raise InputError(f"{path}.id: duplicate shot id")
        ids.add(item["id"])
        item["action"] = string(shot.get("action"), f"{path}.action")
        for field in SHOT_FIELDS:
            if field != "action":
                item[field] = string(shot.get(field, data[field]), f"{path}.{field}")
        if "duration_seconds" in shot:
            duration = shot["duration_seconds"]
            if isinstance(duration, bool) or not isinstance(duration, (int, float)) or (isinstance(duration, float) and not math.isfinite(duration)) or duration <= 0:
                raise InputError(f"{path}.duration_seconds: expected a finite positive number")
            item["duration_seconds"] = duration
        normalized.append(item)
    data["shots"] = normalized
    return data


def compose(request):
    profiles = load_profiles()
    data = normalize(request, profiles)
    style = STYLE_PREFIXES[data["brand_style"]] + STYLE_MATERIALS
    lock = data["character_lock"]
    lock_sentence = "; ".join(f"{key}: {value}" for key, value in lock.items())
    shots = data.get("shots", [{"id": "FRAME_01", **{key: data[key] for key in SHOT_FIELDS}}])
    records = []
    for shot in shots:
        parts = [style, profiles[data["profile"]]["prompt_en"]]
        if lock_sentence:
            parts.append(f"Character identity lock: {lock_sentence}.")
        parts.extend([
            f"Subject: {data['subject']}.", f"Setting: {shot['setting']}.",
            f"Visible action: {shot['action']}.", f"Emotion: {shot['emotion']}.",
            f"Camera and composition: {shot['camera']}.", f"Lighting: {shot['lighting']}.",
            f"Palette: {data['palette']}.",
            f"Frame: {data['aspect_ratio']}; {MODE_DIRECTIVES[data['mode']]}.",
        ])
        records.append({"id": shot["id"], "prompt_en": "\n".join(parts),
                        "shot": {key: value for key, value in shot.items() if key != "id"}})
    negative = list(dict.fromkeys(BASE_AVOID + profiles[data["profile"]]["avoid"] + data["avoid"]))
    warnings = ["[能力边界] 仅组装提示词；未生成图像，未验证视觉一致性。",
                "[能力边界] 自由文本的翻译、叙事和语义冲突需由模型检查。"]
    if not any(field in lock for field in LOCK_FIELDS[1:]):
        warnings.append("[能力边界] 未提供角色视觉锚点，不宣称人物一致性。")
    if data["profile"] == "historical":
        warnings.append("[待核实] 脚本未核实史料；source_notes 仅保留输入，不能证明考据准确。")
    checks = ["[已检查] 字段、类型、枚举及任务结构有效。",
              "[已检查] 每镜包含完整共享风格、配色与画幅。",
              "[已检查] 通用、Profile 和用户禁用项已合并。"]
    if lock:
        checks.append("[已检查] 同一角色锁在所有输出镜头中原样复用。")
    assumptions = {key: data[key] for key in DEFAULTS if key not in request}
    return {
        "schema_version": VERSION, "skill": "chinese-cinematic-3d-prompts",
        "profile": data["profile"], "mode": data["mode"], "assumptions": assumptions,
        "style_lock": style, "character_lock": lock,
        "parameters": {key: data[key] for key in ("aspect_ratio", "palette", "brand_style", "historical_accuracy")},
        "prompt_records": records, "negative_prompt_en": ", ".join(negative),
        "source_notes": data["source_notes"], "assembly_checks": checks, "warnings": warnings,
    }


def fence(value, language=""):
    # Use a fence longer than any user-supplied backtick run.
    marker = "`" * max(3, max((len(s) for s in re.findall(r"`+", value)), default=0) + 1)
    return f"{marker}{language}\n{value}\n{marker}"


def markdown(pack):
    lines = ["# 中国古风电影级 3D 动画提示词包", "",
             f"[输入结果] Profile: {pack['profile']} · Mode: {pack['mode']} · v{pack['schema_version']}", "",
             "## 参数", "", fence(json.dumps(pack["parameters"], ensure_ascii=False, indent=2), "json"), "",
             "## 默认项", "", "[创作默认] 以下为未提供字段的默认值。", "",
             fence(json.dumps(pack["assumptions"], ensure_ascii=False, indent=2), "json"), "",
             "## 角色锁", "", "[输入参数] 本次传入的角色锁原样复用；字段来源与创作补充需由调用者说明。", "",
             fence(json.dumps(pack["character_lock"], ensure_ascii=False, indent=2), "json"), ""]
    for record in pack["prompt_records"]:
        # JSON quote IDs so line breaks cannot create arbitrary headings.
        lines.extend([f"## 镜头 {json.dumps(record['id'], ensure_ascii=False)}", "",
                      "[创作提案] 以下为文字提示词，画面尚未生成。", ""])
        if "duration_seconds" in record["shot"]:
            lines.extend([f"[规划参数] 时长：{record['shot']['duration_seconds']} 秒。", ""])
        lines.extend([fence(record["prompt_en"], "text"), ""])
    lines.extend(["## 负向约束", "", fence(pack["negative_prompt_en"], "text"), "",
                  "## 证据说明", "", "[输入记录] 以下内容未经脚本核实。", "",
                  fence(json.dumps(pack["source_notes"], ensure_ascii=False, indent=2), "json"), "",
                  "## 组装检查", "", *pack["assembly_checks"], "",
                  "## 能力边界", "", *pack["warnings"], ""])
    return "\n".join(lines)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", required=True, type=Path, help="UTF-8 JSON request")
    parser.add_argument("--format", choices=("json", "markdown"), default="markdown")
    parser.add_argument("--output", type=Path, help="New output file; never overwrite existing files")
    args = parser.parse_args(argv)
    try:
        pack = compose(read_json(args.input))
        content = json.dumps(pack, ensure_ascii=False, indent=2, allow_nan=False) + "\n" if args.format == "json" else markdown(pack)
        if args.output:
            with args.output.open("x", encoding="utf-8") as target:
                target.write(content)
        else:
            sys.stdout.write(content)
    except (ValueError, OSError) as error:
        print(f"error: {error}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
