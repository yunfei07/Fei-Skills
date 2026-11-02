# Fei Infographic Director

## Purpose

Turn a URL, repository, document, dataset, or supplied notes into a high-quality, source-aware infographic for social media, education, onboarding, product explanation, architecture explanation, process guidance, or data comparison.

This Skill is not a single image prompt. It separates factual extraction, audience translation, teaching intent, visual planning, rendering, and QA.

## Status

`runnable` as of v0.5.0.

v0.4 introduced profile-specific semantic visual grammars. v0.5 adds repository-native **Visual Grammar Intelligence**: when the caller does not explicitly supply `profile`, `explanatory_verb`, `visual_grammar`, or `visual_data`, the planner can infer them from the teaching structure and return an inspectable confidence score, rationale, and warnings.

Guaranteed repository-native path:
`source -> claim ledger -> teaching goal -> auto visual plan -> profile -> explanatory verb -> visual grammar -> visual_data -> PNG renderer -> visual QA`

External generative-image adapters remain optional enhancement layers.

## Trigger

Use when the user asks to:
- create an infographic, visual explainer, onboarding guide, cheat sheet, comparison poster, process map, architecture explainer, or educational diagram;
- turn a URL/repository/document into a visual explanation;
- explain a technical product or Skill to a non-expert audience;
- create a social-media-first educational visual.

Do not use for pure decorative posters with no explanatory structure.

## Inputs

Required:
- `source`: URL, repository, document, notes, or structured data.
- `goal`: what the viewer should understand or do after reading.

Optional:
- `audience`: default `general`.
- `use_case`: `social | onboarding | education | product | technical`.
- `depth`: `quick | standard | deep`, default `standard`.
- `profile`: `beginner-onboarding | technical-architecture | knowledge-explainer | data-comparison | process-guide`.
- `explanatory_verb`: `compare | transform | branch | repeat | accumulate | focus | relate`.
- `visual_grammar`: explicit renderer grammar override.
- `aspect_ratio`: default `9:16` for social/onboarding.
- `style_profile`: default `song-handdrawn` when no brand system is supplied.
- `language`: inferred from user.
- `must_include`, `must_avoid`, `brand_tokens`, `source_citations`.

## Visual Grammar Intelligence

When profile/verb/grammar are not supplied, run `runtime/visual-planner.mjs`.

Planner output:
- `profile`
- `explanatory_verb`
- `visual_grammar`
- `visual_data`
- `visual_plan.confidence`
- `visual_plan.rationale`
- `visual_plan.warnings`

The confidence score expresses **planning confidence only**. It is not a probability that source claims are true.

See `references/visual-grammar-intelligence.md`.

## Profile routing

Default profile grammars:
- beginner-onboarding -> `onboarding-path`
- technical-architecture -> `node-edge-boundary`
- process-guide -> `connected-step-path`
- data-comparison -> `quantitative-comparison`
- knowledge-explainer -> route by explanatory verb

Knowledge verbs:
- compare -> `paired-comparison`
- transform -> `before-after`
- branch -> `decision-tree`
- repeat -> `cycle`
- accumulate -> `layer-stack`
- focus -> `focus-reveal`
- relate -> `spatial-relations`

## Execution

### 1. Parse the brief
Identify source, audience, desired action, publishing surface, size, language, constraints, and whether claims require verification.

### 2. Research and claim ledger
For factual content:
1. Read the primary source first.
2. Extract only claims needed for the visual story.
3. Record claims as `verified`, `source-derived`, or `inference`.
4. Never invent statistics, benchmark results, installation commands, version requirements, sources, or conclusions.
5. Prefer official documentation/repositories for installation and usage instructions.

### 3. Audience translation
Translate complexity without changing factual meaning. For first-use audiences prioritize what it is, why it matters, prerequisites, first action, expected result, limits, and next steps.

Avoid dismissive audience labels such as “小白” or “菜鸟”. Prefer `入门指南`, `第一次使用`, `快速开始`, or `基础指南`.

### 4. Define teaching goal
State what the viewer must mentally do: compare, transform, branch, repeat, accumulate, focus, relate, start, or follow.

### 5. Auto-plan or explicit-plan
If the caller supplies profile/verb/grammar/visual_data, preserve them unless invalid.

Otherwise:
```bash
cd runtime
node visual-planner.mjs input.json planned.json
```

The planner may organize verified facts but must not invent missing values, undocumented topology, unsupported causality, or rankings.

Architecture auto-planning must warn when topology is inferred from labels/order rather than explicitly sourced.

### 6. Build structured visual_data
Supported structures:
- `steps`: actions, checks, decisions, setup, result;
- `nodes` + `edges`: actors and relationships;
- `metrics`: values, units, roles, display strings;
- `stages`: conceptual stages/layers.

### 7. Build information architecture
Create one visual thesis and 4–8 supporting modules. Use one dominant semantic relationship. Supporting notes remain secondary.

### 8. Compress copy
Use progressive disclosure:
- title + value proposition;
- visual labels;
- short support lines;
- caveats/source notes.

Keep commands, names, numbers, units, and qualifiers exact.

### 9. Choose visual style
Default `song-handdrawn`:
- warm off-white / xuan-paper-like ground;
- ink-black primary text and linework;
- pale celadon / sage / gray-green accents;
- limited warm-yellow emphasis;
- restrained watercolor/ink texture;
- generous negative space;
- technical objects remain semantically recognizable.

Style must never override semantic structure or factual precision.

### 10. Build and validate render brief
Produce JSON conforming to `schemas/render-brief.schema.json`.

```bash
python3 scripts/validate_render_brief.py path/to/render-brief.json
```

### 11. Render
Explicit validated brief:
```bash
cd runtime
node render.mjs path/to/render-brief.json out/infographic.png
```

Automatic planning + render:
```bash
node auto-render.mjs input.json out/infographic.png
```

v0.5 keeps the stable v0.4 renderer for onboarding, architecture, process, data comparison, cycle, layer, before/after and paired comparison. It adds specialized automatic renderers for:
- `decision-tree`
- `focus-reveal`
- `spatial-relations`

### 12. Visual QA
Verify:
- topic readable within ~3 seconds;
- primary relationship/path readable within ~10 seconds;
- grammar matches the teaching structure;
- no semantic profile silently falls back to generic editorial cards when structured data exists;
- no clipped/unreadable text;
- no invented facts;
- exact commands/numbers/units match verified source material;
- mobile reading remains coherent;
- inferred topology or low-confidence planning remains visibly reviewable before factual publication.

## Outputs

Planning:
- `brief`
- `claim-ledger`
- `teaching-goal`
- `visual-plan`
- `explanatory-verb`
- `information-architecture`
- `visual-data`
- `copy-deck`
- `visual-direction`
- `qa-report`

Implementation:
- validated `render-brief.json`
- profile / grammar selection
- planner confidence / rationale / warnings

Rendered:
- deterministic `infographic-png`
- render metadata
- optional generative-image variant
- optional aspect-ratio variants

## Benchmarks

CI now validates three layers:
1. existing explicit semantic render briefs across all five profiles;
2. 10 Visual Grammar Intelligence planner regression cases;
3. 7 automatic planning -> PNG end-to-end cases.

Planner regressions cover profile routing plus `compare / transform / branch / repeat / accumulate / focus / relate`.

## Quality boundary

A visually attractive image with unsupported facts fails.
A factually correct image with weak hierarchy fails.
A profile label without a matching visual grammar fails.
A semantic visual that collapses into generic cards when structured data exists fails.
A high planner confidence score does not override missing source evidence.

The target is verified content + audience translation + inspectable visual planning + semantic visual grammar + director-grade hierarchy + readable rendering.

## References

- `references/design-principles.md`
- `references/visual-grammar-v04.md`
- `references/visual-grammar-intelligence.md`
- `references/renderer-adapter-contract.md`
- `references/rendered-infographic-qa.md`
- `examples/stageshow-onboarding.md`
- `templates/render-brief.example.json`
- `schemas/render-brief.schema.json`
