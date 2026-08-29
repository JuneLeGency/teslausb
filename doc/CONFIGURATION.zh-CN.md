# TeslaUSB 中文配置指南

刷写完成后，在 SD 卡启动分区找到 `teslausb_setup_variables.conf`。变量名必须保持英文；只修改引号内的值。提交问题前请先删除密码、Token 和服务器地址。

## 最小可启动配置

先用不归档模式验证车辆、USB 和本地 Web UI，再添加 NAS：

```bash
export ARCHIVE_SYSTEM=none
export SSID='你的 2.4GHz Wi-Fi'
export WIFIPASS='你的 Wi-Fi 密码'
export CAM_SIZE=40G
```

## SMB / Windows / NAS

```bash
export ARCHIVE_SYSTEM=cifs
export ARCHIVE_SERVER='192.168.31.10'
export SHARE_NAME='TeslaCam'
export SHARE_USER='teslausb'
export SHARE_PASSWORD='请替换为专用密码'
```

建议为 TeslaUSB 单独创建只允许访问目标目录的 NAS 用户。若 NAS 支持，固定 DHCP 地址能减少首次排障变量。

## rsync

```bash
export ARCHIVE_SYSTEM=rsync
export RSYNC_USER='teslausb'
export RSYNC_SERVER='192.168.31.10'
export RSYNC_PATH='/srv/teslacam'
```

密钥认证配置见 [SetupRSync.md](SetupRSync.md)。

## NFS 与云端

NFS 需要服务器正确授权树莓派所在网段；rclone 需要先创建 remote，并妥善保管配置文件。详细步骤见 [SetupShare.md](SetupShare.md) 与 [SetupRClone.md](SetupRClone.md)。

## 容量建议

- 64GB 卡：适合验证或较轻使用，预留系统和维护空间；
- 128GB 卡：推荐起点，CAM 可按百分比分配；
- MUSIC、LIGHTSHOW、BOOMBOX、CUSTOM 只在实际需要时分配；
- 不要把全部空间分光，文件系统检查、日志和升级都需要余量。

## Web UI 与热点

镜像内置并校验 `teslausb-webui v1.2.1`，首次访问默认简体中文，可切换语言。启用 Web UI 后应设置独立用户名和强密码。TeslaUSB 热点只用于首次配置或故障恢复，完成家庭 Wi‑Fi 配置后不要把它作为长期公网入口。

## 锁车音、灯光秀与自定义贴图

```bash
export LIGHTSHOW_SIZE=1G
export BOOMBOX_SIZE=500M
export CUSTOM_SIZE=500M
```

系统分别创建 `LightShow/`、`Boombox/` 和 `Wraps/` 目录，并作为独立 USB 盘暴露给车辆。网页文件管理器可上传素材；兼容音频还能一键复制为盘根目录的 `LockChime.wav`。不同车型和车机版本支持的贴图格式可能不同，最终以车机 Paint Shop/自定义贴图导入界面的提示为准。

## 钉钉、企业微信与飞书通知

```bash
export NOTIFICATION_TITLE='我的 TeslaUSB 通知'

export DINGTALK_ENABLED=true
export DINGTALK_WEBHOOK_URL='https://oapi.dingtalk.com/robot/send?access_token=...'
export DINGTALK_SECRET='SEC...'

export WECOM_ENABLED=true
export WECOM_WEBHOOK_URL='https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=...'

export FEISHU_ENABLED=true
export FEISHU_WEBHOOK_URL='https://open.feishu.cn/open-apis/bot/v2/hook/...'
export FEISHU_SECRET='...'
```

钉钉和飞书建议启用签名校验。这里的“微信”指企业微信群机器人；个人微信没有适合设备自动化的官方群机器人 Webhook。Webhook 和密钥只保存在设备配置中，不要提交到 Git。

## 外接数据盘警告

`DATA_DRIVE` 指向的设备可能在首次配置时被重新分区和格式化。不要凭 `/dev/sda` 等名称猜测；先通过序列号和容量确认目标，并确保盘内数据已有备份。

## 首次启动验收

1. 使用稳定 5V 电源启动，不要立即插车；
2. 等待镜像创建、格式化和服务安装完成；
3. 查看 `/mutable/teslausb-headless-setup.log` 是否出现完成信息；
4. 确认树莓派连接家庭 Wi‑Fi，归档端可写；
5. 断电后用支持数据的线连接车辆 OTG 口；
6. 在车机中确认 Dashcam 图标和录像写入，再检查自动归档。

如果构建下载慢，优先更换 `RASPBIAN_MIRROR`；路由器 VPN 建议让国内镜像直连，让 GitHub、Docker Hub 等境外站点走代理，避免全局代理把国内下载绕到海外。
