export const SCENE_CONTENT = {
  prologue: {
    entryCutsceneId: 'prologueTransition',
    anchors: {
      guideSpot: { position: [0, 0, -3.8], type: 'floor' },
      guideExit: { position: [0, 0, -6.2], type: 'portal' },
      stageFan: { position: [-2.1, 0.98, -4.25], type: 'surface' },
      drumRack: { position: [2.3, 1.02, -4.1], type: 'surface' }
    },
    npcs: [
      {
        id: 'guide-performer',
        characterId: 'npc',
        displayName: '引路使者',
        subtitle: '戏中引路人',
        anchor: 'guideSpot',
        rotationY: 0,
        scale: 1.06,
        interactionRadius: 3.8,
        lookAtPlayer: false,
        dialogueId: 'guide_intro',
        interactable: true
      },
    ],
    props: [
      {
        id: 'prologue-fan',
        propId: 'fan',
        title: '粤剧折扇',
        promptTitle: '粤剧折扇',
        promptSubtitle: '舞台道具',
        actionLabel: '查看',
        anchor: 'stageFan',
        positionOffset: [0, 0, 0],
        rotation: [0.05, 0.44, 0],
        scale: 0.88,
        placement: 'surface',
        surfaceClearance: 0.012,
        interactive: false
      },
      {
        id: 'prologue-drum-shard',
        propId: 'drumShard',
        title: '声境碎片－锣鼓记忆晶片',
        promptTitle: '锣鼓记忆晶片',
        promptSubtitle: '序章声景线索',
        actionLabel: '调查',
        anchor: 'drumRack',
        rotation: [0, 0.32, 0],
        scale: 0.9,
        placement: 'surface',
        surfaceClearance: 0.012,
        interactive: false,
        collectable: true,
        clueId: 'drumShard',
        eventFlag: 'heard_seventh_gong'
      }
    ],
    exits: [
      {
        id: 'prologue-exit-court',
        displayName: '封相朝堂入口',
        promptTitle: '前往封相朝堂',
        promptSubtitle: '正式进入第一幕调查',
        actionLabel: '进入',
        anchor: 'guideExit',
        rotationY: Math.PI,
        interactionRadius: 2.8,
        portalScale: 0.92,
        toScene: 'court',
        requiredFlags: ['guide_completed']
      }
    ]
  },

  court: {
    entryCutsceneId: 'courtArrival',
    anchors: {
      mainDesk: { position: [0, 1.08, -0.94], type: 'surface' },
      eastDesk: { position: [4.15, 1.04, 0.98], type: 'surface' },
      westDesk: { position: [-4.22, 1.04, 0.96], type: 'surface' },
      recordDesk: { position: [-6.18, 1.02, 1.26], type: 'surface' },
      tokenTray: { position: [0.62, 1.11, 0.12], type: 'surface' },
      decreeStand: { position: [0.08, 1.1, -0.08], type: 'surface' },
      sealDesk: { position: [-0.7, 1.1, 0.08], type: 'surface' },
      eastGate: { position: [7.8, 0, 4.9], type: 'portal' },
      crownStand: { position: [5.1, 1.18, -2.05], type: 'surface' }
    },
    npcs: [
      { id: 'court-gongsunyan', characterId: 'gongsunyan', displayName: '公孙衍', subtitle: '黄门官 · 传诏重臣', position: [0.15, 0, -1.92], rotationY: Math.PI, scale: 1.08, interactionRadius: 3.6, lookAtPlayer: false, dialogueId: 'court_gongsunyan', interactable: true },
      { id: 'court-liang', characterId: 'lianghuiwang', displayName: '梁惠王', subtitle: '六国诸侯', position: [0, 0, -4.35], rotationY: Math.PI, scale: 1.12, interactionRadius: 3.4, dialogueId: 'court_lianghuiwang', interactable: true },
      { id: 'court-chu', characterId: 'chuhuiwang', displayName: '楚惠王', subtitle: '六国诸侯', position: [4.55, 0, -1.18], rotationY: -2.42, scale: 1.08, interactionRadius: 3.2, dialogueId: 'court_chuhuiwang', interactable: true },
      { id: 'court-qi', characterId: 'qizhuangwang', displayName: '齐庄王', subtitle: '六国诸侯', position: [6.12, 0, 1.04], rotationY: -2.56, scale: 1.06, interactionRadius: 3.1, dialogueId: 'court_qizhuangwang', interactable: true },
      { id: 'court-zhao', characterId: 'zhaolord', displayName: '赵国诸侯', subtitle: '边境势力代表', position: [7.45, 0, 3.42], rotationY: -2.68, scale: 1.06, interactionRadius: 3.4, dialogueId: 'court_zhaolord', interactable: true },
      { id: 'court-han', characterId: 'hanlord', displayName: '韩国诸侯', subtitle: '弱国代表', position: [-4.62, 0, -1.06], rotationY: 2.42, scale: 1.06, interactionRadius: 3.1, dialogueId: 'court_hanlord', interactable: true },
      { id: 'court-yan', characterId: 'yanlord', displayName: '燕国诸侯', subtitle: '北地观望者', position: [-6.88, 0, 2.84], rotationY: 2.58, scale: 1.06, interactionRadius: 3.1, dialogueId: 'court_yanlord', interactable: true },
      { id: 'court-official', characterId: 'official', displayName: '朝堂文官', subtitle: '记录官', position: [-6.02, 0, 1.02], rotationY: 2.34, scale: 0.98, interactionRadius: 2.6, interactable: false },
      { id: 'court-guard-south', characterId: 'guard', displayName: '侍卫', subtitle: '南侧守卫', position: [0.3, 0, 8.24], rotationY: Math.PI, scale: 1.02, interactionRadius: 2.4, interactable: false },
      { id: 'court-guard-east', characterId: 'guard', displayName: '侍卫', subtitle: '东侧守卫', position: [7.72, 0, 5.16], rotationY: -2.44, scale: 1.02, interactionRadius: 2.4, interactable: false }
    ],
    props: [
      { id: 'court-token', propId: 'token', title: '六国封相令牌', promptTitle: '六国封相令牌', promptSubtitle: '中央礼台线索', actionLabel: '调查', anchor: 'tokenTray', rotation: [0, -0.26, 0], scale: 0.92, placement: 'surface', surfaceClearance: 0.018, interactive: true, interactionRadius: 3.6, collectable: true, clueId: 'token', sourceLabel: '封相台', relatedCharacter: '苏秦' },
      { id: 'court-seal', propId: 'seal', title: '官印', promptTitle: '官印', promptSubtitle: '诏书案样本', actionLabel: '调查', anchor: 'sealDesk', rotation: [0, 0.36, 0], scale: 0.84, placement: 'surface', surfaceClearance: 0.018, interactive: true, interactionRadius: 3.4, collectable: true, clueId: 'seal', sourceLabel: '诏书案', relatedCharacter: '公孙衍' },
      { id: 'court-archive-fragment', propId: 'archiveFragment', title: '数位档案碎片', promptTitle: '数位档案碎片', promptSubtitle: '记录台线索', actionLabel: '调查', anchor: 'recordDesk', positionOffset: [0.22, 0, 0.08], rotation: [0, 0.18, 0], scale: 0.92, placement: 'surface', surfaceClearance: 0.015, interactive: true, interactionRadius: 3.2, collectable: true, clueId: 'archiveFragment', sourceLabel: '记录台', relatedCharacter: '朝堂文官' },
      { id: 'court-decree', propId: 'warringLetter', title: '退盟副诏', promptTitle: '退盟副诏', promptSubtitle: '宣诏异常文书', actionLabel: '调查', anchor: 'decreeStand', rotation: [0.05, -0.54, 0.02], scale: 0.88, placement: 'surface', surfaceClearance: 0.012, interactive: true, interactionRadius: 3.4, collectable: true, clueId: 'draftDecree', sourceLabel: '宣诏区域', relatedCharacter: '公孙衍' }
    ],
    exits: [
      { id: 'court-east-exit', displayName: '通往院子', promptTitle: '前往院子', promptSubtitle: '继续追查第七声锣后的暗令', actionLabel: '进入', anchor: 'eastGate', rotationY: -2.48, interactionRadius: 2.8, portalScale: 0.94, toScene: 'courtyard', requiredFlags: ['courtyard_unlocked'] }
    ]
  },

  courtyard: {
    entryCutsceneId: 'courtyardOverhear',
    anchors: {
      lanternCrack: { position: [3.16, 0, -1.02], type: 'floor' },
      corridorTurn: { position: [1.84, 0, 2.04], type: 'floor' },
      guardPost: { position: [1.24, 0, -2.06], type: 'floor' },
      studyGate: { position: [5.28, 0, -4.22], type: 'portal' }
    },
    npcs: [
      { id: 'courtyard-gongsunyan', characterId: 'gongsunyan', displayName: '公孙衍', subtitle: '回廊暗线', position: [2.82, 0, -1.62], rotationY: -2.16, scale: 1.02, interactionRadius: 2.8, interactable: false },
      { id: 'courtyard-guard', characterId: 'guard', displayName: '院中侍卫', subtitle: '守门侍卫', anchor: 'guardPost', rotationY: -0.18, scale: 1.0, interactionRadius: 3, dialogueId: 'courtyard_guard', interactable: true },
      { id: 'courtyard-patrol', characterId: 'guard', displayName: '巡逻侍卫', subtitle: '回廊守卫', position: [-3.04, 0, 0.94], rotationY: 0.82, scale: 0.98, interactionRadius: 2.2, interactable: false }
    ],
    props: [
      { id: 'courtyard-wax-letter', propId: 'waxLetter', title: '封蜡密函', promptTitle: '封蜡密函', promptSubtitle: '石灯笼后的暗线文书', actionLabel: '调查', anchor: 'lanternCrack', positionOffset: [0.24, 0, 0.12], rotation: [0.02, -0.82, 0.04], scale: 0.92, placement: 'floor', floorClearance: 0.008, interactive: true, interactionRadius: 2.6, collectable: true, clueId: 'waxLetter', sourceLabel: '石灯笼后方', relatedCharacter: '楚惠王' },
      { id: 'courtyard-stage-key', propId: 'key', title: '舞台机关钥匙', promptTitle: '舞台机关钥匙', promptSubtitle: '掉落在回廊转角', actionLabel: '调查', anchor: 'corridorTurn', positionOffset: [0.16, 0, 0.1], rotation: [0, 0.32, 0], scale: 0.82, placement: 'floor', floorClearance: 0.008, interactive: true, interactionRadius: 2.6, collectable: true, clueId: 'key', sourceLabel: '回廊转角', relatedCharacter: '公孙衍', hiddenUntilFlags: ['courtyard_overheard'] },
      { id: 'courtyard-listening-spot', propId: 'drumShard', title: '偷听位置', promptTitle: '偷听位置', promptSubtitle: '靠近后可听清低语', actionLabel: '观察', position: [-0.6, 0.18, -0.76], rotation: [0, 0.12, 0], scale: 0.74, placement: 'hover', interactive: false }
    ],
    exits: [
      { id: 'courtyard-study-exit', displayName: '通往书房密室', promptTitle: '前往书房密室', promptSubtitle: '沿暗门继续搜证', actionLabel: '进入', anchor: 'studyGate', rotationY: -2.62, interactionRadius: 2.8, portalScale: 0.88, toScene: 'study', requiredFlags: ['study_unlocked'] }
    ]
  },

  study: {
    entryCutsceneId: '',
    anchors: {
      hiddenShelf: { position: [-2.12, 1.1, -2.54], type: 'surface' },
      clueBoxSpot: { position: [-2.34, 0.7, -2.92], type: 'surface' },
      verificationDesk: { position: [0.18, 0.92, -1.68], type: 'surface' },
      letterDrawer: { position: [0.96, 0.88, -0.82], type: 'surface' },
      courtReturnGate: { position: [0, 0, 4.82], type: 'portal' }
    },
    npcs: [],
    props: [
      { id: 'study-hidden-shelf', propId: 'key', title: '书架暗格', promptTitle: '书架暗格', promptSubtitle: '需要机关钥匙开启', actionLabel: '调查', anchor: 'hiddenShelf', rotation: [0, 0.42, 0], scale: 0.82, placement: 'surface', surfaceClearance: 0.012, interactive: true, collectable: false, eventFlag: 'open_hidden_shelf', hideWhenFlags: ['hidden_shelf_opened'] },
      { id: 'study-clue-box', propId: 'clueBox', title: '小型线索木匣', promptTitle: '小型线索木匣', promptSubtitle: '书架底层隐藏物证', actionLabel: '调查', anchor: 'clueBoxSpot', rotation: [0, 0.18, 0], scale: 0.96, placement: 'surface', surfaceClearance: 0.012, interactive: true, interactionRadius: 2.5, collectable: false, clueId: 'clueBox', sourceLabel: '书架暗格', relatedCharacter: '苏秦', hiddenUntilFlags: ['hidden_shelf_opened'] },
      { id: 'study-war-letter', propId: 'warringLetter', title: '战国密信', promptTitle: '战国密信', promptSubtitle: '暗屉中的私下文书', actionLabel: '调查', anchor: 'letterDrawer', rotation: [0.05, -0.34, 0.04], scale: 0.9, placement: 'surface', surfaceClearance: 0.012, interactive: true, interactionRadius: 2.5, collectable: true, clueId: 'warringLetter', sourceLabel: '书案暗屉', relatedCharacter: '公孙衍' },
      { id: 'study-verification-desk', propId: 'seal', title: '文书验证台', promptTitle: '文书验证台', promptSubtitle: '用于比对封蜡、官印与副诏', actionLabel: '调查', anchor: 'verificationDesk', rotation: [0, 0.22, 0], scale: 0.76, placement: 'surface', surfaceClearance: 0.012, interactive: true, interactionRadius: 2.8, collectable: false, eventFlag: 'study_puzzle' }
    ],
    exits: [
      { id: 'study-return-court', displayName: '返回封相朝堂', promptTitle: '返回封相朝堂', promptSubtitle: '带着证据回去进行对质', actionLabel: '进入', anchor: 'courtReturnGate', rotationY: Math.PI, interactionRadius: 2.8, portalScale: 0.88, toScene: 'court', requiredFlags: ['final_court_ready'] }
    ]
  },

  stage: {
    entryCutsceneId: 'stageEpilogueLead',
    anchors: {
      stageCenter: { position: [0, 0, -1.24], type: 'floor' },
      crownTable: { position: [2.54, 1.02, -3.68], type: 'surface' },
      fanDesk: { position: [-2.08, 0.96, -3.44], type: 'surface' },
      tokenStand: { position: [1.12, 0.98, -3.18], type: 'surface' },
      returnGate: { position: [0, 0, 6.1], type: 'portal' }
    },
    npcs: [
      { id: 'stage-performer', characterId: 'performer', displayName: '粤剧伶人', subtitle: '终章引唱者', position: [0.18, 0, -1.54], rotationY: 0, scale: 1.04, interactionRadius: 3.1, dialogueId: 'stage_epilogue', interactable: true },
      { id: 'stage-gongsunyan', characterId: 'gongsunyan', displayName: '公孙衍舞台化身', subtitle: '终章群像', position: [3.18, 0, -2.44], rotationY: 0.18, scale: 1.02, interactionRadius: 2.6, interactable: false },
      { id: 'stage-liang', characterId: 'lianghuiwang', displayName: '梁惠王舞台化身', subtitle: '终章群像', position: [-3.34, 0, -2.62], rotationY: -0.16, scale: 1.02, interactionRadius: 2.6, interactable: false },
      { id: 'stage-yan', characterId: 'yanlord', displayName: '燕国诸侯舞台化身', subtitle: '终章群像', position: [-1.74, 0, -3.9], rotationY: 0.22, scale: 1.02, interactionRadius: 2.6, interactable: false }
    ],
    props: [
      { id: 'stage-crown', propId: 'crown', title: '凤冠', promptTitle: '凤冠', promptSubtitle: '终章戏台道具', actionLabel: '查看', anchor: 'crownTable', rotation: [0, 0.34, 0], scale: 0.84, placement: 'surface', surfaceClearance: 0.014, interactive: false },
      { id: 'stage-fan', propId: 'fan', title: '粤剧折扇', promptTitle: '粤剧折扇', promptSubtitle: '终章戏台道具', actionLabel: '查看', anchor: 'fanDesk', rotation: [0.04, 0.24, 0], scale: 0.86, placement: 'surface', surfaceClearance: 0.014, interactive: false },
      { id: 'stage-pattern', propId: 'pattern', title: '蟒袍胸前补子纹样', promptTitle: '补子纹样', promptSubtitle: '服饰细节回收', actionLabel: '查看', position: [0.7, 1.02, -1.22], rotation: [0, 0.18, 0], scale: 0.72, placement: 'surface', surfaceClearance: 0.012, interactive: false },
      { id: 'stage-token', propId: 'token', title: '六国封相令牌', promptTitle: '六国封相令牌', promptSubtitle: '终章礼器回收', actionLabel: '查看', anchor: 'tokenStand', rotation: [0, -0.2, 0], scale: 0.9, placement: 'surface', surfaceClearance: 0.014, interactive: false }
    ],
    exits: [
      { id: 'stage-return-prologue', displayName: '返回序章剧场', promptTitle: '返回序章粤剧剧场', promptSubtitle: '前往终局结算空间', actionLabel: '进入', anchor: 'returnGate', rotationY: Math.PI, interactionRadius: 2.8, portalScale: 0.92, toScene: 'prologue', requiredFlags: ['stage_return_unlocked'] }
    ]
  }
};
