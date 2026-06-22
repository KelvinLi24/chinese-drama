import { CLUE_REGISTRY, getClueTotals } from './data/clue-registry.js';
import { EVIDENCE_CHAINS, STORY_TEXT, evaluateEnding, getEvidenceChainState } from './data/story-state.js';

export { STORY_TEXT, EVIDENCE_CHAINS, evaluateEnding, getEvidenceChainState };
export const CLUE_TARGETS = getClueTotals();

export const ENDING_DATA = {
  '盛典表象': {
    title: '盛典表象',
    text: '你看见了裂缝，却还没来得及把它完全扯开。礼成于众目，真相仍压在锣鼓之后。'
  },
  '礼成局裂': {
    title: '礼成局裂',
    text: '你已用文书和声景撕开伪诏的一角。盛典仍在继续，但六国之间的裂缝再也藏不住了。'
  },
  '破局真相': {
    title: '破局真相',
    text: '你将声景、文书与行动三条证据链合拢，让第七声锣背后的封门私令彻底暴露在朝堂与戏台之前。'
  }
};

export const CLUE_DEFINITIONS = {
  vocalShard: {
    title: CLUE_REGISTRY.vocalShard.title,
    category: CLUE_REGISTRY.vocalShard.category,
    relatedCharacter: '粤剧伶人',
    description: '一段被切下的唱腔残响，保存着正式封相礼应有的节奏。',
    suspicion: '它说明真正的礼制锣鼓只有六声，第七声并不属于正常流程。',
    isKey: CLUE_REGISTRY.vocalShard.isKeyClue
  },
  drumShard: {
    title: CLUE_REGISTRY.drumShard.title,
    category: CLUE_REGISTRY.drumShard.category,
    relatedCharacter: '锣鼓场',
    description: '这片记忆晶片保留了第七声锣落下前后的鼓点变化。',
    suspicion: '第七响后的节奏更像行动暗号，而不是仪式伴奏。',
    isKey: CLUE_REGISTRY.drumShard.isKeyClue
  },
  token: {
    title: CLUE_REGISTRY.token.title,
    category: CLUE_REGISTRY.token.category,
    relatedCharacter: '苏秦',
    description: '封相令牌位于礼台中心，象征公开秩序与合纵名义。',
    suspicion: '令牌被摆在最显眼的位置，恰好遮住了主案上真正可疑的文书流转。',
    isKey: CLUE_REGISTRY.token.isKeyClue
  },
  seal: {
    title: CLUE_REGISTRY.seal.title,
    category: CLUE_REGISTRY.seal.category,
    relatedCharacter: '公孙衍',
    description: '官印本应为诏书背书，如今却成了比对伪诏格式的关键样本。',
    suspicion: '印文落款与封蜡系统不一致，说明宣诏流程中混入了另一套命令来源。',
    isKey: CLUE_REGISTRY.seal.isKeyClue
  },
  archiveFragment: {
    title: CLUE_REGISTRY.archiveFragment.title,
    category: CLUE_REGISTRY.archiveFragment.category,
    relatedCharacter: '朝堂文官',
    description: '被拆开的档案记录着封相礼流程、鼓点顺序与宣诏批次。',
    suspicion: '有人故意把完整档案拆散保存，说明真相早已被人为切割。',
    isKey: CLUE_REGISTRY.archiveFragment.isKeyClue
  },
  draftDecree: {
    title: CLUE_REGISTRY.draftDecree.title,
    category: CLUE_REGISTRY.draftDecree.category,
    relatedCharacter: '公孙衍',
    description: '副诏被摆在主案附近，字句看似顺从礼制，实则掺入了封门私令。',
    suspicion: '文书格式、加写条款与封蜡来源彼此冲突。',
    isKey: CLUE_REGISTRY.draftDecree.isKeyClue
  },
  waxLetter: {
    title: CLUE_REGISTRY.waxLetter.title,
    category: CLUE_REGISTRY.waxLetter.category,
    relatedCharacter: '楚惠王',
    description: '密函被藏在院中石灯笼后的裂缝里，封蜡纹样与六国盟约体系不符。',
    suspicion: '它像一封来自暗线体系的急令，而不是朝堂公开文书。',
    isKey: CLUE_REGISTRY.waxLetter.isKeyClue
  },
  key: {
    title: CLUE_REGISTRY.key.title,
    category: CLUE_REGISTRY.key.category,
    relatedCharacter: '公孙衍',
    description: '这把钥匙并不属于普通侍卫配置，更像后台机关与暗格共用的私钥。',
    suspicion: '它证明有人能在礼台与书房之间走一条不被公开记载的路径。',
    isKey: CLUE_REGISTRY.key.isKeyClue
  },
  warringLetter: {
    title: CLUE_REGISTRY.warringLetter.title,
    category: CLUE_REGISTRY.warringLetter.category,
    relatedCharacter: '公孙衍',
    description: '书案暗屉中的密信暴露了合纵台面之下的私下交易痕迹。',
    suspicion: '密信内容与退盟副诏相互印证，说明命令并非一时起意。',
    isKey: CLUE_REGISTRY.warringLetter.isKeyClue
  },
  clueBox: {
    title: CLUE_REGISTRY.clueBox.title,
    category: CLUE_REGISTRY.clueBox.category,
    relatedCharacter: '苏秦',
    description: '木匣留下了被多次开启的细微痕迹，像是专门为验证身份与声景而设。',
    suspicion: '只有持有玉佩、理解礼制鼓点的人，才能触发其中真正的验证内容。',
    isKey: CLUE_REGISTRY.clueBox.isKeyClue
  },
  zhaoTestimony: {
    title: CLUE_REGISTRY.zhaoTestimony.title,
    category: CLUE_REGISTRY.zhaoTestimony.category,
    relatedCharacter: '赵国诸侯',
    description: '赵国诸侯承认侧门在宣诏前后被额外调动过守卫。',
    suspicion: '这说明封门行动早有布置，不是现场临时反应。',
    isKey: CLUE_REGISTRY.zhaoTestimony.isKeyClue
  },
  guardTestimony: {
    title: CLUE_REGISTRY.guardTestimony.title,
    category: CLUE_REGISTRY.guardTestimony.category,
    relatedCharacter: '院中侍卫',
    description: '侍卫确认梁王原令中并没有“封门”二字。',
    suspicion: '第七响后的封门命令是后来加写的。',
    isKey: CLUE_REGISTRY.guardTestimony.isKeyClue
  },
  yanTestimony: {
    title: CLUE_REGISTRY.yanTestimony.title,
    category: CLUE_REGISTRY.yanTestimony.category,
    relatedCharacter: '燕国诸侯',
    description: '燕国诸侯提到有人在封相礼前调走了记录台附近的目击者。',
    suspicion: '说明真正的操作点并不在礼台中央，而在侧线文书与守门调度。',
    isKey: CLUE_REGISTRY.yanTestimony.isKeyClue
  }
};

export const DIALOGUE_DATA = {
  guide_intro: {
    speaker: '引路使者',
    role: '戏中引路人',
    text: '你已经穿越到剧本杀世界了。从现在起，你就是《六国大封相》中的苏秦。你要在朝堂、院子与书房密室之间搜集证据，找出第七声锣背后的伪诏与封门暗令。只有查明真相并完成通关，你才能回到现实世界。',
    responses: [
      { label: '进入封相朝堂', action: 'completeGuide' },
      { label: '再听一次第七声锣', action: 'replayGong' },
      { label: '查看操作说明', action: 'openHelp' }
    ]
  },
  guide_ending: {
    speaker: '引路使者',
    role: '戏中引路人',
    text: '第七声锣已止于戏中，而你已经看见盛世帷幕之后的人心。恭喜你，苏秦。你不再只是戏中人，也终于明白盟约之重，不在六枚相印，而在人心是否守信。',
    responses: [
      { label: '观看终章影片，返回现实', action: 'playEndingVideo' },
      { label: '重温粤剧戏棚终章', action: 'replayStageEpilogue' },
      { label: '查看本次结局', action: 'showEndingSummary' },
      { label: '重新开始', action: 'restartExperience' },
      { label: '返回资料馆', action: 'returnToArchive' }
    ]
  },
  court_gongsunyan: {
    speaker: '公孙衍',
    role: '黄门官 · 朝堂传诏重臣',
    text: '相国，今夜礼乐齐备，六国使者皆在。只是……东侧案上的封蜡，似乎被人动过。',
    responses: [
      { label: '追问封蜡', action: 'courtHintWax' },
      { label: '观察他的神情', action: 'courtObserveGongsunyan' },
      { label: '暂时离开', action: 'closeDialogue' }
    ]
  },
  court_lianghuiwang: {
    speaker: '梁惠王',
    role: '六国诸侯 · 合纵推手',
    text: '封相可以成局，也可以困局。若有人借礼制加写命令，那就不是礼，而是枷锁。',
    responses: [{ label: '记下这句话', action: 'closeDialogue' }]
  },
  court_chuhuiwang: {
    speaker: '楚惠王',
    role: '六国诸侯 · 权谋角色',
    text: '合纵之名下，谁才是真正盟主？你若要查，就去查那些没人愿意公开承认的命令来源。',
    responses: [{ label: '继续追查', action: 'closeDialogue' }]
  },
  court_qizhuangwang: {
    speaker: '齐庄王',
    role: '六国诸侯 · 观望者',
    text: '不争一时，方能坐收天下之局。你若真想看清局势，不妨多看几眼东侧与记录台之间的来回。',
    responses: [{ label: '我会留意', action: 'closeDialogue' }]
  },
  court_zhaolord: {
    speaker: '赵国诸侯',
    role: '六国诸侯 · 边境势力代表',
    text: '盟书可签，边关之患却无人替我承担。倒是侧门守卫，在宣诏前后被额外调过一轮。',
    responses: [{ label: '记录证词', action: 'collectZhaoTestimony' }]
  },
  court_hanlord: {
    speaker: '韩国诸侯',
    role: '六国诸侯 · 弱国代表',
    text: '弱国无忠奸，只有活路。可今夜朝堂上的命令，确实有一笔写得太匆忙。',
    responses: [{ label: '继续观察', action: 'closeDialogue' }]
  },
  court_yanlord: {
    speaker: '燕国诸侯',
    role: '六国诸侯 · 北地观望者',
    text: '北风未止，盟约又能暖几时？我只知道，记录台旁的两名小吏在礼前被人调开了。',
    responses: [{ label: '记录证词', action: 'collectYanTestimony' }]
  },
  courtyard_guard: {
    speaker: '院中侍卫',
    role: '院中守门侍卫',
    text: '大人，朝门已经按第七响的规矩布置。只是梁王原令中，并无“封门”二字。',
    responses: [
      { label: '继续追问', action: 'collectGuardTestimony' },
      { label: '暂时离开', action: 'closeDialogue' }
    ]
  },
  final_accusation: {
    speaker: '公孙衍',
    role: '朝堂传诏重臣',
    text: '我没有创造裂缝。我只是让所有人看见，裂缝原本就在那里。苏秦，你封得了六国之相，封得住六国之心吗？',
    responses: [
      { label: '以声景链反驳', action: 'accuseWithSound' },
      { label: '以文书链反驳', action: 'accuseWithDocument' },
      { label: '以行动链反驳', action: 'accuseWithAction' }
    ]
  },
  stage_epilogue: {
    speaker: '粤剧伶人',
    role: '终章收束',
    text: '戏台上六国群像已重新归位。礼乐、封相令牌与第七声锣的回响，将在此把朝堂真相重新唱回舞台。看完这场终章演出后，再回序章剧场完成最后的收束。',
    responses: [
      { label: '回到序章剧场结算', action: 'returnToPrologue' },
      { label: '查看本次结局', action: 'showEndingSummary' }
    ]
  }
};
