# Rendered Infographic QA

Use after an actual image has been generated. This checklist evaluates the rendered pixels, not the render brief.

## Hard gates
Fail the render if any item is true:
- an `exact_string` is missing, altered, misspelled or visually ambiguous;
- a prohibited string appears;
- a factual number, unit, command, version, product name or limitation differs from the approved brief;
- important text is clipped, overlapped, illegible or rendered as nonsense glyphs;
- a diagram implies a factual relationship not supported by the source;
- the main action path cannot be followed on a phone-sized view;
- decorative imagery competes with or obscures instructional content.

## Hierarchy review
- Can a viewer identify the topic and value proposition in ~3 seconds?
- Is there one dominant hero rather than a wall of equal cards?
- Can the primary path be followed in ~10 seconds?
- Are actions, evidence, outputs and caveats visually distinguishable?
- Does the lower-priority content recede without becoming unreadable?

## Copy review
- Each idea appears once unless repetition serves a distinct confirmation.
- Headings use concise, respectful language.
- Beginner-facing copy avoids condescending labels.
- Commands and code are visually separated from prose.
- Caveats remain visible where they materially affect interpretation.

## Song-handdrawn review
- Paper ground, ink linework and muted greens support the explanation.
- Warm-yellow emphasis is sparse and functional.
- Botanical/mountain motifs remain atmospheric, not semantic substitutes.
- Technical objects remain recognizable.
- No generic neon/purple AI decoration is added without purpose.

## Mobile review
Inspect at approximately phone feed width:
- title remains readable;
- exact command / primary number remains readable;
- section order remains obvious;
- no dense paragraph requires zooming;
- icons do not replace essential labels.

## Release states
- `pass`: all hard gates pass and hierarchy is clear.
- `revise`: factual content is intact but layout/copy/legibility needs another render.
- `fail`: factual fidelity, exact strings, or core meaning is wrong.

Record unresolved issues in `qa-report`; never silently approve a failed exact string or factual mismatch.
