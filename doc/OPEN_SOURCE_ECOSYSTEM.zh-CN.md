# Tesla 与树莓派车载开源生态评估

审计日期：2026-08-30。选择原则是保持 TeslaUSB 的核心职责单一：车辆写盘、可靠归档和轻量管理。不能因为项目优秀就直接塞入 Pi Zero 镜像。

## 结论

| 项目 | 推荐位置 | 结论 | 主要原因 |
| --- | --- | --- | --- |
| [Tesla Vehicle Command](https://github.com/teslamotors/vehicle-command) | Pi Zero / Zero 2 W | 已部分接入 | Tesla 官方 Apache-2.0 工具；当前已使用 `tesla-control` 和 `tesla-keygen` 处理 BLE 唤醒 |
| [File Browser](https://github.com/filebrowser/filebrowser) | Pi Zero / Zero 2 W | 下一步优先评估 | Apache-2.0 单文件服务，官方发布 ARMv6/ARMv7；可替代旧素材文件管理界面 |
| [tesla_dashcam](https://github.com/ehendrix23/tesla_dashcam) | NAS / PC | 推荐伴生 | 能把多摄像头分段合成完整视频；FFmpeg 运算不应占用 Zero 的归档窗口 |
| [TeslaMate](https://github.com/teslamate-org/teslamate) | Pi 4 / NAS / 服务器 | 推荐伴生 | 行程、充电、电池、地图和 MQTT 完整；官方当前要求 64 位 ARMv8，至少 1GB、推荐 2GB 内存 |
| [Tesla Fleet Telemetry](https://github.com/teslamotors/fleet-telemetry) | 公网服务器 | 高级方案 | Tesla 官方实时遥测服务，需要公网 TLS、证书、Fleet API 注册及隐私治理 |
| [ntfy](https://github.com/binwiederhier/ntfy) | 外部服务；TeslaUSB 作为客户端 | 已支持发送 | ARMv6/ARMv7 可用，但把通知服务器内置在行车记录盘上没有明显收益 |
| [RaspAP](https://github.com/RaspAP/raspap-webgui) | 独立 Pi 3/4/5 网关 | 条件推荐 | 适合移动热点、WireGuard/OpenVPN 和双网卡路由；会与 TeslaUSB 的热点和网络状态机重叠 |
| [OpenAuto Prodigy](https://github.com/mrmees/openauto-prodigy) | 独立 Pi 4 副屏 | 观察项目 | 面向无线 Android Auto 的开源车机，仍较新且要求 Pi 4；Tesla 原车机通常不需要它 |

## 推荐实施顺序

### 1. File Browser 可选组件

先做设计验证，不直接替换现有界面：

- 只允许访问 `/mnt/music`、`/mnt/lightshow`、`/mnt/boombox` 和 `/mnt/custom`；
- 默认禁止访问系统根目录、密钥和归档凭据；
- 与现有 Web Basic Auth 统一，不引入第二套默认密码；
- 车辆占用 LUN 时限制写操作，避免 Linux 与车辆同时修改文件系统；
- 固定版本、校验发布包，并分别使用 ARMv6 和 ARMv7 构建。

### 2. tesla_dashcam 归档触发模板

TeslaUSB 已支持归档完成触发文件。建议增加 NAS 端示例，而不是在 Pi Zero 内运行 FFmpeg：归档成功后生成触发文件，由服务器合成多镜头布局、保留原始片段并回写处理状态。

### 3. 安全远程访问

远程访问优先复用路由器 VPN。若车辆使用独立移动网络，可在独立网关上部署 WireGuard、Tailscale 或 RaspAP；TeslaUSB Web UI 不应直接暴露公网。

## 不建议直接内置

- TeslaMate、TeslaLogger：数据库和可视化栈超出 Pi Zero 的资源边界；
- Fleet Telemetry：需要公开可达的 TLS 服务和敏感证书，车内设备不是合适的信任边界；
- RaspAP/OpenAuto 类完整车机：会争用 Wi-Fi、USB、Nginx、音频或显示资源；
- 只通过浏览器本地目录选择工作的 TeslaCam Viewer：无法直接复用 TeslaUSB 的 FUSE/归档后端，手机浏览体验也受浏览器 API 限制。
