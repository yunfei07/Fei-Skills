---
name: chinese-cinematic-3d-prompts
description: 为中国古风电影级 3D 动画创作可复用的英文图像提示词和中文创作说明。用于侠客、江湖、志怪、历史人物、神话题材的角色设定、场景、连续分镜和既有提示词修订；按统一 Master Template 与五个 Profile 固定手工黏土质感、电影灯光及跨镜头角色特征。仅请求提示词时使用，不自动生成图片。
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
5. 单幅采用 `scene` 或 `character`；分镜采用 `storyboard`。把镜头差异限制在场景、动作、机位、灯光和情绪。按需读取 [实例](references/examples.md)。静态画面用姿态表达动作；不要在一张画面内堆叠连续动作。
6. 历史人物先区分 `stylized`、`inspired`、`strict`。严格模式核实影响视觉的时期、服饰、建筑和道具，记录可追溯来源；不可核实时不要输出“考据通过”。事实使用 `[有据]` 并附来源，未知使用 `[待核实]` 或 `[猜测]`；默认和造型设计使用 `[创作默认]` / `[创作提案]`。不要将志怪、神话的象征或叙事说成现实事实。
7. 按 [输出契约](references/output-contract.md) 交付。能运行 Python 时使用脚本固定结构；不能运行时按相同字段手工输出，并说明未执行脚本。不得声称已经生成或验证图片。

## 脚本调用

从本 Skill 根目录运行（Python 3.10+；仅标准库；离线组装）：

```bash
python3 scripts/compose_prompt.py --input assets/examples/zhiguai-storyboard.json --format markdown
python3 scripts/compose_prompt.py --input assets/examples/xiake-character.json --format json --output /absolute/path/prompt-pack.json
```

参照 [输入 Schema](assets/input.schema.json) 和 [Profile 数据](assets/profiles.json)。英文字段的翻译、叙事设计、史料核查由模型执行，脚本不具备这些能力。`--output` 拒绝覆盖已有文件。失败时修正真实输入，不隐藏错误或伪造结果。

## 交付检查与扩展

读取 [质量检查](references/quality-check.md)，检查输入冲突、角色锁、镜头叙事、事实标签和禁用元素。`assembly_checks` 只代表结构检查；视觉一致性需实际生成后检验。不添加未核实的生成器专有语法、seed 或版本参数。

按 [依据与边界](references/provenance.md) 区分已确认目标和本版实现选择。按 [扩展约定](references/extensions.md) 添加 Profile、工具适配或多角色支持；新模块必须明确输入、输出、默认行为与兼容性。
