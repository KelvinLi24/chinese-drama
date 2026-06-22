# 《六国大封相》数字资料馆

本仓库包含两个前端模块：

- `main-site/`：资料馆主站
- `mystery-vr/`：WebGL / WebXR 剧本杀模块

## 本地 HTTPS 开发

### 安装依赖

```bash
npm install
```

### 准备 HTTPS 证书

请准备以下文件：

- `.certs/dev-cert.pem`
- `.certs/dev-key.pem`

也可以通过环境变量覆盖：

- `VITE_HTTPS_CERT_PATH`
- `VITE_HTTPS_KEY_PATH`

### 启动开发服务器

```bash
npm run dev
```

固定开发地址：

```text
https://localhost:4173
```

注意：

- 不允许使用 `http://localhost:4173`
- 不允许使用 `python -m http.server`
- 缺少 HTTPS 证书时，Vite 会直接报错并停止启动
- WebXR / Meta Quest 3 调试必须基于 HTTPS

### HTTPS 自检

```bash
npm run verify:https
```

## 构建与部署

```bash
npm run build
npm run preview
```

GitHub Pages 工作流位于：

- `.github/workflows/deploy-pages.yml`

部署后将使用公开 HTTPS 地址，供 Meta Quest 3 的 Quest Browser 访问。

## Meta Quest 3 验收建议

1. 将代码推送到 `main` 分支
2. 等待 GitHub Pages 自动构建完成
3. 在 Quest Browser 中打开公开 HTTPS 地址
4. 进入 `mystery-vr/index.html`
5. 确认页面处于安全上下文，且浏览器支持 `immersive-vr`
6. 再点击“进入 VR 模式”
