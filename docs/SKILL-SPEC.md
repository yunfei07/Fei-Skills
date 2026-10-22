# Fei Skill Specification v0.1

## 1. 定义

一个 Fei Skill 是可被 Agent 读取和执行的、面向具体创作能力的工作流包。它不是单段 Prompt，也不应仅描述视觉风格。

## 2. 最低文件要求

每个 Skill 必须包含：

- `SKILL.md`：触发条件、输入、执行流程、输出、质量门槛与边界。
- `manifest.json`：机器可读元数据。

推荐目录：

```text
<skill>/
├── SKILL.md
├── manifest.json
├── references/
├── profiles/
├── templates/
├── schemas/
├── scripts/
├── examples/
└── tests/
```

## 3. Capability-first

Skill 表示能力；Profile 表示表达策略；Style 表示视觉语言；Preset 表示参数组合。

```text
Skill -> Profile -> Style -> Preset
```

例如 `fei-knowledge-explainer-video` 是 Skill；`scientific` 是 Profile；`minimal-editorial` 是 Style；`16:9-90s` 是 Preset。

## 4. 标准执行阶段

1. Parse brief
2. Resolve missing assumptions explicitly
3. Research / source check when facts matter
4. Build narrative or information architecture
5. Build scene/page graph
6. Apply Creative Core
7. Produce implementation plan or artifacts
8. QA against acceptance criteria
9. Emit outputs plus limitations

## 5. 输出契约

所有 Skill 必须区分：

- `planning artifacts`：brief、research、script、storyboard、scene graph、design tokens。
- `implementation artifacts`：源码、模板、资源映射。
- `rendered artifacts`：MP4、PNG、HTML build 等。

如果当前运行环境没有完成渲染，不得把计划文件称为最终渲染产物。

## 6. Manifest 必填字段

`id`, `name`, `version`, `domain`, `status`, `description`, `entrypoint`, `inputs`, `outputs`, `runtime`, `tags`。

Schema 见 `shared/schemas/skill-manifest.schema.json`。

## 7. 质量原则

- 事实性内容需区分已验证事实与创作推断。
- 视觉选择必须服务信息层级或叙事目标。
- 动画必须有功能：解释、引导注意、表现因果或塑造节奏。
- Web 默认考虑响应式、可访问性与性能预算。
- Video 默认考虑镜头连续性、字幕安全区、音画节奏与导出规格。
- 同一项目中重复角色、场景、品牌 UI 必须通过 lock / token / reference 机制保持一致。

## 8. 版本策略

- `0.x`：工作流和契约仍可能调整。
- `1.x`：输入输出兼容，新增能力采用向后兼容方式。
- breaking change 提升 major 版本。
