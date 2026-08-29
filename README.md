# TeslaUSB 中文版

> 把 Raspberry Pi 变成一块会自动归档的特斯拉行车记录 U 盘。

TeslaUSB 通过 USB Gadget 模拟车辆可识别的存储设备。车辆照常写入 Dashcam、Sentry 和音乐分区；回到已配置的 Wi‑Fi 后，树莓派会安全断开虚拟磁盘、检查文件系统，并把新录像归档到 NAS、服务器或云端。

本仓库的 `master` 分支在上游 TeslaUSB 基础上提供中国大陆构建优化、中文文档与介绍站点。`main-dev` 保持跟踪原作者仓库，不承载本地定制。

项目能力介绍：[teslausb-cn.icy-note-8409.chatgpt.site](https://teslausb-cn.icy-note-8409.chatgpt.site)

## 主要能力

- 模拟 `CAM`、`MUSIC`、`LIGHTSHOW`、`BOOMBOX`、`CUSTOM` 等一个或多个 USB LUN；
- 归档到 SMB/CIFS、NFS、rsync 或 rclone，亦可只使用本地录像盘；
- 自动执行文件系统检查、归档、清理、音乐同步并重新连接车辆；
- 保存超过车辆默认时长的 `RecentClips`，并按剩余空间自动清理；
- 内置固定版本、校验过的摄像头 Web 查看器，默认简体中文，可浏览和下载多摄像头录像；
- 支持钉钉、企业微信、飞书及 Signal、Telegram、Discord、Slack、Matrix、ntfy、Gotify、Webhook 等通知；
- 网页管理锁车音、灯光秀和自定义车身贴图素材；独立盘避免与 `TeslaCam` 目录冲突；
- 支持 Wi‑Fi 热点、温度监测、只读根文件系统和独立数据盘；
- 可通过 TeslaFi、Tessie、BLE 或 Webhook 等方式辅助车辆保持唤醒。

完整数据流和安全边界见 [核心架构](doc/ARCHITECTURE.zh-CN.md)，本地化现状见 [本地化审计](doc/LOCALIZATION.zh-CN.md)，通知和素材盘配置见 [中文配置指南](doc/CONFIGURATION.zh-CN.md)。

## 硬件与镜像

| 项目 | 建议 |
| --- | --- |
| 开发板 | Raspberry Pi Zero W / Zero 2 W；Pi 4B / Pi 5 也受支持 |
| 存储卡 | 最低 64GB，推荐 128GB 或更大、高耐久型号 |
| 系统 | Raspberry Pi OS Bookworm，32 位 ARMHF |
| 连接线 | Zero 系列使用支持数据的 USB-A ↔ Micro-USB 线，接入标有 `USB` 的 OTG 口 |
| 网络 | 停车位置能连接 WPA2 Wi‑Fi；首次启动可使用 TeslaUSB 热点配置 |

不带无线网络的初代 Pi Zero 需要额外网络方案，不建议作为默认部署目标。

## 快速开始

1. 从项目构建产物或 [上游 Releases](https://github.com/marcone/teslausb/releases) 获取 `.img.zip`。
2. 使用 Raspberry Pi Imager 或 balenaEtcher 写入 Micro SD 卡；不要仅把压缩包复制到卡中。
3. 按 [中文配置指南](doc/CONFIGURATION.zh-CN.md) 修改启动分区中的 `teslausb_setup_variables.conf`。
4. 将卡插入树莓派，先在稳定电源下完成首次启动。状态灯停止持续活动后，再连接车辆。
5. 通过通知、Web UI 或 `/mutable/teslausb-headless-setup.log` 确认初始化成功。

首次启动会创建和格式化录像分区，期间不要断电。使用 `DATA_DRIVE` 时目标磁盘会被重新分区，务必先核对设备名并备份数据。

## 本地构建

镜像基于 Raspberry Pi 官方 `pi-gen` 的 Bookworm 分支构建。仓库默认固定南京大学 Raspbian 镜像，避免全球重定向器在一次构建中混用高延迟节点；树莓派官方固件和内核源保持不变。

```bash
git clone --branch bookworm https://github.com/RPi-Distro/pi-gen.git
cd pi-gen
../teslausb/pi-gen-sources/prepare.sh
./build-docker.sh
```

可按网络情况切换镜像：

```bash
RASPBIAN_MIRROR=https://mirrors.ustc.edu.cn/raspbian/raspbian/ \
  ../teslausb/pi-gen-sources/prepare.sh
```

在 Apple Silicon macOS 上，`prepare.sh` 会自动处理 `arm64` 架构识别和 QEMU ARMHF personality 兼容。构建结果位于 `pi-gen/deploy/`。

## 分支与上游同步

| 分支/远端 | 用途 |
| --- | --- |
| `master` | 中文版发布、镜像构建与本地维护 |
| `main-dev` | 跟踪原作者 `marcone/teslausb` |
| `origin` | 当前个人仓库 |
| `upstream` | `https://github.com/marcone/teslausb.git` |

更新上游时先同步 `main-dev`，再把经过审阅的提交合并或挑选到 `master`，避免本地化改造污染上游跟踪分支。

## 仓库结构

```text
pi-gen-sources/   Raspberry Pi 镜像构建层
setup/            首次启动、分区和服务配置
run/              设备运行时与 USB Gadget 脚本
archive/          CIFS/NFS/rsync/rclone 归档适配器
doc/              安装、配置、架构及本地化文档
site/             中文能力介绍网站
```

## 安全提示

- 首次启动后立即替换默认 Wi‑Fi、归档端和 Web UI 凭据；
- 不要把包含密码、Token 或私钥的配置文件提交到 Git；
- Web UI 默认更适合可信局域网，跨公网访问应放在 VPN 或反向代理认证之后；
- 更新镜像前保留录像归档和配置备份，并校验发布包 SHA-256。

原项目由社区从早期 Tesla Dashcam 智能 U 盘脚本发展而来，详细历史和更多硬件说明见 [上游 Wiki](https://github.com/marcone/teslausb/wiki)。
