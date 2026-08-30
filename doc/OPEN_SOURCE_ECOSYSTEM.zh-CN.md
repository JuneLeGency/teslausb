# Tesla 与树莓派车载开源生态评估

审计日期：2026-08-30。选择原则是保持 TeslaUSB 的核心职责单一：车辆写盘、可靠归档和轻量管理。不能因为项目优秀就直接塞入 Pi Zero 镜像。

## 结论

| 项目 | 推荐位置 | 结论 | 主要原因 |
| --- | --- | --- | --- |
| [Tesla Vehicle Command](https://github.com/teslamotors/vehicle-command) | Pi Zero / Zero 2 W | 已部分接入 | Tesla 官方 Apache-2.0 工具；当前已使用 `tesla-control` 和 `tesla-keygen` 处理 BLE 唤醒 |
| [Mosquitto MQTT Client](https://mosquitto.org/man/mosquitto_pub-1.html) | Pi Zero / Zero 2 W | 推荐接入 | `mosquitto_pub` 是发送单条消息后退出的轻量客户端；Broker 继续运行在 Home Assistant、NAS 或服务器 |
| [copyparty](https://github.com/9001/copyparty) | Pi Zero / Zero 2 W | 已接入 | 纯 Python 单文件服务，仅管理素材暂存区；禁用媒体解析并由 systemd 限制权限和内存 |
| [2048](https://github.com/gabrielecirulli/2048) | 手机/车机浏览器 | 已接入 | MIT 许可纯静态游戏；Zero 只提供文件，不承担游戏计算 |
| [File Browser](https://github.com/filebrowser/filebrowser/releases) | 不再默认内置 | 停止推进 | 原项目已宣布 2026-09-01 归档且不再提供修复；不能作为新镜像的长期安全依赖 |
| [FileBrowser Quantum](https://github.com/gtsteffaniak/filebrowser) | Zero 2 W 观察项 | 暂不内置 | 项目仍在快速演进；ARM32 slim 包值得测试，但 Zero W 的 ARMv6、内存和只读根适配尚未完成验收 |
| [tesla_dashcam](https://github.com/ehendrix23/tesla_dashcam) | NAS / PC | 推荐伴生 | 能把多摄像头分段合成完整视频；FFmpeg 运算不应占用 Zero 的归档窗口 |
| [TeslaMate](https://github.com/teslamate-org/teslamate) | Pi 4 / NAS / 服务器 | 推荐伴生 | 行程、充电、电池、地图和 MQTT 完整；官方当前要求 64 位 ARMv8，至少 1GB、推荐 2GB 内存 |
| [Tesla Fleet Telemetry](https://github.com/teslamotors/fleet-telemetry) | 公网服务器 | 高级方案 | Tesla 官方实时遥测服务，需要公网 TLS、证书、Fleet API 注册及隐私治理 |
| [ntfy](https://github.com/binwiederhier/ntfy) | 外部服务；TeslaUSB 作为客户端 | 已支持发送 | ARMv6/ARMv7 可用，但把通知服务器内置在行车记录盘上没有明显收益 |
| [RaspAP](https://github.com/RaspAP/raspap-webgui) | 独立 Pi 3/4/5 网关 | 条件推荐 | 适合移动热点、WireGuard/OpenVPN 和双网卡路由；会与 TeslaUSB 的热点和网络状态机重叠 |
| [OpenAuto Prodigy](https://github.com/mrmees/openauto-prodigy) | 独立 Pi 4 副屏 | 观察项目 | 面向无线 Android Auto 的开源车机，仍较新且要求 Pi 4；Tesla 原车机通常不需要它 |

## 推荐实施顺序

### 1. 扩展现有 WebUI，而不是引入第二套文件管理服务

旧 File Browser 已宣布停止后续维护，因此不再作为默认组件。优先在现有 WebUI 上实现：

- 只允许访问 `/mnt/music`、`/mnt/lightshow`、`/mnt/boombox` 和 `/mnt/custom`；
- 默认禁止访问系统根目录、密钥和归档凭据，下载诊断包前必须脱敏；
- 复用现有 Web Basic Auth，不引入第二套账号体系；
- 车辆占用 LUN 时限制写操作，避免 Linux 与车辆同时修改文件系统；
- 对素材上传使用临时文件、格式校验和原子替换，并保留最近一次可回退版本。

### 2. MQTT 事件出口

只安装 Mosquitto 客户端，不在 Zero 上运行 Broker。建议发布以下主题：

- `teslausb/status`：在线、启动时间、版本；
- `teslausb/archive`：开始、完成、失败、复制数量；
- `teslausb/storage`：录像盘占用与清理结果；
- `teslausb/temperature`：温度告警与恢复。

凭据放在 root-only 配置中，优先使用 MQTT over TLS。Home Assistant 只作为订阅端，不反向控制车辆写盘状态。

### 3. tesla_dashcam 归档触发模板

TeslaUSB 已支持归档完成触发文件。建议增加 NAS 端示例，而不是在 Pi Zero 内运行 FFmpeg：归档成功后生成触发文件，由服务器合成多镜头布局、保留原始片段并回写处理状态。

### 4. 安全远程访问

远程访问优先复用路由器 VPN。若车辆使用独立移动网络，可在独立网关上部署 WireGuard、Tailscale 或 RaspAP；TeslaUSB Web UI 不应直接暴露公网。

## 不建议直接内置

- TeslaMate、TeslaLogger：数据库和可视化栈超出 Pi Zero 的资源边界；
- Fleet Telemetry：需要公开可达的 TLS 服务和敏感证书，车内设备不是合适的信任边界；
- RaspAP/OpenAuto 类完整车机：会争用 Wi-Fi、USB、Nginx、音频或显示资源；
- 只通过浏览器本地目录选择工作的 TeslaCam Viewer：无法直接复用 TeslaUSB 的 FUSE/归档后端，手机浏览体验也受浏览器 API 限制。

## Zero 镜像能力路线图

| 优先级 | 能力 | 实现方式 | 资源与风险 |
| --- | --- | --- | --- |
| P0 | Web 配置中心 | 复用 Nginx/WebUI，做变量校验、密钥遮蔽、备份与通知测试 | 低；不新增常驻数据库 |
| P0 | 一键诊断包 | Shell 收集服务、USB、磁盘、温度和脱敏日志 | 低；必须严格过滤凭据 |
| P0 | 车机素材仓 | 复用现有素材盘和互斥状态机，原子上传/替换 | 中；车辆持有 LUN 时禁止写入 |
| P1 | MQTT 事件出口 | `mosquitto_pub` 向外部 Broker 发布事件 | 低；建议 TLS 与最小权限账号 |
| P1 | 热点配网向导 | 复用 NetworkManager AP，提供扫码入口与连接回退 | 低；避免与现有 Wi-Fi 状态机重复 |
| P1 | 录像轻量索引 | Python 标准库 SQLite，仅存元数据、校验值与归档状态 | 中；禁止在 Zero 上生成视频缩略图或转码 |

锁车音、灯光秀和车机皮肤的来源整理、授权清单、车型兼容与内置/按需下载边界见 [车机素材库路线图](ASSET_LIBRARY.zh-CN.md)。其中“小特”等平台作为重点素材来源候选，完成授权与格式审计前不直接打入公开镜像。
