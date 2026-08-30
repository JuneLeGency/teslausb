const flow = [
  ['01', '车辆写入', '行车记录、哨兵与已保存片段'],
  ['02', 'Pi Zero 接管', '安全断开 USB，检查文件系统'],
  ['03', '自动归档', '增量同步到 NAS、服务器或云端'],
];

const capabilities = [
  ['USB', '多盘合一', 'CAM、MUSIC、LightShow、Boombox 与自定义素材盘可按需组合。'],
  ['ARC', '四类归档后端', '原生支持 SMB/CIFS、NFS、rsync、rclone；也可完全离线只保存在本地。'],
  ['FIX', '自动检查与恢复', '归档前安全断开，执行文件系统检查；流程结束后恢复 USB，降低异常断电损坏。'],
  ['WEB', '中文摄像头查看器', '内置并校验 WebUI v1.2.1，默认简体中文；局域网回看、下载多摄像头录像。'],
  ['RET', '扩展录像保留', '保存更多 RecentClips，并根据剩余空间自动清理，优先保证车辆持续写入。'],
  ['MSG', '国内通知与车机素材', '钉钉、企业微信、飞书统一接入；网页管理锁车音、灯光秀和车身贴图。'],
  ['FUN', '停车工具箱', '停车计时、充电估算、胎压换算与氛围灯；计算全部在浏览器完成。'],
  ['DROP', '隔离素材仓', '热点内投递手机文件，先进入独立暂存区，不直接写车辆正在使用的 USB 盘。'],
];

const localization = [
  ['系统语言', 'zh_CN.UTF-8', 'done'],
  ['时区 / Wi‑Fi 国家码', 'Asia/Shanghai · CN', 'done'],
  ['Raspbian 镜像源', '南京大学镜像 · 可覆盖', 'done'],
  ['Apple Silicon 构建', 'arm64 + QEMU ARMHF', 'done'],
  ['中文 README / 架构 / 配置', '已完成', 'done'],
  ['设备内摄像头查看器', '默认简体中文 · 离线缓存', 'done'],
  ['底层技术日志', '部分保留上游英文', 'pending'],
];

const assetStats = [
  ['44', '锁车音', '全部通过 WAV 格式、采样率与 1 MiB 上限检查'],
  ['20', '完整灯光秀', '音频与 FSEQ 成对并通过官方校验；另有 6 个缺配乐序列已隔离'],
  ['826', '车型皮肤', '完整翻页抓取，按 6 种精确车型模板归档'],
];

const featuredAssets = [
  ['SOUND / 05', '五种短促锁车音', '默认“大气结尾”，另含欢快、机器人等候选；统一 44.1 kHz PCM。'],
  ['LIGHT / 05', '五套完整灯光秀', '太空漫游、星球大战、加勒比海盗、超级马里奥与生日快乐。'],
  ['WRAPS / 12', '六车型模板皮肤', '每种模板精选两张，包含赛博玫瑰、星空、金属、迷彩与猫咪主题。'],
];

const ecosystem = [
  {
    status: '已接入',
    fit: 'Pi Zero / Zero 2 W',
    name: 'Tesla Vehicle Command',
    copy: 'Tesla 官方 BLE 与 Fleet 命令工具；当前镜像已经使用 tesla-control / tesla-keygen 辅助唤醒。',
    href: 'https://github.com/teslamotors/vehicle-command',
  },
  {
    status: '建议接入',
    fit: 'Pi Zero / 外部 Broker',
    name: 'Mosquitto MQTT Client',
    copy: '只安装轻量发布客户端，把归档、温度、磁盘和在线状态送往 Home Assistant；Broker 不放在 Zero。',
    href: 'https://mosquitto.org/man/mosquitto_pub-1.html',
  },
  {
    status: '归档端推荐',
    fit: 'NAS / PC',
    name: 'tesla_dashcam',
    copy: '把四至六路 TeslaCam 分段自动拼成一条视频；适合使用归档触发文件在服务器上异步处理。',
    href: 'https://github.com/ehendrix23/tesla_dashcam',
  },
  {
    status: '伴生服务',
    fit: 'Pi 4 / NAS · 64-bit',
    name: 'TeslaMate',
    copy: '完整的行程、充电、电池与位置数据平台。资源需求明显高于 Zero，应独立部署并通过 MQTT 联动。',
    href: 'https://github.com/teslamate-org/teslamate',
  },
  {
    status: '高级方案',
    fit: '公网服务器',
    name: 'Fleet Telemetry',
    copy: 'Tesla 官方实时遥测接收端，需要公网 TLS、证书和严格隐私控制，不适合直接跑在车内 Zero。',
    href: 'https://github.com/teslamotors/fleet-telemetry',
  },
  {
    status: '独立车载 Pi',
    fit: 'Pi 4 / Pi 5',
    name: 'RaspAP / OpenAuto Prodigy',
    copy: '分别面向车载热点/VPN 网关与 Android Auto 副屏；建议使用第二块树莓派，避免争用 TeslaUSB 网络与 USB。',
    href: 'https://github.com/RaspAP/raspap-webgui',
  },
];

const zeroRoadmap = [
  ['P0', 'Web 配置中心', '校验配置、遮蔽密钥、测试通知并生成可回退的变更；复用现有 Nginx 与只读根文件系统。', '低'],
  ['P0', '一键诊断包', '汇总服务、USB Gadget、磁盘、温度和脱敏日志，方便手机直接下载后排障。', '低'],
  ['P0', '车机素材仓', '安全管理锁车音、灯光秀与贴图；只有车辆释放对应 LUN 后才允许写入。', '中'],
  ['P1', 'MQTT 事件出口', '向外部 Home Assistant / Mosquitto 发布归档完成、存储余量、温度和在线状态。', '低'],
  ['P1', '热点配网向导', '复用 NetworkManager 热点，扫码进入页面添加家庭 Wi-Fi、测试连通性并自动回退。', '低'],
  ['P1', '录像轻量索引', '仅用文件元数据与 SQLite 建索引、查重复和校验完整性；不在 Zero 上转码。', '中'],
];

export default function Home() {
  return (
    <main>
      <nav className="nav shell" aria-label="主导航">
        <a className="brand" href="#top" aria-label="TeslaUSB 中文版首页">
          <span className="brandMark">T</span>
          <span>TeslaUSB <b>CN</b></span>
        </a>
        <div className="navLinks">
          <a href="#capabilities">能力</a>
          <a href="#assets">素材</a>
          <a href="#architecture">架构</a>
          <a href="#roadmap">路线图</a>
          <a href="/guides/notifications">教程</a>
          <a href="#ecosystem">生态</a>
        </div>
        <a className="navCta" href="#flash">开始部署</a>
      </nav>

      <section className="hero shell" id="top">
        <div className="heroCopy">
          <p className="eyebrow"><span /> Raspberry Pi Zero · Bookworm · ARMHF</p>
          <h1>把树莓派变成<br /><em>会自动归档的</em><br />特斯拉 U 盘。</h1>
          <p className="lede">
            车辆照常写入录像。回到 Wi‑Fi 范围后，TeslaUSB 自动检查磁盘，
            再把新片段转存到 NAS、服务器或云端。
          </p>
          <div className="actions">
            <a className="primary" href="#flash">查看刷写指南 <span>↘</span></a>
            <a className="secondary" href="/guides/notifications">配置通知 Step by Step</a>
          </div>
          <div className="proof" aria-label="镜像特性">
            <span><b>32-bit</b> 兼容 Zero W</span>
            <span><b>4 类</b> 归档后端</span>
            <span><b>中文 Web UI</b> 多镜头回看</span>
          </div>
        </div>

        <div className="console" aria-label="TeslaUSB 数据流示意">
          <div className="consoleTop"><div><i className="statusDot" /> TESLAUSB / ONLINE</div><span>17:42:08</span></div>
          <div className="storage">
            <div className="storageHead"><span>CAM STORAGE</span><b>40 GB</b></div>
            <div className="meter"><span /></div>
            <div className="storageMeta"><span>12.8 GB 已用</span><span>32%</span></div>
          </div>
          <div className="flow">
            {flow.map(([number, title, copy], index) => (
              <div className="flowItem" key={number}>
                <span className="flowNumber">{number}</span>
                <div><b>{title}</b><small>{copy}</small></div>
                {index < flow.length - 1 && <span className="flowLine" />}
              </div>
            ))}
          </div>
          <div className="event"><span className="eventIcon">✓</span><div><b>归档完成</b><small>18 个片段 · 2.4 GB · 3 分钟前</small></div><span className="eventTag">NAS</span></div>
          <div className="consoleGrid" aria-hidden="true" />
        </div>
      </section>

      <section className="section dark" id="capabilities">
        <div className="shell">
          <div className="sectionHead inverse"><p className="kicker">01 / CURRENT CAPABILITIES</p><h2>它不只是一块 U 盘。</h2><p>一个设备，覆盖车端写入、文件系统保护、家庭归档和录像查看。</p></div>
          <div className="capGrid">
            {capabilities.map(([code, title, copy]) => (
              <article className="capCard" key={code}><span>{code}</span><h3>{title}</h3><p>{copy}</p><i>↗</i></article>
            ))}
          </div>
        </div>
      </section>

      <section className="section assets" id="assets">
        <div className="shell">
          <div className="assetIntro">
            <div className="sectionHead"><p className="kicker">02 / CURATED CAR ASSETS</p><h2>916 个文件已索引，<br />只把合适的留在车上。</h2></div>
            <div className="assetIntroCopy">
              <p>完整库用于检索和车型适配；你的 Zero 只暂存一份 12 MB 个人精选包，降低空间占用，也避免不兼容文件干扰车机识别。</p>
              <a href="https://www.xiaote.com/tools/resources" target="_blank" rel="noreferrer">查看素材来源 ↗</a>
            </div>
          </div>
          <div className="assetStats">
            {assetStats.map(([number, label, copy]) => (
              <article key={label}><b>{number}</b><span>{label}</span><p>{copy}</p></article>
            ))}
          </div>
          <div className="featuredGrid">
            {featuredAssets.map(([code, title, copy]) => (
              <article key={code}><span>{code}</span><h3>{title}</h3><p>{copy}</p><i>已精选</i></article>
            ))}
          </div>
          <div className="assetSafety">
            <span>LOCAL ONLY</span>
            <p><b>写卡策略：</b>精选包先进入 <code>/mutable/assets/inbox/featured</code>，与车辆正在访问的 USB 盘隔离。公开镜像只包含清单和校验工具，不分发授权状态不明的素材原文件；真正安装到 LightShow、Boombox 或 Wraps 前仍需释放对应 LUN。</p>
          </div>
        </div>
      </section>

      <section className="section architecture" id="architecture">
        <div className="shell archGrid">
          <div className="sectionHead"><p className="kicker">03 / ARCHITECTURE</p><h2>车和归档端之间，<br />有一道严格的安全边界。</h2><p>TeslaUSB 不让车辆和 Linux 同时写同一块盘。每次归档都遵循断开、检查、复制、确认、恢复的顺序。</p><a className="textLink" href="https://github.com/marcone/teslausb" target="_blank" rel="noreferrer">查看上游项目 ↗</a></div>
          <div className="pipeline" aria-label="TeslaUSB 核心架构">
            <div className="pipeNode accent"><small>INPUT</small><b>TESLA</b><span>USB Mass Storage</span></div>
            <i>→</i>
            <div className="pipeNode"><small>CONTROL</small><b>PI ZERO</b><span>configfs · fsck · snapshot</span></div>
            <i>→</i>
            <div className="pipeNode mint"><small>ARCHIVE</small><b>HOME</b><span>NAS · Server · Cloud</span></div>
            <div className="safety"><b>互斥原则</b><span>车辆写入时不挂载 · 归档失败时不清理 · 最后总是恢复 USB</span></div>
          </div>
        </div>
      </section>

      <section className="section roadmap" id="roadmap">
        <div className="shell">
          <div className="roadmapIntro">
            <div className="sectionHead"><p className="kicker">04 / ZERO IMAGE ROADMAP</p><h2>下一批能力，<br />先守住 Zero 的边界。</h2></div>
            <p>优先选择低常驻内存、无数据库服务依赖、能在只读根文件系统上运行的功能。任何素材写入都必须服从 USB LUN 的互斥规则。</p>
          </div>
          <div className="roadmapGrid">
            {zeroRoadmap.map(([priority, title, copy, cost]) => (
              <article className="roadmapCard" key={title}>
                <div><span>{priority}</span><em>资源 {cost}</em></div>
                <h3>{title}</h3><p>{copy}</p>
              </article>
            ))}
          </div>
          <div className="boundary"><span>KEEP OUT</span><p><b>不塞入 Zero：</b>多路视频拼接、TeslaMate 数据库、Fleet Telemetry 服务端、完整 RaspAP / Android Auto 栈。它们应运行在 NAS、服务器或第二块树莓派上。</p></div>
        </div>
      </section>

      <section className="section guidePromo" id="guides">
        <div className="shell guidePromoGrid">
          <div className="sectionHead inverse"><p className="kicker">05 / STEP BY STEP</p><h2>归档结束，<br />让消息主动找你。</h2><p>钉钉、企业微信、飞书已经内置适配器。教程从创建群机器人开始，一直到设备端测试与故障排查。</p><a className="guideButton" href="/guides/notifications">打开完整通知教程 <span>→</span></a></div>
          <div className="channelStack" aria-label="支持的国内通知渠道">
            <article><span>01</span><div><b>钉钉</b><small>自定义机器人 · 可选加签</small></div><em>DINGTALK</em></article>
            <article><span>02</span><div><b>企业微信</b><small>群机器人 · Webhook</small></div><em>WECOM</em></article>
            <article><span>03</span><div><b>飞书</b><small>自定义机器人 · 可选签名</small></div><em>FEISHU</em></article>
            <div className="guideSequence"><b>创建机器人</b><i>→</i><b>写入配置</b><i>→</i><b>手动测试</b><i>→</i><b>重启生效</b></div>
          </div>
        </div>
      </section>

      <section className="section ecosystem" id="ecosystem">
        <div className="shell">
          <div className="ecosystemIntro">
            <div className="sectionHead inverse"><p className="kicker">06 / OPEN-SOURCE ECOSYSTEM</p><h2>能组合，不代表<br />都该塞进 Zero。</h2></div>
            <p>按运行位置和硬件能力拆分：轻量、安全边界清晰的能力进入镜像；视频计算、遥测数据库和车载副屏留在 NAS、服务器或独立树莓派。</p>
          </div>
          <div className="projectGrid">
            {ecosystem.map((project) => (
              <a className="projectCard" href={project.href} target="_blank" rel="noreferrer" key={project.name}>
                <div className="projectMeta"><span>{project.status}</span><em>{project.fit}</em></div>
                <h3>{project.name}</h3>
                <p>{project.copy}</p>
                <i>查看项目 ↗</i>
              </a>
            ))}
          </div>
          <div className="ecosystemDecision"><span>NEXT</span><p><b>建议下一步：</b>直接扩展现有 WebUI 的配置、通知测试和素材安全能力；旧 File Browser 已宣布停止后续维护，不再作为镜像默认组件。视频拼接继续通过归档触发器交给 NAS。</p></div>
          <a className="ecosystemDecision hardwareDecision" href="https://github.com/JuneLeGency/teslausb/tree/master/hardware/enclosure" target="_blank" rel="noreferrer"><span>3D</span><p><b>Pi Zero 车载外壳：</b>提供标准版与棱角 Cybercase、可编辑 OpenSCAD、即打 STL、双色徽标和 1.2 mm 孔位试配规；所有关键尺寸均可追溯到 Raspberry Pi 官方机械图。查看模型与打印指南 ↗</p></a>
        </div>
      </section>

      <section className="section localization" id="localization">
        <div className="shell localeGrid">
          <div className="sectionHead"><p className="kicker">07 / LOCALIZATION</p><h2>本地化，做到哪一步了？</h2><p>基础系统、摄像头查看器、常用通知和使用入口已经面向中国大陆环境；底层日志保留少量上游英文，便于检索故障。</p></div>
          <div className="audit">
            {localization.map(([name, value, status]) => (
              <div className="auditRow" key={name}><span className={`auditDot ${status}`} /><b>{name}</b><span>{value}</span><em>{status === 'done' ? '已完成' : '待推进'}</em></div>
            ))}
          </div>
        </div>
      </section>

      <section className="section flash" id="flash">
        <div className="shell">
          <div className="sectionHead centered inverse"><p className="kicker">08 / FLASH & RUN</p><h2>从镜像到车内，四步完成。</h2><p>推荐 Pi Zero 2 W 与 128GB 高耐久卡。Zero W 也可使用本项目的 32 位 ARMHF 镜像。</p></div>
          <div className="steps">
            <article><span>01</span><h3>校验镜像</h3><p>下载 `.img.zip`，核对随包提供的 SHA‑256。</p></article>
            <article><span>02</span><h3>写入 SD 卡</h3><p>使用 Raspberry Pi Imager，选择自定义镜像直接刷写。</p></article>
            <article><span>03</span><h3>填写配置</h3><p>配置 Wi‑Fi 和归档端；首次建议先用 `ARCHIVE_SYSTEM=none`。</p></article>
            <article><span>04</span><h3>先电源后上车</h3><p>稳定供电完成首次初始化，再用数据线连接 Zero 的 USB OTG 口。</p></article>
          </div>
          <div className="defaultAccess" aria-label="TeslaUSB 默认维护热点">
            <div><span>DEFAULT AP</span><h3>TeslaUSB 自身维护热点</h3><p>离开家庭 Wi-Fi 后，用手机连接热点并打开管理地址。这是公开的便捷默认值，可在配置文件中修改。</p></div>
            <dl><div><dt>Wi-Fi</dt><dd>TeslaUSB-Zero</dd></div><div><dt>密码</dt><dd>3.1415926</dd></div><div><dt>管理地址</dt><dd>192.168.66.1</dd></div></dl>
            <a href="http://192.168.66.1/">连接后打开 →</a>
          </div>
          <div className="warning"><span>!</span><p><b>外接盘提醒</b>　配置 `DATA_DRIVE` 可能重建目标盘分区。必须核对设备并提前备份。</p></div>
        </div>
      </section>

      <footer className="footer">
        <div className="shell footerGrid"><div><a className="brand" href="#top"><span className="brandMark">T</span><span>TeslaUSB <b>CN</b></span></a><p>让每一次行车记录，安全回家。</p></div><div><small>SUPPORTED</small><p>Pi Zero W · Zero 2 W<br />Pi 4B · Pi 5</p></div><div><small>BUILD</small><p>Bookworm · ARMHF<br />NJU Raspbian Mirror</p></div></div>
        <div className="shell legal"><span>社区维护的中文增强版本</span><span>不隶属于 Tesla, Inc. 或 Raspberry Pi Ltd.</span></div>
      </footer>
    </main>
  );
}
