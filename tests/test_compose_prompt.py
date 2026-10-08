"""Behavior checks for reusable prompt assembly and safe CLI failures."""
import importlib.util
import json
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import unittest

REPO = Path(__file__).resolve().parents[1]
SKILL = REPO / "skills/chinese-cinematic-3d-prompts"
SCRIPT = SKILL / "scripts/compose_prompt.py"
spec = importlib.util.spec_from_file_location("compose_prompt", SCRIPT)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


def minimal(profile="jianghu"):
    return {"profile": profile, "subject": "a traveler", "setting": "an ancient inn",
            "action": "the traveler pauses at the doorway"}


def storyboard():
    return json.loads((SKILL / "assets/examples/zhiguai-storyboard.json").read_text())


class PromptBehavior(unittest.TestCase):
    def test_all_five_profiles_share_base_but_keep_distinct_focus(self):
        packs = [module.compose(minimal(name)) for name in
                 ("xiake", "jianghu", "zhiguai", "historical", "mythology")]
        self.assertEqual(len({p["style_lock"] for p in packs}), 1)
        self.assertEqual(len({p["prompt_records"][0]["prompt_en"] for p in packs}), 5)
        for pack in packs:
            with self.subTest(profile=pack["profile"]):
                self.assertIn("handcrafted clay-like sculptural texture", pack["style_lock"])
                self.assertEqual(len(pack["prompt_records"]), 1)
                self.assertEqual(pack["assumptions"]["aspect_ratio"], "16:9")
        historical = packs[3]
        self.assertTrue(any("史料" in w for w in historical["warnings"]))

    def test_storyboard_locks_survive_shot_changes(self):
        request = storyboard()
        pack = module.compose(request)
        self.assertEqual(pack["character_lock"], request["character_lock"])
        self.assertEqual(len(pack["prompt_records"]), 3)
        lock_lines = []
        for record in pack["prompt_records"]:
            prompt = record["prompt_en"]
            self.assertIn(pack["style_lock"], prompt)
            self.assertIn(request["palette"], prompt)
            self.assertIn("Frame: 16:9", prompt)
            for value in request["character_lock"].values():
                self.assertIn(value, prompt)
            lock_lines.append(next(line for line in prompt.splitlines() if line.startswith("Character identity lock:")))
        self.assertEqual(len(set(lock_lines)), 1)
        self.assertEqual(pack["prompt_records"][0]["shot"]["setting"], request["setting"])
        self.assertEqual(pack["prompt_records"][2]["shot"]["setting"], request["shots"][2]["setting"])
        self.assertEqual(pack["prompt_records"][1]["shot"]["duration_seconds"], 4)

    def test_reject_storyboard_lock_overrides_duplicate_ids_and_missing_anchors(self):
        variants = []
        data = storyboard(); data["shots"][1]["id"] = data["shots"][0]["id"]; variants.append(data)
        data = storyboard(); data["shots"][0]["character_lock"] = {"costume": "red robe"}; variants.append(data)
        data = storyboard(); data["character_lock"] = {"identity": "a traveler"}; variants.append(data)
        data = storyboard(); data["shots"] = data["shots"][:1]; variants.append(data)
        for request in variants:
            with self.subTest(request=request):
                with self.assertRaises(module.InputError):
                    module.compose(request)

    def test_types_enum_unknown_fields_and_empty_core_rejected(self):
        for update in ({"profile": "other"}, {"subject": "  "}, {"setting": []},
                       {"mode": "video"}, {"avoid": "modern tools"},
                       {"aspect_ratio": "wide"}, {"seed": 1}, {"shots": []},
                       {"character_lock": {"age": 20}}):
            with self.subTest(update=update), self.assertRaises(module.InputError):
                module.compose({**minimal(), **update})

    def test_duration_requires_finite_positive_number(self):
        for value in (False, True, 0, -1, "4", float("nan"), float("inf")):
            data = storyboard()
            data["shots"][0]["duration_seconds"] = value
            with self.subTest(value=value), self.assertRaises(module.InputError):
                module.compose(data)

    def test_strict_requires_sources_without_claiming_they_are_verified(self):
        request = {**minimal("historical"), "historical_accuracy": "strict"}
        with self.assertRaises(module.InputError):
            module.compose(request)
        request["source_notes"] = ["[待核实] example note; not historical proof"]
        pack = module.compose(request)
        self.assertEqual(pack["source_notes"], request["source_notes"])
        self.assertTrue(any("未核实" in w for w in pack["warnings"]))
        request["profile"] = "mythology"
        with self.assertRaises(module.InputError):
            module.compose(request)

    def test_avoid_items_preserved_and_original_test_prefix_opt_in(self):
        request = {**minimal("xiake"), "avoid": ["duplicate weapons", "modern props", "duplicate weapons"],
                   "brand_style": "original-test"}
        pack = module.compose(request)
        self.assertIn("Pixar stylized 3D animated feature film", pack["style_lock"])
        self.assertEqual(pack["negative_prompt_en"].count("duplicate weapons"), 1)
        self.assertEqual(pack["negative_prompt_en"].count("modern props"), 1)
        self.assertNotIn("brand_style", pack["assumptions"])
        self.assertNotIn("Pixar", module.compose(minimal())["style_lock"])

    def test_markdown_quotes_prompt_fences(self):
        pack = module.compose({**minimal(), "subject": "a traveler near ``` engraved marks"})
        rendered = module.markdown(pack)
        self.assertIn("````text", rendered)
        self.assertIn("a traveler near ``` engraved marks", rendered)
        self.assertIn("## 负向约束", rendered)
        self.assertIn("[输入参数]", rendered)
        self.assertNotIn("[用户提供]", rendered)

    def test_cli_from_other_cwd_and_no_overwrite(self):
        with tempfile.TemporaryDirectory() as directory:
            request = Path(directory) / "request.json"
            output = Path(directory) / "pack.json"
            request.write_text(json.dumps(minimal()))
            command = [sys.executable, str(SCRIPT), "--input", str(request), "--format", "json", "--output", str(output)]
            first = subprocess.run(command, cwd=directory, capture_output=True, text=True)
            self.assertEqual(first.returncode, 0, first.stderr)
            before = output.read_bytes()
            self.assertEqual(json.loads(before)["schema_version"], "1.0.0")
            second = subprocess.run(command, cwd=directory, capture_output=True, text=True)
            self.assertEqual(second.returncode, 2)
            self.assertEqual(output.read_bytes(), before)

    def test_malformed_json_and_duplicate_keys_fail_without_output(self):
        for content in ('{bad', '{"profile":"xiake","profile":"zhiguai"}', '{"value":NaN}'):
            with self.subTest(content=content), tempfile.TemporaryDirectory() as directory:
                request = Path(directory) / "request.json"
                output = Path(directory) / "pack.json"
                request.write_text(content)
                result = subprocess.run([sys.executable, str(SCRIPT), "--input", str(request), "--output", str(output)],
                                        capture_output=True, text=True)
                self.assertEqual(result.returncode, 2)
                self.assertFalse(output.exists())
                self.assertNotIn("Traceback", result.stderr)

    def test_skill_local_links_and_schema_profile_contract(self):
        for document in [SKILL / "SKILL.md", *SKILL.glob("references/*.md")]:
            for link in re.findall(r"\]\(([^)]+)\)", document.read_text()):
                if "://" not in link:
                    self.assertTrue((document.parent / link).exists(), f"{document}: {link}")
        schema = json.loads((SKILL / "assets/input.schema.json").read_text())
        self.assertEqual(set(schema["properties"]["profile"]["enum"]), set(module.load_profiles()))


if __name__ == "__main__":
    unittest.main()
