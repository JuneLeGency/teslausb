import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '通知配置教程｜TeslaUSB 中文版',
  description: 'Step by Step 配置 TeslaUSB 钉钉、企业微信与飞书归档通知。',
  openGraph: {
    title: 'TeslaUSB 通知配置教程',
    description: '从创建群机器人到设备端测试，逐步完成钉钉、企业微信和飞书通知。',
  },
};

const editCommands = `ssh teslausb
sudo /root/bin/remountfs_rw
sudo cp -a /root/teslausb_setup_variables.conf \\
  /root/teslausb_setup_variables.conf.before-notifications
sudo nano /root/teslausb_setup_variables.conf`;

const testCommands = `sudo bash -n /root/teslausb_setup_variables.conf

sudo bash -lc '
source /root/bin/envsetup.sh
log() { printf "%s\\n" "$*"; }
export -f log
/root/bin/send-push-message \
  "$NOTIFICATION_TITLE" "通知通道配置成功" finish
'`;

const providers = [
  {
    id: 'dingtalk',
    number: '01',
    name: '钉钉',
    label: 'DINGTALK',
    hint: '推荐开启加签；如启用关键词，建议填写 TeslaUSB。',
    href: 'https://open.dingtalk.com/document/orgapp/custom-robot-access',
    steps: ['进入目标群的设置，打开「机器人」并添加自定义机器人。', '安全设置选择「加签」；需要关键词时填写 TeslaUSB。', '保存 Webhook 地址与以 SEC 开头的加签密钥。'],
    config: `export NOTIFICATION_TITLE='我的 TeslaUSB 通知'
export DINGTALK_ENABLED=true
export DINGTALK_WEBHOOK_URL='https://oapi.dingtalk.com/robot/send?access_token=替换这里'
export DINGTALK_SECRET='SEC替换这里'`,
  },
  {
    id: 'wecom',
    number: '02',
    name: '企业微信',
    label: 'WECOM',
    hint: '这里指企业微信群机器人；个人微信没有对应的官方群 Webhook。',
    href: 'https://developer.work.weixin.qq.com/document/path/91770',
    steps: ['在企业微信群中打开群设置，选择「群机器人」。', '添加机器人并设置名称、头像，复制机器人 Webhook。', 'Webhook 中的 key 就是凭据；无需单独的签名密钥。'],
    config: `export NOTIFICATION_TITLE='我的 TeslaUSB 通知'
export WECOM_ENABLED=true
export WECOM_WEBHOOK_URL='https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=替换这里'`,
  },
  {
    id: 'feishu',
    number: '03',
    name: '飞书',
    label: 'FEISHU',
    hint: '推荐开启签名校验；签名依赖设备时间准确。',
    href: 'https://open.feishu.cn/document/client-docs/bot-v3/add-custom-bot',
    steps: ['进入目标群设置，打开「群机器人」并添加自定义机器人。', '在安全设置中启用「签名校验」，按需设置关键词。', '复制 Webhook 地址和签名校验密钥。'],
    config: `export NOTIFICATION_TITLE='我的 TeslaUSB 通知'
export FEISHU_ENABLED=true
export FEISHU_WEBHOOK_URL='https://open.feishu.cn/open-apis/bot/v2/hook/替换这里'
export FEISHU_SECRET='替换这里'`,
  },
];

export default function NotificationGuide() {
  return (
    <main className="guidePage">
      <nav className="nav shell" aria-label="教程导航">
        <Link className="brand" href="/" aria-label="返回 TeslaUSB 中文版首页"><span className="brandMark">T</span><span>TeslaUSB <b>CN</b></span></Link>
        <div className="guideNavLinks"><a href="#prepare">准备</a><a href="#channels">选渠道</a><a href="#device">写入设备</a><a href="#verify">验证</a></div>
        <Link className="navCta" href="/">返回首页</Link>
      </nav>

      <header className="guideHero shell">
        <div><p className="eyebrow"><span /> GUIDE / NOTIFICATIONS</p><h1>通知配置，<br /><em>一步一步来。</em></h1></div>
        <div className="guideHeroSide"><p>归档开始、结束或设备告警时，把中文消息发送到常用群聊。推荐先只启用一个渠道，测试成功后再增加其他渠道。</p><div><span>预计用时</span><b>10 分钟</b></div></div>
      </header>

      <section className="guideSection guidePrepare" id="prepare">
        <div className="shell guideTwoCol">
          <div className="guideAside"><span>STEP 00</span><h2>开始之前</h2></div>
          <div className="checkGrid">
            <article><span>01</span><h3>设备在线</h3><p>电脑能执行 <code>ssh teslausb</code>，Zero 也能访问对应机器人域名。</p></article>
            <article><span>02</span><h3>准备群聊</h3><p>你需要目标群的机器人管理权限；测试阶段建议使用单独的测试群。</p></article>
            <article><span>03</span><h3>保护密钥</h3><p>Webhook 相当于发送凭据。不要截图公开，也不要提交到 Git 仓库。</p></article>
            <article><span>04</span><h3>只开一个</h3><p>先完成一个渠道的闭环，再复制配置到其他渠道，排障更清楚。</p></article>
          </div>
        </div>
      </section>

      <section className="guideSection guideChannels" id="channels">
        <div className="shell">
          <div className="guideSectionHead"><p className="kicker">STEP 01 / CREATE A BOT</p><h2>选择一个通知渠道。</h2><p>下面每张卡都包含机器人创建路径和需要写入设备的变量。点击展开后照着做即可。</p></div>
          <div className="providerList">
            {providers.map((provider, index) => (
              <details className="provider" id={provider.id} key={provider.id} open={index === 0}>
                <summary><span>{provider.number}</span><div><b>{provider.name}</b><small>{provider.hint}</small></div><em>{provider.label}</em><i>＋</i></summary>
                <div className="providerBody">
                  <ol>{provider.steps.map((step) => <li key={step}>{step}</li>)}</ol>
                  <div><div className="codeHead"><span>teslausb_setup_variables.conf</span><b>只替换“替换这里”</b></div><pre><code>{provider.config}</code></pre><a href={provider.href} target="_blank" rel="noreferrer">查看官方机器人文档 ↗</a></div>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="guideSection guideDevice" id="device">
        <div className="shell guideTwoCol">
          <div className="guideAside inverse"><span>STEP 02</span><h2>写入 Zero</h2><p>运行中的 TeslaUSB 根分区默认只读。先临时切换为可写，并自动保留一份配置备份。</p></div>
          <div className="terminalBlock"><div className="terminalTitle"><i /><i /><i /><span>本机终端</span></div><pre><code>{editCommands}</code></pre><p>把上一步选中渠道的变量粘贴到文件末尾。按 <kbd>Ctrl</kbd> + <kbd>O</kbd> 保存，回车确认，再按 <kbd>Ctrl</kbd> + <kbd>X</kbd> 退出。</p></div>
        </div>
      </section>

      <section className="guideSection guideVerify" id="verify">
        <div className="shell">
          <div className="guideSectionHead"><p className="kicker">STEP 03 / TEST & APPLY</p><h2>先测试，再重启。</h2><p>第一条命令检查配置语法；第二条命令立即向所有已启用渠道发送测试消息。</p></div>
          <div className="verifyGrid">
            <div className="terminalBlock light"><div className="terminalTitle"><i /><i /><i /><span>teslausb</span></div><pre><code>{testCommands}</code></pre></div>
            <div className="verifySteps">
              <article><span>1</span><div><b>群里收到测试消息</b><p>说明 Webhook、签名和网络都正常。</p></div></article>
              <article><span>2</span><div><b>重启加载正式配置</b><pre><code>sudo systemctl reboot</code></pre></div></article>
              <article><span>3</span><div><b>检查归档日志</b><pre><code>{`ssh teslausb 'tail -n 80 /mutable/archiveloop.log'`}</code></pre></div></article>
            </div>
          </div>
        </div>
      </section>

      <section className="guideSection troubleshooting">
        <div className="shell">
          <div className="guideSectionHead inverse"><p className="kicker">TROUBLESHOOTING</p><h2>没有收到消息？</h2></div>
          <div className="troubleGrid">
            <article><span>01</span><h3>先看返回码</h3><p>手动测试会直接显示平台响应。钉钉/企业微信成功通常是 <code>errcode: 0</code>，飞书成功是 <code>code: 0</code>。</p></article>
            <article><span>02</span><h3>检查时间</h3><p>加签失败先运行 <code>timedatectl status</code>。飞书签名和钉钉加签都依赖设备时间准确。</p></article>
            <article><span>03</span><h3>检查安全规则</h3><p>确认消息包含平台要求的关键词；若设置了 IP 白名单，需要允许 Zero 当前公网出口地址。</p></article>
            <article><span>04</span><h3>检查路由器 VPN</h3><p>机器人域名应能正常直连或走稳定代理。fake-IP 模式下要避免 DNS 可解析但 HTTPS 请求被重置。</p></article>
          </div>
          <div className="secretWarning"><span>!</span><p><b>不要把真实 Webhook 发到 Issue、聊天截图或仓库。</b> 如果泄露，应立即在群设置中删除机器人并重新创建。</p></div>
        </div>
      </section>

      <footer className="footer"><div className="shell legal"><span>TeslaUSB 中文版 · 通知配置教程</span><Link href="/">返回能力总览 →</Link></div></footer>
    </main>
  );
}
