# 《六国大封相》数字资料馆

本仓库目前分为两个彼此独立的前端模块：

- `main-site/`：现有资料馆主站，包含人物馆、物件馆、场景馆。
- `mystery-vr/`：新增的 WebGL / WebXR 沉浸式原型《六国大封相：声境谜局》。

## 根目录行为

- 根目录 `index.html` 会自动跳转到 `main-site/index.html`。
- 主站首页额外提供一个入口按钮，可进入 `mystery-vr/index.html`。

## 本地运行

请不要直接用 `file://` 打开页面。Three.js 资源加载与 WebXR 检测都需要通过本地 HTTP 服务访问。

示例：

```bash
python -m http.server 4173
```

然后访问：

```text
http://localhost:4173
```

## GitHub Pages

本仓库中的两套前端都使用相对路径，可直接部署到 GitHub Pages：

- 主站入口：`/main-site/index.html`
- WebXR 原型：`/mystery-vr/index.html`

## 说明

- `mystery-vr/README.md` 中包含 WebXR 原型的完整实现说明、资源清单、已知限制与后续补充建议。
