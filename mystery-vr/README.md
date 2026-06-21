# 《六国大封相：声境谜局》

这是一个独立于主站 `main-site/` 的前端 WebGL / WebXR 原型。  
目标是让观众以苏秦视角，在七个场景中完成轻量搜证、人物对话与沉浸式浏览。

## 1. 当前实现范围

- Three.js 场景渲染
- WebGL 桌面探索
- WebXR VR 进入按钮与控制器交互
- 七个场景切换
- 线索拾取、档案库、对话与结局判定
- 纯前端、相对路径、GitHub Pages 兼容

## 2. 目录结构

```text
mystery-vr/
├─ index.html
├─ README.md
├─ styles/
│  └─ game.css
├─ scripts/
│  ├─ main.js
│  ├─ game-engine.js
│  ├─ player-controller.js
│  ├─ vr-controller.js
│  ├─ interaction-system.js
│  ├─ scene-manager.js
│  ├─ npc-system.js
│  ├─ inventory-system.js
│  ├─ audio-system.js
│  ├─ story-data.js
│  └─ asset-manifest.js
└─ assets/
   ├─ characters/
   ├─ props/
   └─ scenes/
```

## 3. 本地运行方式

请使用本地 HTTP 服务，不要直接双击 `file://`。

```bash
python -m http.server 4173
```

然后访问：

```text
http://localhost:4173/mystery-vr/index.html
```

## 4. GitHub Pages 部署说明

- 页面仅使用相对路径。
- Three.js 使用 CDN ES Module 导入。
- 模型、图片、全景图都从仓库内 `assets/` 读取。
- 部署后入口建议为：`/mystery-vr/index.html`

## 5. 桌面操作

- `W A S D`：移动
- `Shift`：加速
- 鼠标左键拖动：转向
- `E`：交互
- `F`：切换第一 / 第三人称
- `I`：线索档案库
- `M`：场景图
- `Esc`：暂停 / 关闭面板
- `R`：重置站位

## 6. VR 操作

当浏览器支持 WebXR 且设备允许 `immersive-vr` 时，会显示 `进入VR模式`：

- 右手控制器扳机：交互
- 左摇杆：移动
- 右摇杆：快速转向

不支持时会自动保留桌面模式。

## 7. 七个场景清单

- 序章粤剧剧场
- 封相朝堂
- 书房密室
- 粤剧戏棚（一）
- 粤剧戏棚（二）
- 粤剧戏棚（三）
- 院子

## 8. 已接入资源

### 人物

- 苏秦
- 公孙衍
- 楚惠王
- 齐庄王
- 梁惠王
- 赵国诸侯
- 韩国诸侯
- 燕国诸侯
- 通用六国文官
- 通用侍卫
- 粤剧伶人
- NPC

### 物件 / 线索

- 六国封相令牌
- 官印
- 凤冠
- 蟒袍胸前补子纹样
- 丞相玉佩
- 封蜡密函
- 战国密信
- 小型线索木匣
- 舞台机关钥匙
- 粤剧折扇
- 声境碎片-唱腔记忆片
- 声境碎片-锣鼓记忆晶片
- 数字档案碎片

## 9. 动画检测结果

已对仓库中的人物 `.glb` 做过扫描。当前检测到的人物模型 `animations` 数组均为空：

- `苏秦.glb`
- `公孙衍.glb`
- `楚惠王.glb`
- `齐庄王.glb`
- `梁惠王.glb`
- `赵国诸侯.glb`
- `韩国诸侯.glb`
- `燕国诸侯.glb`
- `通用六国文官.glb`
- `通用侍卫.glb`
- `粤剧伶人.glb`
- `NPC.glb`

因此当前原型已实现：

- 动画名称检测与日志输出
- 若模型无动画，仍可作为静态角色参与展示
- 保留后续接入 `idle / walk / run / talk` 动画的扩展位

## 10. 占位与已知限制

当前缺失、因此使用占位条目的内容：

- `改写戏单（占位）`
- `残缺唱词页（占位）`
- 环境音、UI 音效、角色语音

说明：

- 这些占位条目不会伪造 GLB，仅用于保持搜证流程完整。
- 若补齐音频资源，可直接扩展 `audio-system.js`。
- 若补齐带动画的苏秦数字人，可直接替换 `asset-manifest.js` 中的玩家模型配置。
