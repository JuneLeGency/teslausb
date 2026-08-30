# TeslaUSB 国内通知配置教程

TeslaUSB 已内置钉钉、企业微信群机器人和飞书通知适配器，支持 UTF-8 中文消息；钉钉与飞书支持可选签名。建议先只配置一个渠道，手动测试成功后再增加其他渠道。

> Webhook 和签名密钥等同于发送凭据。不要提交到 Git、公开 Issue 或截图；若泄露，应立即删除机器人并重新创建。

## Step 0：准备

1. 确认可以运行 `ssh teslausb` 登录设备；
2. 确认你有目标群的机器人管理权限；
3. 测试阶段建议新建一个测试群；
4. 如果路由器启用了 VPN，确认 Zero 能访问对应机器人的 HTTPS 域名。

## Step 1：创建群机器人

### 钉钉

1. 进入目标群设置，打开“机器人”，添加自定义机器人；
2. 安全设置推荐选择“加签”；如果同时启用关键词，建议填写 `TeslaUSB`；
3. 保存 Webhook 地址和以 `SEC` 开头的加签密钥；
4. 将下面变量加入配置：

```bash
export NOTIFICATION_TITLE='我的 TeslaUSB 通知'
export DINGTALK_ENABLED=true
export DINGTALK_WEBHOOK_URL='https://oapi.dingtalk.com/robot/send?access_token=替换这里'
export DINGTALK_SECRET='SEC替换这里'
```

官方说明：[钉钉自定义机器人](https://open.dingtalk.com/document/orgapp/custom-robot-access)。

### 企业微信

这里的“微信”指企业微信群机器人；个人微信没有对应的官方群机器人 Webhook。

1. 在企业微信群设置中打开“群机器人”；
2. 添加机器人并复制 Webhook；
3. Webhook 中的 `key` 就是发送凭据，无需单独签名密钥；
4. 将下面变量加入配置：

```bash
export NOTIFICATION_TITLE='我的 TeslaUSB 通知'
export WECOM_ENABLED=true
export WECOM_WEBHOOK_URL='https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=替换这里'
```

官方说明：[企业微信群机器人](https://developer.work.weixin.qq.com/document/path/91770)。

### 飞书

1. 进入目标群设置，打开“群机器人”，添加自定义机器人；
2. 推荐启用签名校验；按需设置关键词；
3. 保存 Webhook 地址和签名密钥；
4. 将下面变量加入配置：

```bash
export NOTIFICATION_TITLE='我的 TeslaUSB 通知'
export FEISHU_ENABLED=true
export FEISHU_WEBHOOK_URL='https://open.feishu.cn/open-apis/bot/v2/hook/替换这里'
export FEISHU_SECRET='替换这里'
```

官方说明：[飞书自定义机器人](https://open.feishu.cn/document/client-docs/bot-v3/add-custom-bot)。

## Step 2：写入 Zero

运行中的 TeslaUSB 根分区默认只读。先切换为可写并备份配置：

```bash
ssh teslausb
sudo /root/bin/remountfs_rw
sudo cp -a /root/teslausb_setup_variables.conf \
  /root/teslausb_setup_variables.conf.before-notifications
sudo nano /root/teslausb_setup_variables.conf
```

把所选渠道的变量粘贴到文件末尾。按 `Ctrl+O` 保存、回车确认，再按 `Ctrl+X` 退出。

## Step 3：语法检查和手动测试

先检查配置文件没有 Bash 语法错误：

```bash
sudo bash -n /root/teslausb_setup_variables.conf
```

然后立即向所有已启用渠道发送一条测试消息：

```bash
sudo bash -lc '
source /root/bin/envsetup.sh
log() { printf "%s\n" "$*"; }
export -f log
/root/bin/send-push-message \
  "$NOTIFICATION_TITLE" "通知通道配置成功" finish
'
```

钉钉和企业微信成功响应通常包含 `errcode: 0`；飞书成功响应通常包含 `code: 0`。

## Step 4：重启并验收

```bash
sudo systemctl reboot
```

设备恢复后查看归档日志：

```bash
ssh teslausb 'tail -n 80 /mutable/archiveloop.log'
```

有新录像被复制时才会发送正常的归档完成通知；没有新文件时不发送是正常行为。

## 常见问题

- **签名校验失败**：运行 `timedatectl status`，确认设备时间和 NTP 同步正常；
- **关键词不匹配**：确保通知标题或正文包含平台要求的关键词，推荐关键词 `TeslaUSB`；
- **IP 白名单失败**：允许 Zero 当前使用的公网出口 IP；
- **Webhook 无效**：检查复制时是否遗漏字符，必要时删除机器人并重新创建；
- **域名能解析但请求失败**：检查路由器 VPN/fake-IP 规则，让机器人域名直连或走稳定代理；
- **恢复旧配置**：使用 `teslausb_setup_variables.conf.before-notifications` 覆盖当前配置，然后重启。

国外渠道（Telegram、Discord、Slack、Matrix、ntfy、Gotify 等）继续参见 [上游通知配置](ConfigureNotificationsForArchive.md)。
