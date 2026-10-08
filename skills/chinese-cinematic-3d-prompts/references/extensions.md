# 后续扩展约定

[本版实现] 保留接口，以下模块尚未实现。

| 扩展 | 接口位置 | 升级要求 |
|---|---|---|
| 新 Profile | profiles.json、参考文档、路由表 | 同步 Schema 枚举；不改共享底座；运行新例子 |
| 多角色 | characters[] 和镜头角色 ID | 保持 character_lock 兼容；逐角色定义外貌、道具、站位 |
| 时间轴 | shots 的时长和节拍字段 | 定义顺序、总时长、转场、音画；现有时长只为规划 |
| 图像工具 | 独立 adapter | 输入 prompt pack，输出工具 payload；核对真实支持参数 |
| 参考图 / seed | adapter 资源映射 | 记录 ID、权限、真实支持；当前不上传参考图或设置 seed |
| 项目设定 | 版本化 project bible | 导入锁和世界观；记录来源、修订；不覆盖旧锁 |
| 风格修订 | 新 style 版本 | 当前仅前缀开关；其他整体改变明确版本边界 |

Profile 条目固定 `label`（中文）、`focus`（选型说明）、`prompt_en`（英文叠加）、`avoid`（英文数组）四键。脚本运行时读取，无 Profile 分支硬编码。

未知输入字段故意报错。新增字段同步 Schema、校验、契约、实例；兼容可选字段用次版本，改含义或删字段用主版本，更新输出 schema_version。
