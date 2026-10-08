# 输出契约 v1.0.0

交付中文说明、可复制英文 prompt 与负向约束；JSON 便于复用，Markdown 便于阅读。

| JSON 字段 | 内容 |
|---|---|
| `schema_version` | `1.0.0` |
| `skill` | `chinese-cinematic-3d-prompts` |
| `profile` / `mode` | 本次选择 |
| `assumptions` | 本次采用的默认值 |
| `style_lock` / `character_lock` | 完整共享底座 / 角色对象 |
| `parameters` | 画幅、配色、brand_style、史实等级 |
| `prompt_records` | 每幅/镜一项，含 `id`、`prompt_en`、`shot` |
| `negative_prompt_en` | 通用、Profile、用户禁用元素去重拼接 |
| `source_notes` | 原输入证据说明，不自动升级核查状态 |
| `assembly_checks` | 已完成的结构检查，不是视觉或史实验收 |
| `warnings` | 角色锚点缺失、史实未验证等边界 |

`shot` 固定包含 setting/action/emotion/camera/lighting；有时长才附 duration_seconds。单幅 ID 为 `FRAME_01`；分镜 ID 保持原输入。JSON 文件不含 Markdown 围栏。

Markdown 顺序：参数、默认项、角色锁、逐镜英文提示词、负向约束、证据说明、组装检查、能力边界。可追加中文创作提案，但不能改掉字段伪造完成。

| 标签 | 含义 |
|---|---|
| `[用户提供]` | 来自输入，不代表独立核实 |
| `[输入参数]` / `[输入记录]` | 脚本接收的内容；可能含模型创作，不能自动视为用户设定 |
| `[有据]` | 已核查事实，附来源 |
| `[创作默认]` | 契约默认选择 |
| `[创作提案]` | 本次新设计，不是现实事实 |
| `[待核实]` / `[猜测]` | 证据不足的事实性说法 |
| `[已检查]` | 真正执行完成的结构检查 |
| `[能力边界]` | 未执行或无法执行的事项 |

标签放在说明中，不进入 prompt_en 干扰图像工具。虚构动作标创作提案，不伪装为历史记录。模型须在中文说明中区分用户实际提供的视觉锚点与自行补充的造型；脚本不知道字段来源。
