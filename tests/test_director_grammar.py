import json, unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class DirectorGrammarTests(unittest.TestCase):
    def test_transformer_uses_director_grammars(self):
        data=json.loads((ROOT/'benchmarks/transformer-explainer/scene-graph.json').read_text())
        scenes=[s for c in data['chapters'] for s in c['scenes']]
        grammars={s.get('visual_grammar') for s in scenes}
        self.assertTrue({'projection-split','attention-map','parallel-heads','layer-stack'}.issubset(grammars))
        for s in scenes:
            if s.get('visual_grammar'):
                self.assertIn('director',s)
                self.assertGreater(s['director'].get('stable_frame',0),0)
                self.assertLess(s['director'].get('stable_frame',1),1)
if __name__=='__main__': unittest.main()
