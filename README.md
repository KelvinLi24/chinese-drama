# 《六国大封相》数字资料馆

本仓库包含两个前端模块：

- `main-site/`：资料馆主站，包含人物馆、物件馆、场景馆。
- `mystery-vr/`：WebGL / WebXR 沉浸式剧本杀模块《六国大封相：第七声锣》。

## 根目录入口

- 根目录 `index.html` 会跳转到 `main-site/index.html`。
- 主站中的“进入剧本杀世界”按钮会进入 `mystery-vr/index.html`。

## 本地运行

### WebXR / HTTPS 调试

```bash
npm run dev
```

默认地址：

```text
https://localhost:4173
```

说明：

- `npm run dev` 使用本地 HTTPS 服务器；
- 若缺少 `.certs/dev-key.pem` 与 `.certs/dev-cert.pem`，会直接报错退出；
- 不会静默退回 HTTP。

### 普通桌面临时查看

```bash
npm run dev:http
```

地址：

```text
http://localhost:4173
```

该模式仅适合普通页面查看，不适合作为 Meta Quest WebXR 验收环境。

## GitHub Pages

仓库已提供 GitHub Pages 工作流，可直接部署静态站点。

部署后可访问：

- 主站：`/main-site/index.html`
- 剧本杀：`/mystery-vr/index.html`

## 说明

- `main-site/` 与 `mystery-vr/` 相互独立。
- `mystery-vr/README.md` 记录了 WebXR、HTTPS、场景流程、调试模式与资源说明。
- 本地 HTTPS 证书目录 `.certs/` 已被 `.gitignore` 忽略，不会提交到仓库。
