# 苏虹硕 · AI 产品经理 · 个人网站 v2

响应式中文个人网站。原生 HTML、CSS、JavaScript，无构建依赖；首屏使用本地化 Three.js r160。

本版基于 `su-hongshuo-v2` 发布，采用黑白灰与薄荷绿视觉，包含关于、方向、方法、作品、手记、此刻、联系七个区块。旧版可通过 Git 历史查看。

- 网站：https://suhongshuo6-cell.github.io/
- 源码：https://github.com/suhongshuo6-cell/suhongshuo6-cell.github.io

## GitHub Pages 自动部署

网站通过 `.github/workflows/pages.yml` 发布 `dist/` 目录。每次推送到 `main` 分支后，GitHub Actions 会检查 JavaScript 语法并自动更新网站。也可在仓库的 Actions 页面手动运行工作流。

修改文件后，在本项目目录执行：

```sh
npm run check
git add dist README.md package.json .github/workflows/pages.yml
git commit -m "Update personal website"
git push origin main
```

部署进度见仓库的 Actions 页面；发布设置见 Settings → Pages（来源为 GitHub Actions）。网站和源码仓库均公开可访问。

## 本地浏览

运行 `npm run dev`，打开 http://127.0.0.1:4173 。3D 场景使用 ES 模块，需要通过 HTTP 预览。

## 编辑

- `dist/index.html`：页面结构与个人介绍。
- `dist/styles.css`：桌面、手机样式和减少动态效果支持。
- `dist/main.js`：导航、滚动动效、工作步骤与手记展开。
- `dist/hero3d.js`：首屏互动台阶与小球场景。
- `dist/hero-still.jpg`：3D 加载前或 WebGL 不可用时的静态海报。
- `dist/vendor/`：Three.js r160 及本页使用的扩展；原始 MIT 许可证见 `dist/vendor/LICENSE`。

此仓库的 `dist/` 是线上网站的维护源；修改后推送 `main` 即自动部署。“此刻”区块的日期和内容需随近况手动更新。

姓名与职业来自用户提供的信息。个人介绍、关注方向与产品思考为网站拟稿，未添加未经提供的任职、项目业绩、联系方式或客户评价。工作经历和项目中的具体职责可按本人提供的信息补充。

Claude Shield 案例依据 [公开仓库及 README](https://github.com/suhongshuo6-cell/claude-shield) 整理；`dist/claude-shield.png` 来自该仓库的 `docs/images/connection-verified.png`。截图包含隔离演示数据，页面保留相应说明及项目功能边界链接。案例没有推断个人职责、用户规模或项目成效。公开个人主页为 [suhongshuo6-cell](https://github.com/suhongshuo6-cell)。

Google Fonts 是可选字体增强，加载失败时自动使用系统中文字体。站点代码不收集访问者信息，也不含需要后端的表单；托管平台和字体服务可能处理访问请求信息。
