import { COURT_HALL_LAYOUT } from "./scene-layouts/court-hall-layout.js";

const resolveAsset = (relativePath) => new URL(relativePath, import.meta.url).href;

export const ASSET_MANIFEST = {
  scenes: {
    prologue: {
      id: "prologue",
      title: "序章粤剧剧场",
      path: resolveAsset("../assets/scenes/序章粤剧剧场.glb"),
      preview: resolveAsset("../assets/scenes/序章粤剧剧场.png"),
      panorama: resolveAsset("../assets/scenes/序章粤剧剧场360.png"),
      rootScale: 10.5,
      rotationY: 0,
      floorOffset: 0,
      playerStart: [0, 0, 7.6],
      playerRotationY: Math.PI,
      cameraHeight: 1.66,
      walkArea: { minX: -8.5, maxX: 8.5, minZ: -7.5, maxZ: 8.8 },
      loadCopy: "正在调入序章戏台记忆……",
      ambience: "序章粤剧剧场",
      unlockedByDefault: true
    },
    court: {
      id: "court",
      title: "封相朝堂",
      path: resolveAsset("../assets/scenes/封相朝堂.glb"),
      preview: resolveAsset("../assets/scenes/封相朝堂.png"),
      panorama: resolveAsset("../assets/scenes/封相朝堂360.png"),
      rootScale: COURT_HALL_LAYOUT.rootScale,
      rotationY: COURT_HALL_LAYOUT.rotationY,
      floorOffset: COURT_HALL_LAYOUT.floorOffset,
      playerStart: COURT_HALL_LAYOUT.playerStart.position,
      playerRotationY: COURT_HALL_LAYOUT.playerStart.rotationY,
      cameraHeight: COURT_HALL_LAYOUT.playerStart.eyeHeight,
      walkArea: COURT_HALL_LAYOUT.walkArea,
      loadCopy: "正在重构封相大典的声境记忆……",
      ambience: "封相朝堂",
      unlockedByDefault: true,
      layout: COURT_HALL_LAYOUT
    },
    study: {
      id: "study",
      title: "书房密室",
      path: resolveAsset("../assets/scenes/书房密室.glb"),
      preview: resolveAsset("../assets/scenes/书房密室.png"),
      panorama: resolveAsset("../assets/scenes/书房密室360.png"),
      rootScale: 8.4,
      rotationY: 0,
      floorOffset: 0,
      playerStart: [0, 0, 4.6],
      playerRotationY: Math.PI,
      cameraHeight: 1.66,
      walkArea: { minX: -5.2, maxX: 5.2, minZ: -5.8, maxZ: 5.8 },
      loadCopy: "正在调入书房密室……",
      ambience: "书房密室",
      unlockedByDefault: false
    },
    shed1: {
      id: "shed1",
      title: "粤剧戏棚（一）",
      path: resolveAsset("../assets/scenes/粤剧戏棚(1).glb"),
      preview: resolveAsset("../assets/scenes/粤剧戏棚(1).png"),
      panorama: resolveAsset("../assets/scenes/粤剧戏棚360.png"),
      rootScale: 8.6,
      rotationY: 0,
      floorOffset: 0,
      playerStart: [0, 0, 5.6],
      playerRotationY: Math.PI,
      cameraHeight: 1.66,
      walkArea: { minX: -6.4, maxX: 6.4, minZ: -6.2, maxZ: 6.2 },
      loadCopy: "正在调入粤剧戏棚（一）……",
      ambience: "粤剧戏棚",
      unlockedByDefault: false
    },
    shed2: {
      id: "shed2",
      title: "粤剧戏棚（二）",
      path: resolveAsset("../assets/scenes/粤剧戏棚(2).glb"),
      preview: resolveAsset("../assets/scenes/粤剧戏棚(2).png"),
      panorama: resolveAsset("../assets/scenes/粤剧戏棚360.png"),
      rootScale: 8.9,
      rotationY: 0,
      floorOffset: 0,
      playerStart: [0, 0, 5.2],
      playerRotationY: Math.PI,
      cameraHeight: 1.66,
      walkArea: { minX: -6.6, maxX: 6.6, minZ: -6.5, maxZ: 6.5 },
      loadCopy: "正在调入粤剧戏棚（二）……",
      ambience: "粤剧戏棚",
      unlockedByDefault: false
    },
    shed3: {
      id: "shed3",
      title: "粤剧戏棚（三）",
      path: resolveAsset("../assets/scenes/粤剧戏棚(3).glb"),
      preview: resolveAsset("../assets/scenes/粤剧戏棚(3).png"),
      panorama: resolveAsset("../assets/scenes/粤剧戏棚360.png"),
      rootScale: 8.8,
      rotationY: 0,
      floorOffset: 0,
      playerStart: [0, 0, 5.4],
      playerRotationY: Math.PI,
      cameraHeight: 1.66,
      walkArea: { minX: -6.4, maxX: 6.4, minZ: -6.3, maxZ: 6.3 },
      loadCopy: "正在调入粤剧戏棚（三）……",
      ambience: "粤剧戏棚",
      unlockedByDefault: false
    },
    courtyard: {
      id: "courtyard",
      title: "院子",
      path: resolveAsset("../assets/scenes/院子.glb"),
      preview: resolveAsset("../assets/scenes/院子.png"),
      rootScale: 9.6,
      rotationY: 0,
      floorOffset: 0,
      playerStart: [0, 0, 6.1],
      playerRotationY: Math.PI,
      cameraHeight: 1.66,
      walkArea: { minX: -7.2, maxX: 7.2, minZ: -7.2, maxZ: 7.2 },
      loadCopy: "正在调入院落外景……",
      ambience: "院子",
      unlockedByDefault: false
    }
  },
  player: {
    title: "苏秦",
    path: resolveAsset("../assets/characters/苏秦.glb"),
    portrait: resolveAsset("../assets/characters/苏秦.png"),
    targetHeight: 1.76,
    usePlaceholderWhenNoAnimation: false,
    animationCandidates: {
      idle: ["Idle", "idle", "Breathing", "Stand"],
      walk: ["Walk", "walk", "Walking", "Locomotion"],
      run: ["Run", "run", "Running"],
      talk: ["Talk", "talk", "Speaking", "Gesture"]
    }
  },
  characters: {
    npc: {
      title: "NPC",
      role: "中立引导",
      path: resolveAsset("../assets/characters/NPC.glb"),
      portrait: resolveAsset("../assets/characters/NPC.png"),
      targetHeight: 1.72,
      animationCandidates: { idle: ["Idle", "idle"] }
    },
    gongsunyan: {
      title: "公孙衍",
      role: "朝堂传诏重臣",
      path: resolveAsset("../assets/characters/公孙衍.glb"),
      portrait: resolveAsset("../assets/characters/公孙衍.png"),
      targetHeight: 1.76,
      animationCandidates: {
        idle: ["Idle", "idle"],
        talk: ["Talk", "talk", "Gesture", "Speaking"]
      },
      dialogueTree: "gongsunyan_intro"
    },
    chuhuiwang: {
      title: "楚惠王",
      role: "六国诸侯",
      path: resolveAsset("../assets/characters/楚惠王.glb"),
      portrait: resolveAsset("../assets/characters/楚惠王.png"),
      targetHeight: 1.82,
      animationCandidates: { idle: ["Idle", "idle"] },
      dialogueTree: "chuhuiwang_probe"
    },
    qizhuangwang: {
      title: "齐庄王",
      role: "六国诸侯",
      path: resolveAsset("../assets/characters/齐庄王.glb"),
      portrait: resolveAsset("../assets/characters/齐庄王.png"),
      targetHeight: 1.8,
      animationCandidates: { idle: ["Idle", "idle"] }
    },
    lianghuiwang: {
      title: "梁惠王",
      role: "六国诸侯",
      path: resolveAsset("../assets/characters/梁惠王.glb"),
      portrait: resolveAsset("../assets/characters/梁惠王.png"),
      targetHeight: 1.8,
      animationCandidates: { idle: ["Idle", "idle"] }
    },
    zhaolord: {
      title: "赵国诸侯",
      role: "六国诸侯",
      path: resolveAsset("../assets/characters/赵国诸侯.glb"),
      portrait: resolveAsset("../assets/characters/赵国诸侯.png"),
      targetHeight: 1.8,
      animationCandidates: { idle: ["Idle", "idle"] }
    },
    hanlord: {
      title: "韩国诸侯",
      role: "六国诸侯",
      path: resolveAsset("../assets/characters/韩国诸侯.glb"),
      portrait: resolveAsset("../assets/characters/韩国诸侯.png"),
      targetHeight: 1.8,
      animationCandidates: { idle: ["Idle", "idle"] }
    },
    yanlord: {
      title: "燕国诸侯",
      role: "六国诸侯",
      path: resolveAsset("../assets/characters/燕国诸侯.glb"),
      portrait: resolveAsset("../assets/characters/燕国诸侯.png"),
      targetHeight: 1.8,
      animationCandidates: { idle: ["Idle", "idle"] }
    },
    official: {
      title: "通用六国文官",
      role: "朝堂文官",
      path: resolveAsset("../assets/characters/通用六国文官.glb"),
      portrait: resolveAsset("../assets/characters/通用六国文官.png"),
      targetHeight: 1.72,
      animationCandidates: { idle: ["Idle", "idle"] }
    },
    guard: {
      title: "通用侍卫",
      role: "朝堂侍卫",
      path: resolveAsset("../assets/characters/通用侍卫.glb"),
      portrait: resolveAsset("../assets/characters/通用侍卫.png"),
      targetHeight: 1.78,
      animationCandidates: { idle: ["Idle", "idle"] }
    },
    performer: {
      title: "粤剧伶人",
      role: "戏棚人物",
      path: resolveAsset("../assets/characters/粤剧伶人.glb"),
      portrait: resolveAsset("../assets/characters/粤剧伶人.png"),
      targetHeight: 1.7,
      animationCandidates: { idle: ["Idle", "idle"] }
    }
  },
  props: {
    token: {
      title: "六国封相令牌",
      category: "令牌印信",
      path: resolveAsset("../assets/props/六国封相令牌.glb"),
      preview: resolveAsset("../assets/props/六国封相令牌.png"),
      targetHeight: 0.28
    },
    seal: {
      title: "官印",
      category: "令牌印信",
      path: resolveAsset("../assets/props/官印.glb"),
      preview: resolveAsset("../assets/props/官印.png"),
      targetHeight: 0.24
    },
    crown: {
      title: "凤冠",
      category: "令牌印信",
      path: resolveAsset("../assets/props/凤冠.glb"),
      preview: resolveAsset("../assets/props/凤冠.png"),
      targetHeight: 0.56
    },
    pattern: {
      title: "蟒袍胸前补子纹样",
      category: "服饰纹样",
      path: resolveAsset("../assets/props/蟒袍胸前补子纹样.glb"),
      preview: resolveAsset("../assets/props/蟒袍胸前补子纹样.png"),
      targetHeight: 0.18
    },
    jade: {
      title: "丞相玉佩",
      category: "令牌印信",
      path: resolveAsset("../assets/props/丞相玉佩.glb"),
      preview: resolveAsset("../assets/props/丞相玉佩.png"),
      targetHeight: 0.2
    },
    waxLetter: {
      title: "封蜡密函",
      category: "密函文书",
      path: resolveAsset("../assets/props/封蜡密函.glb"),
      preview: resolveAsset("../assets/props/封蜡密函.png"),
      targetHeight: 0.18
    },
    warringLetter: {
      title: "战国密信",
      category: "密函文书",
      path: resolveAsset("../assets/props/战国密信.glb"),
      preview: resolveAsset("../assets/props/战国密信.png"),
      targetHeight: 0.18
    },
    clueBox: {
      title: "小型线索木匣",
      category: "令牌印信",
      path: resolveAsset("../assets/props/小型线索木匣.glb"),
      preview: resolveAsset("../assets/props/小型线索木匣.png"),
      targetHeight: 0.32
    },
    key: {
      title: "舞台机关钥匙",
      category: "令牌印信",
      path: resolveAsset("../assets/props/舞台机关钥匙.glb"),
      preview: resolveAsset("../assets/props/舞台机关钥匙.png"),
      targetHeight: 0.14
    },
    fan: {
      title: "粤剧折扇",
      category: "令牌印信",
      path: resolveAsset("../assets/props/粤剧折扇.glb"),
      preview: resolveAsset("../assets/props/粤剧折扇.png"),
      targetHeight: 0.28
    },
    vocalShard: {
      title: "声境碎片-唱腔记忆片",
      category: "声景碎片",
      path: resolveAsset("../assets/props/声境碎片-唱腔记忆片.glb"),
      preview: resolveAsset("../assets/props/声境碎片-唱腔记忆片.png"),
      targetHeight: 0.18
    },
    drumShard: {
      title: "声境碎片-锣鼓记忆晶片",
      category: "声景碎片",
      path: resolveAsset("../assets/props/声境碎片-锣鼓记忆晶片.glb"),
      preview: resolveAsset("../assets/props/声境碎片-锣鼓记忆晶片.png"),
      targetHeight: 0.18
    },
    archiveFragment: {
      title: "数字档案碎片",
      category: "档案残片",
      path: resolveAsset("../assets/props/数字档案碎片.glb"),
      preview: resolveAsset("../assets/props/数字档案碎片.png"),
      targetHeight: 0.2
    },
    alteredPlaybill: {
      title: "改写戏单（占位）",
      category: "密函文书",
      preview: "",
      placeholder: true
    },
    scoreFragment: {
      title: "残缺唱词页（占位）",
      category: "声景碎片",
      preview: "",
      placeholder: true
    }
  },
  sceneLayout: {
    prologue: {
      npcs: [{ id: "performer", position: [1.6, 0, -1.8], rotationY: -1.5, scale: 1 }],
      clues: []
    },
    study: {
      npcs: [],
      clues: [
        { id: "warringLetter", position: [0.25, 0, -0.65], rotationY: 0.1, scale: 1, placement: "floor" },
        { id: "waxLetter", position: [-0.45, 0, -0.8], rotationY: -0.4, scale: 1, placement: "floor" },
        { id: "jade", position: [1.0, 0, -0.4], rotationY: 0.3, scale: 1, placement: "floor" },
        { id: "clueBox", position: [-1.15, 0, -1.2], rotationY: 0, scale: 1, placement: "floor" },
        { id: "key", position: [1.3, 0, -1.1], rotationY: 0.9, scale: 1, placement: "floor" }
      ]
    },
    shed1: {
      npcs: [{ id: "official", position: [-1.2, 0, -2], rotationY: 1.4, scale: 1 }],
      clues: [
        { id: "fan", position: [0.45, 0, -0.7], rotationY: 0.5, scale: 1, placement: "floor" },
        { id: "alteredPlaybill", position: [-0.8, 0, -0.4], rotationY: 0, scale: 1, placement: "floor" }
      ]
    },
    shed2: {
      npcs: [{ id: "official", position: [1.1, 0, -2.1], rotationY: -1.6, scale: 1 }],
      clues: [{ id: "scoreFragment", position: [0.3, 0, -0.8], rotationY: 0.4, scale: 1, placement: "floor" }]
    },
    shed3: {
      npcs: [],
      clues: [{ id: "vocalShard", position: [0.05, 0.2, -0.7], rotationY: 0, scale: 1, placement: "hover" }]
    },
    courtyard: {
      npcs: [{ id: "hanlord", position: [1.8, 0, -2.4], rotationY: -1.2, scale: 1 }],
      clues: [
        { id: "drumShard", position: [-0.6, 0.2, -0.8], rotationY: 0.1, scale: 1, placement: "hover" },
        { id: "archiveFragment", position: [0.9, 0, -1.1], rotationY: 0.2, scale: 1, placement: "floor" }
      ]
    }
  }
};

export const GAME_RESOURCES = {
  missingAudio: [
    "封相朝堂环境音（宫灯 / 木地板 / 远处礼乐）",
    "书房密室环境音",
    "粤剧戏棚环境音",
    "院子环境音",
    "关键对话提示音"
  ],
  missingAnimation: ["苏秦 Idle / Walk / Run", "公孙衍 Talk / Gesture"]
};
