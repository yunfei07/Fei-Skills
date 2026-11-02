import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { planVisual } from './visual-planner.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturePath = path.join(__dirname, 'fixtures', 'planner-cases.json');
const cases = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
const results = [];
let failed = 0;

for (const tc of cases) {
  const planned = planVisual(tc.input);
  const checks = {
    profile: !tc.expect.profile || planned.profile === tc.expect.profile,
    verb: !tc.expect.verb || planned.explanatory_verb === tc.expect.verb,
    grammar: !tc.expect.grammar || planned.visual_grammar === tc.expect.grammar,
    confidence: typeof planned.visual_plan?.confidence === 'number' && planned.visual_plan.confidence >= 0 && planned.visual_plan.confidence <= 1,
    visual_data: planned.visual_data && Object.keys(planned.visual_data).length > 0
  };
  const ok = Object.values(checks).every(Boolean);
  if (!ok) failed += 1;
  results.push({ id:tc.id, ok, expected:tc.expect, actual:{profile:planned.profile, verb:planned.explanatory_verb, grammar:planned.visual_grammar, confidence:planned.visual_plan?.confidence}, checks });
}

const report = { status: failed ? 'failed' : 'passed', total:cases.length, passed:cases.length-failed, failed, results };
fs.mkdirSync(path.join(__dirname,'out'), {recursive:true});
fs.writeFileSync(path.join(__dirname,'out','visual-planner-report.json'), JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
if (failed) process.exit(1);
