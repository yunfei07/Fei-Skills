# 输出契约 v1.1.0

交付中文说明、可复制英文 prompt 与负向约束；JSON 便于复用，Markdown 便于阅读。

| JSON 字段 | 内容 |
|---|---|
| `schema_version` | `1.1.0` |
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


## v1.1 新增输出

| 字段 | 内容 |
|---|---|
| title | 项目名称 |
| scene_locks | 规范化场景注册表 |
| reference_images | 参考图注册表；本地 source 为解析后的绝对路径 |
| timeline | timing_complete、total_duration_seconds、convention、逐镜 entries |
| prompt_records[].motion_prompt_en | 完整视觉底座与独立镜头运动、起止画面及规划时长 |
| prompt_records[].reference_ids / references | 本镜选中 ID 与解析记录；不代表已上传或使用 |
| prompt_records[].shot | 保留原字段，新增 scene_id/scene_lock/reference_ids/camera_motion/sound/transition_out |

每个 timeline.entries 包含 id/start_seconds/end_seconds/duration_seconds/transition_start_seconds。未知值为 null；不得将不完整规划宣称总时长已确定。静态 prompt_en 不包含声音、转场或运动轨迹，避免一帧出现多个动作过程。

Markdown 追加场景锁、参考关联、时间轴，以及逐镜制作规划和动态提示词。HTML 导出包含项目摘要、逐镜图片或占位、时间信息、机位、动作、运动起止、声音、转场、参考 ID 与可展开提示词；参考图库独立呈现，不替代缺图。

[能力边界] HTML 是静态分镜板，打印排版不等于自动 PDF 导出；可用浏览器打印保存 PDF。声音、镜头运动、转场均未被实际渲染成视频或音频。
