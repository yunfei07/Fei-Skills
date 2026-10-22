# Song Aesthetic Profile

[定义] `song-aesthetic` 是 `fei-knowledge-explainer-web` 的默认视觉 Profile。它将宋式审美转译为数字界面的设计约束，而不是把历史器物或绘画元素机械贴到页面上。

## Design principles

1. **留白优先**：页面节奏先由空白、比例和呼吸感建立，再加入图形。
2. **淡而不弱**：主色低饱和，关键信息依靠明度、尺度、位置和线性结构形成层级，不依赖高饱和强调色。
3. **细线成骨**：分隔、网络、图表和路径优先使用细线与疏密关系，避免厚重卡片边框。
4. **书卷式阅读**：纵向阅读连续、缓慢、清晰；章节之间允许大段空白，减少 dashboard 式模块堆叠。
5. **动势含蓄**：动画以淡入、位移、线条生长、轻微视差为主；避免弹跳、霓虹、强缩放和连续旋转。
6. **植物性秩序**：当解释对象允许抽象映射时，可采用枝、叶、脉络、水纹、层峦等结构隐喻，但不得牺牲事实表达。
7. **数字宋意而非仿古**：不强制卷轴、印章、毛笔字、古画边框等表面符号。

## Color tokens

- paper: `#F4F1E8`
- paper-deep: `#ECE8DC`
- ink: `#24302B`
- ink-soft: `#5F6B65`
- song-green: `#7F9488`
- song-cyan: `#A7B8B1`
- mist: `#D9DFDA`
- line: `#C7CEC8`
- white: `#FBFAF6`

Accent color should normally occupy less than 12% of the viewport.

## Typography

Prefer an editorial CJK serif stack for Chinese titles and a restrained serif/sans pairing for Latin text. Runtime must not depend on proprietary fonts.

Recommended fallbacks:

```css
--font-display: "Songti SC", "STSong", "Noto Serif CJK SC", Georgia, serif;
--font-body: "PingFang SC", "Noto Sans CJK SC", system-ui, sans-serif;
```

Headings use generous line-height and moderate tracking. Avoid oversized ultra-bold SaaS headlines.

## Layout grammar

- content max width: 1120–1180px
- prose max width: 620–700px
- first viewport should reveal the start of the next semantic section
- favor asymmetric 30/70 or 36/64 compositions over centered card grids
- use open canvas, rails, thin rules and whitespace instead of nested cards
- mobile collapses to a single reading column without losing scene order

## Renderer grammar

### Flow
Use spaced labels connected by hairlines. Rounded pills are not the default.

### Compare
Use two open columns divided by a single vertical rule; avoid boxed cards.

### Network
Nodes should feel like ink dots or seed points. Connections use subdued hairlines. Density must remain readable.

### Chart
Use thin axes, minimal grid lines, direct labels when practical and a single restrained highlight series.

### Spatial / Three.js
Use orthographic or low-perspective cameras where possible; restrained depth, fog and slow camera movement. Default materials are matte, low-specular and low-saturation. Spatial scenes must have a semantic 2D fallback.

## Motion

Default durations: 420–900ms. Use ease-out or smoothstep-like easing. Respect `prefers-reduced-motion` and never gate comprehension behind animation.

## Prohibited defaults

Do not default to glassmorphism, neon gradients, glossy 3D, heavy shadows, bento grids, pill-heavy navigation, giant metric cards, rapid parallax or ornamental pseudo-Chinese motifs.
