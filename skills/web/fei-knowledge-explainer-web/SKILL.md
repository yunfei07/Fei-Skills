# fei-knowledge-explainer-web

Use this Skill when the user wants an interactive website that teaches a concept through scroll, direct manipulation, diagrams, data visualization or 3D.

## Inputs

Required: `topic`, `audience`. Optional: `depth`, `chapters`, `profile`, `interaction_level`, `device_priority`.

## Workflow

1. Define learning objective and prerequisite chain.
2. Verify factual content where necessary.
3. Build chapter architecture.
4. For each concept, choose the minimum adequate medium: text, SVG, Canvas, chart, DOM, Three.js/WebGL.
5. Define interactions only where user manipulation improves understanding.
6. Build scene/state graph for scroll or step-through transitions.
7. Apply responsive, accessibility and performance constraints before decorative effects.
8. Produce implementation plan or actual React/Next.js/Vite source when tools permit.
9. QA keyboard use, reduced-motion behavior, mobile reading flow and factual correctness.

## Outputs

`content-outline`, `concept-map`, `interaction-spec`, `scene-graph`, `design-tokens`, `component-map`, optional project source/build.

## Hard rules

Do not hide essential explanation behind hover-only UI. Scroll animation must not trap navigation. Provide non-3D fallback when WebGL is not essential.
