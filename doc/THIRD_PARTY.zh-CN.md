# 第三方组件清单

镜像内下载型组件必须固定版本或提交，并在解包/安装前验证 SHA-256。许可证原文随上游发布包保留。

| 组件 | 固定版本 | 用途 | 许可证 | SHA-256 |
| --- | --- | --- | --- | --- |
| [teslausb-webui](https://github.com/marcone/teslausb-webui) | v1.2.1 | 摄像头录像查看器 | 见上游发布包 | `d606a5a71fc15ae96b3b74b1bb8c5213d51479821bdf205f515da52119a8d774` |
| [copyparty](https://github.com/9001/copyparty) | v1.20.21 | 素材暂存与热点内文件投递 | MIT | `43ac488742715f10ecec03e29f7562d3be66f2976644b3af55d43043fa25c8fa` |
| [2048](https://github.com/gabrielecirulli/2048) | `478b6ec346e3787f589e4af751378d06ded4cbbc` | 停车时离线小游戏 | MIT | `4f3e35b3b9124c5a5c16231b71684288d8d781c2d534754f6b36119336231e2e` |

## copyparty 的安全边界

- 仅监听 `127.0.0.1:3923`，由 Nginx 的 `/assets/` 路径反向代理；
- 只读写 `/mutable/assets/inbox`，不授予 `/backingfiles`、`/mnt/*` 或系统根目录权限；
- 使用独立低权限用户、只读系统保护、私有设备和 96MB 内存上限；
- 默认关闭缩略图、媒体解析、HTML 渲染、WebDAV 和跨卷符号链接；
- 上传仅进入暂存区，安装到 LightShow/Boombox/Custom 必须另走 TeslaUSB 的 USB LUN 互斥流程。

## 2048 的运行边界

2048 仅由 Zero 提供静态文件，游戏逻辑在手机或车机浏览器中运行，不在 Zero 上启动额外服务。页面明确标注仅停车时使用。
