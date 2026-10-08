# 调用实例

[创作提案] 示例为本版设计，不是用户实际作品或历史记录。

## 最小单幅

```json
{
  "profile": "jianghu",
  "subject": "a lone traveler standing outside a rural inn",
  "setting": "a rainy courtyard outside an ancient Chinese roadside inn",
  "action": "the traveler pauses at the doorway and looks toward a seated guest"
}
```

自然语言：“江湖客栈雨夜，旅人在门口与坐客对视，写单幅提示词。”模型选主类和默认机位，标默认；CLI 显式填写 profile。

## 角色与分镜

运行 `assets/examples/xiake-character.json` 得到一个姿态的全身角色设定；后续复用 character_lock。运行 `assets/examples/zhiguai-storyboard.json` 得三镜，每镜完整重复角色、风格、配色、画幅，变化机位、动作、灯光。

复制各完整 prompt_en 到目标工具；检查实际图像后迭代，不把词句重复当成视觉保证。

## 历史场景

未考据例可采用 historical + stylized + “an unnamed ancient Chinese scholar”。没有姓名和史料，不能说是具体人物复原。用户要求具体人物与 strict 时先查证，填入主张、来源和状态；不为让例子运行而编造证据。
