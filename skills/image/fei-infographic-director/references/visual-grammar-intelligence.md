# Visual Grammar Intelligence — v0.5

## Goal

Choose how to explain before choosing how to decorate.

v0.5 adds a repository-native planning layer that can infer a visual plan from source-derived content when `profile`, `explanatory_verb`, `visual_grammar`, or `visual_data` are not explicitly supplied.

## Planner output

The planner returns:
- `profile`
- `explanatory_verb`
- `visual_grammar`
- `visual_data`
- `visual_plan.mode`
- `visual_plan.confidence`
- `visual_plan.rationale`
- `visual_plan.warnings`

The planner is an implementation heuristic, not a factual source. It may organize verified claims, but it must not invent claims.

## Reasoning order

1. Read the teaching goal and section purposes.
2. Detect the dominant reader task.
3. Choose the primary profile.
4. Choose the explanatory verb.
5. Map the verb/profile to a visual grammar.
6. Extract structured `visual_data` from verified content.
7. Report confidence and warnings.
8. Render only after the plan is inspectable.

## Profile signals

### beginner-onboarding
Signals: installation, prerequisites, first use, setup, getting started.
Default grammar: `onboarding-path`.

### technical-architecture
Signals: architecture, system, components, client/server, Router/Worker, interfaces, protocol relations.
Default grammar: `node-edge-boundary`.

### process-guide
Signals: ordered actions, workflow, steps, checks, create/run/open/submit actions.
Default grammar: `connected-step-path`.

### data-comparison
Signals: two or more quantitative values plus comparison/delta language.
Default grammar: `quantitative-comparison`.

### knowledge-explainer
Used when the primary task is conceptual explanation rather than setup, architecture, operations, or metric comparison.
The explanatory verb selects the grammar.

## Explanatory verbs

- `compare` -> `paired-comparison`
- `transform` -> `before-after`
- `branch` -> `decision-tree`
- `repeat` -> `cycle`
- `accumulate` -> `layer-stack`
- `focus` -> `focus-reveal`
- `relate` -> `spatial-relations`

## Confidence policy

Confidence is a planning confidence score, not a probability that the underlying facts are true.

- High confidence: strong profile signal + useful structured visual data.
- Medium confidence: plausible dominant relationship but some ambiguity.
- Low confidence: competing relationships or insufficient structure.

When confidence is low, add a warning and keep the plan inspectable. Do not silently claim certainty.

## Factual boundary

The planner may infer:
- which verified claims should be compared;
- which verified stages should be ordered;
- which verified entities should become diagram nodes;
- which teaching relationship is dominant.

The planner must not infer:
- missing benchmark values;
- undocumented system topology as factual deployment architecture;
- causal relationships absent from the source;
- rankings not supported by the supplied evidence.

## Runtime

Planning only:

```bash
cd runtime
node visual-planner.mjs input.json planned.json
```

Automatic plan + render:

```bash
node auto-render.mjs input.json out/infographic.png
```

Planner regression:

```bash
npm run benchmark:planner
```

End-to-end automatic planning regression:

```bash
npm run benchmark:auto
```
