# fei-knowledge-explainer-web

Use this Skill when the user wants an interactive website that teaches a concept through scroll, step-through interaction, diagrams, data visualization or restrained 3D.

## Status

`runnable` as of v0.3.0. The repository includes a React + Vite reference runtime that renders a validated scene graph into an accessible interactive explainer.

The default visual profile is `song-aesthetic`, defined in `profiles/song-aesthetic.md`. This profile treats Song aesthetics as a digital design system based on whitespace, pale cyan/green tones, editorial rhythm, fine-line structure and restrained motion. It must not reduce the style to decorative pseudo-historical motifs.

## Inputs

Required: `topic`, `audience`.

Optional: `depth`, `chapters`, `profile`, `interaction_level`, `device_priority`, `facts`, `source_notes`.

Default: `profile = song-aesthetic`.

## Workflow

1. Define one measurable learning objective.
2. Verify factual claims when the topic requires current or specialist knowledge.
3. Build a prerequisite chain and chapter architecture.
4. For each concept choose the minimum adequate medium: text, flow, comparison, network, chart, DOM interaction, or spatial 3D.
5. Apply the selected visual profile before visual composition. When no profile is supplied, use `song-aesthetic`.
6. Convert the explanation into the scene-graph contract in `schemas/scene-graph.schema.json`.
7. Keep essential meaning available without hover, motion or WebGL.
8. Validate the scene graph with `scripts/validate_scene.py`.
9. Preview it in `runtime/` with the bundled React + Vite player.
10. QA keyboard navigation, reduced-motion behavior, mobile reading order, factual correctness and fallback content.

## Scene graph

A project is a sequence of chapters. Each chapter contains scenes. Every scene has:

- `id`, `title`, `summary`
- `kind`: `text`, `flow`, `compare`, `network`, `chart`, or `spatial`
- optional structured `data`
- optional `narration`
- visual scenes require semantic `fallback`

`chart` uses a restrained SVG renderer. `spatial` uses Three.js and must only be chosen when spatial depth materially improves explanation.

## Song aesthetic routing

Read `profiles/song-aesthetic.md` before authoring visual or motion decisions. In particular:

- preserve large negative space and a continuous reading flow;
- favor paper, ink, Song-green and pale-cyan tones over saturated accents;
- use thin rules rather than nested cards;
- use serif-led editorial hierarchy rather than oversized SaaS typography;
- prefer fade, line growth and slow positional movement over bounce, spin or dramatic scale;
- charts and networks must remain sparse and legible;
- spatial scenes use matte materials, restrained depth and slow cameras;
- do not add seals, scroll frames, brush-calligraphy effects or ornamental Chinese motifs unless the content itself requires them.

## Run

From `skills/web/fei-knowledge-explainer-web/runtime`:

```bash
npm install
npm run dev
```

Validate an example before previewing:

```bash
python3 ../scripts/validate_scene.py ../examples/neural-network-basics.json
```

Production build:

```bash
npm run build
```

## Outputs

Required planning artifacts: `content-outline`, `concept-map`, `interaction-spec`, `scene-graph`, `design-tokens`, `component-map`.

Runnable artifacts: React project source, validated scene JSON and static Vite build.

## Hard rules

- Do not hide essential explanation behind hover-only UI.
- Scroll or step animation must not trap navigation.
- Respect `prefers-reduced-motion`.
- Provide a readable fallback for any visual renderer.
- Do not use WebGL when SVG/DOM communicates the concept equally well.
- Song-aesthetic styling must not weaken information hierarchy or factual clarity.
- Do not claim factual verification unless sources were actually checked.
