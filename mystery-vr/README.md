# mystery-vr

`mystery-vr/` 是从 `main-site/` 的“进入剧本杀世界”按钮进入的 WebGL / WebXR 粤剧剧本杀模块。

## 当前正式场景

仅保留以下五个正式场景：

1. `序章粤剧剧场`
2. `粤剧戏棚`
3. `封相朝堂`
4. `院子`
5. `书房密室`

## 当前主线流程

`开始探索`
→ `序章影片.mp4`
→ `序章粤剧剧场`
→ `封相朝堂`
→ `院子`
→ `书房密室`
→ `封相朝堂最终对质`
→ `粤剧戏棚终章演出`
→ `序章粤剧剧场结算`
→ `现实结局页`

## 主要脚本

- `scripts/main.js`：主流程、UI 状态机、剧情推进、调试面板
- `scripts/scene-manager.js`：场景加载、环境壳体、锚点、物件摆放与传送门
- `scripts/player-controller.js`：苏秦第一 / 第三人称、WASD、跳跃、高跳、上帝模式
- `scripts/interaction-system.js`：准星交互、E 键、XR 射线与中文提示
- `scripts/npc-system.js`：NPC 加载、待机、对话触发与动画
- `scripts/systems/scene-load-coordinator.js`：真实加载进度聚合
- `scripts/systems/world-collision-system.js`：地面检测、受控跨台阶、最后安全位置、物件贴地
- `scripts/systems/webxr-diagnostics.js`：安全上下文与 WebXR 失败根因审计
- `scripts/systems/xr-session-manager.js`：唯一的 immersive-vr 会话入口
- `scripts/vr-controller.js`：Quest / WebXR 控制器、摇杆、Trigger 与 XR HUD
- `scripts/data/scene-registry.js`：正式场景注册与视频路径
- `scripts/data/scene-content.js`：NPC / 物件 / 出口 / 锚点布局
- `scripts/data/model-calibration.js`：场景缩放、人物高度、物件高度、视角参数
- `scripts/story-data.js`、`scripts/data/story-state.js`：对白、任务、证据链、结局

## 本地开发

### 1. 生成本地 HTTPS 证书

推荐使用 `mkcert`，或使用你自己的受信任证书。

也可以用 OpenSSL 在本地生成临时证书，放到：

- `.certs/dev-key.pem`
- `.certs/dev-cert.pem`

仓库已通过 `.gitignore` 忽略 `.certs/`，不会把本机证书提交到版本库。

### 2. 启动 HTTPS 开发服务器

在仓库根目录执行：

```bash
npm run dev
```

默认地址：

- `https://localhost:4173`

若未找到证书，脚本会直接输出中文错误并退出，不会静默退回 HTTP。

### 3. 仅桌面临时调试（非 WebXR 验收）

如你只想做普通桌面页面查看，可执行：

```bash
npm run dev:http
```

但这 **不能** 作为 Meta Quest WebXR 验收环境。

## HTTPS 与 Quest 说明

- WebXR 必须运行在安全上下文。
- 桌面本地调试可用 `https://localhost:4173`。
- Meta Quest 3 正式验收应优先使用公开 HTTPS 部署地址，而不是电脑的 `localhost`。
- 如果使用局域网自签名证书，Quest 设备也必须信任该证书，否则浏览器可能拒绝进入 immersive-vr。

## GitHub Pages / 公开部署

仓库已包含 Pages 部署工作流：

- `.github/workflows/deploy-pages.yml`

部署后建议直接使用：

- `https://<你的账号>.github.io/<仓库名>/mystery-vr/index.html`

当前资源全部使用相对路径，适合静态 HTTPS 部署。

## 当前资源确认

### 场景

- `assets/scenes/序章粤剧剧场.glb`
- `assets/scenes/粤剧戏棚.glb`
- `assets/scenes/封相朝堂.glb`
- `assets/scenes/院子.glb`
- `assets/scenes/书房密室.glb`

### 角色

- `assets/characters/NPC.glb`
- `assets/characters/苏秦.glb`
- `assets/characters/苏秦_walk.glb`

### 视频

- `assets/videos/序章影片.mp4`
- 终章影片当前仍未提供，系统会自动回退到文字结局页

## 调试快捷键

- `~`：显示 / 隐藏开发调试面板
- `F`：第一 / 第三人称切换
- `R`：重置当前位置
- `I`：线索档案
- `M`：场景地图
- `Esc`：暂停 / 关闭当前面板

## 调试模式能力

调试面板当前可查看：

- 当前场景与包围盒
- 玩家 / 相机坐标
- 是否落地、垂直速度、当前动画
- WebXR 安全状态与会话状态
- 左右摇杆输入
- 已收集线索
- 已加载 NPC / 物件
- 物件贴地校验结果
- 上帝模式开关
- 场景跳转按钮
- 锚点快速跳转按钮
