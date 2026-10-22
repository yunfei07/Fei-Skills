# Fei-Skills

[已实现] Fei-Skills 是面向 AI Agent 的创作能力库。仓库从单一古风提示词 Skill 扩展为 **Fei-Skills 2.0**：以共享 Creative Core 为基础，组织 Video、Web 与 Visual Storytelling 能力。

## 2.0 架构

```text
Fei-Skills/
├── skills/
│   ├── chinese-cinematic-3d-prompts/
│   ├── video/
│   │   ├── fei-knowledge-explainer-video/
│   │   ├── fei-product-launch-video/
│   │   └── fei-cinematic-story-film/
│   └── web/
│       ├── fei-knowledge-explainer-web/
│       ├── fei-immersive-story-site/
│       └── fei-product-landing-page/
├── shared/
│   ├── creative-core/
│   └── schemas/
├── registry/
└── tests/
```

[设计原则] 一个 Skill 表达一种稳定能力（Capability），Profile / Style / Preset 在 Skill 内部变化。避免把每一种视觉样式都拆成独立 Skill。

## 第一批旗舰 Skills

| Domain | Skill | 目标产物 | 当前状态 |
|---|---|---|---|
| Video | `fei-knowledge-explainer-video` | 研究驱动的知识解释视频工程 | workflow v0.1 |
| Video | `fei-product-launch-video` | 产品发布/功能演示视频工程 | workflow v0.1 |
| Video | `fei-cinematic-story-film` | 电影化故事分镜与影片工程 | workflow v0.1 |
| Web | `fei-knowledge-explainer-web` | 交互式知识解释网站 | workflow v0.1 |
| Web | `fei-immersive-story-site` | 沉浸式叙事网站 | workflow v0.1 |
| Web | `fei-product-landing-page` | 产品营销落地页 | workflow v0.1 |

[能力边界] v0.1 已提供 Agent 路由、输入输出约定、共享创作规范、manifest 与注册表；尚未把 Remotion / Three.js / Next.js / FFmpeg 等渲染运行时固化为仓库脚本，因此不得把 `video.mp4`、部署后的 Web 站点描述为已由仓库离线脚本自动生成。

## 原有古风 Skill

[已实现] `skills/chinese-cinematic-3d-prompts` 保持兼容，继续提供侠客 / 江湖 / 志怪 / 历史人物 / 神话五个 Profile，以及角色锁、场景锁、参考图关联、镜头运动、声音提示、转场、时间轴和 HTML 分镜板导出。

## Skill Specification

新 Skill 遵循 [`docs/SKILL-SPEC.md`](docs/SKILL-SPEC.md)。每个 Skill 至少包含：

```text
SKILL.md
manifest.json
```

推荐逐步增加：

```text
references/
profiles/
templates/
schemas/
scripts/
examples/
tests/
```

统一注册表：[`registry/skills.json`](registry/skills.json)。共享创作语言：[`shared/creative-core/README.md`](shared/creative-core/README.md)。

## 验证

```bash
python3 -m unittest discover -s tests -v
```

[版本] Fei-Skills 2.0 architecture preview / Skill spec `0.1.0`。

[许可证] GPL-3.0。
