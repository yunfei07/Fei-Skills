# Fei Shared Scene Graph

This directory is the cross-medium semantic contract for Fei-Skills explanatory artifacts.

## Purpose

The scene graph describes **meaning before renderer**. Web, video and static exporters should consume the same conceptual structure, then adapt layout, timing and interaction to their medium.

Current contract version: `0.3`.

Supported scene kinds:

- `text` — a verbal or symbolic idea that needs no diagram.
- `flow` — ordered transformation or process.
- `compare` — two-side contrast.
- `network` — connected layered or node structure.
- `chart` — quantitative series or comparison.
- `spatial` — a scene where depth materially contributes to explanation.

## Required semantics

Every scene requires `id`, `title`, `summary`, and `kind`.

Every visual scene should include `fallback`. The fallback is the semantic equivalent used for accessibility, reduced capability, static export, or renderer failure. It is not decorative alt text.

`duration` is optional at the shared level. Video runtimes may use it as seconds; Web runtimes may ignore it.

## Spatial contract

`spatial.data` may contain:

```json
{
  "points": [
    {"x": -1.2, "y": 0.4, "z": 0.2, "size": 0.13},
    {"x": 0.8, "y": -0.2, "z": -0.7, "size": 0.11}
  ],
  "camera": {
    "position": [0, 0, 6],
    "target": [0, 0, 0],
    "motion": "slow-push"
  },
  "meaning": "Distance represents similarity in the illustrative embedding."
}
```

Rules:

- Coordinates must be deterministic input data or deterministic transforms; do not use runtime randomness.
- Perspective or depth must encode a named relationship. Cosmetic 3D is not sufficient.
- `meaning` must state what position/depth means and what it must not be interpreted as.
- A readable `fallback` remains mandatory.
- Camera motion should be single-purpose and slow. Song-aesthetic defaults prohibit orbiting for spectacle.

## Renderer ownership

The shared graph owns semantics only. Renderers own:

- responsive layout and interaction on Web;
- frame timing, transitions and export in Video;
- static key-frame composition in SVG/PNG/PDF exporters.

A renderer may simplify a scene but must not change the claim encoded by the graph.
