export const STORY_DATA = {
  title: "《六国大封相：声境谜局》",
  subtitle: "粤剧沉浸式 WebXR 剧本杀",
  arrivalPrompt: [
    "六国封相大典即将开始。",
    "满堂朝贺之下，似乎有人试图掩盖一封不该存在的密信。",
    "你是苏秦。",
    "请先观察朝堂中的异常。"
  ],
  states: {
    arrival: {
      id: "arrival",
      label: "入殿",
      objective: "先靠近公孙衍，确认朝堂中的第一处异常。"
    },
    waxTarget: {
      id: "waxTarget",
      label: "封蜡异动",
      objective: "调查东侧案台上的异常封蜡。"
    },
    contradictionFound: {
      id: "contradictionFound",
      label: "疑点浮现",
      objective: "你已确认第一条异常证据，继续比对主案上的印信与令牌。"
    },
    studyUnlocked: {
      id: "studyUnlocked",
      label: "书房已开",
      objective: "前往书房密室，查找密函、玉佩与机关线索。"
    },
    finalCluesReady: {
      id: "finalCluesReady",
      label: "关键拼合",
      objective: "关键线索逐步成形，回到朝堂前再梳理一遍线索档案。"
    },
    endingReady: {
      id: "endingReady",
      label: "结局推演",
      objective: "你已拥有足够证据，请回到封相朝堂见证最终推演。"
    }
  },
  endings: {
    facade: {
      id: "facade",
      title: "盛典表象",
      text: "你看见了华服、印信与礼制，却仍未彻底刺穿台前的表象。封相大典照常成立，但真正的裂痕仍被礼乐压住。"
    },
    tragedy: {
      id: "tragedy",
      title: "权谋悲剧",
      text: "你已捕捉到密函与印信的矛盾，却仍晚了一步。朝堂上的合纵仍以猜忌收场，所有人都被困在一场无法收束的政治表演里。"
    },
    breakthrough: {
      id: "breakthrough",
      title: "孤身破局",
      text: "你将令牌、官印、密信与声景碎片连成完整证词。舞台之上是封相，舞台之下是博弈，而苏秦终于在众声交叠中看清了局心。"
    }
  },
  dialogue: {
    gongsunyan_intro: {
      id: "gongsunyan_intro",
      speaker: "公孙衍",
      role: "黄门官 · 朝堂传诏重臣",
      lines: [
        {
          text: "相国，今夜礼乐齐备，六国使者皆在。只是……东侧案上的封蜡，似乎被人动过。",
          responses: [
            {
              label: "追问封蜡",
              nextText: "那封密函本不该出现在殿上。若你亲自查看，也许能比我更早看出是谁在借礼掩密。",
              grantsFlag: "talked_gongsunyan",
              setState: "waxTarget"
            },
            {
              label: "观察他的神情",
              nextText: "他答得极稳，眼神却始终掠向东侧案台，像是在确认那封密函是否还留在原处。"
            },
            {
              label: "暂时离开",
              nextText: "公孙衍微微侧身，让出通往主案与东侧案台的视线。"
            }
          ]
        }
      ]
    },
    chuhuiwang_probe: {
      id: "chuhuiwang_probe",
      speaker: "楚惠王",
      role: "六国诸侯",
      lines: [
        {
          text: "朝堂之上人人都说合纵，真正的问题却是——谁来做这局中的主人？",
          responses: [
            {
              label: "我会继续查下去。",
              nextText: "那你就去看清楚吧。看看那些看似华美的仪制，究竟遮住了多少人的心思。",
              grantsFlag: "observed_chu"
            }
          ]
        }
      ]
    }
  },
  clueTargets: {
    total: 12,
    keyTotal: 4
  },
  sceneUnlockRules: {
    study: ["talked_gongsunyan", "inspected_wax_letter"],
    shed1: ["study_unlocked"],
    shed2: ["study_unlocked"],
    shed3: ["study_unlocked"],
    courtyard: ["study_unlocked"]
  }
};

export function evaluateEnding(progress) {
  const hasToken = progress.collectedClues.has("token");
  const hasSeal = progress.collectedClues.has("seal");
  const hasLetter = progress.collectedClues.has("warringLetter") || progress.collectedClues.has("waxLetter");
  const hasShards = progress.collectedClues.has("vocalShard") && progress.collectedClues.has("drumShard");

  if (hasToken && hasSeal && hasLetter && hasShards && progress.flags.has("talked_gongsunyan")) {
    return "breakthrough";
  }
  if (hasLetter && hasSeal) {
    return "tragedy";
  }
  return "facade";
}
