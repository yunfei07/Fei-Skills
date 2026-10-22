import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class RegistryTests(unittest.TestCase):
    def test_registered_skills_have_entrypoints(self):
        registry = json.loads((ROOT / "registry" / "skills.json").read_text(encoding="utf-8"))
        self.assertEqual(registry["spec_version"], "0.1.0")
        for item in registry["skills"]:
            path = ROOT / item["path"]
            self.assertTrue(path.is_dir(), item["id"])
            self.assertTrue((path / "SKILL.md").is_file(), item["id"])

    def test_new_manifests_match_registry(self):
        registry = json.loads((ROOT / "registry" / "skills.json").read_text(encoding="utf-8"))
        for item in registry["skills"]:
            manifest_path = ROOT / item["path"] / "manifest.json"
            if not manifest_path.exists():
                self.assertEqual(item["id"], "chinese-cinematic-3d-prompts")
                continue
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
            self.assertEqual(manifest["id"], item["id"])
            self.assertEqual(manifest["domain"], item["domain"])
            self.assertEqual(manifest["status"], item["status"])
            self.assertRegex(manifest["version"], r"^\d+\.\d+\.\d+$")
            self.assertEqual(manifest["entrypoint"], "SKILL.md")
            self.assertTrue(manifest["inputs"])
            self.assertTrue(manifest["outputs"])


if __name__ == "__main__":
    unittest.main()
