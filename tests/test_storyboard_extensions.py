"""Production behavior, backwards compatibility and offline export checks."""
import base64
import copy
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

from test_compose_prompt import SKILL, module, storyboard
import export_storyboard as board

PNG = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jR1cAAAAASUVORK5CYII=")


def production_request():
    return json.loads((SKILL / "assets/examples/linchong-storyboard.json").read_text())


class ProductionBehavior(unittest.TestCase):
    def test_old_storyboard_keeps_static_prompt_and_input_is_unchanged(self):
        request = storyboard()
        before = copy.deepcopy(request)
        pack = module.compose(request)
        self.assertEqual(request, before)
        self.assertEqual(pack["scene_locks"], [])
        self.assertEqual(pack["timeline"]["total_duration_seconds"], 12)
        for record in pack["prompt_records"]:
            self.assertNotIn("Camera movement plan", record["prompt_en"])
            self.assertEqual(record["shot"]["camera_motion"]["type"], "locked")
            self.assertEqual(record["shot"]["transition_out"]["duration_seconds"], 0)
            self.assertEqual(record["references"], [])

    def test_scene_locks_refs_movement_sound_and_timing(self):
        request = production_request()
        pack = module.compose(request, SKILL / "assets/examples")
        self.assertEqual(pack["schema_version"], "1.1.0")
        self.assertEqual(pack["timeline"]["total_duration_seconds"], 24)
        self.assertAlmostEqual(pack["timeline"]["entries"][-1]["transition_start_seconds"], 23.3)
        locks = []
        for record in pack["prompt_records"]:
            self.assertEqual(record["reference_ids"], ["REF_LINCHONG"])
            self.assertEqual(record["shot"]["scene_id"], "TEMPLE")
            self.assertEqual(record["shot"]["scene_lock"], pack["scene_locks"][0])
            self.assertNotIn("持续风雪声", record["prompt_en"])
            self.assertNotIn("Camera movement plan", record["prompt_en"])
            locks.append(next(line for line in record["prompt_en"].splitlines() if line.startswith("Scene continuity lock:")))
        self.assertEqual(len(set(locks)), 1)
        first = pack["prompt_records"][0]
        self.assertIn("dolly_in", first["motion_prompt_en"])
        self.assertEqual(first["shot"]["sound"]["ambience"], ["持续风雪声"])
        self.assertEqual(first["shot"]["sound"]["effects"], ["远处木门被风吹动的轻响"])
        self.assertTrue(Path(first["references"][0]["source"]).is_absolute())
        self.assertTrue(any("参考图不存在" in w for w in pack["warnings"]))

    def test_two_locations_and_scene_scoped_reference(self):
        request = production_request()
        other = {**request["scene_locks"][0], "id": "PATH", "identity": "a separate forest path"}
        request["scene_locks"].append(other)
        request["reference_images"] = [{"id": "REF_TEMPLE", "role": "scene", "scene_id": "TEMPLE",
                                         "source_type": "resource_id", "source": "test-only-opaque-reference"}]
        request["reference_ids"] = ["REF_TEMPLE"]
        request["shots"][0].update({"scene_id": "PATH", "reference_ids": []})
        pack = module.compose(request)
        self.assertEqual(pack["prompt_records"][0]["shot"]["scene_lock"]["identity"], "a separate forest path")
        self.assertEqual(pack["prompt_records"][1]["shot"]["scene_id"], "TEMPLE")
        del request["shots"][0]["reference_ids"]
        with self.assertRaisesRegex(ValueError, "does not match"):
            module.compose(request)

    def test_unknown_duplicate_and_forbidden_registry_overrides(self):
        variants = []
        data = production_request(); data["scene_id"] = "OTHER"; variants.append(data)
        data = production_request(); data["scene_locks"].append(data["scene_locks"][0]); variants.append(data)
        data = production_request(); data["reference_ids"] = ["UNKNOWN"]; variants.append(data)
        data = production_request(); data["reference_ids"] *= 2; variants.append(data)
        data = production_request(); data["reference_images"].append(data["reference_images"][0]); variants.append(data)
        data = production_request(); data["shots"][0]["scene_lock"] = {"weather": "sunshine"}; variants.append(data)
        data = production_request(); data["reference_images"][0]["role"] = "unknown"; variants.append(data)
        data = production_request(); data["reference_images"][0]["source"] = "https://example.invalid/image.png"; variants.append(data)
        data = production_request(); data["scene_locks"] = [{"id": "TEMPLE"}]; variants.append(data)
        for request in variants:
            with self.subTest(request=request), self.assertRaises(ValueError):
                module.compose(request)

    def test_camera_sound_and_transition_bad_values(self):
        for update in (
            {"camera_motion": {"type": "zoom_magic"}}, {"camera_motion": {"type": "pan"}},
            {"sound": {"effects": "footsteps"}}, {"sound": {"dialogue": [{"speaker": "Lin Chong"}]}},
            {"transition_out": {"type": "cut", "duration_seconds": 1}},
            {"transition_out": {"type": "dissolve", "duration_seconds": 0}},
            {"transition_out": {"type": "fade_out", "duration_seconds": 10}},
            {"transition_out": {"type": "fade_out", "duration_seconds": True}},
        ):
            request = production_request()
            request["shots"][0].update(update)
            with self.subTest(update=update), self.assertRaises(ValueError):
                module.compose(request)
        request = production_request()
        request["shots"][-1]["transition_out"] = {"type": "dissolve", "duration_seconds": 0.5}
        with self.assertRaisesRegex(ValueError, "nonexistent"):
            module.compose(request)

    def test_unknown_timing_never_invents_total_or_later_timepoints(self):
        request = production_request()
        del request["shots"][1]["duration_seconds"]
        pack = module.compose(request)
        timing = pack["timeline"]
        self.assertFalse(timing["timing_complete"])
        self.assertIsNone(timing["total_duration_seconds"])
        self.assertEqual(timing["entries"][1]["start_seconds"], 5)
        self.assertIsNone(timing["entries"][1]["end_seconds"])
        self.assertIsNone(timing["entries"][2]["start_seconds"])
        self.assertTrue(any("缺少时长" in w for w in pack["warnings"]))

    def test_sound_override_is_per_field_and_reference_selection_can_clear(self):
        request = production_request()
        request["shots"][0]["sound"] = {"effects": ["木杆触地"], "dialogue": [{"speaker": "林冲", "text": "自拟测试台词"}]}
        request["shots"][0]["reference_ids"] = []
        pack = module.compose(request)
        first = pack["prompt_records"][0]
        self.assertEqual(first["references"], [])
        self.assertEqual(first["shot"]["sound"]["ambience"], ["持续风雪声"])
        self.assertEqual(first["shot"]["sound"]["effects"], ["木杆触地"])
        self.assertEqual(first["shot"]["sound"]["dialogue"][0]["text"], "自拟测试台词")
        self.assertEqual(pack["prompt_records"][1]["shot"]["sound"]["dialogue"], [])

    def test_html_embeds_actual_frame_and_keeps_missing_frames_honest(self):
        request = production_request()
        request["title"] = "<script>alert(1)</script> 林冲"
        request["shots"][0]["sound"]["dialogue"] = [{"speaker": "林冲", "text": "<img src=x onerror=alert(1)>"}]
        with tempfile.TemporaryDirectory() as directory:
            picture = Path(directory) / "frame.png"; picture.write_bytes(PNG)
            request["reference_images"][0]["source"] = str(picture)
            pack = module.compose(request)
            result = board.render(pack, {"SHOT_02": picture})
            self.assertIn("已关联 1/6", result)
            self.assertEqual(result.count('class="placeholder"'), 5)
            self.assertIn("data:image/png;base64,", result)
            self.assertIn("[参考图]", result)
            self.assertIn("镜头运动", result)
            self.assertIn("持续风雪声", result)
            self.assertIn("@page{size:A4 landscape", result)
            self.assertNotIn("<script>", result)
            self.assertIn("&lt;script&gt;", result)
            self.assertIn("script-src &#39;none&#39;", result)

    def test_image_mapping_and_unsupported_images_fail_before_writing(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            manifest = root / "images.json"
            manifest.write_text(json.dumps({"SHOT_01": "frames/one.png"}))
            mapped = board.image_map(manifest, ["SHOT_01"])
            self.assertEqual(mapped["SHOT_01"], root / "frames/one.png")
            manifest.write_text(json.dumps({"UNKNOWN": "one.png"}))
            with self.assertRaises(ValueError):
                board.image_map(manifest, ["SHOT_01"])
            manifest.write_text(json.dumps({"SHOT_01": "https://example.invalid/a.png"}))
            with self.assertRaises(ValueError):
                board.image_map(manifest, ["SHOT_01"])
            svg = root / "untrusted.svg"; svg.write_text("<svg><script/></svg>")
            with self.assertRaises(ValueError):
                board.render(module.compose(production_request()), {"SHOT_01": svg})

    def test_export_cli_offline_from_arbitrary_cwd_and_no_overwrite(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            pack = root / "pack.json"
            pack.write_text(json.dumps(module.compose(production_request()), ensure_ascii=False))
            output = root / "board.html"
            command = [sys.executable, str(SKILL / "scripts/export_storyboard.py"),
                       "--input", str(pack), "--output", str(output)]
            first = subprocess.run(command, cwd=directory, capture_output=True, text=True)
            self.assertEqual(first.returncode, 0, first.stderr)
            before = output.read_bytes()
            second = subprocess.run(command, cwd=directory, capture_output=True, text=True)
            self.assertEqual(second.returncode, 2)
            self.assertEqual(output.read_bytes(), before)
            # Explicit frame mapping to a missing file must not silently become a placeholder.
            manifest = root / "map.json"; manifest.write_text('{"SHOT_01":"missing.png"}')
            another = root / "not-created.html"
            bad = subprocess.run([*command[:-1], str(another), "--image-map", str(manifest)],
                                 capture_output=True, text=True)
            self.assertEqual(bad.returncode, 2)
            self.assertFalse(another.exists())

    def test_export_accepts_legacy_pack_and_image_budget_is_enforced(self):
        legacy = {"schema_version": "1.0.0", "prompt_records": [
            {"id": "FRAME_01", "prompt_en": "one traveler in an ancient inn",
             "shot": {"action": "the traveler pauses", "camera": "medium shot"}}
        ]}
        result = board.render(legacy)
        self.assertIn("已关联 0/1", result)
        self.assertIn("旧版提示词包未提供", result)
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "too-large.png"
            with path.open("wb") as target:
                target.truncate(board.MAX_IMAGE_BYTES + 1)
            with self.assertRaisesRegex(ValueError, "budget"):
                board.render(legacy, {"FRAME_01": path})


if __name__ == "__main__":
    unittest.main()
