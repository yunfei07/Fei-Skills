# Fei Creative Core v0.1

Creative Core 是 Video、Web、Image、Storyboard 共享的创作语言，不直接生成成品。

## Narrative

- 先定义观众、目标与单一核心命题。
- 信息按 `context -> tension/question -> mechanism -> resolution/insight` 排序。
- 删除不能改变理解、情绪或下一步行动的段落。

## Visual hierarchy

- 每个 scene / viewport 只允许一个第一视觉焦点。
- Typography、scale、contrast、depth 用于建立层级，不用于装饰堆叠。
- 重要状态必须至少通过两种信号表达，不能只依赖颜色。

## Composition

- 明确 foreground / subject / context 三层关系。
- 3D 场景优先控制 silhouette、camera angle、depth cues，再增加材质细节。
- UI 场景优先保持真实产品信息架构，不伪造不存在的功能。

## Motion

运动必须属于以下至少一种功能：

1. attention routing
2. state transition
3. causal explanation
4. spatial orientation
5. pacing / emotion

默认避免持续无意义漂浮、过度弹性 easing 与同时竞争注意力的多重动画。

## Camera

- Establishing -> medium -> detail 形成空间关系。
- Push-in 表示注意力收束；pull-out 表示语境扩展；orbit 只在空间结构本身重要时使用。
- 镜头运动速度与叙事信息密度反相关。

## Interaction

Web 交互应提供可预测反馈；scroll-driven scene 必须允许用户继续阅读，不让动画阻塞内容。

## Sound

声音分为 narration、music、SFX、ambient。声音提示应说明目的和同步点；没有实际音频资产时只输出 cue，不声称已混音。

## QA

每个 Skill 应检查：

- hierarchy
- consistency / locks
- factual claims
- pacing
- responsive behavior（Web）
- accessibility（Web）
- safe areas / legibility（Video）
- performance risks
- rendered-vs-planned artifact boundary
