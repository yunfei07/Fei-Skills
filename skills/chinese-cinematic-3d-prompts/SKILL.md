---
name: chinese-cinematic-3d-prompts
description: 为中国古风电影级 3D 动画创作可复用的英文图像提示词和中文创作说明。用于侠客、江湖、志怪、历史人物、神话题材的角色设定、场景、连续分镜和既有提示词修订；按统一 Master Template 与五个 Profile 固定手工黏土质感、电影灯光及跨镜头角色特征。也用于动画电影分镜规划：场景锁、参考图关联、镜头运动、声音提示、转场和 HTML 分镜板导出。默认生成提示词与规划；只有用户明确要求出图时才调用可用图像工具。
---

# 中国古风电影级 3D 动画提示词

## 执行流程

1. 读取 [参数契约](references/input-contract.md) 和 [Master Template](references/master-template.md)。根据用户叙事重点只读取一个主 Profile：

   | Profile | 选择条件 | 文档 |
   |---|---|---|
   | `xiake` / 侠客 | 个人行动、游侠、武艺和人物塑造 | [侠客](references/profile-xiake.md) |
   | `jianghu` / 江湖 | 门派、关系、客栈、渡口和群体环境 | [江湖](references/profile-jianghu.md) |
   | `zhiguai` / 志怪 | 民俗异象、精怪和幽微悬念 | [志怪](references/profile-zhiguai.md) |
   | `historical` / 历史人物 | 有具体姓名、时期或事件的历史人物 | [历史人物](references/profile-historical.md) |
   | `mythology` / 神话 | 神祇、神兽、神话事件和超常尺度 | [神话](references/profile-mythology.md) |

2. 提取 `profile`、`subject`、`setting`、`action`。接受中文自然语言，先由模型整理为契约规定的英文视觉字段。不要要求用户填写 JSON；仅在影响结果的关键事实缺失时提问。自动选择 Profile 时，在输出的 `[创作默认]` 中说明依据。
3. 建立一个 `character_lock`。系列已有角色时原样复用脸型、发型、服饰、道具与轮廓；不要在每个镜头重新设计。新角色的补充特征标为 `[创作提案]`，不要冒充用户设定。多角色边界见 [扩展约定](references/extensions.md)。
4. 保留统一 `style_lock`：风格化动画长片、定格动画启发、手工黏土雕塑质感、微缩工艺、克制的不规则表面，以及可读的情绪和电影灯光。将 Profile 叠加到这个底座上。原测试的品牌风格词保存在 Master Template，明确要求时使用。
5. 分镜制作先读取 [分镜制作流程](references/storyboard-production.md)。建立 scene_locks，用 scene_id 选择地点；登记实际参考图，用 reference_ids 逐镜关联。把已有角色和场景锁原样复用，不将参考图误称为已生成的镜头图。
6. 单幅采用 `scene` 或 `character`；分镜采用 `storyboard`。把镜头差异限定为选定场景中的动作、机位、灯光、情绪与制作规划；换地点选择另一 scene_id。静态 prompt_en 只描述一帧；运动使用 camera_motion 和独立 motion_prompt_en，声音与 transition_out 单独记录。按需读取 [实例](references/examples.md)。静态画面用姿态表达动作；不要在一张画面内堆叠连续动作。
7. 历史人物先区分 `stylized`、`inspired`、`strict`。严格模式核实影响视觉的时期、服饰、建筑和道具，记录可追溯来源；不可核实时不要输出“考据通过”。事实使用 `[有据]` 并附来源，未知使用 `[待核实]` 或 `[猜测]`；默认和造型设计使用 `[创作默认]` / `[创作提案]`。不要将志怪、神话的象征或叙事说成现实事实。
8. 按 [输出契约](references/output-contract.md) 交付。能运行 Python 时使用脚本固定结构；不能运行时按相同字段手工输出，并说明未执行脚本。未实际出图时不得声称已经生成图片；结构检查或关联已有图片不能替代视觉审阅。

## 脚本调用

从本 Skill 根目录运行（Python 3.10+；仅标准库；离线组装）：

```bash
python3 scripts/compose_prompt.py --input assets/examples/zhiguai-storyboard.json --format markdown
python3 scripts/compose_prompt.py --input assets/examples/xiake-character.json --format json --output /absolute/path/prompt-pack.json
```

导出 HTML 分镜板（输入为脚本生成的 JSON 包；未提供镜头图片时生成明确标注的占位板）：

```bash
python3 scripts/compose_prompt.py --input assets/examples/linchong-storyboard.json --format json --output /absolute/path/linchong-pack.json
python3 scripts/export_storyboard.py --input /absolute/path/linchong-pack.json --output /absolute/path/linchong-board.html
python3 scripts/export_storyboard.py --input /absolute/path/linchong-pack.json --image-map /absolute/path/frame-images.json --columns 2 --output /absolute/path/linchong-board-with-images.html
```

逐镜出图须遵循可用图像工具的能力与引用方式；先查看本地参考图，明确参考角色/场景/风格的用途，再传给工具。脚本的关联记录不等于工具已消费参考图。不支持的参考资源不得冒充已上传。导出后按 [分镜制作流程](references/storyboard-production.md) 检查图片数、占位状态与时间轴。

参照 [输入 Schema](assets/input.schema.json) 和 [Profile 数据](assets/profiles.json)。英文字段的翻译、叙事设计、史料核查由模型执行，脚本不具备这些能力。`--output` 拒绝覆盖已有文件。失败时修正真实输入，不隐藏错误或伪造结果。

## 交付检查与扩展

读取 [质量检查](references/quality-check.md)，检查输入冲突、角色锁、镜头叙事、事实标签和禁用元素。`assembly_checks` 只代表结构检查；视觉一致性需实际生成后检验。不添加未核实的生成器专有语法、seed 或版本参数。

按 [依据与边界](references/provenance.md) 区分已确认目标和本版实现选择。按 [扩展约定](references/extensions.md) 添加 Profile、工具适配或多角色支持；新模块必须明确输入、输出、默认行为与兼容性。
