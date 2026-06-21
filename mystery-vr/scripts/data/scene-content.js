export const SCENE_CONTENT = {
  prologue: {
    entryCutsceneId: 'prologueTransition',
    anchors: {
      guideSpot: { position: [0, 0, -0.9], type: 'floor' },
      guideExit: { position: [0, 0, -6.4], type: 'portal' },
      stageFan: { position: [-2.2, 0.92, -4.5], type: 'desk' },
      drumRack: { position: [2.4, 0.92, -4.2], type: 'desk' }
    },
    npcs: [
      {
        id: 'guide-performer',
        characterId: 'npc',
        displayName: '引路使者',
        subtitle: '戏中引路人',
        position: [0, 0, -0.9],
        rotationY: 0,
        scale: 1.08,
        interactionRadius: 4,
        lookAtPlayer: true,
        dialogueId: 'guide_intro',
        interactable: true
      },
      {
        id: 'guide-guard',
        characterId: 'guard',
        displayName: '守幕侍卫',
        subtitle: '静候开场',
        position: [-4.2, 0, 1.8],
        rotationY: -1.3,
        scale: 1.06,
        interactionRadius: 2.2,
        interactable: false
      }
    ],
    props: [
      {
        id: 'prologue-fan',
        propId: 'fan',
        title: '粤剧折扇',
        promptTitle: '粤剧折扇',
        promptSubtitle: '舞台道具',
        actionLabel: '观察',
        position: [-2.2, 0.92, -4.5],
        rotation: [0.04, 0.5, 0],
        placement: 'surface',
        interactive: false
      },
      {
        id: 'prologue-drum-shard',
        propId: 'drumShard',
        title: '锣鼓记忆晶片',
        promptTitle: '锣鼓记忆晶片',
        promptSubtitle: '序章声景',
        actionLabel: '聆听',
        position: [2.4, 0.92, -4.2],
        rotation: [0, 0.4, 0],
        scale: 1.1,
        placement: 'surface',
        interactive: false,
        collectable: true,
        clueId: 'drumShard',
        eventFlag: 'heard_seventh_gong'
      }
    ],
    exits: [
      {
        id: 'prologue-exit-court',
        displayName: '舞台帷幕',
        promptTitle: '进入封相朝堂',
        promptSubtitle: '完成引导后可进入',
        actionLabel: '进入',
        position: [0, 0, -6.4],
        rotationY: Math.PI,
        interactionRadius: 3.2,
        toScene: 'court',
        requiredFlags: ['guide_completed']
      }
    ]
  },
  court: {
    entryCutsceneId: 'courtArrival',
    anchors: {
      mainDesk: { position: [0, 1.08, -0.95], type: 'desk' },
      eastDesk: { position: [4.05, 1.02, 0.85], type: 'desk' },
      westDesk: { position: [-4.2, 1.02, 0.8], type: 'desk' },
      recordDesk: { position: [-6.1, 1.04, 1.2], type: 'desk' },
      decreePoint: { position: [0.28, 1.1, 0.18], type: 'desk' },
      eastGate: { position: [8.3, 0, 5.1], type: 'portal' },
      crownStand: { position: [5.5, 1.2, -2.1], type: 'altar' }
    },
    npcs: [
      { id: 'court-gongsunyan', characterId: 'gongsunyan', displayName: '公孙衍', subtitle: '黄门官 · 朝堂传诏重臣', position: [0.15, 1.34, -1.86], rotationY: Math.PI, scale: 1.38, interactionRadius: 4.2, lookAtPlayer: true, dialogueId: 'court_gongsunyan', interactable: true },
      { id: 'court-liang', characterId: 'lianghuiwang', displayName: '梁惠王', subtitle: '魏国主位诸侯', position: [0, 1.38, -4.28], rotationY: Math.PI, scale: 1.42, interactionRadius: 3.8, dialogueId: 'court_lianghuiwang', interactable: true },
      { id: 'court-chu', characterId: 'chuhuiwang', displayName: '楚惠王', subtitle: '楚国前列诸侯', position: [4.65, 1.35, -1.18], rotationY: -2.42, scale: 1.36, interactionRadius: 3.4, dialogueId: 'court_chuhuiwang', interactable: true },
      { id: 'court-qi', characterId: 'qizhuangwang', displayName: '齐庄王', subtitle: '齐国观望者', position: [6.25, 1.35, 0.96], rotationY: -2.58, scale: 1.34, interactionRadius: 3.3, dialogueId: 'court_qizhuangwang', interactable: true },
      { id: 'court-zhao', characterId: 'zhaolord', displayName: '赵国诸侯', subtitle: '东侧边门代表', position: [7.68, 1.32, 3.66], rotationY: -2.72, scale: 1.34, interactionRadius: 3.8, dialogueId: 'court_zhaolord', interactable: true },
      { id: 'court-han', characterId: 'hanlord', displayName: '韩国诸侯', subtitle: '西侧前列使者', position: [-4.72, 1.34, -1.04], rotationY: 2.42, scale: 1.34, interactionRadius: 3.4, dialogueId: 'court_hanlord', interactable: true },
      { id: 'court-yan', characterId: 'yanlord', displayName: '燕国诸侯', subtitle: '北地观望者', position: [-7.08, 1.31, 2.98], rotationY: 2.58, scale: 1.34, interactionRadius: 3.4, dialogueId: 'court_yanlord', interactable: true },
      { id: 'court-official', characterId: 'official', displayName: '记录文官', subtitle: '西侧记录台', position: [-6.08, 1.32, 0.96], rotationY: 2.36, scale: 1.22, interactionRadius: 2.8, interactable: false },
      { id: 'court-guard-south', characterId: 'guard', displayName: '南门侍卫', subtitle: '封相仪仗', position: [0.22, 0, 8.52], rotationY: Math.PI, scale: 1.18, interactionRadius: 2.6, interactable: false },
      { id: 'court-guard-east', characterId: 'guard', displayName: '侧门侍卫', subtitle: '东侧封门口', position: [8.15, 0, 5.52], rotationY: -2.4, scale: 1.18, interactionRadius: 2.6, interactable: false }
    ],
    props: [
      { id: 'court-token', propId: 'token', title: '六国封相令牌', promptTitle: '六国封相令牌', promptSubtitle: '中央封相台', actionLabel: '调查', position: [0.54, 1.11, 0.2], rotation: [0, -0.44, 0], scale: 1.95, placement: 'surface', interactive: true, interactionRadius: 4.8, collectable: true, clueId: 'token', sourceLabel: '封相朝堂', relatedCharacter: '苏秦' },
      { id: 'court-seal', propId: 'seal', title: '官印', promptTitle: '官印', promptSubtitle: '诏书案右侧', actionLabel: '调查', position: [-0.62, 1.11, 0.14], rotation: [0, 0.52, 0], scale: 1.9, placement: 'surface', interactive: true, interactionRadius: 4.8, collectable: true, clueId: 'seal', sourceLabel: '主案区域', relatedCharacter: '公孙衍' },
      { id: 'court-archive-fragment', propId: 'archiveFragment', title: '数位档案碎片', promptTitle: '数位档案碎片', promptSubtitle: '文官记录台', actionLabel: '调查', position: [-5.8, 1.07, 1.28], rotation: [0, 0.24, 0], scale: 1.8, placement: 'surface', interactive: true, interactionRadius: 4.4, collectable: true, clueId: 'archiveFragment', sourceLabel: '记录台', relatedCharacter: '朝堂文官' },
      { id: 'court-decree', propId: 'warringLetter', title: '退盟副诏', promptTitle: '退盟副诏', promptSubtitle: '封相主案', actionLabel: '调查', position: [0.05, 1.11, -0.12], rotation: [0.05, -0.76, 0.03], scale: 2.2, placement: 'surface', interactive: true, interactionRadius: 4.8, collectable: true, clueId: 'draftDecree', sourceLabel: '宣诏区域', relatedCharacter: '公孙衍' }
    ],
    exits: [
      { id: 'court-east-exit', displayName: '东侧偏门', promptTitle: '前往院子', promptSubtitle: '需先锁定第一轮疑点', actionLabel: '前往', position: [8.3, 0, 5.1], rotationY: -2.48, interactionRadius: 3.1, toScene: 'courtyard', requiredFlags: ['courtyard_unlocked'] }
    ]
  },
  courtyard: {
    entryCutsceneId: 'courtyardOverhear',
    anchors: {
      lanternCrack: { position: [3.2, 0, -1.02], type: 'floor' },
      corridorTurn: { position: [1.82, 0, 2.18], type: 'floor' },
      studyGate: { position: [5.7, 0, -4.4], type: 'portal' }
    },
    npcs: [
      { id: 'courtyard-gongsunyan', characterId: 'gongsunyan', displayName: '公孙衍', subtitle: '回廊阴影中的低语', position: [2.84, 0, -1.64], rotationY: -2.16, scale: 1.16, interactionRadius: 2.8, interactable: false },
      { id: 'courtyard-guard', characterId: 'guard', displayName: '院中侍卫', subtitle: '守门侍卫', position: [1.28, 0, -2.14], rotationY: -0.18, scale: 1.14, interactionRadius: 3.2, dialogueId: 'courtyard_guard', interactable: true },
      { id: 'courtyard-patrol', characterId: 'guard', displayName: '巡逻侍卫', subtitle: '远处巡逻', position: [-3.2, 0, 0.86], rotationY: 0.82, scale: 1.1, interactionRadius: 2.2, interactable: false }
    ],
    props: [
      { id: 'courtyard-wax-letter', propId: 'waxLetter', title: '封蜡密函', promptTitle: '封蜡密函', promptSubtitle: '石灯笼后方裂缝', actionLabel: '调查', position: [3.48, 0, -0.92], rotation: [0.02, -0.82, 0.04], scale: 1.5, placement: 'floor', interactive: true, interactionRadius: 3.2, collectable: true, clueId: 'waxLetter', sourceLabel: '院中石灯笼', relatedCharacter: '楚惠王' },
      { id: 'courtyard-stage-key', propId: 'key', title: '舞台机关钥匙', promptTitle: '舞台机关钥匙', promptSubtitle: '回廊转角地面', actionLabel: '拾取', position: [1.92, 0, 2.14], rotation: [0, 0.38, 0], scale: 1.45, placement: 'floor', interactive: true, interactionRadius: 3.1, collectable: true, clueId: 'key', sourceLabel: '回廊转角', relatedCharacter: '公孙衍', hiddenUntilFlags: ['courtyard_overheard'] },
      { id: 'courtyard-listening-spot', propId: 'drumShard', title: '偷听位置', promptTitle: '偷听位置', promptSubtitle: '先别惊动他们', actionLabel: '观察', position: [-0.6, 0.18, -0.76], rotation: [0, 0.12, 0], placement: 'hover', interactive: false }
    ],
    exits: [
      { id: 'courtyard-study-exit', displayName: '侧廊暗门', promptTitle: '进入书房密室', promptSubtitle: '需要拿到钥匙与口供', actionLabel: '进入', position: [5.7, 0, -4.4], rotationY: -2.62, interactionRadius: 3.1, toScene: 'study', requiredFlags: ['study_unlocked'] }
    ]
  },
  study: {
    entryCutsceneId: '',
    anchors: {
      hiddenShelf: { position: [-2.36, 0.84, -2.82], type: 'shelf' },
      clueBoxSpot: { position: [-2.54, 0.62, -3.08], type: 'shelf' },
      verificationDesk: { position: [0.22, 0.92, -1.86], type: 'desk' },
      letterDrawer: { position: [0.94, 0.92, -0.86], type: 'desk' },
      courtReturnGate: { position: [0, 0, 5.36], type: 'portal' }
    },
    npcs: [],
    props: [
      { id: 'study-hidden-shelf', propId: 'key', title: '书架暗格', promptTitle: '书架暗格', promptSubtitle: '似乎藏着机关锁扣', actionLabel: '检查', position: [-2.36, 0.84, -2.82], rotation: [0, 0.42, 0], scale: 1.08, placement: 'surface', interactive: true, collectable: false, eventFlag: 'open_hidden_shelf' },
      { id: 'study-clue-box', propId: 'clueBox', title: '小型线索木匣', promptTitle: '小型线索木匣', promptSubtitle: '藏在旧竹简后方', actionLabel: '调查', position: [-2.54, 0.62, -3.08], rotation: [0, 0.18, 0], scale: 1.28, placement: 'surface', interactive: true, interactionRadius: 2.8, collectable: false, clueId: 'clueBox', sourceLabel: '书架底层', relatedCharacter: '苏秦', hiddenUntilFlags: ['hidden_shelf_opened'] },
      { id: 'study-war-letter', propId: 'warringLetter', title: '战国密信', promptTitle: '战国密信', promptSubtitle: '书案右侧暗屉', actionLabel: '调查', position: [0.94, 0.92, -0.86], rotation: [0.05, -0.34, 0.04], scale: 1.26, placement: 'surface', interactive: true, interactionRadius: 2.8, collectable: true, clueId: 'warringLetter', sourceLabel: '书案暗屉', relatedCharacter: '公孙衍' },
      { id: 'study-verification-desk', propId: 'seal', title: '文书验证台', promptTitle: '文书验证台', promptSubtitle: '可在此比对声景与印信', actionLabel: '验证', position: [0.22, 0.92, -1.86], rotation: [0, 0.22, 0], scale: 1.15, placement: 'surface', interactive: true, interactionRadius: 3.2, collectable: false, eventFlag: 'study_puzzle' }
    ],
    exits: [
      { id: 'study-return-court', displayName: '回朝堂', promptTitle: '返回封相朝堂', promptSubtitle: '完成证据链后进入对质', actionLabel: '返回', position: [0, 0, 5.36], rotationY: Math.PI, interactionRadius: 3.2, toScene: 'court', requiredFlags: ['final_court_ready'] }
    ]
  },
  stage: {
    entryCutsceneId: 'stageEpilogueLead',
    anchors: {
      stageCenter: { position: [0, 0, -1.2], type: 'stageProp' },
      crownTable: { position: [2.6, 0.96, -3.8], type: 'altar' },
      fanDesk: { position: [-2.2, 0.92, -3.6], type: 'desk' },
      returnGate: { position: [0, 0, 6.4], type: 'portal' }
    },
    npcs: [
      { id: 'stage-performer', characterId: 'performer', displayName: '终章伶人', subtitle: '戏中收束者', position: [0.2, 0, -1.6], rotationY: Math.PI, scale: 1.08, interactionRadius: 3.2, dialogueId: 'stage_epilogue', interactable: true },
      { id: 'stage-gongsunyan', characterId: 'gongsunyan', displayName: '公孙衍·台上角', subtitle: '戏中反证', position: [3.4, 0, -2.6], rotationY: -2.36, scale: 1.08, interactionRadius: 2.6, interactable: false },
      { id: 'stage-liang', characterId: 'lianghuiwang', displayName: '梁惠王·台上角', subtitle: '礼制见证', position: [-3.6, 0, -2.8], rotationY: 2.4, scale: 1.08, interactionRadius: 2.6, interactable: false },
      { id: 'stage-yan', characterId: 'yanlord', displayName: '燕国诸侯·台上角', subtitle: '北地群像', position: [-1.8, 0, -4.2], rotationY: 2.82, scale: 1.08, interactionRadius: 2.6, interactable: false },
      { id: 'stage-guard', characterId: 'guard', displayName: '仪仗侍卫', subtitle: '终章群像', position: [5.1, 0, -1.4], rotationY: -2.14, scale: 1.06, interactionRadius: 2.4, interactable: false }
    ],
    props: [
      { id: 'stage-crown', propId: 'crown', title: '凤冠', promptTitle: '凤冠', promptSubtitle: '终章礼台', actionLabel: '观察', position: [2.6, 1.02, -3.8], rotation: [0, 0.34, 0], scale: 1.12, placement: 'surface', interactive: false },
      { id: 'stage-fan', propId: 'fan', title: '粤剧折扇', promptTitle: '粤剧折扇', promptSubtitle: '戏曲案台', actionLabel: '观察', position: [-2.2, 0.96, -3.6], rotation: [0.04, 0.24, 0], scale: 1.08, placement: 'surface', interactive: false },
      { id: 'stage-pattern', propId: 'pattern', title: '蟒袍胸前补子纹样', promptTitle: '蟒袍胸前补子纹样', promptSubtitle: '服饰细节', actionLabel: '观察', position: [0.68, 1.08, -1.24], rotation: [0, 0.18, 0], scale: 1.06, placement: 'surface', interactive: false },
      { id: 'stage-token', propId: 'token', title: '六国封相令牌', promptTitle: '六国封相令牌', promptSubtitle: '舞台收束象征', actionLabel: '观察', position: [1.2, 0.98, -3.28], rotation: [0, -0.2, 0], scale: 1.18, placement: 'surface', interactive: false }
    ],
    exits: [
      { id: 'stage-return-prologue', displayName: '回到序章剧场', promptTitle: '回到序章剧场', promptSubtitle: '终章演出后返回结语', actionLabel: '返回', position: [0, 0, 6.4], rotationY: Math.PI, interactionRadius: 3.1, toScene: 'prologue', requiredFlags: ['ending_played'] }
    ]
  }
};
