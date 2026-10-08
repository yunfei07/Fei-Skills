# 输入契约 v1.0.0

自然语言由模型整理为 JSON；CLI 不自动翻译。提示词字符串采用英文；中文仅用于说明与证据标签。Schema 见 `assets/input.schema.json`；脚本独立执行同样的字段、类型和枚举约束，无需 Schema 库。

| 字段 | 类型 / 取值 | 必填 / 默认 | 用途 |
|---|---|---|---|
| `profile` | `xiake` / `jianghu` / `zhiguai` / `historical` / `mythology` | 必填 | 中文类别由模型转换 |
| `subject` | 非空字符串 | 必填 | 可见主体 |
| `setting` | 非空字符串 | 必填 | 地点、环境、时代背景 |
| `action` | 非空字符串 | 必填 | 一帧可读动作 |
| `mode` | `character` / `scene` / `storyboard` | `scene` | 任务类型 |
| `character_lock` | 下述对象 | `{}` | 已有角色视觉锚点 |
| `emotion` | 非空字符串 | `restrained curiosity` | 情绪 |
| `camera` | 非空字符串 | `medium-wide shot, eye-level, readable silhouette` | 景别、构图 |
| `lighting` | 非空字符串 | `soft cinematic key light, motivated practical glow, cool ambient fill` | 光源 |
| `palette` | 非空字符串 | `muted earth tones, restrained warm-cool contrast` | 配色 |
| `aspect_ratio` | `16:9` / `9:16` / `1:1` / `4:3` / `3:2` / `2.39:1` | `16:9` | 通用画幅描述 |
| `brand_style` | `descriptive` / `original-test` | `descriptive` | 原测试前缀开关 |
| `historical_accuracy` | `stylized` / `inspired` / `strict` | `stylized` | 史实要求 |
| `source_notes` | 非空字符串数组 | `[]` | 主张、来源、核查状态；脚本不核实 |
| `avoid` | 非空字符串数组 | `[]` | 额外禁用项 |
| `shots` | 镜头对象数组 | storyboard 必填，2–12 项 | 不自动补写故事 |

`character_lock` 仅接受 `identity`、`face`、`hair`、`costume`、`props`、`silhouette` 六个非空字符串字段；可提供部分。未提供的字段不自动填充。分镜必须至少有一个视觉锚点（face/hair/costume/props/silhouette）；姓名本身不算视觉锚点。

每个 `shots` 项必须有非空 `id`、`action`；ID 不重复。可覆写 `setting`、`emotion`、`camera`、`lighting`，否则从顶层继承。可附正数 `duration_seconds`（规划时长，不是视频）。不允许覆写角色锁、Profile、配色、画幅、风格。

## 校验与冲突

- 拒绝未知字段、空字符串、类型错误、非法枚举、重复 ID、非有限时长；退出码 2。
- 非 storyboard 不接受 `shots`；storyboard 不凭空生成镜头。
- `strict` 仅用于 `historical`，要求非空 `source_notes`。模型仍需核实视觉结论；字符串存在不是史实验证。
- “保持角色锁”与“完全改变服饰”的冲突需澄清或拆成两个有名造型版本，不能靠拼接掩盖。
- 字符串仅去除首尾空白；不删改用户禁用项。缺省顶层参数在输出 `assumptions` 中列出；镜头继承正常顶层值不代表重新设计。
- [本版实现] 默认值是便利选择，不是用户已确认审美。模型可补充具体值并标 `[创作提案]`；关键主题不明才提问。
