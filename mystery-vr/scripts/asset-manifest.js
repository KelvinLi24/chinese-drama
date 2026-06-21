import { MODEL_CALIBRATION } from './data/model-calibration.js';
import { SCENE_CONTENT } from './data/scene-content.js';
import { SCENE_REGISTRY } from './data/scene-registry.js';

const resolveAsset = (relativePath) => new URL(relativePath, import.meta.url).href;

export const ASSET_MANIFEST = {
  scenes: Object.fromEntries(
    Object.entries(SCENE_REGISTRY).map(([sceneId, scene]) => [
      sceneId,
      {
        ...scene,
        layout: SCENE_CONTENT[sceneId]
      }
    ])
  ),
  player: {
    id: 'suqin-player',
    title: '苏秦',
    role: '主视角 / 六国丞相 / 合纵策士',
    path: resolveAsset('../assets/characters/苏秦_walk.glb'),
    fallbackPath: resolveAsset('../assets/characters/苏秦.glb'),
    portrait: resolveAsset('../assets/characters/苏秦.png'),
    targetHeight: MODEL_CALIBRATION.player.targetHeight,
    modelForwardOffsetY: MODEL_CALIBRATION.player.modelForwardOffsetY,
    usePlaceholderWhenNoAnimation: false,
    animationCandidates: {
      idle: ['Idle', 'idle', 'Breathing', 'Stand', '站立', '待机'],
      walk: ['Walk', 'walk', 'Walking', 'Locomotion', '走路', '行走'],
      run: ['Run', 'run', 'Running', '奔跑'],
      talk: ['Talk', 'talk', 'Speaking', 'Gesture', '说话']
    }
  },
  characters: {
    npc: {
      title: 'NPC',
      role: '中立引导角色',
      path: resolveAsset('../assets/characters/NPC.glb'),
      portrait: resolveAsset('../assets/characters/NPC.png'),
      targetHeight: MODEL_CALIBRATION.characters.npc,
      animationCandidates: { idle: ['Idle', 'idle', '站立'] }
    },
    gongsunyan: {
      title: '公孙衍',
      role: '朝堂传诏重臣',
      path: resolveAsset('../assets/characters/公孙衍.glb'),
      portrait: resolveAsset('../assets/characters/公孙衍.png'),
      targetHeight: MODEL_CALIBRATION.characters.gongsunyan,
      animationCandidates: {
        idle: ['Idle', 'idle', '站立'],
        talk: ['Talk', 'talk', 'Speaking', 'Gesture', '说话']
      }
    },
    chuhuiwang: {
      title: '楚惠王',
      role: '六国诸侯',
      path: resolveAsset('../assets/characters/楚惠王.glb'),
      portrait: resolveAsset('../assets/characters/楚惠王.png'),
      targetHeight: MODEL_CALIBRATION.characters.chuhuiwang,
      animationCandidates: { idle: ['Idle', 'idle', '站立'] }
    },
    qizhuangwang: {
      title: '齐庄王',
      role: '六国诸侯',
      path: resolveAsset('../assets/characters/齐庄王.glb'),
      portrait: resolveAsset('../assets/characters/齐庄王.png'),
      targetHeight: MODEL_CALIBRATION.characters.qizhuangwang,
      animationCandidates: { idle: ['Idle', 'idle', '站立'] }
    },
    lianghuiwang: {
      title: '梁惠王',
      role: '六国诸侯',
      path: resolveAsset('../assets/characters/梁惠王.glb'),
      portrait: resolveAsset('../assets/characters/梁惠王.png'),
      targetHeight: MODEL_CALIBRATION.characters.lianghuiwang,
      animationCandidates: { idle: ['Idle', 'idle', '站立'] }
    },
    zhaolord: {
      title: '赵国诸侯',
      role: '六国诸侯',
      path: resolveAsset('../assets/characters/赵国诸侯.glb'),
      portrait: resolveAsset('../assets/characters/赵国诸侯.png'),
      targetHeight: MODEL_CALIBRATION.characters.zhaolord,
      animationCandidates: { idle: ['Idle', 'idle', '站立'] }
    },
    hanlord: {
      title: '韩国诸侯',
      role: '六国诸侯',
      path: resolveAsset('../assets/characters/韩国诸侯.glb'),
      portrait: resolveAsset('../assets/characters/韩国诸侯.png'),
      targetHeight: MODEL_CALIBRATION.characters.hanlord,
      animationCandidates: { idle: ['Idle', 'idle', '站立'] }
    },
    yanlord: {
      title: '燕国诸侯',
      role: '六国诸侯',
      path: resolveAsset('../assets/characters/燕国诸侯.glb'),
      portrait: resolveAsset('../assets/characters/燕国诸侯.png'),
      targetHeight: MODEL_CALIBRATION.characters.yanlord,
      animationCandidates: { idle: ['Idle', 'idle', '站立'] }
    },
    official: {
      title: '通用六国文官',
      role: '朝堂文官',
      path: resolveAsset('../assets/characters/通用六国文官.glb'),
      portrait: resolveAsset('../assets/characters/通用六国文官.png'),
      targetHeight: MODEL_CALIBRATION.characters.official,
      animationCandidates: { idle: ['Idle', 'idle', '站立'] }
    },
    guard: {
      title: '通用侍卫',
      role: '仪仗侍卫',
      path: resolveAsset('../assets/characters/通用侍卫.glb'),
      portrait: resolveAsset('../assets/characters/通用侍卫.png'),
      targetHeight: MODEL_CALIBRATION.characters.guard,
      animationCandidates: { idle: ['Idle', 'idle', '站立'] }
    },
    performer: {
      title: '粤剧伶人',
      role: '戏棚人物',
      path: resolveAsset('../assets/characters/粤剧伶人.glb'),
      portrait: resolveAsset('../assets/characters/粤剧伶人.png'),
      targetHeight: MODEL_CALIBRATION.characters.performer,
      animationCandidates: { idle: ['Idle', 'idle', '站立'] }
    }
  },
  props: {
    token: {
      title: '六国封相令牌',
      category: '令牌印信',
      path: resolveAsset('../assets/props/六国封相令牌.glb'),
      preview: resolveAsset('../assets/props/六国封相令牌.png'),
      targetHeight: MODEL_CALIBRATION.props.token
    },
    seal: {
      title: '官印',
      category: '令牌印信',
      path: resolveAsset('../assets/props/官印.glb'),
      preview: resolveAsset('../assets/props/官印.png'),
      targetHeight: MODEL_CALIBRATION.props.seal
    },
    crown: {
      title: '凤冠',
      category: '戏曲冠饰',
      path: resolveAsset('../assets/props/凤冠.glb'),
      preview: resolveAsset('../assets/props/凤冠.png'),
      previewVideo: resolveAsset('../assets/props/凤冠.mp4'),
      targetHeight: MODEL_CALIBRATION.props.crown
    },
    pattern: {
      title: '蟒袍胸前补子纹样',
      category: '服饰纹样',
      path: resolveAsset('../assets/props/蟒袍胸前补子纹样.glb'),
      preview: resolveAsset('../assets/props/蟒袍胸前补子纹样.png'),
      targetHeight: MODEL_CALIBRATION.props.pattern
    },
    jade: {
      title: '丞相玉佩',
      category: '令牌印信',
      path: resolveAsset('../assets/props/丞相玉佩.glb'),
      preview: resolveAsset('../assets/props/丞相玉佩.png'),
      targetHeight: MODEL_CALIBRATION.props.jade
    },
    waxLetter: {
      title: '封蜡密函',
      category: '密函文书',
      path: resolveAsset('../assets/props/封蜡密函.glb'),
      preview: resolveAsset('../assets/props/封蜡密函.png'),
      targetHeight: MODEL_CALIBRATION.props.waxLetter
    },
    warringLetter: {
      title: '战国密信',
      category: '密函文书',
      path: resolveAsset('../assets/props/战国密信.glb'),
      preview: resolveAsset('../assets/props/战国密信.png'),
      targetHeight: MODEL_CALIBRATION.props.warringLetter
    },
    clueBox: {
      title: '小型线索木匣',
      category: '令牌印信',
      path: resolveAsset('../assets/props/小型线索木匣.glb'),
      preview: resolveAsset('../assets/props/小型线索木匣.png'),
      targetHeight: MODEL_CALIBRATION.props.clueBox
    },
    key: {
      title: '舞台机关钥匙',
      category: '令牌印信',
      path: resolveAsset('../assets/props/舞台机关钥匙.glb'),
      preview: resolveAsset('../assets/props/舞台机关钥匙.png'),
      targetHeight: MODEL_CALIBRATION.props.key
    },
    fan: {
      title: '粤剧折扇',
      category: '舞台道具',
      path: resolveAsset('../assets/props/粤剧折扇.glb'),
      preview: resolveAsset('../assets/props/粤剧折扇.png'),
      targetHeight: MODEL_CALIBRATION.props.fan
    },
    vocalShard: {
      title: '声境碎片-唱腔记忆片',
      category: '声景碎片',
      path: resolveAsset('../assets/props/声境碎片-唱腔记忆片.glb'),
      preview: resolveAsset('../assets/props/声境碎片-唱腔记忆片.png'),
      targetHeight: MODEL_CALIBRATION.props.vocalShard
    },
    drumShard: {
      title: '声境碎片-锣鼓记忆晶片',
      category: '声景碎片',
      path: resolveAsset('../assets/props/声境碎片-锣鼓记忆晶片.glb'),
      preview: resolveAsset('../assets/props/声境碎片-锣鼓记忆晶片.png'),
      targetHeight: MODEL_CALIBRATION.props.drumShard
    },
    archiveFragment: {
      title: '数位档案碎片',
      category: '档案残片',
      path: resolveAsset('../assets/props/数字档案碎片.glb'),
      preview: resolveAsset('../assets/props/数字档案碎片.png'),
      targetHeight: MODEL_CALIBRATION.props.archiveFragment
    }
  }
};

export const GAME_RESOURCES = {
  missingAudio: [
    '封相朝堂环境音',
    '院子环境音',
    '书房密室环境音',
    '终章粤剧戏棚环境音'
  ]
};

