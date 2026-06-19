# deepseek-chrome-plugin

DeepSeek 聊天增强 Chrome 扩展，为 chat.deepseek.com 提供消息时间线、提示词管理、会话收藏、视觉效果等功能。

基于 WXT + React 19 + TypeScript 构建（Manifest V3）。

## 功能

- **消息时间线** — 从 DeepSeek 页面 DOM 提取聊天消息，提供可滚动的时间线导航，点击即跳转到对应消息
- **提示词管理** — 创建/编辑/删除/复制提示词模板，支持标签分类，数据持久化存储
- **会话收藏** — 将当前会话保存到自定义文件夹，支持标签、URL 去重、一键打开
- **导出** — 将当前会话导出为 Markdown 或 JSON 格式文件
- **视觉效果** — 雪、樱花、雨三种粒子动画效果（纯 CSS 实现）
- **弹窗控制台** — 通过扩展工具栏图标查看数据概览，快速切换面板和视觉效果

## 项目结构

```
entrypoints/
├── deepseek.content.tsx    # 内容脚本（核心面板，625 行）
├── deepseek-panel.css      # 面板样式（363 行）
└── popup/                  # 浏览器操作弹窗
    ├── App.tsx             # 弹窗主组件
    ├── main.tsx            # 弹窗挂载点
    ├── index.html          # 弹窗 HTML
    └── style.css           # 弹窗样式

src/
├── types.ts                # 类型定义
├── storage.ts              # chrome.storage.local 封装
└── deepseek/
    ├── domAdapter.ts       # DOM 消息提取适配器
    └── export.ts           # Markdown/JSON 导出模块
```

## 截图预览

`screenshots/` 目录包含独立的预览渲染系统，用于生成扩展各 UI 状态的截图拼贴图：

```
screenshots/
├── preview.html              # 预览页面（渲染所有 UI 变体）
├── preview-main.tsx          # 预览入口
├── preview-components.tsx    # 预览组件（无状态版，镜像扩展 UI）
├── preview-bundle.js         # esbuild 打包的预览脚本（含 React）
├── preview-bundle.css        # 合并的样式包
├── preview-overrides.css     # 预览专用样式覆盖
├── mock-data.ts              # 模拟数据
└── *.png / *.jpg             # 已生成的截图
```

使用方式：在 `screenshots/` 目录下用浏览器打开 `preview.html`，即可看到所有 UI 变体的拼贴展示。

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发模式
pnpm dev

# 构建生产版本
pnpm build

# 打包为 .zip
pnpm zip
```

## 工具链

| 依赖 | 版本 |
|---|---|
| WXT | ^0.20.26 |
| React | ^19.2.4 |
| TypeScript | ^5.9.3 |
| Vite | (WXT 内嵌) |
