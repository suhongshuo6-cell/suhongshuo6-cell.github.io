# 苏虹硕 · AI 产品经理

响应式中文个人网站。原生 HTML、CSS、JavaScript，无构建依赖。

- 网站：https://suhongshuo6-cell.github.io/
- 源码：https://github.com/suhongshuo6-cell/suhongshuo6-cell.github.io

## GitHub Pages 自动部署

网站通过 `.github/workflows/pages.yml` 发布 `dist/` 目录。每次推送到 `main` 分支后，GitHub Actions 会检查 JavaScript 语法并自动更新网站。也可在仓库的 Actions 页面手动运行工作流。

修改文件后，在本项目目录执行：

```sh
npm run check
git add dist README.md
git commit -m "Update personal website"
git push origin main
```

部署进度见仓库的 Actions 页面；发布设置见 Settings → Pages（来源为 GitHub Actions）。网站和源码仓库均公开可访问。

## 本地浏览

运行 `npm run dev`，打开 http://127.0.0.1:4173 。也可以直接打开 `dist/index.html`。

## 编辑

- `dist/index.html`：页面结构与个人介绍。
- `dist/styles.css`：桌面、手机样式和减少动态效果支持。
- `dist/app.js`：方向详情、产品思考文章、移动导航。

姓名与职业来自用户提供的信息。介绍、方向与产品思考为初版拟稿，未添加未经提供的任职、项目业绩、联系方式或客户评价。上线给公众阅读前可按真实经历补充修改。

Google Fonts 是可选字体增强，加载失败时自动使用系统中文字体。站点代码不收集访问者信息，也不含需要后端的表单；托管平台和字体服务可能处理访问请求信息。
