"""Validate optional storyboard production fields without external dependencies."""
from __future__ import annotations

import math
from pathlib import Path

TOP_FIELDS = {"title", "scene_locks", "scene_id", "reference_images", "reference_ids",
              "camera_motion", "sound", "transition_out"}
SHOT_FIELDS = {"scene_id", "reference_ids", "camera_motion", "sound", "transition_out"}
SCENE_FIELDS = ("identity", "layout", "architecture", "fixed_props", "weather", "time_of_day", "continuity")
MOTION_TYPES = ("locked", "pan", "tilt", "dolly_in", "dolly_out", "track", "orbit", "handheld")
TRANSITION_TYPES = ("cut", "match_cut", "dissolve", "fade_out")


def obj(value, allowed, path):
    if not isinstance(value, dict):
        raise ValueError(f"{path}: expected an object")
    unknown = set(value) - set(allowed)
    if unknown:
        raise ValueError(f"{path}: unknown fields: {', '.join(sorted(unknown))}")


def text(value, path):
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{path}: expected a non-empty string")
    return value.strip()


def texts(value, path):
    if not isinstance(value, list):
        raise ValueError(f"{path}: expected an array")
    return [text(item, f"{path}[{i}]") for i, item in enumerate(value)]


def number(value, path, positive=False):
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError(f"{path}: expected a finite number")
    try:
        finite = math.isfinite(value)
    except OverflowError:
        finite = False
    if not finite or value < 0 or (positive and value == 0):
        raise ValueError(f"{path}: expected a finite {'positive' if positive else 'nonnegative'} number")
    return value


def choice(value, options, path):
    value = text(value, path)
    if value not in options:
        raise ValueError(f"{path}: choose one of {', '.join(options)}")
    return value


def motion(value, path):
    obj(value, {"type", "description", "start_frame", "end_frame"}, path)
    kind = choice(value.get("type", "locked"), MOTION_TYPES, path + ".type")
    if kind != "locked" and "description" not in value:
        raise ValueError(path + ": moving camera requires description")
    result = {"type": kind, "description": text(value.get("description", "static camera, no movement"), path + ".description")}
    for key in ("start_frame", "end_frame"):
        if key in value:
            result[key] = text(value[key], path + "." + key)
    return result


def sound(value, path):
    obj(value, {"ambience", "effects", "music", "dialogue"}, path)
    result = {key: texts(value.get(key, []), path + "." + key) for key in ("ambience", "effects")}
    result["music"] = text(value.get("music", "none"), path + ".music")
    dialogue = value.get("dialogue", [])
    if not isinstance(dialogue, list):
        raise ValueError(path + ".dialogue: expected an array")
    result["dialogue"] = []
    for i, line in enumerate(dialogue):
        where = f"{path}.dialogue[{i}]"
        obj(line, {"speaker", "text"}, where)
        result["dialogue"].append({key: text(line.get(key), where + "." + key) for key in ("speaker", "text")})
    return result


def transition(value, path):
    obj(value, {"type", "duration_seconds", "notes"}, path)
    kind = choice(value.get("type", "cut"), TRANSITION_TYPES, path + ".type")
    duration = number(value.get("duration_seconds", 0 if kind in ("cut", "match_cut") else 0.5), path + ".duration_seconds")
    if (kind in ("cut", "match_cut")) != (duration == 0):
        raise ValueError(path + ": cut/match_cut require zero duration; dissolve/fade_out require positive duration")
    result = {"type": kind, "duration_seconds": duration}
    if "notes" in value:
        result["notes"] = text(value["notes"], path + ".notes")
    return result


def attach(request, data, base_dir=None):
    """Return normalized registry and attach resolved production metadata to shots."""
    data["title"] = text(request.get("title", "中国古风电影级 3D 动画分镜"), "title")
    scenes = request.get("scene_locks", [])
    if not isinstance(scenes, list):
        raise ValueError("scene_locks: expected an array")
    scene_map = {}
    for i, scene in enumerate(scenes):
        path = f"scene_locks[{i}]"
        obj(scene, {"id", *SCENE_FIELDS}, path)
        identifier = text(scene.get("id"), path + ".id")
        if identifier in scene_map:
            raise ValueError(path + ".id: duplicate scene id")
        if not any(key in scene for key in SCENE_FIELDS):
            raise ValueError(path + ": add at least one visual scene field")
        scene_map[identifier] = {"id": identifier, **{key: text(scene[key], path + "." + key)
                                                     for key in SCENE_FIELDS if key in scene}}
    refs = request.get("reference_images", [])
    if not isinstance(refs, list):
        raise ValueError("reference_images: expected an array")
    ref_map = {}
    for i, ref in enumerate(refs):
        path = f"reference_images[{i}]"
        obj(ref, {"id", "role", "source_type", "source", "description", "scene_id"}, path)
        identifier = text(ref.get("id"), path + ".id")
        if identifier in ref_map:
            raise ValueError(path + ".id: duplicate reference id")
        result = {"id": identifier,
                  "role": choice(ref.get("role"), ("character", "scene", "style"), path + ".role"),
                  "source_type": choice(ref.get("source_type"), ("local", "resource_id"), path + ".source_type"),
                  "source": text(ref.get("source"), path + ".source")}
        if result["source_type"] == "local":
            if "://" in result["source"] or result["source"].startswith("data:"):
                raise ValueError(path + ".source: local references require filesystem paths")
            result["source"] = str(((Path(base_dir) if base_dir else Path.cwd()) / result["source"]).resolve())
        if "description" in ref:
            result["description"] = text(ref["description"], path + ".description")
        if "scene_id" in ref:
            result["scene_id"] = text(ref["scene_id"], path + ".scene_id")
            if result["role"] != "scene" or result["scene_id"] not in scene_map:
                raise ValueError(path + ".scene_id: requires a scene reference and a registered scene")
        ref_map[identifier] = result
    top_scene = text(request["scene_id"], "scene_id") if "scene_id" in request else None
    if top_scene is not None and top_scene not in scene_map:
        raise ValueError("scene_id: unknown scene")
    shared_refs = texts(request.get("reference_ids", []), "reference_ids")
    if len(shared_refs) != len(set(shared_refs)) or any(identifier not in ref_map for identifier in shared_refs):
        raise ValueError("reference_ids: selections must be unique registered references")
    default_motion = motion(request.get("camera_motion", {}), "camera_motion")
    default_sound = sound(request.get("sound", {}), "sound")
    default_transition = transition(request.get("transition_out", {}), "transition_out")
    if data["mode"] != "storyboard" and "transition_out" in request:
        raise ValueError("transition_out: only available in storyboard mode")
    if data["mode"] == "storyboard":
        raw_shots, shots = request["shots"], data["shots"]
    else:
        raw_shots = [{}]
        shots = [{"id": "FRAME_01", **{key: data[key] for key in ("setting", "action", "emotion", "camera", "lighting")}}]
    for i, (raw, shot) in enumerate(zip(raw_shots, shots)):
        path = f"shots[{i}]"
        scene_id = text(raw["scene_id"], path + ".scene_id") if "scene_id" in raw else top_scene
        if scene_id is not None and scene_id not in scene_map:
            raise ValueError(path + ".scene_id: unknown scene")
        if scene_map and scene_id is None:
            raise ValueError(path + ": select a scene_id when scene_locks are provided")
        shot["scene_id"] = scene_id
        shot["scene_lock"] = scene_map.get(scene_id, {})
        selected = texts(raw.get("reference_ids", shared_refs), path + ".reference_ids")
        if len(selected) != len(set(selected)):
            raise ValueError(path + ".reference_ids: duplicate selection")
        for identifier in selected:
            if identifier not in ref_map:
                raise ValueError(path + ".reference_ids: unknown reference " + identifier)
            ref = ref_map[identifier]
            if ref.get("scene_id") and ref["scene_id"] != scene_id:
                raise ValueError(path + ": scene reference does not match selected scene")
        shot["reference_ids"] = selected
        shot["references"] = [ref_map[identifier] for identifier in selected]
        shot["camera_motion"] = motion(raw["camera_motion"], path + ".camera_motion") if "camera_motion" in raw else default_motion.copy()
        if "sound" in raw:
            obj(raw["sound"], {"ambience", "effects", "music", "dialogue"}, path + ".sound")
        shot["sound"] = sound({**default_sound, **raw.get("sound", {})}, path + ".sound")
        shot["transition_out"] = transition(raw["transition_out"], path + ".transition_out") if "transition_out" in raw else default_transition.copy()
        duration = shot.get("duration_seconds")
        if duration is not None:
            number(duration, path + ".duration_seconds", positive=True)
            if shot["transition_out"]["duration_seconds"] > duration:
                raise ValueError(path + ": transition duration exceeds shot duration")
        if i == len(shots) - 1 and shot["transition_out"]["type"] in ("dissolve", "match_cut"):
            raise ValueError(path + ": final shot cannot transition to a nonexistent next shot")
    data["scene_locks"] = list(scene_map.values())
    data["reference_images"] = list(ref_map.values())
    data["production_shots"] = shots
    data["production_defaults"] = {
        "camera_motion": default_motion, "sound": default_sound, "transition_out": default_transition,
        "scene_locks": [], "reference_images": [], "reference_ids": [],
    }
    return data


def timeline(shots):
    entries, cursor = [], 0
    complete = all("duration_seconds" in shot for shot in shots)
    for shot in shots:
        duration = shot.get("duration_seconds")
        end = cursor + duration if cursor is not None and duration is not None else None
        if end is not None:
            number(end, "timeline.end_seconds")
        transition_duration = shot["transition_out"]["duration_seconds"]
        entries.append({"id": shot["id"], "start_seconds": cursor, "end_seconds": end,
                        "duration_seconds": duration,
                        "transition_start_seconds": end - transition_duration if end is not None else None})
        cursor = end
    return {"timing_complete": complete, "total_duration_seconds": cursor if complete else None,
            "convention": "Transitions occur within the source shot duration; durations are not subtracted or overlapped.",
            "entries": entries}
