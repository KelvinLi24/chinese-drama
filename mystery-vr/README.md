# mystery-vr

`mystery-vr/` 是从 `main-site/` 的“进入剧本杀世界”按钮进入的 WebGL / WebXR 粤剧剧本杀模块。

## 当前正式场景

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

## WebXR 与 HTTPS

- WebXR 必须运行在安全上下文中
- 本地调试使用 `https://localhost:4173`
- Quest 3 正式验收建议使用 GitHub Pages 公网 HTTPS 地址
- 若证书缺失，Vite 会直接停止启动，不会回退 HTTP

## 主要脚本

- `scripts/main.js`：主流程、UI 状态机、剧情推进、调试面板
- `scripts/game-engine.js`：唯一渲染循环、Three.js 场景与性能统计
- `scripts/scene-manager.js`：场景加载、锚点、物件摆放、出口传送
- `scripts/player-controller.js`：苏秦第一/第三人称、移动、跳跃、上帝模式
- `scripts/interaction-system.js`：准星交互、E 键、XR 射线与中文提示
- `scripts/vr-controller.js`：Quest 控制器、摇杆、Trigger 与 XR HUD
- `scripts/systems/xr-session-manager.js`：唯一 immersive-vr 会话入口
- `scripts/systems/webxr-diagnostics.js`：安全上下文与 Quest 诊断
- `scripts/systems/world-collision-system.js`：地面检测、台阶、最后安全位置
- `scripts/systems/scene-load-coordinator.js`：真实场景加载进度聚合

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
- 若缺少 `assets/videos/终章影片.mp4`，系统会回退到文字结局页
