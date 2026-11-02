# Fei Infographic Director

## Purpose

Turn a URL, repository, document, dataset, or supplied notes into a high-quality, source-aware infographic for social media, education, onboarding, product explanation, architecture explanation, process guidance, or data comparison.

This Skill is not a single image prompt. It is a director workflow that separates factual extraction, audience translation, explanatory intent, visual grammar, rendering, and QA.

## Status

`runnable` as of v0.4.0.

v0.4 introduces profile-specific semantic visual grammars. Different information structures must now produce materially different visual structures instead of sharing one editorial card/grid renderer.

Guaranteed repository-native path:
`source -> claim ledger -> teaching goal -> profile -> explanatory verb -> visual grammar -> visual_data -> render brief -> PNG renderer -> visual QA`

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
- `explanatory_verb`: what the viewer must mentally do, such as `start`, `route`, `follow`, `compare`, `transform`, `accumulate`, `focus`, or `relate`.
- `visual_grammar`: renderer grammar selected from the teaching goal and profile.
- `aspect_ratio`: default `9:16` for social/onboarding.
- `style_profile`: default `song-handdrawn` when no brand system is supplied.
- `language`: inferred from user.
- `must_include`, `must_avoid`, `brand_tokens`, `source_citations`.

## Profile routing

Choose the primary task profile first:
- `beginner-onboarding`: first-use, setup and product/Skill onboarding.
- `technical-architecture`: components, interfaces, data/control flow and boundaries.
- `knowledge-explainer`: concepts and mechanisms.
- `data-comparison`: benchmarks, before/after, ranked choices and metrics.
- `process-guide`: workflows, SOPs, checklists and tutorials.

Then choose an explanatory verb and visual grammar. See `references/visual-grammar-v04.md`.

Default routing:
- beginner-onboarding -> `start/follow` -> `onboarding-path`
- technical-architecture -> `route/connect` -> `node-edge-boundary`
- process-guide -> `follow/check` -> `connected-step-path`
- data-comparison -> `compare/delta` -> `quantitative-comparison`
- knowledge-explainer -> route by verb: transform / branch / accumulate / focus / repeat / relate / compare.

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
Translate source complexity without changing factual meaning.

For first-use audiences prioritize:
1. What is it?
2. What can it do for me?
3. What do I need?
4. How do I start?
5. What happens next?
6. What will I get?
7. What are the limits / next steps?

Avoid dismissive labels such as “小白” or “菜鸟”. Prefer neutral wording such as `入门指南`, `第一次使用`, `快速开始`, `基础指南`.

### 4. Define teaching goal and explanatory verb
Before layout, state what the viewer must mentally do.

Examples:
- onboarding: `start`
- architecture: `route`
- process: `follow`
- comparison: `compare`
- layered mechanism: `accumulate`
- change over stages: `transform`

The explanatory verb is not decoration; it selects the visual grammar.

### 5. Build information architecture
Create one visual thesis and 4–8 supporting modules. Use one dominant hero relationship. Supporting notes are secondary evidence or orientation, not equal-weight cards.

### 6. Build structured visual_data
The render brief may include:
- `steps`: actions, checks, decisions, setup and results;
- `nodes` + `edges`: architecture actors and relationships;
- `metrics`: numeric values, units, roles and display strings;
- `stages`: conceptual stages or layers.

Use structured fields for the main semantic visual. Do not expect the renderer to infer quantitative or graph topology from prose when structured data can be supplied.

### 7. Choose visual grammar
Follow `references/visual-grammar-v04.md`.

Acceptance rule: if a profile has structured semantic data, falling back to `editorial-fallback` is a QA failure.

### 8. Compress copy
Apply progressive disclosure:
- Level 1: title + value proposition.
- Level 2: visual labels and section headings.
- Level 3: short support lines.
- Level 4: caveats/source notes.

Say each idea once. Keep commands, names, numbers and units exact.

### 9. Choose visual style
Default `song-handdrawn` profile:
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

Validate:
```bash
python3 scripts/validate_render_brief.py path/to/render-brief.json
```

A valid render brief is an implementation artifact, not yet the final infographic.

### 11. Render
Guaranteed repository-native path:
```bash
cd runtime
npm install
npx playwright install chromium
node render.mjs ../templates/render-brief.example.json out/infographic.png
```

The deterministic renderer now routes by visual grammar:
- onboarding-path -> product object + setup strip + first-use path + result;
- node-edge-boundary -> architecture nodes, edges and boundary;
- connected-step-path -> explicit sequential flow;
- quantitative-comparison -> dominant metric + direct quantitative marks;
- knowledge grammars -> layered, paired, cycle, or relational structures according to explanatory verb.

The runtime returns `grammar` and `fallback_used` metadata.

### 12. Visual QA
Apply `references/rendered-infographic-qa.md` and verify:
- the topic is understandable within ~3 seconds;
- the primary relationship/path is understandable within ~10 seconds;
- the visual grammar matches the information structure;
- no semantic profile silently falls back to editorial cards when structured data exists;
- no clipped or unreadable text;
- no invented facts;
- exact commands/numbers/units match the claim ledger and render brief;
- mobile reading remains coherent.

## Outputs

Planning:
- `brief`
- `claim-ledger`
- `teaching-goal`
- `explanatory-verb`
- `information-architecture`
- `visual-data`
- `copy-deck`
- `visual-direction`
- `qa-report`

Implementation:
- validated `render-brief.json`
- profile / grammar selection
- renderer handoff instructions

Rendered:
- deterministic `infographic-png`
- render metadata: `grammar`, `fallback_used`
- optional generative-image variant
- optional aspect-ratio variants

## Benchmarks

`benchmarks/infographic-director/` exercises all five profiles:
- beginner onboarding;
- technical architecture;
- process guide;
- data comparison;
- knowledge explainer.

CI validates contracts, renders PNGs, verifies dimensions/guardrails, and fails semantic profiles that unexpectedly use the editorial fallback.

## Quality boundary

A visually attractive image with unsupported facts fails.
A factually correct image with weak hierarchy fails.
A profile label without a matching visual grammar fails.
A semantic visual that collapses back into generic cards fails when structured data exists.

The target is verified content + audience translation + semantic visual grammar + director-grade hierarchy + readable rendering.

## References

- `references/design-principles.md`
- `references/visual-grammar-v04.md`
- `references/renderer-adapter-contract.md`
- `references/rendered-infographic-qa.md`
- `examples/stageshow-onboarding.md`
- `templates/render-brief.example.json`
- `schemas/render-brief.schema.json`
