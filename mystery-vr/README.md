# mystery-vr

`mystery-vr/` 是从 `main-site` 的“进入剧本杀世界”按钮进入的 WebXR 粤剧剧本杀模块。

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
→ `序章粤剧剧场 / 结局收束`

## 主要脚本

- `scripts/main.js`：主流程、UI 状态机、剧情推进
- `scripts/scene-manager.js`：场景加载、环境壳、锚点、物件注册
- `scripts/player-controller.js`：苏秦第一 / 第三人称、WASD、跳跃、高跳
- `scripts/interaction-system.js`：准星交互、E 键、中文提示
- `scripts/npc-system.js`：NPC 加载、待机、朝向玩家、对话触发
- `scripts/data/scene-registry.js`：五个正式场景注册
- `scripts/data/scene-content.js`：NPC / 物件 / 出口布局
- `scripts/data/story-state.js`：剧情状态、目标、证据链
- `scripts/story-data.js`：对白、线索文本、结局文本

## 本地运行

在仓库根目录执行：

```bash
python -m http.server 4173
```

然后打开：

```text
http://127.0.0.1:4173/mystery-vr/index.html
```

## 当前资源说明

- 玩家数字人：`assets/characters/苏秦_walk.glb`
- 序章影片：`assets/videos/序章影片.mp4`
- 终章戏棚：`assets/scenes/粤剧戏棚.glb`

## 调试快捷键

- `~`：显示调试面板
- `F`：第一 / 第三人称切换
- `R`：重置当前位置
- `I`：线索档案
- `M`：场景地图

