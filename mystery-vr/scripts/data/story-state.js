export const GAME_MODES = {
  MENU: 'menu',
  LOADING: 'loading',
  VIDEO: 'video',
  CUTSCENE: 'cutscene',
  EXPLORE: 'explore',
  DIALOGUE: 'dialogue',
  INSPECT: 'inspect',
  PUZZLE: 'puzzle',
  MAP: 'map',
  PAUSED: 'paused',
  ENDING: 'ending'
};

export const STORY_TEXT = {
  title: '《六国大封相：第七声锣》',
  subtitle: '粤剧沉浸式 WebXR 剧本杀',
  launchCopy: '你将以苏秦视角步入戏中世界，在封相朝堂、院子与书房密室之间追查那道不该出现的封门之令。',
  videoLoading: ['正在聆听第七声锣……', '正在重构戏中声境……'],
  prologueTransition: [
    '戏幕未落，声已入局。',
    '你听见的第七声锣，',
    '正在另一个时空等待你。'
  ],
  courtArrival: [
    '六国封相大典即将开始。',
    '满堂朝贺之下，似乎有人试图掩盖一封不该存在的密信。',
    '你是苏秦。',
    '请先观察朝堂中的异常。'
  ],
  courtyardOverhear: [
    '你已离开正殿。',
    '回廊里的低语说明，第七响后的封门并非礼制常规。',
    '先别惊动公孙衍，听清他与侍卫到底说了什么。'
  ],
  finalCourtReturn: [
    '你已拼出文书与声景的真相。',
    '带着证据回朝堂，对公孙衍发起最终对质。'
  ],
  endingReturn: [
    '真相已经揭开。',
    '你再次回到序章粤剧剧场。',
    '去找引路使者，为这场戏收束最后一句台词。'
  ]
};

export const EVIDENCE_CHAINS = {
  sound: ['vocalShard', 'drumShard', 'archiveFragment'],
  document: ['seal', 'waxLetter', 'draftDecree'],
  action: ['zhaoTestimony', 'guardTestimony', 'yanTestimony']
};

export function createInitialProgress() {
  return {
    currentSceneId: 'prologue',
    storyBeat: 'video',
    flags: new Set(),
    collectedClues: new Set(),
    unlockedScenes: new Set(['prologue']),
    inspectedObjects: new Set(),
    completedDialogues: new Set(),
    puzzleState: {
      shelfOpened: false,
      clueBoxPicked: false,
      identityVerified: false,
      soundVerified: false,
      rhythmVerified: false,
      documentVerified: false
    },
    endingId: '',
    endingPlayed: false,
    guideNpcDialogueState: 'arrival'
  };
}

export function syncSceneUnlocks(progress) {
  progress.unlockedScenes.add('prologue');
  if (progress.flags.has('guide_completed')) progress.unlockedScenes.add('court');
  if (progress.flags.has('courtyard_unlocked')) progress.unlockedScenes.add('courtyard');
  if (progress.flags.has('study_unlocked')) progress.unlockedScenes.add('study');
  if (progress.flags.has('ending_unlocked')) progress.unlockedScenes.add('stage');
}

export function getCurrentObjective(progress, sceneId) {
  if (sceneId === 'prologue') {
    if (progress.guideNpcDialogueState === 'ending' || progress.flags.has('ending_returned')) {
      return '与引路使者再谈一次，观看终章并返回现实。';
    }
    return progress.flags.has('guide_completed')
      ? '引导已经完成，穿过帷幕进入封相朝堂。'
      : '靠近引路使者，确认你的身份与第一步调查目标。';
  }
  if (sceneId === 'court') {
    if (!progress.flags.has('court_intro_seen')) return '先与公孙衍交谈，确认退盟副诏与封相礼的第一处异常。';
    if (!progress.flags.has('courtyard_unlocked')) return '调查官印、封相令牌、退盟副诏，并从诸侯反应中锁定下一处去向。';
    if (!progress.flags.has('final_court_ready')) return '院子与书房的暗线尚未查清，暂时别急着做最终对质。';
    if (!progress.flags.has('ending_unlocked')) return '证据已齐，回到封相台中央，对公孙衍发起最终指控。';
    return '最终对质已经结束，回到序章粤剧剧场完成收束。';
  }
  if (sceneId === 'courtyard') {
    if (!progress.flags.has('courtyard_overheard')) return '先躲在合适位置偷听，不要立刻惊动回廊中的两人。';
    if (!progress.flags.has('study_unlocked')) return '拾取封蜡密函与舞台机关钥匙，再向侍卫追问第七响后的封门命令。';
    return '线索已足够，沿侧廊暗门进入书房密室。';
  }
  if (sceneId === 'study') {
    if (!progress.puzzleState.shelfOpened) return '先检查书架暗格，确认机关锁是否能被舞台钥匙打开。';
    if (!progress.puzzleState.clueBoxPicked) return '从书架底层取出小型线索木匣。';
    if (!progress.puzzleState.identityVerified) return '将丞相玉佩作为身份验证物放入木匣机关。';
    if (!progress.puzzleState.soundVerified) return '放入唱腔记忆片与锣鼓记忆晶片，完成声景验证。';
    if (!progress.puzzleState.documentVerified) return '在验证台比对封蜡密函、官印与退盟副诏的格式差异。';
    return '书房证据已经成立，返回封相朝堂进行最终对质。';
  }
  if (sceneId === 'stage') {
    return '终章戏棚已解锁，可作为额外收束场景回看舞台群像。';
  }
  return '继续探索。';
}

export function getEvidenceChainState(progress) {
  const check = (ids) => ({
    total: ids.length,
    owned: ids.filter((id) => progress.collectedClues.has(id)).length,
    complete: ids.every((id) => progress.collectedClues.has(id))
  });

  return {
    sound: check(EVIDENCE_CHAINS.sound),
    document: check(EVIDENCE_CHAINS.document),
    action: check(EVIDENCE_CHAINS.action)
  };
}

export function evaluateEnding(progress) {
  const chains = getEvidenceChainState(progress);
  if (chains.sound.complete && chains.document.complete && chains.action.complete) {
    return '破局真相';
  }
  if (chains.sound.complete && chains.document.complete) {
    return '礼成局裂';
  }
  return '盛典表象';
}
