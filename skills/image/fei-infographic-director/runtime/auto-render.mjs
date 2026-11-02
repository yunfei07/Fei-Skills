import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { planVisual } from './visual-planner.mjs';
import { renderBrief } from './render.mjs';

export async function autoRender(input, outPath) {
  const raw = typeof input === 'string' ? JSON.parse(fs.readFileSync(input,'utf8')) : structuredClone(input);
  const enriched = {
    audience: raw.audience || 'general audience',
    aspect_ratio: raw.aspect_ratio || '9:16',
    hero: raw.hero || { message: raw.goal || raw.title || 'Visual explanation', visual_subject: 'semantic visual structure generated from source content' },
    exact_strings: raw.exact_strings || [],
    prohibited_strings: raw.prohibited_strings || [],
    visual: raw.visual || {
      style_profile: 'song-handdrawn',
      palette: ['warm off-white','ink black','sage','celadon'],
      composition: 'semantic layout selected by visual planner',
      illustration_language: 'clear explanatory diagram with restrained Song-inspired editorial styling'
    },
    qa: raw.qa || {
      three_second_read: 'topic and visual thesis are immediately visible',
      ten_second_path: 'primary explanatory path is visible within ten seconds',
      mobile_legibility: 'primary labels remain readable on mobile',
      fact_check: 'claims and exact strings must match verified source material',
      tone_check: 'neutral and respectful language'
    },
    sections: raw.sections || [],
    title: raw.title || 'Untitled visual explanation',
    goal: raw.goal || 'Explain the supplied content clearly',
    ...raw
  };
  const planned = planVisual(enriched);
  const tmp = path.join(os.tmpdir(), `fei-infographic-plan-${process.pid}-${Date.now()}.json`);
  fs.writeFileSync(tmp, JSON.stringify(planned,null,2));
  const rendered = await renderBrief(tmp, outPath);
  fs.unlinkSync(tmp);
  return { ...rendered, plan: planned.visual_plan, profile: planned.profile, explanatory_verb: planned.explanatory_verb, visual_grammar: planned.visual_grammar, visual_data: planned.visual_data };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const input = process.argv[2];
  const out = process.argv[3] || path.resolve('out/auto-infographic.png');
  if (!input) { console.error('usage: node auto-render.mjs <input.json> [out.png]'); process.exit(2); }
  autoRender(path.resolve(input), path.resolve(out)).then(r => console.log(JSON.stringify(r,null,2))).catch(err => { console.error(err); process.exit(1); });
}
