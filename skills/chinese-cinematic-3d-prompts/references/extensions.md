# 扩展约定 v1.1.0

[已实现] 场景锁、参考图关联、镜头运动、声音提示、转场和离线 HTML 分镜板导出。完整契约见 input-contract.md、output-contract.md；工作步骤见 storyboard-production.md。

| 后续扩展 | 接口位置 | 要求 |
|---|---|---|
| 新 Profile | profiles.json、参考文档、路由表 | 同步 Schema 枚举，保留风格底座 |
| 多角色 | characters[] 与角色 ID | 当前仍是单角色锁；新增时兼容 character_lock |
| 图像适配器 | 消费 prompt_en 与 references | 当前仅模型按工具能力使用；不自动上传或生成 |
| 动态预演 | 消费 timeline、motion、sound、transition_out | 明确计时约定；当前不输出可播放视频或音频 |
| 直接 PDF / 视频导出 | export_storyboard.py 的后续格式 | 当前只有 HTML；打印 PDF 由浏览器执行 |
| 项目设定 | 版本化 project bible | 保留来源与修订，不覆盖旧锁 |

Profile 条目维持 label/focus/prompt_en/avoid。新增字段必须同步 Schema、运行时校验、契约、实例和行为验证。兼容可选字段用次版本；改变含义或删字段用主版本；更新 schema_version。

Python 实现仅依赖标准库。导出器仅嵌入本地 PNG/JPEG/WebP，不请求外网，不执行输入中的脚本。扩展网络或自动上传能力时须明示实际行为与资源状态。
