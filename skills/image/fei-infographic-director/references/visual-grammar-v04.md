# Fei Infographic Director v0.4 — Profile-specific Visual Grammar

## Goal

Different information structures must produce materially different visual structures. Profiles are not just content taxonomies; they route to different visual grammars.

## Shared director sequence

`source -> claim ledger -> teaching goal -> profile -> explanatory verb -> visual grammar -> layout grammar -> renderer -> visual QA`

The explanatory verb describes what the viewer must mentally do: orient, follow, compare, branch, accumulate, inspect, transform, or relate.

## beginner-onboarding

Primary verbs: `start`, `follow`, `try`, `get`.

Default grammar: `hero-object + setup-strip + first-action-path + result-preview`.

Required visual distinctions:
- one recognizable product/tool object;
- a compact prerequisite/setup strip;
- one dominant first-use path;
- a distinct result/output zone;
- terminal commands displayed as actions, not generic cards.

## technical-architecture

Primary verbs: `route`, `connect`, `contain`, `exchange`.

Default grammar: `node-edge-boundary`.

Required visual distinctions:
- components render as nodes;
- relationships render as edges with direction;
- system boundaries render as enclosing regions;
- external actors sit outside the core boundary;
- supporting notes stay outside the architecture hero.

## process-guide

Primary verbs: `follow`, `repeat`, `branch`, `check`.

Default grammar: `connected-step-path`.

Required visual distinctions:
- numbered steps form one visible path;
- branches only appear for real decisions;
- checkpoints use a marker distinct from actions;
- optional tips are subordinate to the path.

## data-comparison

Primary verbs: `compare`, `rank`, `measure`, `delta`.

Default grammar: `big-number + direct-comparison + caveat`.

Required visual distinctions:
- one primary metric is visually dominant;
- at least one quantitative mark type is used: bar, proportion, delta arrow, dot, slope, or paired value;
- units and scope stay attached to values;
- numeric marks come from structured `visual_data` when available.

## knowledge-explainer

Route by explanatory verb:
- `transform` -> before/after or stage transition;
- `branch` -> tree / decision grammar;
- `accumulate` -> layers / stack grammar;
- `focus` -> context + zoom / reveal grammar;
- `repeat` -> cycle grammar;
- `relate` -> spatial / node grammar;
- `compare` -> paired / small-multiple grammar.

## Fallback

If profile-specific structured fields are missing, the renderer may use the editorial fallback, but must return `fallback_used: true`. Benchmark QA should expose fallback usage rather than hiding the loss of semantic visualization.
