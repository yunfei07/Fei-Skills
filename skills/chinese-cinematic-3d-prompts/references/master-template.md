# Master Template

[可见记录] 共享底座为风格化 3D 动画长片、中国古风叙事、定格动画启发、手工黏土雕塑质感、微缩工艺和略不均匀的手作表面。

[本版实现] 灯光、配色、负向约束和模块顺序是实现选择。完整底座常量见 `scripts/compose_prompt.py`；Profile 修饰语见 `assets/profiles.json`，修改时以它们为运行时依据。

## 组装顺序

```text
[STYLE_LOCK]
[PRIMARY_PROFILE]
Character identity: [CHARACTER_LOCK]
Scene continuity: [SELECTED_SCENE_LOCK]
Subject: [SUBJECT]
Setting: [SETTING]
Visible action: [ACTION]
Emotion: [EMOTION]
Camera and composition: [CAMERA]
Lighting: [LIGHTING]
Palette: [PALETTE]
Frame: [ASPECT_RATIO]; [MODE_DIRECTIVE]
```

每镜完整重复共享底座和角色锁，可以单独复制使用。不要只写“同上一镜”。角色锁保持词句完全一致。

| 模块 | 固定项 | 可变化项 |
|---|---|---|
| STYLE_LOCK | 材质、工艺、动画渲染语言 | 用户明确要求改变风格时建立新版本 |
| PRIMARY_PROFILE | 一个主叙事类别 | 角色和场景细节；混合题材先选主类 |
| CHARACTER_LOCK | 身份、面部、发型、服饰、道具、轮廓 | 动作、表情、位置；剧情换装需新锁版本 |
| SCENE_LOCK | 场景布局、建筑、固定道具、天气、时段 | 换地点选择另一个注册场景 |
| SETTING / ACTION | 具体可见环境与一个主要动作 | 地点和叙事推进 |
| CAMERA / LIGHTING | 可读主体、明确光源 | 景别、角度、色温、情绪曲线 |
| FRAME | 系列统一画幅和配色 | 用户明确改版时新建输出包 |

## 原测试风格词

[可见记录] 原测试使用 `Pixar stylized 3D animated feature film`。默认采用可拆解的视觉描述；明确要求保留原词时将 `brand_style` 设置为 `original-test`。只切换风格前缀，不改变材质底座，不保证复现某部电影。

## 负向约束

以自然语言排除真人摄影、二维平涂、光滑廉价塑料、现代道具、风格漂移和不可读动作；各 Profile 添加对应约束。目标工具支持独立负向字段时使用该字段，否则采用 `Avoid …` 约束段。不擅自添加工具参数。


[本版实现] 场景锁与角色锁逐镜完整重复。镜头运动只进入独立 motion_prompt_en；声音和转场仅为制作字段，不改变静态风格底座。参考图 ID 作为元数据保留，不将文件路径写入视觉提示词。
