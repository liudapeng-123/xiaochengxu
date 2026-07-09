# AI智能打印助手

## 项目概览
适配智能AI打印机的移动端Web应用（微信小程序风格），支持语音交互、AI内容生成、一键打印。使用 Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 构建。

## 技术栈
- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI**: shadcn/ui + Tailwind CSS 4
- **AI**: coze-coding-dev-sdk (LLM)
- **语音识别**: Web Speech API

## 文件结构
```
src/
├── app/
│   ├── layout.tsx              # 根布局（移动端适配）
│   ├── page.tsx                # 首页：语音按钮 + 快捷功能
│   ├── globals.css             # 全局样式 + 动画
│   ├── preview/page.tsx        # 内容预览与编辑页
│   ├── print/page.tsx          # 打印记录页
│   ├── manual/page.tsx         # 手动输入/图片/文档页
│   ├── profile/page.tsx        # 个人中心页
│   └── api/
│       ├── generate/route.ts   # AI内容生成接口
│       └── voice-parse/route.ts # 语音指令解析接口
├── components/
│   ├── VoiceButton.tsx         # 语音按钮组件（按住说话）
│   ├── QuickActions.tsx        # 快捷功能网格
│   ├── BottomNav.tsx           # 底部Tab导航
│   └── PrintStatusCard.tsx     # 打印状态卡片
├── lib/
│   ├── types.ts                # TypeScript 类型定义
│   ├── store.ts                # 简单状态管理
│   └── utils.ts                # 工具函数
└── types/
    └── speech-recognition.d.ts # Web Speech API 类型声明
```

## 核心功能
1. **语音交互**: 按住说话 → 语音识别 → AI解析指令 → 生成内容
2. **AI内容生成**: 口算题、应用题、生字表、练字帖、英语单词
3. **内容预览编辑**: 生成后可编辑修改
4. **打印管理**: 发送打印 → 状态追踪（排队/发送中/打印中/完成）
5. **辅助功能**: 手动文本输入、图片拍照打印、文档上传打印

## API 接口
| 路径 | 方法 | 说明 |
|------|------|------|
| `/api/generate` | POST | AI内容生成，参数: `{ command: string }` |
| `/api/voice-parse` | POST | 语音指令解析，参数: `{ text: string }` |

## 构建与运行
```bash
pnpm install          # 安装依赖
pnpm run dev          # 开发模式
pnpm run build        # 生产构建
pnpm run start        # 生产启动
pnpm ts-check         # TypeScript 类型检查
pnpm lint             # ESLint 检查
pnpm exec next dev -H 0.0.0.0 -p 5000       #运行代码
```

## 设计规范
- 移动端优先，最大宽度 480px
- 微信小程序风格UI：圆角卡片、大按钮、底部Tab导航
- 主色: #4F8EF7 (蓝), 强调色: #F59E0B (橙), 成功色: #10B981 (绿)
- 详见 DESIGN.md
