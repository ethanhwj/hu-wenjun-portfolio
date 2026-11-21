# Hu wenjun — Portfolio

React + Vite 个人品牌 / 平面设计作品网站，PC 版心最大 1700px，包含响应式布局。

## 开发

```sh
pnpm install
pnpm dev
```

## 生产构建

```sh
pnpm build
pnpm preview
```

`dist/` 可部署到静态托管平台。

## 修改内容

- `src/main.jsx`：个人信息、邮箱、项目列表、项目说明与图片映射。
- `src/style.css`：配色、字体、间距和响应式布局。
- `public/works/`：从提供的 PDF 渲染的作品页及裁切封面。

邮箱暂将原资料的 `h10417795@@icloud.com` 修正为 `h10417795@icloud.com`，正式使用前请核实。
项目说明为根据作品画面撰写的初稿，未添加客户成果、项目时间或个人职责等未经提供的信息。
作品详情保留 PDF 页面原始比例；首页封面单独裁切。原始 PDF 不包含在网站中。

## 独立页面

- `/`：首页与精选作品。
- `/about`：个人介绍，正文在 `src/AboutPage.jsx` 中维护。
- `/playground`：视觉实验作品。

导航邮箱按钮复制邮箱，并显示两秒的 Copied! 提示。`pnpm build` 会为 About 和 Playground 输出独立的 HTML 入口，支持静态托管下直接访问和刷新。
