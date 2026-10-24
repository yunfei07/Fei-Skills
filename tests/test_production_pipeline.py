import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class ProductionPipelineTests(unittest.TestCase):
    def test_song_tokens_keep_required_palette_and_motion_rules(self):
        tokens = json.loads((ROOT / 'shared/design-systems/song-aesthetic/tokens.json').read_text(encoding='utf-8'))
        colors = tokens['colors']
        for name in ('paper', 'ink', 'songGreen', 'songCyan', 'line'):
            self.assertIn(name, colors)
        forbidden = set(tokens['motion']['forbidden'])
        self.assertTrue({'bounce', 'spin', 'neon-glow'}.issubset(forbidden))

    def test_shared_schema_contains_all_scene_kinds(self):
        schema = json.loads((ROOT / 'shared/scene-graph/scene-graph.schema.json').read_text(encoding='utf-8'))
        kinds = set(schema['$defs']['scene']['properties']['kind']['enum'])
        self.assertEqual(kinds, {'text', 'flow', 'compare', 'network', 'chart', 'spatial'})

    def test_smoke_fixture_is_song_aesthetic_and_exercises_spatial(self):
        fixture = json.loads((ROOT / 'shared/scene-graph/examples/smoke.json').read_text(encoding='utf-8'))
        self.assertEqual(fixture['profile'], 'song-aesthetic')
        kinds = {scene['kind'] for chapter in fixture['chapters'] for scene in chapter['scenes']}
        self.assertTrue({'text', 'chart', 'spatial'}.issubset(kinds))

    def test_video_runtime_has_smoke_commands(self):
        package = json.loads((ROOT / 'skills/video/fei-knowledge-explainer-video/runtime/package.json').read_text(encoding='utf-8'))
        scripts = package['scripts']
        for name in ('smoke:render', 'smoke:stills'):
            self.assertIn(name, scripts)

    def test_ci_and_visual_qa_exist(self):
        self.assertTrue((ROOT / '.github/workflows/production-ci.yml').is_file())
        self.assertTrue((ROOT / 'shared/qa/song-aesthetic-visual-qa.md').is_file())


if __name__ == '__main__':
    unittest.main()
