# fei-knowledge-explainer-video

Use this Skill when the user wants a complex concept turned into a programmable explainer video rather than a generative-video-only prompt.

## Status

`runnable` as of v0.2.0. The repository includes a React + Remotion reference runtime. The default visual profile is `song-aesthetic`, sourced from `shared/design-systems/song-aesthetic/`.

## Inputs

Required: `topic`, `audience`.

Optional: `duration`, `aspect_ratio`, `depth`, `profile`, `narration`, `source_requirements`.

Default: `profile = song-aesthetic`.

## Shared scene graph

The video runtime is designed to consume the same conceptual scene kinds used by `fei-knowledge-explainer-web` v0.3:

- `text`
- `flow`
- `compare`
- `network`
- `chart`
- `spatial`

The current Remotion renderer directly supports text, flow, compare, network and chart. `spatial` is rendered as a semantic static projection fallback in v0.2; Three.js video rendering remains an extension point.

## Workflow

1. Define the one-sentence learning objective.
2. Research and separate verified facts from analogy.
3. Build a concept map and prerequisite order.
4. Write narration beats sized to target duration.
5. Convert each beat into the shared scene graph.
6. Read `shared/design-systems/song-aesthetic/README.md` and `tokens.json` before styling.
7. Assign duration per scene and keep one primary motion per shot.
8. Preview in Remotion Studio.
9. Render MP4 only after the scene graph, labels, pacing and fallback text pass QA.
10. Do not claim `video.mp4` exists until an actual render completes successfully.

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

## Song aesthetic rules

- Large negative space and paper-toned backgrounds.
- Song-green / pale-cyan / ink hierarchy; no saturated neon accents.
- Serif-led editorial titles and restrained line-based diagrams.
- Prefer dissolve, paper fade, line growth and slow positional motion.
- No bounce, spin, trailer-hit typography, glassmorphism or decorative pseudo-historical motifs.
- Charts use sparse axes and direct visual emphasis.
- Spatial content must keep a readable 2D or text fallback.

## Outputs

Planning: `research-notes`, `concept-map`, `script`, `storyboard`, `scene-graph`, `timeline`.

Runnable: Remotion project source and composition preview.

Rendered output such as `video.mp4` may only be claimed after an actual renderer completes successfully.

## Hard rules

Do not use decorative motion when static explanation is clearer. Do not present metaphors as literal mechanisms. Do not invent scientific or product facts. Do not trade legibility for style.
