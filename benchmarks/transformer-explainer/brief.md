# Capability Benchmark: Transformer Explainer

## User brief

Explain **how the Transformer works** to a technically curious beginner.

Constraints:
- Chinese language.
- Song-aesthetic visual system.
- One shared semantic scene graph must drive both Web and Video.
- The explanation should focus on the canonical 2017 Transformer mechanism, while clearly distinguishing later decoder-only LLM variants.
- Visual mechanisms must be explanatory, not decorative.
- Do not use 3D unless depth materially improves understanding.
- Target video duration: roughly 40–45 seconds.

## Sources checked

Primary factual anchors:
- Vaswani et al., *Attention Is All You Need* (2017 / arXiv:1706.03762).
- Google Research, *Transformer: A Novel Neural Network Architecture for Language Understanding* (2017).

## Acceptance criteria

### Knowledge
- Explain token/vector representation and positional information.
- Explain Query / Key / Value and scaled dot-product attention at a conceptual level.
- Explain that attention weights control how much other token representations contribute.
- Explain multi-head attention as multiple learned relation views, without claiming heads have fixed human-interpretable roles.
- Include residual connections, normalization and the position-wise feed-forward network.
- Distinguish the canonical encoder-decoder Transformer from common decoder-only LLM variants.

### Visual judgement
- Use the simplest renderer that communicates each idea.
- `spatial` is deliberately not required: the subject does not need 3D depth to explain the core mechanism.
- Maintain Song-aesthetic paper, ink, pale cyan/green, whitespace and restrained motion.

### Cross-medium consistency
- Web and Video use the same semantic content and scene order.
- Different layouts are allowed, but no medium may introduce contradictory claims.

## What this benchmark tests

This is not a compiler test. It tests whether the Skills can turn an ambiguous teaching request into a coherent information architecture, choose appropriate visual mechanisms, maintain factual boundaries, preserve a design system, and render the same explanation across two media.