# Fei Infographic Director

## Purpose

Turn a URL, repository, document, dataset, or supplied notes into a high-quality, source-aware infographic for social media, education, onboarding, or product explanation.

This Skill is not a single image prompt. It is a director workflow that separates factual extraction, information architecture, visual hierarchy, style direction, rendering, and QA.

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
- `aspect_ratio`: default `9:16` for social/onboarding.
- `style_profile`: default `song-handdrawn` when no brand system is supplied.
- `language`: inferred from user.
- `must_include`, `must_avoid`, `brand_tokens`, `source_citations`.

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

The aesthetic must never reduce text legibility or factual precision.

### 7. Compose the infographic
For a 9:16 onboarding/explainer poster, prefer:
- top 20–28%: title, value proposition, hero illustration;
- middle 45–55%: installation/action workflow and first-use formula;
- lower 20–30%: outputs, FAQ, advanced learning, limitations/source note.

Use connectors to show causality. Avoid a uniform grid of cards when a flow or hierarchy communicates better.

### 8. Render
Produce a `render-brief` that is directly usable by the available image renderer.

The render brief must specify:
- exact required text;
- hierarchy and placement;
- aspect ratio;
- visual profile;
- illustration subjects;
- factual numbers/commands that must not be altered;
- prohibited wording/elements.

If no renderer is available, stop at planning/implementation artifacts and state that no rendered PNG was produced.

### 9. Visual QA
Review the rendered artifact at full size and thumbnail size.

Acceptance gates:
- viewer understands the topic within ~3 seconds;
- viewer can find the primary action path within ~10 seconds;
- title and section hierarchy are unambiguous;
- no clipped or unreadable text;
- no duplicated concepts;
- no invented facts;
- exact commands/numbers match the claim ledger;
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
- `render-brief`
- `qa-report`

Rendered artifacts when a renderer is available:
- `infographic-png`
- optional aspect-ratio variants

## Quality boundary

A visually attractive image with unsupported facts fails this Skill.
A factually correct image with weak hierarchy also fails this Skill.
The target is verified content + audience translation + director-grade hierarchy + readable rendering.

## Reference

See `references/design-principles.md` and `examples/stageshow-onboarding.md`.