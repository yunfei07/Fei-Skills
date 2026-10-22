# fei-knowledge-explainer-video

Use this Skill when the user wants a complex concept turned into a programmable explainer video rather than a generative-video-only prompt.

## Status

`runnable` as of v0.3.0. The repository includes a React + Remotion reference runtime. The default visual profile is `song-aesthetic`, sourced from `shared/design-systems/song-aesthetic/`.

## Inputs

Required: `topic`, `audience`.

Optional: `duration`, `aspect_ratio`, `depth`, `profile`, `narration`, `source_requirements`.

Default: `profile = song-aesthetic`.

## Shared scene graph

The canonical semantic contract is now `shared/scene-graph/`.

Supported kinds:

- `text`
- `flow`
- `compare`
- `network`
- `chart`
- `spatial`

Web and Video should consume the same scene meaning. Layout, interaction, timing and export belong to the renderer, not the semantic graph.

`spatial` scenes require deterministic point coordinates, semantic `meaning`, a camera definition when needed, and readable fallback text. Depth must encode a named relationship; decorative 3D is not sufficient.

## Workflow

1. Define the one-sentence learning objective.
2. Research and separate verified facts from analogy.
3. Build a concept map and prerequisite order.
4. Write narration beats sized to target duration.
5. Convert each beat into `shared/scene-graph` v0.3.
6. Validate the graph with `shared/scene-graph/validate_scene.py`.
7. Read `shared/design-systems/song-aesthetic/README.md` and `tokens.json` before styling.
8. Assign duration per scene and keep one primary motion per shot.
9. Preview in Remotion Studio.
10. Render MP4 only after scene meaning, labels, pacing and fallback text pass QA.
11. Do not claim `video.mp4` exists until an actual render completes successfully.

## Spatial renderer

v0.3 includes a deterministic Three.js renderer using `@remotion/three`.

Rules:

- Three scene state is driven from Remotion `useCurrentFrame()`.
- Do not use `useFrame()`, independent `requestAnimationFrame`, or runtime randomness for scene truth.
- `<ThreeCanvas>` must receive explicit composition `width` and `height`.
- Song-aesthetic spatial material defaults are matte, low-saturation and non-metallic.
- Camera motion is restricted to `static`, `slow-push`, `slow-pull`, or restrained `lateral` movement.
- A semantic text/static fallback remains mandatory even when WebGL rendering succeeds.
- If SVG/DOM communicates the relationship equally well, do not use 3D.

## Run

From `skills/video/fei-knowledge-explainer-video/runtime`:

```bash
npm install
npm run studio
```

Render the bundled reference composition:

```bash
npm run render
```

The default composition is `FeiKnowledgeExplainer`, 1920×1080 at 30 fps.

Validate a shared scene JSON:

```bash
python3 ../../../../shared/scene-graph/validate_scene.py path/to/scene.json
```

## Song aesthetic rules

- Large negative space and paper-toned backgrounds.
- Song-green / pale-cyan / ink hierarchy; no saturated neon accents.
- Serif-led editorial titles and restrained line-based diagrams.
- Prefer dissolve, paper fade, line growth and slow positional motion.
- No bounce, spin, trailer-hit typography, glassmorphism or decorative pseudo-historical motifs.
- Charts use sparse axes and direct visual emphasis.
- Spatial content uses matte geometry and restrained camera movement.

## Outputs

Planning: `research-notes`, `concept-map`, `script`, `storyboard`, `scene-graph`, `timeline`.

Runnable: Remotion project source, SVG/DOM renderers, deterministic Three.js spatial renderer and composition preview.

Rendered output such as `video.mp4` may only be claimed after an actual renderer completes successfully.

## Hard rules

Do not use decorative motion when static explanation is clearer. Do not present metaphors as literal mechanisms. Do not invent scientific or product facts. Do not trade legibility for style. Do not use 3D without an explicit semantic reason.
