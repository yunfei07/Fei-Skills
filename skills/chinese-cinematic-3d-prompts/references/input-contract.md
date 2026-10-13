# 输入契约 v1.1.0

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

每个 `shots` 项必须有非空 `id`、`action`；ID 不重复。可覆写 `setting`、`emotion`、`camera`、`lighting`，否则从顶层继承。v1.1 另允许 scene_id、reference_ids、camera_motion、sound、transition_out；具体约束见下文。可附正数 `duration_seconds`（规划时长，不是视频）。不允许覆写角色锁、Profile、配色、画幅、风格。

## 校验与冲突

- 拒绝未知字段、空字符串、类型错误、非法枚举、重复 ID、非有限时长；退出码 2。
- 非 storyboard 不接受 `shots`；storyboard 不凭空生成镜头。
- `strict` 仅用于 `historical`，要求非空 `source_notes`。模型仍需核实视觉结论；字符串存在不是史实验证。
- “保持角色锁”与“完全改变服饰”的冲突需澄清或拆成两个有名造型版本，不能靠拼接掩盖。
- 字符串仅去除首尾空白；不删改用户禁用项。缺省顶层参数在输出 `assumptions` 中列出；镜头继承正常顶层值不代表重新设计。
- [本版实现] 默认值是便利选择，不是用户已确认审美。模型可补充具体值并标 `[创作提案]`；关键主题不明才提问。


## v1.1 分镜制作字段

| 顶层字段 | 默认 | 内容 |
|---|---|---|
| title | 中国古风电影级 3D 动画分镜 | 中文项目名称 |
| scene_locks | [] | 场景注册表；每项 id 加至少一个视觉字段 |
| scene_id | 未选择 | 当前默认场景 ID；有注册场景时每镜必须明确选择 |
| reference_images | [] | 参考图注册表；登记不等于上传 |
| reference_ids | [] | 所有镜头的默认参考图 ID 列表 |
| camera_motion | locked | 默认镜头运动对象；逐镜整体替换 |
| sound | 无环境声/音效/对白，music: none | 默认声音规划；逐镜按字段合并，数组整体替换 |
| transition_out | cut，0 秒 | 出镜转场；只允许 storyboard，逐镜整体替换 |

scene_locks 每项有唯一 id，可填写 identity/layout/architecture/fixed_props/weather/time_of_day/continuity 非空英文字符串。镜头只能选择 scene_id，不能覆写锁对象。setting 表达同一场景中的局部视域，不得与布局、道具、天气冲突；自由文本语义由模型检查。跨地点分别注册锁，切换 scene_id。

reference_images 每项必须有唯一 id、role（character/scene/style）、source_type（local/resource_id）、source。可附 description；scene 参考图可附已注册 scene_id，使用时必须与镜头地点一致。其他 role 不接受 scene_id。local 路径相对输入 JSON 所在目录解析并输出绝对路径；resource_id 原样记录，不推测内容或访问权限。未存在的本地参考图生成明确警告。每镜 reference_ids 替换顶层选择，不合并；空数组可取消参考。未知 ID、重复选择、错配场景报错。参考图片未被上传、检查或自动消费。

camera_motion 的 type 可为 locked/pan/tilt/dolly_in/dolly_out/track/orbit/handheld。非 locked 必须给 description；可附英文 start_frame/end_frame，表达起止构图。运动不会拼入静态 prompt_en；独立输出 motion_prompt_en。运动类型和起止语义一致性需模型检查；本版不生成视频。

sound 可含 ambience、effects（字符串数组）、music（非空字符串，none 表示不安排）、dialogue（speaker/text 对象数组）。允许中文声音说明与台词；默认无对白，不能自拟台词却宣称原著引用。仅规划，不合成音频。

transition_out 含 type、duration_seconds、可选 notes。type 为 cut/match_cut/dissolve/fade_out；cut 与 match_cut 必须为 0 秒；后两者正数，缺省 0.5 秒。转场时长不能超过源镜头时长；末镜不得 dissolve/match_cut 到不存在的下一镜。

## 时间轴与兼容

转场占源镜头末尾时长，不额外叠加、不扣重叠。因此 5+4+3+4+3+5 秒六镜总规划时长为 24 秒，末镜 0.7 秒淡出属于最后 5 秒。缺少任意 duration_seconds 时 total_duration_seconds 为 null；未知时长之后的时间点也为 null，不自动补时长。源镜头时长未知时无法确认转场是否能容纳，需补充后再检查。

旧 v1.0 输入仍可直接运行；新增字段都可省略。输出版本为 1.1.0，原 prompt_en、角色锁与静态参数保留；增加制作字段和规划默认项。严格依赖旧输出版本或固定字段集合的调用者需适配新增字段。
