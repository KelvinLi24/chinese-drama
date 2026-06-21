# 粤剧《六国大封相》数字仓库

这是一个纯前端的静态展陈页面，用于展示粤剧《六国大封相》的人物、物件与场景，并进入对应的三维展示台。

## 当前结构

```text
.
├─ index.html
├─ styles/
│  └─ main.css
├─ scripts/
│  ├─ app.js
│  ├─ catalog.js
│  ├─ previewStage.js
│  └─ viewer.js
└─ assets/
   ├─ character/
   ├─ object/
   └─ scene/
```

## 功能说明

- 人物馆：人物档案 / 行当名册
- 物件馆：物件档案 / 道具线索库
- 场景馆：场景档案 / 三维空间库
- 使用 `Three.js`、`GLTFLoader`、`OrbitControls`
- 支持本地 `.glb`、`.png`，凤冠额外支持 `.mp4` 预览
- 纯静态前端，无后端、无 VR
- 使用相对路径，兼容本地运行与 GitHub Pages 部署

## 本地运行

由于浏览器通常会限制直接通过 `file://` 读取模块与 GLB，建议使用一个本地静态服务器。

### 方式一：Python

```bash
python -m http.server 4173
```

打开：

```text
http://localhost:4173
```

### 方式二：VS Code Live Server

直接在项目根目录启动 Live Server 即可。

## 资源接入规则

### 人物资源

- `assets/character/<名称>.png`
- `assets/character/<名称>.glb`

### 物件资源

- `assets/object/<名称>.png`
- `assets/object/<名称>.glb`
- `assets/object/<名称>.mp4`（可选，例如 `凤冠.mp4`）

### 场景资源

- `assets/scene/<名称>.png`
- `assets/scene/<名称>.glb`

## 当前已接入场景

- `序章粤剧剧场`
- `封相朝堂`
- `院子`

## 部署到 GitHub Pages

本项目使用相对路径，例如：

- `./assets/character/NPC.glb`
- `./assets/object/凤冠.mp4`
- `./assets/scene/封相朝堂.glb`

因此可以直接作为静态站点部署到 GitHub Pages，无需改写资源前缀。
