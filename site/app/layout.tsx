import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://teslausb-cn.icy-note-8409.chatgpt.site'),
  title: 'TeslaUSB 中文版｜会自动归档的特斯拉 U 盘',
  description: '用 Raspberry Pi Zero 构建支持自动归档、中文回看、国内通知、素材仓和停车工具箱的 TeslaUSB。',
  openGraph: {
    title: 'TeslaUSB 中文版｜会自动归档的特斯拉 U 盘',
    description: '车辆照常写入，回家后自动归档；内置中文回看、通知教程、素材仓与停车工具箱。',
    locale: 'zh_CN',
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'TeslaUSB 自动归档数据流' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
