import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI智能打印助手',
  description: '语音指令，智能生成学习内容，一键打印',
  keywords: ['AI打印', '语音交互', '习题生成', '智能打印机'],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <div className="mx-auto max-w-[480px] min-h-screen relative bg-background">
          {children}
        </div>
      </body>
    </html>
  );
}
