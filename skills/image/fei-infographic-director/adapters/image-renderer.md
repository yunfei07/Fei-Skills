# Image Renderer Adapter Contract

This adapter describes how an Agent hands a validated `render-brief.json` to an available image-generation system. It is tool-agnostic; concrete platforms may expose different invocation APIs.

## Input
A render brief that has passed `scripts/validate_render_brief.py`.

## Required mapping

### 1. Preserve exact strings
Every item in `exact_strings` must be requested verbatim. Commands, versions, metrics, units, product names and identifiers must not be rewritten for visual style.

### 2. Enforce prohibited strings
Every item in `prohibited_strings` must be explicitly excluded from visible copy.

### 3. Convert structure, not facts
Translate `hero`, `sections`, `visual` and `qa` into composition and art-direction instructions. Do not add factual claims not present in the brief or claim ledger.

### 4. Keep typography readable
If the requested content is too dense for the target aspect ratio, reduce secondary copy or split variants. Do not solve density by shrinking important text below practical mobile readability.

### 5. Preserve information hierarchy
The renderer instruction must identify:
- first focal point;
- second reading path;
- action/evidence/output areas;
- footer/caveat area when present.

### 6. Style is subordinate
The `song-handdrawn` profile may influence material, line, palette and atmosphere, but cannot alter the meaning of diagrams, commands, values or UI controls.

## Generation loop

1. Generate first render from the validated brief.
2. Inspect the actual image, not only the prompt.
3. Run rendered-image QA from `references/rendered-image-qa.md`.
4. If copy is wrong, correct only the affected copy/layout while preserving the approved visual direction.
5. Re-render until all hard gates pass or report the unresolved limitation.

## Artifact boundary
A successful renderer call produces a candidate rendered artifact, not an approved artifact. Approval requires rendered-image QA.
