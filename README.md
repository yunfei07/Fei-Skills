# Fei-Skills

[已实现] 本仓库收录可复用的个人 Skill。首个模块为 **中国古风电影级 3D 动画提示词**，位于 [`skills/chinese-cinematic-3d-prompts`](skills/chinese-cinematic-3d-prompts/SKILL.md)。

## 首个 Skill

[已实现] 共享 Master Template 与侠客 / 江湖 / 志怪 / 历史人物 / 神话五个 Profile；支持角色设定、场景和连续分镜。输入采用自然语言（由模型整理）或 JSON；输出为英文提示词、负向约束、角色锁、参数、默认项和核查说明。

[能力边界] 脚本离线组装提示词，不生成图片、不翻译中文、不核实史料。固定角色词句有助于表达一致性要求，实际图像效果仍需生成后验证。

## 直接运行

[运行要求] Python 3.10+，仅标准库，无 API key 或第三方依赖。从仓库根目录运行：

```bash
python3 skills/chinese-cinematic-3d-prompts/scripts/compose_prompt.py \
  --input skills/chinese-cinematic-3d-prompts/assets/examples/zhiguai-storyboard.json \
  --format markdown

python3 skills/chinese-cinematic-3d-prompts/scripts/compose_prompt.py \
  --input skills/chinese-cinematic-3d-prompts/assets/examples/xiake-character.json \
  --format json --output xiake-prompts.json

python3 -m unittest discover -s tests -v
```

[已实现] `--output` 只创建新文件，拒绝覆盖。非法输入退出码为 2。脚本可在任意工作目录运行；资源路径从脚本位置解析。

## 在支持 Skill 的助手中使用

[使用方式] 让助手读取完整 Skill 目录中的 `SKILL.md`，按其中路由读取相应 Profile 和参数契约。若工具支持本地 Skill 安装，将整个 `chinese-cinematic-3d-prompts` 目录复制到该工具规定的个人 Skill 位置，不要只复制 SKILL.md。

调用示例：

> 请使用 $chinese-cinematic-3d-prompts，为灰蓝长袍、背竹篓、持木杖的游方道士，在雾中竹林发现浮灯的故事写三个连续镜头。只生成提示词，保持人物一致。

## 核心入口

| 文件 | 作用 |
|---|---|
| [SKILL.md](skills/chinese-cinematic-3d-prompts/SKILL.md) | 触发说明、流程、Profile 路由 |
| [Master Template](skills/chinese-cinematic-3d-prompts/references/master-template.md) | 风格底座、组装顺序、固定与可变模块 |
| [输入契约](skills/chinese-cinematic-3d-prompts/references/input-contract.md) | 参数、默认、约束 |
| [输入 Schema](skills/chinese-cinematic-3d-prompts/assets/input.schema.json) | JSON 请求结构 |
| [输出契约](skills/chinese-cinematic-3d-prompts/references/output-contract.md) | 提示词包字段和状态标签 |
| [Profile 数据](skills/chinese-cinematic-3d-prompts/assets/profiles.json) | 五类叠加词与负向约束 |
| [扩展约定](skills/chinese-cinematic-3d-prompts/references/extensions.md) | 新 Profile、多角色、工具适配和版本边界 |
| [依据与边界](skills/chinese-cinematic-3d-prompts/references/provenance.md) | 用户已确认目标与本版实现选择 |

[版本] 首版输出契约为 `1.0.0`。原测试视觉底座与五类目标沿用可见记录，具体字段和 Profile 文案为本版实现，不宣称逐字还原未检索到的旧方案全文。

[许可证] 沿用仓库现有 [GPL-3.0 LICENSE](LICENSE)。
