# Song Aesthetic Visual QA

Use this checklist on Web screenshots and Video keyframes. It is a sign-off checklist, not a substitute for semantic or accessibility testing.

## Composition

- The frame has substantial negative space and one primary visual claim.
- Information reads in a calm editorial sequence rather than a dashboard grid.
- No nested-card accumulation, ornamental frame, fake scroll painting or decorative seal is present by default.

## Color

- Background is paper-toned rather than pure white or dark UI chrome.
- Ink is the primary text color; Song green and pale cyan are restrained supporting colors.
- No neon, saturated gradient, glassmorphism glow or high-chroma accent competes with the explanation.

## Typography

- Display text is serif-led and restrained in weight.
- Long explanatory text stays legible and is not treated as decorative calligraphy.
- No pseudo-brush font is introduced merely to signal “Chinese style”.

## Lines and charts

- Rules and axes are hairline or near-hairline.
- Charts avoid unnecessary grids, legends and color categories.
- Direct labels or nearby explanation make the claim understandable in a static frame.

## Motion and keyframes

- Motion is limited to fade, line growth, slow push/pull, lateral drift or similarly restrained transitions.
- No bounce, spin, trailer-hit scale or decorative orbiting is used.
- First, middle and final keyframes each remain semantically readable without motion.

## Spatial / Three.js

- Depth is used because it explains a spatial relationship, not because 3D looks impressive.
- Materials are matte and low-saturation; lighting does not create glossy product-render aesthetics.
- Camera motion is slow and predictable.
- Orientation remains clear, and fallback text states what the spatial metaphor means.
- Illustrative coordinates are never presented as measured data unless they really are measured data.

## Release decision

Fail visual sign-off if any one of these conditions applies: information hierarchy is ambiguous, text is clipped, the focal claim depends on motion alone, aesthetic decoration competes with meaning, or the result reads as generic SaaS/tech-demo styling rather than restrained Song-inspired editorial design.
