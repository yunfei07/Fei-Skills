# 分镜制作与导出 v1.1.0

## 建立制作输入

1. 提取故事节拍；给一个镜头一个主要可见动作。默认只规划和输出提示词，明确要求出图才使用图像工具。
2. 固定角色锁；为各地点登记 scene_locks 并选择 scene_id。局部视域变化放在 setting，地点变化切换 ID。
3. 登记 reference_images 并用 reference_ids 选择。原图可用时先查看内容，再明确用于角色、场景或风格的哪一部分。不能查看或无法传入工具时如实说明。
4. 安排 camera_motion、sound、transition_out 和每镜 duration_seconds。镜头运动在 motion_prompt_en，声音、转场单独记录，不混入静态图像提示词。
5. 运行 compose_prompt.py；处理真实校验错误和缺失提示，再交付制作包。不得伪造已生成媒体。

## 逐镜出图

- 只有用户要求出图时调用可用图像技能/工具；遵循该工具的参考图、编辑与保存流程。
- 把每镜完整 prompt_en 与实际可提供的参考图一起使用；明确参考图用途。reference_ids 本身不是工具参数。
- 审阅脸、服饰、武器持握、建筑与路径、视线和左右关系；重复锁句不保证视觉一致。
- 保存实际出图结果与镜头 ID 的对应关系。不把参考图自动当成所有镜头的成图。

## 导出分镜板

输入：compose_prompt.py 输出的 JSON 包。可选 image map 是镜头 ID 到实际本地成图路径的 JSON 对象：

```json
{
  "SHOT_01": "frames/shot-01.png",
  "SHOT_02": "frames/shot-02.png"
}
```

路径相对 image map 所在目录解析，也可用绝对路径；未知镜头、无效路径、非支持图片字节报错。缺少映射的镜头显示“待出图”；显式映射到不存在的文件会失败，不静默降级。

```bash
python3 scripts/export_storyboard.py --input /absolute/path/pack.json --image-map /absolute/path/frame-images.json --columns 2 --output /absolute/path/board.html
```

HTML 为自包含离线文件，嵌入本地图片，不依赖网络；支持 1/2/3 列，窄屏变单列。单张图片上限 20 MiB，唯一图片总字节上限 50 MiB。只接受 PNG/JPEG/WebP；不接收远程 URL 或 SVG。字节格式检查不是视觉正确性检查。

参考图库单独展示；本地参考路径不可用时标记，resource_id 只显示关联，导出器不解析或下载。镜头图明确标为输入图片，尚未审阅其内容。

## 打印与验收

打开 HTML 检查实际图片数、镜头 ID、占位状态、中文、长说明和竖幅。用浏览器打印预览检查 A4 横向双列布局，再保存 PDF；本版不直接生成 PDF。打印版隐藏长提示词，保留主要镜头与声音说明。

转场占源镜头末尾时长；时间轴不叠加或扣除转场。缺时长不报假总时长。声音与运动提示均为规划，不代表已合成或实现。
