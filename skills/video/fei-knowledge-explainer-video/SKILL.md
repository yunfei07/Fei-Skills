# fei-knowledge-explainer-video

Use this Skill when the user wants a complex concept turned into a programmable explainer video rather than a generative-video-only prompt.

## Inputs

Required: `topic`, `audience`. Optional: `duration`, `aspect_ratio`, `depth`, `profile`, `narration`, `source_requirements`.

Default profiles: `scientific`, `editorial`, `playful`.

## Workflow

1. Define the one-sentence learning objective.
2. Research and separate verified facts from analogy.
3. Build a concept map and prerequisite order.
4. Write narration beats sized to target duration.
5. Convert each beat into a visual mechanism: SVG, Canvas, DOM, chart, Three.js/WebGL, or typography.
6. Build a scene graph with timing, camera, transitions, labels and sound cues.
7. Apply `shared/creative-core` hierarchy and motion rules.
8. Produce an implementation plan for React/Three.js/Remotion or equivalent runtime.
9. QA for conceptual correctness, label legibility, pacing and visual causality.

## Outputs

Planning: `research-notes`, `concept-map`, `script`, `storyboard`, `scene-graph`, `timeline`.

Implementation when the environment supports coding: project source, assets map, render instructions.

Rendered output such as `video.mp4` may only be claimed after an actual renderer completes successfully.

## Hard rules

Do not use decorative motion when static explanation is clearer. Do not present metaphors as literal mechanism. Do not invent scientific or product facts.
