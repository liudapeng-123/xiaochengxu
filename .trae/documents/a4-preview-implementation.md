# A4 纸张预览排版实现方案

## 背景

当前预览页（preview/page.tsx）使用 `<textarea>` 直接展示纯文本，没有任何 A4 纸张格式的概念。用户点击"发送打印"后，内容以何种格式输出完全不可控。需要在前端实现 A4 纸张的可视化预览，让用户"所见即所得"。

## 核心方案

**前端负责排版预览**，通过 CSS `transform: scale()` 将 A4 尺寸（794×1123px）缩放到手机屏幕宽度。后端 API 和打印机固件不涉及排版逻辑。

缩放公式：`scale = (屏幕可用宽度 - 32px padding) / 794px`

## 架构

```
preview/page.tsx
  └── A4Preview（主组件，协调分页 + 多页渲染）
        ├── A4Page（A4 纸张容器，负责缩放）
        │     └── 内容渲染器（按 type 选择）
        │           ├── MathArithmeticRenderer  — 5列×8行网格
        │           ├── MathWordRenderer        — 每题+答题空白
        │           ├── ChineseCharsRenderer    — 田字格（拼音+格子）
        │           ├── ChinesePracticeRenderer — 四线三格
        │           ├── EnglishWordsRenderer    — 两列：单词+释义
        │           ├── TextDocumentRenderer    — 标准段落排版
        │           └── ImageRenderer           — 图片居中
        └── 页码指示器 "第 X / N 页"
```

## 文件变更清单

### 1. `src/lib/types.ts` — 新增类型
- 新增 `PageConfig` 接口（pageSize, orientation, margins）
- 新增 A4 常量 `A4_MM`, `A4_MARGIN_MM`
- `GeneratedContent.metadata` 新增可选字段：`pageCount?`, `pageSize?`, `layout?`

### 2. `src/app/globals.css` — 新增样式
- `.a4-page`：白色背景、阴影、固定宽高比
- `.tianzige-grid`：田字格 CSS（虚线十字 + 实线边框）
- `.writing-lines`：四线三格（repeating-linear-gradient）
- `@media print`：隐藏导航、去除缩放、1:1 输出

### 3. `src/components/a4-preview/` — 新建目录（12 个文件）
| 文件 | 职责 |
|------|------|
| `A4Page.tsx` | A4 纸张容器，ResizeObserver + scale 缩放 |
| `A4Preview.tsx` | 主组件，分页 + 多页渲染 |
| `MathArithmeticRenderer.tsx` | 口算题 5列网格 |
| `MathWordRenderer.tsx` | 应用题 + 答题区 |
| `ChineseCharsRenderer.tsx` | 田字格生字表 |
| `ChinesePracticeRenderer.tsx` | 四线三格练字帖 |
| `EnglishWordsRenderer.tsx` | 单词两列布局 |
| `TextDocumentRenderer.tsx` | 通用文本排版 |
| `ImageRenderer.tsx` | 图片居中 |
| `index.ts` | 统一导出 |

### 4. `src/app/preview/page.tsx` — 集成 A4 预览
- 新增 `viewMode: 'preview' | 'edit'` 状态，默认 `'preview'`
- 预览模式显示 `<A4Preview />`，编辑模式显示原 textarea
- 内容信息卡片下方添加"预览/编辑"切换按钮

### 5. `src/app/api/generate/route.ts` — 可选优化
- system prompt 中增加对 layout 字段的返回要求

## 分页策略

| 内容类型 | 策略 | 每页容量 |
|----------|------|----------|
| 口算题 | 按题数切分 | 40 题/页（5×8） |
| 应用题 | 按题数切分 | 3-4 题/页 |
| 生字表 | 按字数切分 | 32 字/页（4×8） |
| 练字帖 | 按字数切分 | 96 字/页（8×12） |
| 英语单词 | 按词数切分 | 20 词/页 |
| 文本/文档 | 按字数估算 | ~800 字/页 |
| 图片 | 单页 | 1 张/页 |

## 实现顺序

**第一阶段：基础框架**
1. types.ts 添加 A4 类型
2. globals.css 添加 A4 基础样式
3. A4Page.tsx 容器组件
4. TextDocumentRenderer.tsx（最简单的渲染器）
5. A4Preview.tsx 主组件
6. preview/page.tsx 集成

**第二阶段：各类型渲染器**
7-12. 依次实现 6 个内容类型渲染器

**第三阶段：增强**
13. 编辑/预览模式切换
14. 页眉页脚（标题、页码）
15. @media print 打印样式

## 验证步骤

1. `pnpm ts-check` — 类型检查
2. `pnpm lint` — 代码规范
3. `pnpm run dev` — 启动开发服务器
4. 浏览器中测试：生成各类内容 → 进入预览页 → 确认 A4 预览正确
5. 测试编辑/预览模式切换
6. 测试多页滚动
7. 在不同屏幕宽度下验证缩放效果
