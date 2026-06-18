const characterAssetMap = {
  NPC: { imagePath: "./assets/character/NPC.png", modelPath: "./assets/character/NPC.glb" },
  苏秦: { imagePath: "./assets/character/苏秦.png", modelPath: "./assets/character/苏秦.glb" },
  楚惠王: { imagePath: "./assets/character/楚惠王.png", modelPath: "./assets/character/楚惠王.glb" },
  齐庄王: { imagePath: "./assets/character/齐庄王.png", modelPath: "./assets/character/齐庄王.glb" },
  梁惠王: { imagePath: "./assets/character/梁惠王.png", modelPath: "./assets/character/梁惠王.glb" },
  公孙衍: { imagePath: "./assets/character/公孙衍.png", modelPath: "./assets/character/公孙衍.glb" },
  赵国诸侯: { imagePath: "./assets/character/赵国诸侯.png", modelPath: "./assets/character/赵国诸侯.glb" },
  韩国诸侯: { imagePath: "./assets/character/韩国诸侯.png", modelPath: "./assets/character/韩国诸侯.glb" },
  燕国诸侯: { imagePath: "./assets/character/燕国诸侯.png", modelPath: "./assets/character/燕国诸侯.glb" },
  通用六国文官: {
    imagePath: "./assets/character/通用六国文官.png",
    modelPath: "./assets/character/通用六国文官.glb"
  },
  通用侍卫: {
    imagePath: "./assets/character/通用侍卫.png",
    modelPath: "./assets/character/通用侍卫.glb"
  },
  粤剧伶人: {
    imagePath: "./assets/character/粤剧伶人.png",
    modelPath: "./assets/character/粤剧伶人.glb"
  }
};

const objectAssetMap = {
  凤冠: { imagePath: "./assets/object/凤冠.png", modelPath: "./assets/object/凤冠.glb" }
};

export const characterExhibits = [
  {
    id: "npc",
    name: "NPC",
    category: "人物",
    camp: "中立",
    roleType: "通用 NPC / 交互引导角色",
    operaRoleRef: "群像角色",
    storyFunction: "引导 / 搜证入口",
    stance: "视剧情而变，可作为引导者、旁观者或线索触发角色。",
    clueLevel: "普通",
    stage: "开锣 / 搜证",
    quote: "戏未开锣，局已在台下悄然成形。",
    soundscape: ["戏棚环境声", "远处锣鼓点", "人群低语"],
    visualFocus: "观察人物姿态、服饰轮廓、冠饰比例与整体舞台气质。",
    clueHint: "可作为对话引导、场景提示或搜证任务入口。",
    primaryTags: ["全部"],
    operaTags: ["群像"],
    soundscapeScene: "戏棚后台",
    isFeatured: false,
    isSuspicious: false
  },
  {
    id: "suqin",
    name: "苏秦",
    category: "人物",
    camp: "合纵",
    roleType: "主视角 / 六国丞相 / 合纵策士",
    operaRoleRef: "正生 / 文武生",
    storyFunction: "制衡 / 主线推理",
    stance: "表面受六国共封，实则被六国利益共同牵制。",
    clueLevel: "关键",
    stage: "封相 / 疑云 / 反转",
    quote: "六印加身，亦是六国枷锁。",
    soundscape: ["朝堂回声", "低频疑云", "封相锣鼓点"],
    visualFocus: "观察冠服层次、腰间配饰、袖口纹样与主角站姿。",
    clueHint: "玩家主视角人物，所有权谋线索最终会回到苏秦的抉择。",
    primaryTags: ["主线人物", "关键线索"],
    operaTags: ["正生", "文武生"],
    soundscapeScene: "封相大典",
    isFeatured: true,
    isSuspicious: false
  },
  {
    id: "chu-huiwang",
    name: "楚惠王",
    category: "人物",
    camp: "楚",
    roleType: "六国诸侯 / 嫌疑人 / 权谋角色",
    operaRoleRef: "大花面",
    storyFunction: "猜忌 / 暗线",
    stance: "表面拥护合纵，暗中觊觎联盟主导权。",
    clueLevel: "关键",
    stage: "封相 / 疑云 / 搜证",
    quote: "合纵之名下，谁才是真正盟主？",
    soundscape: ["低频鼓点", "朝堂回声", "衣袍摩擦声"],
    visualFocus: "观察大花面威严感、厚重袍服、肩部轮廓与王侯气势。",
    clueHint: "可与通秦密信、朝堂密谈、诸侯猜忌线索关联。",
    primaryTags: ["六国诸侯", "关键线索", "隐藏线索"],
    operaTags: ["大花面"],
    soundscapeScene: "朝堂疑云",
    isFeatured: true,
    isSuspicious: true
  },
  {
    id: "qi-zhuangwang",
    name: "齐庄王",
    category: "人物",
    camp: "齐",
    roleType: "六国诸侯 / 观望者 / 布局者",
    operaRoleRef: "公脚",
    storyFunction: "制衡 / 旁观",
    stance: "看似老成持重，实则暗中布局，试图坐收渔利。",
    clueLevel: "关键",
    stage: "封相 / 疑云",
    quote: "不争一时，方能坐收天下之局。",
    soundscape: ["朝堂低语", "玉佩轻响", "远处梆子"],
    visualFocus: "观察王侯服饰的稳重感、袖口纹样与腰间玉饰。",
    clueHint: "与齐国中立立场、暗中观望、制衡他国的线索有关。",
    primaryTags: ["六国诸侯", "关键线索"],
    operaTags: ["公脚"],
    soundscapeScene: "封相大典",
    isFeatured: false,
    isSuspicious: false
  },
  {
    id: "liang-huiwang",
    name: "梁惠王",
    category: "人物",
    camp: "魏",
    roleType: "六国诸侯 / 合纵推手 / 制衡者",
    operaRoleRef: "公脚 / 王侯角色化处理",
    storyFunction: "制衡 / 猜忌",
    stance: "看似感恩苏秦，实则忌惮其权倾六国。",
    clueLevel: "关键",
    stage: "封相 / 疑云 / 搜证",
    quote: "封相可以成局，也可以困局。",
    soundscape: ["沉重靴步声", "朝堂回声", "低频疑云"],
    visualFocus: "观察王侯袍服、腰带、冠饰与角色威压感。",
    clueHint: "与制衡苏秦、限制相权、封相大典背后安排有关。",
    primaryTags: ["六国诸侯", "关键线索"],
    operaTags: ["公脚"],
    soundscapeScene: "朝堂疑云",
    isFeatured: false,
    isSuspicious: true
  },
  {
    id: "gongsun-yan",
    name: "公孙衍",
    category: "人物",
    camp: "朝堂",
    roleType: "朝堂传诏重臣 / 关键线索人物",
    operaRoleRef: "黄门官",
    storyFunction: "传诏 / 暗线",
    stance: "熟知朝堂礼制与封相流程，立场暧昧。",
    clueLevel: "隐藏",
    stage: "封相 / 搜证 / 反转",
    quote: "诏令落下之前，已有暗语传开。",
    soundscape: ["翻诏书声", "靴步声", "朝堂低语"],
    visualFocus: "观察官服层次、袖口、腰牌与传诏角色的肃穆姿态。",
    clueHint: "可触发封相诏书、传令顺序、朝堂暗语等隐藏线索。",
    primaryTags: ["朝堂人物", "隐藏线索"],
    operaTags: ["黄门官"],
    soundscapeScene: "搜证密室",
    isFeatured: false,
    isSuspicious: true
  },
  {
    id: "zhao-lord",
    name: "赵国诸侯",
    category: "人物",
    camp: "赵",
    roleType: "六国诸侯 / 边境势力代表",
    operaRoleRef: "王侯角色化处理",
    storyFunction: "同盟 / 猜忌",
    stance: "位处战局要冲，既需要合纵抗秦，也担心被盟友牺牲。",
    clueLevel: "普通",
    stage: "封相 / 疑云 / 搜证",
    quote: "盟书可签，边关之患却无人替我承担。",
    soundscape: ["战鼓低鸣", "甲胄声", "朝堂回声"],
    visualFocus: "观察武备感、披风、腰带与边境诸侯的紧张气质。",
    clueHint: "可关联边关军报、六国军力分配、同盟信任危机。",
    primaryTags: ["六国诸侯"],
    operaTags: [],
    soundscapeScene: "朝堂疑云",
    isFeatured: false,
    isSuspicious: true
  },
  {
    id: "han-lord",
    name: "韩国诸侯",
    category: "人物",
    camp: "韩",
    roleType: "六国诸侯 / 弱国代表 / 嫌疑人",
    operaRoleRef: "王侯角色化处理",
    storyFunction: "私通 / 暗线",
    stance: "国力较弱，表面依附合纵，暗中寻找自保退路。",
    clueLevel: "隐藏",
    stage: "疑云 / 搜证 / 反转",
    quote: "弱国无忠奸，只有活路。",
    soundscape: ["低频疑云", "翻信纸声", "远处梆子"],
    visualFocus: "观察服饰细节、神态姿势与较为收敛的王侯气质。",
    clueHint: "可与私通外敌、密信往来、合纵破口等暗线相关。",
    primaryTags: ["六国诸侯", "隐藏线索"],
    operaTags: [],
    soundscapeScene: "搜证密室",
    isFeatured: false,
    isSuspicious: true
  },
  {
    id: "yan-lord",
    name: "燕国诸侯",
    category: "人物",
    camp: "燕",
    roleType: "六国诸侯 / 北地代表 / 观望者",
    operaRoleRef: "王侯角色化处理",
    storyFunction: "猜忌 / 旁观",
    stance: "远在北地，对合纵既有期待，也有距离与不信任。",
    clueLevel: "普通",
    stage: "封相 / 疑云",
    quote: "北风未止，盟约又能暖几时？",
    soundscape: ["冷风声", "朝堂回声", "衣袍摩擦声"],
    visualFocus: "观察披风、衣袍厚重感、冠饰与北地诸侯的冷峻气质。",
    clueHint: "可关联六国距离感、联盟稳定性与诸侯观望态度。",
    primaryTags: ["六国诸侯"],
    operaTags: [],
    soundscapeScene: "朝堂疑云",
    isFeatured: false,
    isSuspicious: false
  },
  {
    id: "six-states-civil-official",
    name: "通用六国文官",
    category: "人物",
    camp: "朝堂",
    roleType: "朝堂文官 / 仪式见证者 / 背景线索角色",
    operaRoleRef: "文场官 / 群像角色",
    storyFunction: "旁观 / 传诏",
    stance: "负责记录、传递、见证封相仪式，可能掌握细碎文书线索。",
    clueLevel: "背景",
    stage: "开锣 / 封相 / 搜证",
    quote: "史册只记大典，不记每一声低语。",
    soundscape: ["翻册声", "毛笔书写声", "朝堂低语"],
    visualFocus: "观察文官袍服、袖口、手部姿态与文书气质。",
    clueHint: "可作为文书、名册、诏令、座次表等搜证入口。",
    primaryTags: ["朝堂人物"],
    operaTags: ["群像"],
    soundscapeScene: "封相大典",
    isFeatured: false,
    isSuspicious: false
  },
  {
    id: "generic-guard",
    name: "通用侍卫",
    category: "人物",
    camp: "朝堂",
    roleType: "朝堂侍卫 / 仪仗守卫 / 动线封锁角色",
    operaRoleRef: "武行 / 龙套武将",
    storyFunction: "护卫 / 暗线",
    stance: "守卫朝堂秩序，亦可能见过不该出现的人与物。",
    clueLevel: "普通",
    stage: "封相 / 疑云 / 搜证",
    quote: "守的是殿门，未必守得住人心。",
    soundscape: ["甲胄摩擦声", "靴步声", "兵器轻响"],
    visualFocus: "观察甲胄、武器、站姿、护卫动线与仪仗感。",
    clueHint: "可关联出入记录、刺杀动线、殿门守卫漏洞。",
    primaryTags: ["朝堂人物"],
    operaTags: ["武行"],
    soundscapeScene: "朝堂疑云",
    isFeatured: false,
    isSuspicious: true
  },
  {
    id: "cantonese-opera-performer",
    name: "粤剧伶人",
    category: "人物",
    camp: "戏棚",
    roleType: "戏棚人物 / 序幕表演者 / 后台叙事角色",
    operaRoleRef: "旦角 / 戏棚伶人",
    storyFunction: "引导 / 旁观",
    stance: "既是台上表演者，也是引导玩家理解粤剧美学与剧情反差的角色。",
    clueLevel: "背景",
    stage: "开锣 / 后台 / 反转",
    quote: "台上一句唱词，台下可能是一道伏笔。",
    soundscape: ["伶人吊嗓声", "水袖破风声", "锣鼓点"],
    visualFocus: "观察水袖、身段、妆造、头饰与粤剧表演姿态。",
    clueHint: "可作为序幕导览、后台提示、声景解说与文化注释角色。",
    primaryTags: ["戏棚人物"],
    operaTags: ["旦角"],
    soundscapeScene: "戏棚后台",
    isFeatured: false,
    isSuspicious: false
  }
].map((exhibit) => ({
  ...exhibit,
  assetCategory: "character",
  imagePath: characterAssetMap[exhibit.name].imagePath,
  modelPath: characterAssetMap[exhibit.name].modelPath,
  hasModel: true,
  archiveState: "已入库"
}));

export const objectExhibits = [
  {
    id: "phoenix-crown",
    name: "凤冠",
    category: "物件",
    objectType: "冠饰",
    role: "戏曲冠饰 / 道具展示模型",
    storyStage: "开锣 / 封相",
    storyTags: ["开锣", "封相"],
    clueLevel: "关键视觉线索",
    quote: "珠翠满冠，是盛典表象，也是身份秩序。",
    soundscape: ["珠饰碰撞声", "后台整冠声", "远处锣鼓点"],
    description: "适合观察珠饰、流苏、金属骨架、青绿羽纹与红色垂珠层次。",
    symbolism: "代表封相大典中的华丽表象与身份秩序。",
    status: "ready",
    soundscapeScene: "后台整冠"
  },
  {
    id: "six-seals",
    name: "六国相印",
    category: "物件",
    objectType: "相印",
    role: "封相权力象征 / 关键剧情道具",
    storyStage: "封相 / 反转",
    storyTags: ["封相", "反转"],
    clueLevel: "关键",
    quote: "六印落身，权力亦成枷锁。",
    soundscape: ["印章落案声", "朝堂回声", "低频疑云"],
    description: "用于展示封相权力结构与六印并悬的仪式张力。",
    symbolism: "既象征加身之权，也暗示被六国共同制衡的困局。",
    status: "coming-soon",
    soundscapeScene: "封相大典"
  },
  {
    id: "hezong-secret-letter",
    name: "合纵密信",
    category: "物件",
    objectType: "密信",
    role: "搜证文书 / 暗线证物",
    storyStage: "搜证 / 反转",
    storyTags: ["搜证", "反转"],
    clueLevel: "隐藏",
    quote: "信中所写，未必是盟约；未写之处，才是真相。",
    soundscape: ["翻信纸声", "低频疑云", "烛火声"],
    description: "用于呈现同盟缝隙中的书信往来与未明暗语。",
    symbolism: "是剧本杀搜证链路中的关键文书线索。",
    status: "coming-soon",
    soundscapeScene: "搜证密室"
  },
  {
    id: "court-token",
    name: "朝堂令牌",
    category: "物件",
    objectType: "令牌",
    role: "出入权限 / 动线线索",
    storyStage: "疑云 / 搜证",
    storyTags: ["疑云", "搜证"],
    clueLevel: "普通",
    quote: "一枚令牌，能开殿门，也能开杀局。",
    soundscape: ["金属轻碰声", "靴步声", "殿门声"],
    description: "用于梳理朝堂空间、出入路径与守卫漏洞。",
    symbolism: "是权力通行与行动轨迹的实物凭证。",
    status: "coming-soon",
    soundscapeScene: "朝堂疑云"
  },
  {
    id: "edict-scroll",
    name: "封相诏书",
    category: "物件",
    objectType: "封相文书",
    role: "仪式文书 / 关键流程线索",
    storyStage: "封相 / 搜证",
    storyTags: ["封相", "搜证"],
    clueLevel: "关键",
    quote: "诏书宣读之时，真正的安排早已完成。",
    soundscape: ["翻诏书声", "毛笔书写声", "朝堂回声"],
    description: "用于追踪封相流程、传诏顺序与礼制破绽。",
    symbolism: "是表层秩序与暗中安排并存的象征。",
    status: "coming-soon",
    soundscapeScene: "封相大典"
  },
  {
    id: "soundscape-fragment",
    name: "锣鼓声景碎片",
    category: "物件",
    objectType: "声景碎片",
    role: "声音线索 / 情绪转场提示",
    storyStage: "开锣 / 疑云 / 反转",
    storyTags: ["开锣", "疑云", "反转"],
    clueLevel: "隐藏",
    quote: "锣鼓点一变，盛典便不再只是盛典。",
    soundscape: ["锣鼓点", "梆子", "低频反转声"],
    description: "用于展示声景如何提示戏台气氛、剧情转折与暗线逼近。",
    symbolism: "是数智声景设计中最直接的情绪线索载体。",
    status: "coming-soon",
    soundscapeScene: "封相大典"
  }
].map((exhibit) => {
  const assets = objectAssetMap[exhibit.name] ?? {};
  return {
    ...exhibit,
    assetCategory: "object",
    imagePath: assets.imagePath ?? "",
    modelPath: assets.modelPath ?? "",
    hasModel: Boolean(assets.modelPath),
    archiveState: assets.modelPath ? "已入库" : "模型待入库"
  };
});

export const categoryMeta = {
  character: {
    label: "人物档案",
    shortLabel: "人物",
    eyebrow: "人物档案 / 行当名册",
    description:
      "六国诸侯、朝堂重臣、侍卫文官与粤剧伶人齐聚于此；每一身行头，皆藏一重立场。",
    introTitle: "戏曲角色档案墙",
    introText:
      "在朝堂仪典、戏棚后台与搜证暗线之间，人物的行当、服饰与站位本身便是叙事。",
    archiveLabel: "已入库角色"
  },
  object: {
    label: "物件档案",
    shortLabel: "物件",
    eyebrow: "物件档案 / 道具线索库",
    description:
      "冠饰、相印、密信与声景碎片，皆是封相大典背后的证物。",
    introTitle: "戏曲道具与线索库",
    introText:
      "即使部分模型仍在入库中，物件档案依然保留其剧情用途、声景提示与视觉设定。",
    archiveLabel: "物件与线索"
  }
};

export const filterConfigs = {
  character: [
    {
      key: "primary",
      label: "人物主筛选",
      options: [
        "全部",
        "主线人物",
        "六国诸侯",
        "朝堂人物",
        "戏棚人物",
        "关键线索",
        "隐藏线索"
      ]
    },
    {
      key: "camp",
      label: "阵营",
      options: ["全部", "合纵", "齐", "楚", "燕", "韩", "赵", "魏", "朝堂", "戏棚", "中立"]
    },
    {
      key: "operaRef",
      label: "行当参考",
      options: ["全部", "正生", "文武生", "大花面", "公脚", "黄门官", "武行", "旦角", "群像"]
    }
  ],
  object: [
    {
      key: "type",
      label: "物件分类",
      options: ["全部", "冠饰", "戏服", "令牌", "密信", "相印", "声景碎片", "舞台道具", "封相文书"]
    }
  ]
};

export const defaultFilters = {
  character: {
    primary: "全部",
    camp: "全部",
    operaRef: "全部",
    advancedOpen: false
  },
  object: {
    type: "全部"
  }
};

export function getExhibits(category) {
  return category === "character" ? characterExhibits : objectExhibits;
}

export function getExhibit(category, name) {
  return getExhibits(category).find((item) => item.name === name) ?? null;
}

export function getFeaturedExhibit() {
  return getExhibit("character", "苏秦");
}

export function getHomeStats() {
  const characterCount = characterExhibits.length;
  const objectCount = objectExhibits.length;
  const readyModels =
    [...characterExhibits, ...objectExhibits].filter((item) => item.hasModel).length;
  return { characterCount, objectCount, readyModels };
}
