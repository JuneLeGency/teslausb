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
          <a href="#architecture">架构</a>
          <a href="#localization">本地化</a>
          <a href="#flash">刷写</a>
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
            <a className="secondary" href="#architecture">理解工作原理</a>
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

      <section className="section architecture" id="architecture">
        <div className="shell archGrid">
          <div className="sectionHead"><p className="kicker">02 / ARCHITECTURE</p><h2>车和归档端之间，<br />有一道严格的安全边界。</h2><p>TeslaUSB 不让车辆和 Linux 同时写同一块盘。每次归档都遵循断开、检查、复制、确认、恢复的顺序。</p><a className="textLink" href="https://github.com/marcone/teslausb" target="_blank" rel="noreferrer">查看上游项目 ↗</a></div>
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

      <section className="section localization" id="localization">
        <div className="shell localeGrid">
          <div className="sectionHead"><p className="kicker">03 / LOCALIZATION</p><h2>本地化，做到哪一步了？</h2><p>基础系统、摄像头查看器、常用通知和使用入口已经面向中国大陆环境；底层日志保留少量上游英文，便于检索故障。</p></div>
          <div className="audit">
            {localization.map(([name, value, status]) => (
              <div className="auditRow" key={name}><span className={`auditDot ${status}`} /><b>{name}</b><span>{value}</span><em>{status === 'done' ? '已完成' : '待推进'}</em></div>
            ))}
          </div>
        </div>
      </section>

      <section className="section flash" id="flash">
        <div className="shell">
          <div className="sectionHead centered inverse"><p className="kicker">04 / FLASH & RUN</p><h2>从镜像到车内，四步完成。</h2><p>推荐 Pi Zero 2 W 与 128GB 高耐久卡。Zero W 也可使用本项目的 32 位 ARMHF 镜像。</p></div>
          <div className="steps">
            <article><span>01</span><h3>校验镜像</h3><p>下载 `.img.zip`，核对随包提供的 SHA‑256。</p></article>
            <article><span>02</span><h3>写入 SD 卡</h3><p>使用 Raspberry Pi Imager，选择自定义镜像直接刷写。</p></article>
            <article><span>03</span><h3>填写配置</h3><p>配置 Wi‑Fi 和归档端；首次建议先用 `ARCHIVE_SYSTEM=none`。</p></article>
            <article><span>04</span><h3>先电源后上车</h3><p>稳定供电完成首次初始化，再用数据线连接 Zero 的 USB OTG 口。</p></article>
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
