export const CLUE_REGISTRY = {
  vocalShard: {
    id: 'vocalShard',
    title: '声境碎片－唱腔记忆片',
    category: '声景碎片',
    isCollectible: true,
    isKeyClue: true,
    scene: 'prologue',
    requiredForEnding: true
  },
  drumShard: {
    id: 'drumShard',
    title: '声境碎片－锣鼓记忆晶片',
    category: '声景碎片',
    isCollectible: true,
    isKeyClue: true,
    scene: 'prologue',
    requiredForEnding: true
  },
  token: {
    id: 'token',
    title: '六国封相令牌',
    category: '令牌印信',
    isCollectible: true,
    isKeyClue: true,
    scene: 'court',
    requiredForEnding: true
  },
  seal: {
    id: 'seal',
    title: '官印',
    category: '令牌印信',
    isCollectible: true,
    isKeyClue: true,
    scene: 'court',
    requiredForEnding: true
  },
  archiveFragment: {
    id: 'archiveFragment',
    title: '数位档案碎片',
    category: '档案残片',
    isCollectible: true,
    isKeyClue: false,
    scene: 'court',
    requiredForEnding: true
  },
  draftDecree: {
    id: 'draftDecree',
    title: '退盟副诏',
    category: '密函文书',
    isCollectible: true,
    isKeyClue: false,
    scene: 'court',
    requiredForEnding: true
  },
  waxLetter: {
    id: 'waxLetter',
    title: '封蜡密函',
    category: '密函文书',
    isCollectible: true,
    isKeyClue: true,
    scene: 'courtyard',
    requiredForEnding: true
  },
  key: {
    id: 'key',
    title: '舞台机关钥匙',
    category: '令牌印信',
    isCollectible: true,
    isKeyClue: false,
    scene: 'courtyard',
    requiredForEnding: true
  },
  warringLetter: {
    id: 'warringLetter',
    title: '战国密信',
    category: '密函文书',
    isCollectible: true,
    isKeyClue: false,
    scene: 'study',
    requiredForEnding: false
  },
  clueBox: {
    id: 'clueBox',
    title: '小型线索木匣',
    category: '机关匣盒',
    isCollectible: true,
    isKeyClue: false,
    scene: 'study',
    requiredForEnding: true
  },
  zhaoTestimony: {
    id: 'zhaoTestimony',
    title: '赵国诸侯证词',
    category: '证词',
    isCollectible: true,
    isKeyClue: false,
    scene: 'court',
    requiredForEnding: true
  },
  guardTestimony: {
    id: 'guardTestimony',
    title: '侍卫口供',
    category: '证词',
    isCollectible: true,
    isKeyClue: false,
    scene: 'courtyard',
    requiredForEnding: true
  },
  yanTestimony: {
    id: 'yanTestimony',
    title: '燕国诸侯证词',
    category: '证词',
    isCollectible: true,
    isKeyClue: false,
    scene: 'court',
    requiredForEnding: true
  }
};

export const ALL_COLLECTIBLE_CLUES = Object.values(CLUE_REGISTRY).filter((clue) => clue.isCollectible);
export const ALL_KEY_CLUES = ALL_COLLECTIBLE_CLUES.filter((clue) => clue.isKeyClue);

export function getClueTotals() {
  return {
    total: ALL_COLLECTIBLE_CLUES.length,
    keyTotal: ALL_KEY_CLUES.length
  };
}

export function getCollectedClueStats(collectedIds) {
  const collectedSet = collectedIds instanceof Set ? collectedIds : new Set(collectedIds ?? []);
  return {
    total: ALL_COLLECTIBLE_CLUES.length,
    keyTotal: ALL_KEY_CLUES.length,
    collectedCount: ALL_COLLECTIBLE_CLUES.filter((clue) => collectedSet.has(clue.id)).length,
    collectedKeyCount: ALL_KEY_CLUES.filter((clue) => collectedSet.has(clue.id)).length
  };
}
