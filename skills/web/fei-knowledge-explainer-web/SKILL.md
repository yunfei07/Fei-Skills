# fei-knowledge-explainer-web

Use this Skill when the user wants an interactive website that teaches a concept through scroll, step-through interaction, diagrams, data visualization or optional 3D.

## Status

`runnable` as of v0.2.0. The repository includes a React + Vite reference runtime that renders a validated scene graph into an accessible interactive explainer. The reference runtime currently ships DOM/SVG renderers; Three.js/WebGL is an extension point, not a bundled dependency.

## Inputs

Required: `topic`, `audience`.

Optional: `depth`, `chapters`, `profile`, `interaction_level`, `device_priority`, `facts`, `source_notes`.

## Workflow

1. Define one measurable learning objective.
2. Verify factual claims when the topic requires current or specialist knowledge.
3. Build a prerequisite chain and chapter architecture.
4. For each concept choose the minimum adequate medium: text, flow, comparison, SVG diagram, chart, DOM interaction, or optional 3D.
5. Convert the explanation into the scene-graph contract in `schemas/scene-graph.schema.json`.
6. Keep essential meaning available without hover and without motion.
7. Validate the scene graph with `scripts/validate_scene.py`.
8. Preview it in `runtime/` with the bundled React + Vite player.
9. QA keyboard navigation, reduced-motion behavior, mobile reading order, factual correctness and fallback content.

## Scene graph

A project is a sequence of chapters. Each chapter contains scenes. Every scene has:

- `id`, `title`, `summary`
- `kind`: `text`, `flow`, `compare`, or `network`
- optional structured `data`
- optional `narration`
- optional `fallback`

The v0.2 runtime deliberately keeps the contract small. New renderers should extend the scene graph without breaking existing scene kinds.

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
- Do not claim factual verification unless sources were actually checked.
