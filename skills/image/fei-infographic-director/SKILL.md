# Fei Infographic Director

## Purpose

Turn a URL, repository, document, dataset, or supplied notes into a high-quality, source-aware infographic for social media, education, onboarding, or product explanation.

This Skill is not a single image prompt. It is a director workflow that separates factual extraction, information architecture, visual hierarchy, style direction, rendering, and QA.

## Status

`workflow` as of v0.2.0. The source-to-render-brief pipeline, five audience/task profiles, schema validation, benchmark briefs and CI validation are implemented. Repository-native image rendering and rendered-image QA are not yet implemented, so this Skill must not claim autonomous PNG production without an available renderer.

## Trigger

Use when the user asks to:
- create an infographic, visual explainer, onboarding guide, cheat sheet, comparison poster, process map, or architecture explainer;
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
- `aspect_ratio`: default `9:16` for social/onboarding.
- `style_profile`: default `song-handdrawn` when no brand system is supplied.
- `language`: inferred from user.
- `must_include`, `must_avoid`, `brand_tokens`, `source_citations`.

## Profile routing

Choose the task profile before composing:
- `profiles/beginner-onboarding.md`: first-use, setup and product/Skill onboarding.
- `profiles/technical-architecture.md`: components, interfaces, data/control flow and system boundaries.
- `profiles/knowledge-explainer.md`: concepts, mechanisms and educational explanation.
- `profiles/data-comparison.md`: benchmarks, before/after, ranked choices and metric-led comparison.
- `profiles/process-guide.md`: workflows, SOPs, checklists and tutorials.

If more than one applies, choose the profile that matches the viewer's primary decision or learning task. Secondary modules may borrow another profile's pattern without changing the primary profile.

## Execution

### 1. Parse the brief
Identify source, audience, desired action, publishing surface, size, language, constraints, and whether facts require external verification.

Do not force the user to answer questions already resolved by context. Ask only when missing information materially changes factual correctness or usability.

### 2. Research and claim ledger
When the infographic contains factual claims:
1. Read the primary source first.
2. Extract only claims needed for the visual story.
3. Record each claim as `verified`, `source-derived`, or `inference`.
4. Never invent statistics, benchmark results, installation commands, version requirements, sources, or conclusions.
5. Prefer official documentation/repositories for installation and usage instructions.

Output planning artifact: `claim-ledger.md` or equivalent structured notes.

### 3. Audience translation
Translate source complexity to the audience without changing factual meaning.

For beginner/general audiences prioritize these questions in order:
1. What is it?
2. What can it do for me?
3. What do I need before starting?
4. How do I install/start it?
5. How do I use it the first time?
6. What happens behind the scenes?
7. What will I get?
8. What are the limits / FAQ / next steps?

Avoid labels that can feel condescending (for example, calling the audience “小白”). Prefer neutral wording such as `入门指南`, `第一次使用`, `快速开始`, `基础指南`.

### 4. Build information architecture
Create a single visual thesis and 4–8 supporting modules.

Default hierarchy:
- Hero: one sentence that explains the value.
- Orientation: what it is / what it does.
- Action path: setup → install → first prompt/action → result.
- System path: simplified internal workflow when useful.
- Output gallery: concrete deliverables.
- Trust layer: limitations, source note, FAQ, or next steps.

Use one hero object and at most one or two strong satellites. Do not make every module equal weight.

### 5. Compress copy
Apply progressive disclosure:
- Level 1: title + value proposition.
- Level 2: section headings + action verbs.
- Level 3: short supporting lines.
- Level 4: caveats/source notes in the footer.

Rules:
- Say each idea once.
- One dominant number or command at most per section.
- Prefer short labels over paragraphs.
- Keep commands/code exact.
- Preserve important qualifiers.

### 6. Choose visual profile
Default `song-handdrawn` profile:
- warm off-white / xuan-paper-like ground;
- ink-black primary text and linework;
- pale celadon / sage / gray-green system accents;
- very limited warm-yellow emphasis for actions/warnings;
- hand-drawn watercolor/ink illustration language;
- restrained bamboo, mist, mountain, botanical accents only where they support composition;
- generous negative space;
- no gratuitous AI sparkle/purple-tech decoration;
- technical objects (terminal, browser, laptop, phone, flow arrows) remain recognizable.

The aesthetic must never reduce text legibility or factual precision. Reuse `shared/creative-core/`, `shared/visual-grammar/` and `shared/qa/song-aesthetic-visual-qa.md` rather than creating conflicting local rules.

### 7. Compose the infographic
For a 9:16 onboarding/explainer poster, prefer:
- top 20–28%: title, value proposition, hero illustration;
- middle 45–55%: installation/action workflow and first-use formula;
- lower 20–30%: outputs, FAQ, advanced learning, limitations/source note.

Use connectors to show causality. Avoid a uniform grid of cards when a flow or hierarchy communicates better.

### 8. Build and validate render brief
Produce a renderer-neutral JSON render brief that conforms to `schemas/render-brief.schema.json`.

The render brief must specify:
- exact required text;
- prohibited strings;
- hierarchy and placement;
- aspect ratio and task profile;
- visual profile and illustration language;
- factual numbers/commands that must not be altered;
- QA expectations.

Validate it before rendering:

```bash
python3 scripts/validate_render_brief.py path/to/render-brief.json
```

A valid render brief is an implementation artifact, not a rendered infographic.

### 9. Render
Pass the validated render brief to an available image renderer. Preserve `exact_strings` verbatim and respect `prohibited_strings`.

If no renderer is available, stop at planning/implementation artifacts and state that no rendered PNG was produced.

### 10. Visual QA
Review the rendered artifact at full size and thumbnail size.

Acceptance gates:
- viewer understands the topic within ~3 seconds;
- viewer can find the primary action path within ~10 seconds;
- title and section hierarchy are unambiguous;
- no clipped or unreadable text;
- no duplicated concepts;
- no invented facts;
- exact commands/numbers match the claim ledger and render brief;
- beginner-facing wording is respectful and neutral;
- decorative elements do not compete with instructional content;
- output remains coherent on a phone screen.

If text rendering is unreliable, simplify copy and re-render rather than shrinking typography.

## Outputs

Planning artifacts:
- `brief`
- `claim-ledger`
- `information-architecture`
- `copy-deck`
- `visual-direction`
- `qa-report`

Implementation artifacts:
- validated `render-brief.json`
- profile selection
- renderer handoff instructions

Rendered artifacts when a renderer is available:
- `infographic-png`
- optional aspect-ratio variants

## Benchmarks

`benchmarks/infographic-director/` currently exercises:
- beginner onboarding;
- technical architecture;
- data comparison.

CI validates the template and all benchmark render briefs against the schema and local guardrails.

## Quality boundary

A visually attractive image with unsupported facts fails this Skill.
A factually correct image with weak hierarchy also fails this Skill.
A valid JSON brief without an actual renderer is not a final infographic.
The target is verified content + audience translation + director-grade hierarchy + readable rendering.

## References

- `references/design-principles.md`
- `examples/stageshow-onboarding.md`
- `templates/render-brief.example.json`
- `schemas/render-brief.schema.json`
