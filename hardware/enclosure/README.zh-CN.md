# TeslaUSB Pi Zero 车载外壳

适用于 Raspberry Pi Zero W 与 Zero 2 W 的双件式 3D 打印外壳，尺寸依据 Raspberry Pi 官方 65 × 30 mm 机械图和 58 × 23 mm 安装孔距建立。

## 官方尺寸基准

- 官方文件：[Raspberry Pi Zero 2 W Mechanical Drawing](https://datasheets.raspberrypi.com/rpizero2/raspberry-pi-zero-2-w-mechanical-drawing.pdf)；
- 官方索引：[Schematics and mechanical drawings](https://www.raspberrypi.com/documentation/computers/raspberry-pi.html#schematics-and-mechanical-drawings)；
- 项目内存档：[`reference/raspberry-pi-zero-2-w-mechanical-drawing.pdf`](reference/raspberry-pi-zero-2-w-mechanical-drawing.pdf)；
- 下载日期：2026-08-30；文件标题 `Zero 2 Mechanical drawing`，1 页，163,618 字节；
- SHA-256：`58a9cb559ec2747af2581b0e0a95890fabc3d2c627c8192b7b485f612345692d`。

CAD 使用的官方基准为：PCB 外形 65 × 30 mm、圆角半径 3 mm、四孔中心距 58 × 23 mm、孔中心距板边 3.5 mm、安装孔约 Ø2.75 mm。端口开口除参考机械图外，还额外预留了常见线材胶壳的装配余量。

## 文件

- `teslausb-zero-enclosure.scad`：可参数化源文件；
- `teslausb-zero-bottom.stl`：底壳，包含主板支柱和可选安装耳；
- `teslausb-zero-lid.stl`：上盖，包含定位唇、散热孔和标识；
- `teslausb-zero-print-plate.stl`：底壳与上盖同盘排版；
- `teslausb-zero-assembly.stl`：标准版装配参考；
- `teslausb-zero-cybercase.scad`：棱角车身风格的可参数化模型；
- `teslausb-zero-cybercase-bottom.stl` / `teslausb-zero-cybercase-lid.stl`：Cybercase 底壳与上盖；
- `teslausb-zero-cybercase-badge.stl`：可用红色耗材单独打印的原创 T 形徽标；
- `teslausb-zero-fit-gauge.stl`：1.2 mm 薄型官方板框与孔位试配规；
- `teslausb-zero-cybercase-print-plate.stl`：Cybercase 同盘排版；
- `preview.svg`：标准版技术预览；
- `cybercase-preview.svg`：Cybercase 与试配规技术预览；
- `render-preview.scad` / `render-cyber-preview.scad`：预览图生成源文件；
- `reference/`：官方机械图原件和来源记录。

## 设计特点

- 四个孔位使用一组 M2.5 × 16–20 mm 盘头自攻螺丝，同时固定上盖和主板；
- Mini HDMI、USB OTG、USB 供电、MicroSD 和摄像头排线侧均留有维护开口；
- 上盖在 Zero 2 W SoC 上方设置五条散热槽；
- 四个安装耳可用于扎带或螺丝固定，设置 `mounting_ears=false` 可关闭；
- 默认封闭 GPIO，设置 `gpio_window=true` 可为已焊排针的主板开窗；
- 外壳外廓约 72 × 37 × 14 mm，不含安装耳和凸字。

Cybercase 版在同一机械基准上增加八边形外轮廓、车身折线、斜向散热槽、凹刻字样和双色徽标；这些造型均为本项目原创，不复制 Tesla 官方商标或车身设计。

## 如何确认尺寸

参数化 CAD 能保证模型中的尺寸与官方机械图一致，但不同打印机、材料收缩、主板批次和 USB 插头胶壳会影响实物装配，因此不能只靠 STL 宣称百分之百适配。

1. 先打印 `teslausb-zero-fit-gauge.stl`，把主板放在试配规上检查 65 × 30 mm 外轮廓和四个孔位；
2. 用卡尺检查试配规长宽和 58 × 23 mm 孔距；孔位全部自然对齐后再打印完整外壳；
3. 默认主板四周总装配余量为 1.5 mm，上盖配合间隙为 0.25 mm，可在 SCAD 中修改 `xy_clearance` 和 `fit_tolerance`；
4. 首次完整打印前，再打印 10–15 mm 高的端口区域，验证自己的 USB、HDMI 和排线插头。

## 打印建议

| 项目 | 建议值 |
| --- | --- |
| 材料 | PETG 或 ASA；车内高温环境不要使用 PLA |
| 喷嘴 / 层高 | 0.4 mm / 0.20 mm |
| 壁线 | 3–4 道 |
| 填充 | 20–30% |
| 支撑 | 不需要 |
| 底壳方向 | 开口朝上 |
| 上盖方向 | 外表面贴打印平台、定位唇朝上 |

首次打印建议只打印 10–15 mm 高的端口区域，实测自己的线材插头外壳。不同 Micro USB 线的胶壳尺寸差异很大，可在 SCAD 中放宽相应开口。

## 车载安装注意事项

- 安装位置必须避免脚部、座椅导轨、安全气囊和车辆原厂线束；
- 为 USB 线保留松弛量和应力释放，不能让插头承担外壳重量；
- 不要密封散热孔，也不要放在阳光直射或暖风出口附近；
- 实车长期使用前，先验证 USB OTG、Wi-Fi 温度和连续归档稳定性；
- 本设计未做防水、阻燃、碰撞或汽车级认证，只适合车内非安全关键位置。

模型采用 `CC-BY-SA-4.0` 许可。Raspberry Pi 名称及板型属于其各自权利人。
