# fei-knowledge-explainer-web

Use this Skill when the user wants an interactive website that teaches a concept through step-through interaction, diagrams, data visualization or restrained 3D.

## Status

`runnable` as of v0.4.0. The repository includes a React + Vite reference runtime. The default visual profile is `song-aesthetic`.

## Inputs

Required: `topic`, `audience`.

Optional: `depth`, `chapters`, `profile`, `interaction_level`, `device_priority`, `facts`, `source_notes`.

Default: `profile = song-aesthetic`.

## Director-first workflow

The Skill must not jump directly from a concept to a renderer.

1. Define one measurable learning objective.
2. Verify factual claims when the topic requires current or specialist knowledge.
3. Build the prerequisite chain and teaching sequence.
4. For every important mechanism, state the **explanatory verb**: transform, branch, weight, compare, repeat, focus, accumulate, or spatially relate.
5. Choose a reusable `visual_grammar` from `shared/visual-grammar/`. Prefer the simplest grammar that makes the mechanism visible.
6. Create a `director` plan with one focal relationship, intended reading order, evidence type and `stable_frame`.
7. Choose `motion_grammar` only when temporal staging improves comprehension. Read `shared/motion-grammar/song-aesthetic/` for Song motion rules.
8. Only now choose the concrete renderer: DOM, SVG, Canvas or Three.js.
9. Convert the result to the canonical `shared/scene-graph/` contract and validate it.
10. Preview the Web runtime and inspect the director-designated stable scenes.
11. QA keyboard navigation, reduced motion, mobile reading order, factual correctness, fallback content and visual causality.

The required causal chain is:

`knowledge claim -> teaching strategy -> explanatory verb -> visual grammar -> director plan -> motion grammar -> renderer`

## Visual grammar

Director-grade mechanisms currently include:

- `projection-split`: one representation branches into learned projections and recombines.
- `attention-map`: line strength/opacity encodes weighted relationships.
- `parallel-heads`: shared input fans into parallel learned paths and merges.
- `layer-stack`: structured sublayers and repetition are the claim.
- `process-flow`, `comparison`, `focus-reveal`: semantic grammars that may use generic renderers until a dedicated renderer adds clear explanatory value.

Do not add a new grammar merely to create a new look. A grammar must name a reusable explanatory verb.

## Scene graph

Canonical contract: `shared/scene-graph/`.

Scene kinds remain renderer-neutral: `text`, `flow`, `compare`, `network`, `chart`, `spatial`.

Important mechanism scenes should additionally provide:

- `visual_grammar`
- `motion_grammar` when temporal staging is useful
- `director.focus`
- `director.reading_order` when order matters
- `director.evidence`: `literal`, `measured`, `schematic`, or `illustrative`
- `director.stable_frame` for QA
- semantic `fallback`

## Song aesthetic routing

- Preserve large negative space and continuous reading flow.
- Favor paper, ink, Song-green and pale-cyan tones over saturated accents.
- Use thin rules rather than nested cards.
- Use serif-led editorial hierarchy rather than oversized SaaS typography.
- Prefer line growth, layered emergence, focus reveal and quiet parallel motion over bounce, spin or dramatic scale.
- Charts and networks must remain sparse and legible.
- Spatial scenes use matte materials, restrained depth and slow cameras.
- Do not add seals, scroll frames, brush-calligraphy effects or ornamental Chinese motifs unless the content itself requires them.

## Run

From `skills/web/fei-knowledge-explainer-web/runtime`:

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## Outputs

Planning: `content-outline`, `concept-map`, `teaching-strategy`, `director-plan`, `interaction-spec`, `scene-graph`, `design-tokens`, `component-map`.

Runnable: React project source, validated scene JSON and static Vite build.

## Hard rules

- The renderer is chosen after the explanatory verb and visual grammar, never before.
- An important mechanism scene must remain understandable as a stable still.
- Motion must encode order, causality, relation or emphasis; decorative ambient motion is a regression.
- Do not hide essential explanation behind hover-only UI.
- Respect `prefers-reduced-motion`.
- Provide a readable fallback for every visual renderer.
- Do not use WebGL when SVG/DOM communicates the concept equally well.
- Do not present illustrative geometry or weights as measured evidence.
- Song-aesthetic styling must not weaken factual clarity or hierarchy.
