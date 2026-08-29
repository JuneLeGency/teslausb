# 当前设备部署记录

本文件记录 TeslaUSB 设备的非秘密访问配置。Wi‑Fi 密码、系统登录密码、Webhook 和 NAS 凭据不得提交到 Git。

## 网络

| 优先级 | SSID | 说明 |
| ---: | --- | --- |
| 300 | `MiOfLee_5G_Game` | 存在兼容频段时优先 |
| 200 | `MiOfLee_5G` | 次选 |
| 100 | `MiOfLee` | Pi Zero 系列的 2.4 GHz 兼容兜底 |

Raspberry Pi Zero W 和 Zero 2 W 的板载无线网络均只支持 2.4 GHz。名称中带 `5G` 的 SSID 如果只广播 5 GHz，设备会自动跳过并连接 `MiOfLee`。

首次部署使用 `ARCHIVE_SYSTEM=none`，先验证 USB、Wi‑Fi 和 Web UI；NAS 归档凭据确认后再启用 CIFS、NFS、rsync 或 rclone。

## SSH 与 sudo

- 登录用户：`gencylee`；
- 权限：`sudo` 组成员，默认执行 sudo 时要求输入系统密码；
- 私钥保管：Bitwarden SSH Agent，私钥不复制到 SD 卡；
- 授权密钥：`GITHUB_FOR_ALL`，ED25519；
- 公钥指纹：`SHA256:bjBMt1kbrYMUH4HwkN0IaZg70s5Ml82rP9defNZSyH0`；
- 默认 `pi` 用户的密码登录在首次部署时锁定。

客户端确认 Bitwarden Agent 已启用：

```bash
ssh-add -l
ssh teslausb
```

本机 `~/.ssh/config` 使用以下快捷配置；`IdentityFile` 是与 Bitwarden Agent 中私钥对应的公钥，只用于精确选择 Agent 密钥：

```sshconfig
Host teslausb
    HostName teslausb.local
    User gencylee
    Port 22
    PreferredAuthentications publickey
    PasswordAuthentication no
    IdentityAgent $SSH_AUTH_SOCK
    IdentityFile ~/.ssh/id_ed25519.pub
    IdentitiesOnly yes
    ConnectTimeout 10
    ServerAliveInterval 30
    ServerAliveCountMax 3
```

当前设备 SSH host key 指纹为 `SHA256:qWKN9RCypgwOUHJSpLjrS/aZ9Vsq7kcBDgIoweid4Oo`。重刷系统后 host key 会变化，应在确认目标 IP/MAC 后重新核验，而不是直接关闭主机密钥检查。

连接时由 Bitwarden 弹窗确认签名。首次登录后执行：

```bash
id
sudo -v
nmcli connection show
```

应能看到 `sudo` 组以及三个 `TESLAUSB-MiOfLee*` 自动连接配置。首次启动脚本执行后会自删除；执行结果保存在启动分区的 `device-provisioning.log`，日志不输出明文密码。
