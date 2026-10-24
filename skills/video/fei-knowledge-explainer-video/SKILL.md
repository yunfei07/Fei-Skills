# fei-knowledge-explainer-video

Use this Skill when the user wants a complex concept turned into a programmable explainer video rather than a generative-video-only prompt.

## Status

`runnable` as of v0.5.0. The repository includes a React + Remotion runtime, shared director grammar and deterministic Three.js spatial rendering. Default profile: `song-aesthetic`.

## Inputs

Required: `topic`, `audience`.

Optional: `duration`, `aspect_ratio`, `depth`, `profile`, `narration`, `source_requirements`.

## Director-first workflow

The Skill must reason like a visual explanation director before acting like a renderer.

1. Define the one-sentence learning objective.
2. Research and separate verified fact, measured data, schematic structure and illustration.
3. Build the prerequisite chain and teaching sequence.
4. For each important mechanism, state the **explanatory verb**: transform, branch, weight, compare, repeat, focus, accumulate, or spatially relate.
5. Choose `visual_grammar` from `shared/visual-grammar/` before choosing SVG, DOM or Three.js.
6. Create a `director` plan: one focal relationship, reading order, transition, evidence type and `stable_frame`.
7. Choose `motion_grammar` from `shared/motion-grammar/song-aesthetic/` only when time helps reveal order, causality or relation.
8. Convert the plan into canonical `shared/scene-graph` v0.3 and validate it.
9. Choose the concrete renderer only after the visual mechanism is established.
10. Assign scene duration with a stable reading plateau occupying at least half of the scene.
11. Preview in Remotion Studio, inspect director stable frames, then render the full MP4.
12. Do not claim a rendered artifact until the renderer succeeds.

Required causal chain:

`knowledge claim -> teaching strategy -> explanatory verb -> visual grammar -> director plan -> motion grammar -> renderer -> stable-frame QA`

## Director-grade visual mechanisms

- `projection-split`: visually branch one representation into learned projections, show the operation path and recombination.
- `attention-map`: line strength or opacity carries relationship weight while exact values remain readable.
- `parallel-heads`: a shared input visibly fans into independent paths and visibly merges again.
- `layer-stack`: internal sublayers, residual bypasses and repeated blocks are spatially legible.
- `process-flow`, `comparison`, `focus-reveal`: semantic grammars that may use generic renderers until a dedicated mechanism adds explanatory value.

A new renderer is not a new grammar. A grammar is accepted only when it expresses a reusable explanatory verb.

## Shared scene graph

Canonical semantic contract: `shared/scene-graph/`.

Renderer-neutral kinds remain:

- `text`
- `flow`
- `compare`
- `network`
- `chart`
- `spatial`

Important mechanism scenes should also specify `visual_grammar`, optional `motion_grammar`, and `director` metadata. Web and Video should preserve the same scene meaning even when layout and timing differ.

## Song motion grammar

Song motion is restrained but not static. Preferred verbs include:

- `ink-line-grow`: reveal a causal or relational path.
- `layered-emergence`: reveal semantic layers in reading order.
- `focus-reveal`: raise contrast on the focal relationship while context stays quiet.
- `quiet-parallel`: stagger parallel paths, then let them settle together.
- `paper-dissolve`: low-contrast transition between scenes; never the only explanatory motion.

Avoid bounce, spin, elastic overshoot, constant ambient movement and dramatic scale changes.

## Spatial renderer

Use Three.js only when depth carries a named semantic relationship.

- Three scene state is driven from Remotion `useCurrentFrame()`.
- Do not use independent `requestAnimationFrame`, runtime randomness or cosmetic orbiting for scene truth.
- Song spatial materials are matte, low-saturation and non-metallic.
- Camera motion is restricted and must have a named explanatory purpose.
- A semantic 2D/text fallback remains mandatory.
- If SVG/DOM communicates the relationship equally well, do not use 3D.

## Run

From `skills/video/fei-knowledge-explainer-video/runtime`:

```bash
npm install
npm run studio
```

Render:

```bash
npm run render
```

Validate shared scene JSON:

```bash
python3 ../../../../shared/scene-graph/validate_scene.py path/to/scene.json
```

## Outputs

Planning: `research-notes`, `concept-map`, `teaching-strategy`, `director-plan`, `script`, `storyboard`, `scene-graph`, `timeline`.

Runnable: Remotion project source, SVG/DOM director renderers, deterministic Three.js spatial renderer and composition preview.

Rendered output such as `video.mp4` may only be claimed after an actual renderer completes successfully.

## Hard rules

- Never choose a renderer before identifying the explanatory verb and visual grammar.
- Every important mechanism scene must be understandable at its `stable_frame`.
- Motion must stage comprehension, not decorate a static slide.
- Do not present metaphors or illustrative weights as measured mechanism output.
- Do not invent scientific or product facts.
- Do not use 3D without explicit semantic value.
- Do not trade legibility for Song styling or cinematic motion.
