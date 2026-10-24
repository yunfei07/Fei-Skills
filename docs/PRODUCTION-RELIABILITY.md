# Production Reliability

Fei-Skills uses three automated gates and one visual sign-off gate before a runnable creative skill should be treated as production-ready.

## 1. Contract gate

Run repository tests and validate a canonical shared Scene Graph fixture.

```bash
python3 -m unittest discover -s tests -v
python3 shared/scene-graph/validate_scene.py shared/scene-graph/examples/smoke.json
```

A failure here means the semantic contract, registry, design tokens, or expected runtime interface drifted.

## 2. Build gate

Build both reference runtimes.

```bash
cd skills/web/fei-knowledge-explainer-web/runtime
npm install
npm run build

cd ../../../video/fei-knowledge-explainer-video/runtime
npm install
npm run build
```

The repository currently does not commit npm lockfiles. CI therefore uses `npm install`, not `npm ci`. Pinning and committing lockfiles is a later reproducibility improvement.

## 3. Render gate

The video runtime includes a six-second smoke composition designed to exercise text, chart and real Three.js spatial rendering without making CI unnecessarily expensive.

```bash
cd skills/video/fei-knowledge-explainer-video/runtime
npm run smoke:render
npm run smoke:stills
```

Expected outputs:

- `out/smoke.mp4`
- `out/smoke-first.png`
- `out/smoke-middle.png`
- `out/smoke-final.png`

A successful render proves the composition can be evaluated frame-by-frame and encoded; it does not by itself prove visual quality.

## 4. Song-aesthetic visual sign-off

Review the three exported keyframes against `shared/qa/song-aesthetic-visual-qa.md`.

The first, middle and final frames should preserve the semantic claim without requiring motion. Visual QA is intentionally separate from functional QA: a valid render can still be aesthetically wrong or illegible.

## CI

`.github/workflows/production-ci.yml` runs all three automated gates for pull requests and pushes to `main`. The smoke MP4 and keyframes are uploaded as a workflow artifact for visual review.
