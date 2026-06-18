# 粤剧《六国大封相》数字仓库

这是一个纯前端的静态数字仓库页面，用于展示粤剧《六国大封相》的人物与物件，并进入对应的三维展示台。

## 目录结构

```text
.
├─ index.html
├─ styles/
│  └─ main.css
├─ scripts/
│  ├─ app.js
│  ├─ catalog.js
│  └─ viewer.js
└─ assets/
   ├─ character/
   └─ object/
```

## 本地运行

由于 Three.js 模块与 GLB 资源更适合通过本地 HTTP 服务加载，建议不要直接双击 `index.html`，而是启动一个静态服务器。

### 方式一：Python

```bash
python -m http.server 4173
```

然后打开：

```text
http://localhost:4173
```

### 方式二：VS Code Live Server

打开仓库根目录后启动本地静态服务即可。

## GitHub Pages 部署

当前页面使用相对路径，例如 `./assets/character/NPC.glb`，因此可以直接部署到 GitHub Pages。

将仓库根目录作为静态站点发布即可。

## 资源命名规则

- 分类清单定义在 `scripts/catalog.js`
- 人物缩略图与模型使用：
  - `assets/character/<name>.png`
  - `assets/character/<name>.glb`
- 物件缩略图与模型使用：
  - `assets/object/<name>.png`
  - `assets/object/<name>.glb`

- 如果缺少 PNG，卡片会自动退回为文字封面。
- 如果缺少 GLB，展示台会显示友好的不可用提示。

## 说明

- 使用 `Three.js`、`GLTFLoader` 与 `OrbitControls`
- 无后端
- 无 VR 模式
- 封面过渡页与三维展示台都包含在同一个独立前端页面中
