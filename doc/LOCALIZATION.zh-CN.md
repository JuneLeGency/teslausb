# 中国大陆本地化审计

审计日期：2026-08-30。结论：**基础镜像、构建链、设备内查看器、主要通知和中文入口已经完成本地化；底层技术日志仍有上游英文。** 当前状态适合刷写和日常使用。

## 已完成

| 项目 | 当前实现 | 验证点 |
| --- | --- | --- |
| 系统语言 | `zh_CN.UTF-8` | `pi-gen-config` 与导出镜像 `/etc/default/locale` |
| 时区 | `Asia/Shanghai` | `pi-gen-config`、配置样例 |
| Wi‑Fi 国家码 | `CN` | pi-gen、首次设置脚本、wpa_supplicant 样例 |
| Raspbian 软件源 | 默认南京大学镜像，可用环境变量覆盖 | `pi-gen-sources/prepare.sh` |
| Apple Silicon 构建 | 兼容 macOS `arm64` 与 QEMU ARMHF | `prepare.sh` 注入兼容层 |
| 中文使用入口 | README、配置指南、架构文档 | `README.md`、`doc/*.zh-CN.md` |
| 项目介绍 | 中文响应式网站 | `site/` |
| 分支治理 | `master` 本地化；`main-dev` 跟踪上游 | Git branch/remote 配置 |
| 摄像头查看器 | 固定 `teslausb-webui v1.2.1`、SHA-256 校验、镜像内缓存、默认简体中文 | `00-run.sh`、`configure-web.sh` |
| 国内通知 | 钉钉、企业微信群机器人、飞书；支持 UTF-8 和可选签名 | `send-cn-webhook.py` 与单元测试 |
| 自定义素材 | 锁车音、灯光秀、车身贴图独立存储并可通过网页管理 | `BOOMBOX`、`LIGHTSHOW`、`CUSTOM` LUN |

键盘布局仍保持 `us`，这是有意选择：TeslaUSB 通常无显示器运行，英文键位更利于终端排障，也避免改变脚本符号输入习惯。

## 尚未完成

| 项目 | 原因与影响 | 建议优先级 |
| --- | --- | --- |
| 底层运行时日志全文中文 | 保留部分英文便于与上游问题单和搜索结果对应；用户可见通知已中文化 | 低 |
| 全部高级配置样例逐行中文注释 | 变量很多且持续随上游变化；已有中文高频配置指南 | 中 |
| 第三方 Wiki 中文镜像 | Wiki 独立维护，容易过期 | 低 |

## 本地化边界

以下内容不应翻译：配置变量名、systemd 服务名、Linux 路径、USB 卷标、协议字段以及外部 API 参数。中文文档应解释它们，但保持可直接复制和与上游问题单一致。

## 后续验收清单

- 每次上游合并后搜索 `country=US`、`America/Los_Angeles`、默认 Raspbian URL 是否回归；
- 构建后在镜像中核对 locale、timezone、Wi‑Fi regdomain 和 apt source；
- 用 Pi Zero W 冷启动验证 2.4GHz WPA2 网络；
- 验证国内镜像不可用时 `RASPBIAN_MIRROR` 可切回官方源；
- 校验内置查看器压缩包 SHA-256，并验证首次访问默认选择简体中文；
- 钉钉/企业微信/飞书至少各做一次真实机器人投递验收。
