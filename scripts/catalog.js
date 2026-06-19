const assetPath = (folder, name, extension) => `./assets/${folder}/${name}.${extension}`;

const characterAssetMap = {
  NPC: { imagePath: assetPath("character", "NPC", "png"), modelPath: assetPath("character", "NPC", "glb") },
  苏秦: { imagePath: assetPath("character", "苏秦", "png"), modelPath: assetPath("character", "苏秦", "glb") },
  楚惠王: { imagePath: assetPath("character", "楚惠王", "png"), modelPath: assetPath("character", "楚惠王", "glb") },
  齐庄王: { imagePath: assetPath("character", "齐庄王", "png"), modelPath: assetPath("character", "齐庄王", "glb") },
  梁惠王: { imagePath: assetPath("character", "梁惠王", "png"), modelPath: assetPath("character", "梁惠王", "glb") },
  公孙衍: { imagePath: assetPath("character", "公孙衍", "png"), modelPath: assetPath("character", "公孙衍", "glb") },
  赵国诸侯: { imagePath: assetPath("character", "赵国诸侯", "png"), modelPath: assetPath("character", "赵国诸侯", "glb") },
  韩国诸侯: { imagePath: assetPath("character", "韩国诸侯", "png"), modelPath: assetPath("character", "韩国诸侯", "glb") },
  燕国诸侯: { imagePath: assetPath("character", "燕国诸侯", "png"), modelPath: assetPath("character", "燕国诸侯", "glb") },
  通用六国文官: {
    imagePath: assetPath("character", "通用六国文官", "png"),
    modelPath: assetPath("character", "通用六国文官", "glb")
  },
  通用侍卫: { imagePath: assetPath("character", "通用侍卫", "png"), modelPath: assetPath("character", "通用侍卫", "glb") },
  粤剧伶人: { imagePath: assetPath("character", "粤剧伶人", "png"), modelPath: assetPath("character", "粤剧伶人", "glb") }
};

const objectAssetMap = {
  小型线索木匣: { imagePath: assetPath("object", "小型线索木匣", "png"), modelPath: assetPath("object", "小型线索木匣", "glb") },
  六国封相令牌: { imagePath: assetPath("object", "六国封相令牌", "png"), modelPath: assetPath("object", "六国封相令牌", "glb") },
  凤冠: {
    imagePath: assetPath("object", "凤冠", "png"),
    modelPath: assetPath("object", "凤冠", "glb"),
    videoPath: assetPath("object", "凤冠", "mp4")
  },
  丞相玉佩: { imagePath: assetPath("object", "丞相玉佩", "png"), modelPath: assetPath("object", "丞相玉佩", "glb") },
  "声境碎片-唱腔记忆片": {
    imagePath: assetPath("object", "声境碎片-唱腔记忆片", "png"),
    modelPath: assetPath("object", "声境碎片-唱腔记忆片", "glb")
  },
  "声境碎片-锣鼓记忆晶片": {
    imagePath: assetPath("object", "声境碎片-锣鼓记忆晶片", "png"),
    modelPath: assetPath("object", "声境碎片-锣鼓记忆晶片", "glb")
  },
  官印: { imagePath: assetPath("object", "官印", "png"), modelPath: assetPath("object", "官印", "glb") },
  封蜡密函: { imagePath: assetPath("object", "封蜡密函", "png"), modelPath: assetPath("object", "封蜡密函", "glb") },
  战国密信: { imagePath: assetPath("object", "战国密信", "png"), modelPath: assetPath("object", "战国密信", "glb") },
  粤剧折扇: { imagePath: assetPath("object", "粤剧折扇", "png"), modelPath: assetPath("object", "粤剧折扇", "glb") },
  数字档案碎片: { imagePath: assetPath("object", "数字档案碎片", "png"), modelPath: assetPath("object", "数字档案碎片", "glb") },
  舞台机关钥匙: { imagePath: assetPath("object", "舞台机关钥匙", "png"), modelPath: assetPath("object", "舞台机关钥匙", "glb") },
  蟒袍胸前补子纹样: {
    imagePath: assetPath("object", "蟒袍胸前补子纹样", "png"),
    modelPath: assetPath("object", "蟒袍胸前补子纹样", "glb")
  }
};

const sceneAssetMap = {
  书房密室: { imagePath: assetPath("scene", "书房密室", "png"), modelPath: assetPath("scene", "书房密室", "glb") },
  序章粤剧剧场: { imagePath: assetPath("scene", "序章粤剧剧场", "png"), modelPath: assetPath("scene", "序章粤剧剧场", "glb") },
  "粤剧戏棚(1)": { imagePath: assetPath("scene", "粤剧戏棚(1)", "png"), modelPath: assetPath("scene", "粤剧戏棚(1)", "glb") },
  "粤剧戏棚(2)": { imagePath: assetPath("scene", "粤剧戏棚(2)", "png"), modelPath: assetPath("scene", "粤剧戏棚(2)", "glb") },
  "粤剧戏棚(3)": { imagePath: assetPath("scene", "粤剧戏棚(3)", "png"), modelPath: assetPath("scene", "粤剧戏棚(3)", "glb") },
  封相朝堂: { imagePath: assetPath("scene", "封相朝堂", "png"), modelPath: assetPath("scene", "封相朝堂", "glb") },
  院子: { imagePath: assetPath("scene", "院子", "png"), modelPath: assetPath("scene", "院子", "glb") }
};

const panoramaAssetMap = {
  "粤剧戏棚 360": { imagePath: assetPath("scene", "粤剧戏棚360", "png") },
  "封相朝堂 360": { imagePath: assetPath("scene", "封相朝堂360", "png") },
  "书房密室 360": { imagePath: assetPath("scene", "书房密室360", "png") },
  "序章粤剧剧场 360": { imagePath: assetPath("scene", "序章粤剧剧场360", "png") }
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
    stance: "在戏台前后承接观众视线，负责将人带入封相疑局。",
    clueLevel: "普通",
    stage: "开锣 / 搜证",
    quote: "戏未开锣，局已在台下悄然成形。",
    soundscape: ["戏棚低语", "脚步回声", "台前候场"],
    visualFocus: "观察人物姿态、服饰轮廓、冠饰比例与整体舞台气质。",
    clueHint: "可作为对话引导、场景提示或搜证任务入口。",
    primaryTags: ["全部"],
    operaTags: ["群像"]
  },
  {
    id: "suqin",
    name: "苏秦",
    category: "人物",
    camp: "合纵",
    roleType: "主视角 / 六国丞相 / 合纵策士",
    operaRoleRef: "正生 / 文武生",
    storyFunction: "制衡 / 主线推理",
    stance: "立于六国权谋中心，既是封相主角，也是局中被凝视之人。",
    clueLevel: "关键",
    stage: "封相 / 疑云 / 反转",
    quote: "六印加身，亦是六国枷锁。",
    soundscape: ["朝堂回声", "低频疑云", "封相锣鼓点"],
    visualFocus: "观察冠服层次、腰间配饰、袖口纹样与主角站姿。",
    clueHint: "玩家主视角人物，所有权谋线索最终都会回到苏秦的抉择。",
    primaryTags: ["全部", "主线人物", "关键线索"],
    operaTags: ["正生", "文武生"],
    isFeatured: true
  },
  {
    id: "chu-huiwang",
    name: "楚惠王",
    category: "人物",
    camp: "楚",
    roleType: "六国诸侯 / 嫌疑人 / 权谋角色",
    operaRoleRef: "大花面",
    storyFunction: "猜忌 / 暗线",
    stance: "封相之礼中神情威严，实际对合纵盟主之位充满试探。",
    clueLevel: "关键",
    stage: "封相 / 疑云 / 搜证",
    quote: "合纵之名下，谁才是真正盟主？",
    soundscape: ["朝堂压场", "重鼓低震", "耳语暗涌"],
    visualFocus: "观察面部神情、王侯冠饰、肩部轮廓与站位压迫感。",
    clueHint: "适合作为对权力怀疑与朝堂施压的关键观察对象。",
    primaryTags: ["全部", "六国诸侯", "关键线索"],
    operaTags: ["大花面"],
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
    stance: "不轻易露出立场，更多以观察者姿态审视封相大局。",
    clueLevel: "关键",
    stage: "封相 / 疑云",
    quote: "不争一时，方能坐收天下之局。",
    soundscape: ["丝竹余响", "宫灯轻摆", "堂前静压"],
    visualFocus: "观察衣纹走势、袖摆重量、王者气度与视线方向。",
    clueHint: "适合与其他诸侯对照，判断谁在明面观礼、谁在暗处布局。",
    primaryTags: ["全部", "六国诸侯", "关键线索"],
    operaTags: ["公脚"]
  },
  {
    id: "liang-huiwang",
    name: "梁惠王",
    category: "人物",
    camp: "魏",
    roleType: "六国诸侯 / 合纵推手 / 制衡者",
    operaRoleRef: "公脚 / 王侯角色化处理",
    storyFunction: "制衡 / 猜忌",
    stance: "既推动封相成局，也担心六印最终反噬魏国筹谋。",
    clueLevel: "关键",
    stage: "封相 / 疑云 / 搜证",
    quote: "封相可以成局，也可以困局。",
    soundscape: ["金佩轻响", "朝堂压声", "暗潮低鸣"],
    visualFocus: "观察王袍比例、佩饰摆位与人物视线的犹疑感。",
    clueHint: "适合与苏秦、公孙衍相关线索进行对照判断。",
    primaryTags: ["全部", "六国诸侯", "关键线索"],
    operaTags: ["公脚"],
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
    stance: "看似依礼宣诏，实则掌握朝堂气流与暗语流向。",
    clueLevel: "隐藏",
    stage: "封相 / 搜证 / 反转",
    quote: "诏令落下之前，已有暗语传开。",
    soundscape: ["宣诏余音", "朝靴掠地", "殿前肃静"],
    visualFocus: "观察官服层次、手势节奏、诏令姿态与前倾的身位。",
    clueHint: "适合串联朝堂线与隐藏线索，是转折前的重要桥接人物。",
    primaryTags: ["全部", "朝堂人物", "隐藏线索"],
    operaTags: ["黄门官"],
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
    stance: "盟书可以签下，但边关安危始终是赵国真正关心之处。",
    clueLevel: "普通",
    stage: "封相 / 疑云 / 搜证",
    quote: "盟书可签，边关之患却无人替我承担。",
    soundscape: ["边地风声", "甲片摩擦", "殿前沉鼓"],
    visualFocus: "观察人物站姿的防备感、衣甲边缘与边地来者的气质。",
    clueHint: "常与同盟表象形成反差，适合用于比对盟约真心。",
    primaryTags: ["全部", "六国诸侯"],
    operaTags: []
  },
  {
    id: "han-lord",
    name: "韩国诸侯",
    category: "人物",
    camp: "韩",
    roleType: "六国诸侯 / 弱国代表 / 嫌疑人",
    operaRoleRef: "王侯角色化处理",
    storyFunction: "私通 / 暗线",
    stance: "弱国在大局之中更在乎出路，因此最容易牵出隐线。",
    clueLevel: "隐藏",
    stage: "疑云 / 搜证 / 反转",
    quote: "弱国无忠奸，只有活路。",
    soundscape: ["暗线低语", "书信摩擦", "屏息旁听"],
    visualFocus: "观察人物缩肩姿态、衣纹收束感与不安视线。",
    clueHint: "适合结合密信、院落场景与私通线索一并查看。",
    primaryTags: ["全部", "六国诸侯", "隐藏线索"],
    operaTags: [],
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
    stance: "始终保留寒意般的距离感，不急于表态也不轻信盟局。",
    clueLevel: "普通",
    stage: "封相 / 疑云",
    quote: "北风未止，盟约又能暖几时？",
    soundscape: ["北地风声", "远鼓回荡", "冷调宫灯"],
    visualFocus: "观察人物整体冷峻轮廓、衣料厚度与停驻节奏。",
    clueHint: "适合与齐庄王一并对照，判断不同观望者的权谋分寸。",
    primaryTags: ["全部", "六国诸侯"],
    operaTags: []
  },
  {
    id: "six-states-civil-official",
    name: "通用六国文官",
    category: "人物",
    camp: "朝堂",
    roleType: "朝堂文官 / 仪式见证者 / 背景线索角色",
    operaRoleRef: "文场官 / 群像角色",
    storyFunction: "旁观 / 传诏",
    stance: "史册常只记封相大礼，却不记朝堂每一声压低的私语。",
    clueLevel: "背景",
    stage: "开锣 / 封相 / 搜证",
    quote: "史册只记大典，不记每一声低语。",
    soundscape: ["文官低声", "卷轴翻动", "殿内回音"],
    visualFocus: "观察服饰层叠、袖口秩序感与文官站位关系。",
    clueHint: "常用于营造朝堂氛围，也可作为背景目击者参照。",
    primaryTags: ["全部", "朝堂人物"],
    operaTags: ["群像"]
  },
  {
    id: "generic-guard",
    name: "通用侍卫",
    category: "人物",
    camp: "朝堂",
    roleType: "朝堂侍卫 / 仪仗守卫 / 动线封锁角色",
    operaRoleRef: "武行 / 龙套武将",
    storyFunction: "护卫 / 暗线",
    stance: "守的是殿门、廊道与动线，也象征信息的被阻断与被筛选。",
    clueLevel: "普通",
    stage: "封相 / 疑云 / 搜证",
    quote: "守的是殿门，未必守得住人心。",
    soundscape: ["甲片轻撞", "长戟落地", "封门回声"],
    visualFocus: "观察武行站姿、持械方式、脚步重心与防线感。",
    clueHint: "适合搭配院落与朝堂场景理解人物行动路线。",
    primaryTags: ["全部", "朝堂人物"],
    operaTags: ["武行"]
  },
  {
    id: "cantonese-opera-performer",
    name: "粤剧伶人",
    category: "人物",
    camp: "戏棚",
    roleType: "戏棚人物 / 序幕表演者 / 后台叙事角色",
    operaRoleRef: "旦角 / 戏棚伶人",
    storyFunction: "引导 / 旁观",
    stance: "一声唱词能打开戏台，也能暗暗提示台下真正的伏笔。",
    clueLevel: "背景",
    stage: "开锣 / 后台 / 反转",
    quote: "台上一句唱词，台下可能是一道伏笔。",
    soundscape: ["唱腔起势", "板眼轻敲", "后台整妆"],
    visualFocus: "观察身段线条、手部兰花势、头面比例与戏棚气韵。",
    clueHint: "适合与序章场景、唱腔记忆片一起观看，串联开锣线索。",
    primaryTags: ["全部", "戏棚人物"],
    operaTags: ["旦角"]
  }
].map((exhibit) => {
  const assets = characterAssetMap[exhibit.name] ?? {};
  return {
    ...exhibit,
    assetCategory: "character",
    imagePath: assets.imagePath ?? "",
    modelPath: assets.modelPath ?? "",
    hasModel: Boolean(assets.modelPath),
    archiveState: assets.modelPath ? "已接入展台" : "待补充模型",
    soundscapeScene: exhibit.soundscape[0] ?? "戏台声景",
    isFeatured: Boolean(exhibit.isFeatured),
    isSuspicious: Boolean(exhibit.isSuspicious)
  };
});

export const objectExhibits = [
  {
    id: "small-clue-box",
    name: "小型线索木匣",
    category: "物件",
    objectType: "线索匣",
    role: "机关解锁道具 / 场景互动线索",
    storyStage: "搜证 / 反转",
    clueLevel: "关键",
    quote: "匣中不只藏物，也藏着谁想让真相迟一步出现。",
    description: "用于开启暗格、收纳密信或藏匿关键物证的木匣线索。",
    symbolism: "代表被暂时压住的真相与尚未揭开的局中局。",
    soundscape: ["木匣轻响", "机关卡扣", "搜证呼吸"],
    soundscapeScene: "院落搜证"
  },
  {
    id: "six-states-command-token",
    name: "六国封相令牌",
    category: "物件",
    objectType: "令牌",
    role: "封相信物 / 朝堂权力标识",
    storyStage: "封相 / 疑云",
    clueLevel: "关键",
    quote: "一枚令牌，既是荣耀，也是一层层试探的凭证。",
    description: "象征封相大礼与诸侯权力承认关系的核心信物。",
    symbolism: "代表权力合法性与联盟秩序的短暂成立。",
    soundscape: ["金属轻碰", "殿前回声", "朝堂肃静"],
    soundscapeScene: "封相朝堂"
  },
  {
    id: "phoenix-crown",
    name: "凤冠",
    category: "物件",
    objectType: "冠饰",
    role: "戏曲冠饰 / 道具展示模型",
    storyStage: "开锣 / 封相",
    clueLevel: "关键视觉线索",
    quote: "珠翠满冠，是盛典表象，也是身份秩序。",
    description: "用于强调典礼仪式感与人物身份层级的戏曲冠饰。",
    symbolism: "代表封相大典中的华丽表象与身份秩序。",
    soundscape: ["珠饰碰撞声", "后台整冠声", "远处锣鼓点"],
    soundscapeScene: "后台整妆"
  },
  {
    id: "chancellor-jade-pendant",
    name: "丞相玉佩",
    category: "物件",
    objectType: "佩饰",
    role: "身份配饰 / 苏秦关联物证",
    storyStage: "封相 / 反转",
    clueLevel: "关键",
    quote: "玉佩近身，分量却比礼服更沉。",
    description: "与苏秦形象、朝堂身份与封相礼制直接相关的贴身配饰。",
    symbolism: "代表身份被赋予，也代表责任被加重。",
    soundscape: ["玉佩轻响", "朝堂回声", "暗潮低鸣"],
    soundscapeScene: "封相朝堂"
  },
  {
    id: "vocal-memory-fragment",
    name: "声境碎片-唱腔记忆片",
    category: "物件",
    objectType: "声境碎片",
    role: "唱腔记忆存片 / 戏棚声景线索",
    storyStage: "开锣 / 后台 / 反转",
    clueLevel: "隐藏",
    quote: "一句唱词落下，留下的不只是余韵。",
    description: "承载序章唱腔记忆的数字化声景碎片，可提示戏棚线索。",
    symbolism: "代表戏台记忆被重新唤起，也提示剧情伏笔已埋下。",
    soundscape: ["唱腔余韵", "戏棚板眼", "后台回响"],
    soundscapeScene: "序章粤剧剧场"
  },
  {
    id: "drum-memory-chip",
    name: "声境碎片-锣鼓记忆晶片",
    category: "物件",
    objectType: "声境碎片",
    role: "锣鼓记忆存片 / 节奏线索",
    storyStage: "开锣 / 疑云 / 反转",
    clueLevel: "隐藏",
    quote: "鼓点一乱，礼与局就会一起露出缝隙。",
    description: "记录锣鼓节奏变化的碎片，可辅助理解仪式转折与气氛变化。",
    symbolism: "代表舞台节奏与权谋节奏的彼此映照。",
    soundscape: ["鼓点碎响", "铜锣余震", "礼乐断续"],
    soundscapeScene: "封相朝堂"
  },
  {
    id: "official-seal",
    name: "官印",
    category: "物件",
    objectType: "印章",
    role: "礼制凭证 / 朝堂制度物",
    storyStage: "封相 / 搜证 / 反转",
    clueLevel: "关键",
    quote: "印落于纸，往往比人开口更早决定局势。",
    description: "与封相诏令、文书流转和朝堂制度合法性相关的关键物证。",
    symbolism: "代表制度表面上的稳固与实际操作中的权力流向。",
    soundscape: ["印章落案", "朝堂回声", "低声议论"],
    soundscapeScene: "封相朝堂"
  },
  {
    id: "wax-sealed-letter",
    name: "封蜡密函",
    category: "物件",
    objectType: "密函",
    role: "隐藏文书 / 私通线索",
    storyStage: "疑云 / 搜证 / 反转",
    clueLevel: "隐藏",
    quote: "蜡封未裂，心迹先露。",
    description: "尚未公开的密函，常用于串联私通、暗线与立场摇摆。",
    symbolism: "代表未被宣之于口却已改变局面的隐秘意志。",
    soundscape: ["封蜡开裂", "纸页摩擦", "暗处耳语"],
    soundscapeScene: "院落搜证"
  },
  {
    id: "warring-states-letter",
    name: "战国密信",
    category: "物件",
    objectType: "密信",
    role: "战国往来文书 / 暗线凭证",
    storyStage: "搜证 / 反转",
    clueLevel: "隐藏",
    quote: "笔墨不响，却常把局势写偏半寸。",
    description: "牵动诸侯关系与暗线勾连的关键书信物件。",
    symbolism: "代表合纵与猜忌之间不断摇摆的外交通道。",
    soundscape: ["纸页翻动", "毛笔余声", "屏息低语"],
    soundscapeScene: "院落搜证"
  },
  {
    id: "cantonese-opera-fan",
    name: "粤剧折扇",
    category: "物件",
    objectType: "戏曲道具",
    role: "戏台道具 / 身段辅助物",
    storyStage: "开锣 / 后台",
    clueLevel: "普通",
    quote: "一开一合之间，既有身段，也有分寸。",
    description: "用于戏曲表演动作与人物气质表达的传统折扇。",
    symbolism: "代表戏台中的身段秩序与人物风度。",
    soundscape: ["折扇开合", "台步摩擦", "唱腔起势"],
    soundscapeScene: "序章粤剧剧场"
  },
  {
    id: "digital-archive-fragment",
    name: "数字档案碎片",
    category: "物件",
    objectType: "数字档案",
    role: "档案化线索 / 证据索引",
    storyStage: "搜证 / 反转",
    clueLevel: "隐藏",
    quote: "被整理进档案的，不一定就是全部真相。",
    description: "用于串联人物、场景与物件证据关系的数字档案索引碎片。",
    symbolism: "代表被重新归档、重新解释的剧情证词。",
    soundscape: ["数据脉冲", "档案跳频", "低亮回响"],
    soundscapeScene: "院落搜证"
  },
  {
    id: "stage-mechanism-key",
    name: "舞台机关钥匙",
    category: "物件",
    objectType: "机关钥匙",
    role: "舞台机关钥匙 / 场景互动线索",
    storyStage: "搜证 / 后台",
    clueLevel: "关键",
    quote: "钥匙能开暗格，也能开出被藏起来的另一幕。",
    description: "用于打开舞台暗格、后台箱匣或场景机关的关键道具。",
    symbolism: "代表从表演空间进入隐藏空间的转换节点。",
    soundscape: ["钥匙碰撞", "机关弹开", "后台木响"],
    soundscapeScene: "序章粤剧剧场"
  },
  {
    id: "mangpao-buzi-pattern",
    name: "蟒袍胸前补子纹样",
    category: "物件",
    objectType: "戏服纹样",
    role: "服饰观察件 / 戏曲身份细节",
    storyStage: "开锣 / 封相",
    clueLevel: "普通",
    quote: "一片补子纹样，往往比台词更早透露身份。",
    description: "用于近距离观察蟒袍纹样、色彩秩序与服饰等级关系的展件。",
    symbolism: "代表戏曲服饰系统中关于身份与气度的视觉密码。",
    soundscape: ["绣纹摩挲", "布料低响", "后台整理"],
    soundscapeScene: "封相朝堂"
  }
].map((exhibit) => {
  const assets = objectAssetMap[exhibit.name] ?? {};
  return {
    ...exhibit,
    assetCategory: "object",
    imagePath: assets.imagePath ?? "",
    modelPath: assets.modelPath ?? "",
    videoPath: assets.videoPath ?? "",
    hasModel: Boolean(assets.modelPath),
    archiveState: assets.modelPath ? "已接入展台" : "待补充模型"
  };
});

export const sceneExhibits = [
  {
    id: "study-secret-room",
    name: "书房密室",
    category: "场景",
    sceneType: "搜证 / 暗线场景",
    sceneGroup: "搜证空间",
    role: "用于放置密信、令牌、相印等剧本杀线索",
    description: "提供玩家进行线索观察、密信搜证与剧情推理的空间。",
    soundscape: ["低频疑云", "翻信纸声", "烛火声"],
    soundscapeScene: "密室搜证",
    controls: {
      mode: "自由浏览",
      canOrbit: true,
      canPan: true,
      canZoom: true,
      canEnterScene: true,
      minDistance: 1.5,
      maxDistance: 8,
      maxPolarAngle: Math.PI * 0.48,
      minPolarAngle: Math.PI * 0.12,
      enableDamping: true,
      dampingFactor: 0.08,
      autoRotate: false
    },
    hotspots: [
      {
        id: "letter-fragment",
        label: "密信残页",
        type: "线索点",
        description: "观察纸页内容与摆放方向，推断谁曾在此停留。",
        position: [-1.2, 1.1, 0.4]
      },
      {
        id: "court-token",
        label: "朝堂令牌",
        type: "观察点",
        description: "可与封相朝堂中的权力信物互相对照。",
        position: [0.6, 1.25, -0.8]
      },
      {
        id: "hidden-compartment",
        label: "暗格",
        type: "空间线索",
        description: "适合联想到被延后公开的真相与隐藏证物。",
        position: [1.4, 0.9, 1.1]
      }
    ]
  },
  {
    id: "prologue-theatre",
    name: "序章粤剧剧场",
    category: "场景",
    sceneType: "剧场 / 序章叙事场景",
    sceneGroup: "戏曲空间",
    role: "用于作为玩家进入《六国大封相》前的开场空间",
    description: "连接现实观演与虚拟入戏的过渡场景，让玩家从看戏人转为戏中人。",
    soundscape: ["剧场低语", "开场锣鼓", "空间混响"],
    soundscapeScene: "序章剧场",
    controls: {
      mode: "场景漫游",
      canOrbit: true,
      canPan: true,
      canZoom: true,
      canEnterScene: true,
      minDistance: 1.8,
      maxDistance: 18,
      maxPolarAngle: Math.PI * 0.48,
      minPolarAngle: Math.PI * 0.12,
      enableDamping: true,
      dampingFactor: 0.08,
      autoRotate: false
    },
    hotspots: [
      {
        id: "immersive-entry",
        label: "入戏入口",
        type: "空间线索",
        description: "这里连接现实观演与戏中叙事，是身份转换的起点。",
        position: [0, 1.2, 0]
      },
      {
        id: "prologue-stage",
        label: "序章舞台",
        type: "观察点",
        description: "适合先看整体舞台结构与剧场空间的开场关系。",
        position: [1.8, 1.1, -0.6]
      },
      {
        id: "audience-view",
        label: "观众视角",
        type: "声景点",
        description: "用于感受观演空间混响与从看戏人进入戏中人的过渡。",
        position: [-1.4, 1.5, -1.2]
      }
    ]
  },
  {
    id: "opera-shed-1",
    name: "粤剧戏棚(1)",
    category: "场景",
    sceneType: "戏台 / 序幕场景",
    sceneGroup: "戏曲空间",
    role: "用于展示《六国大封相》开锣与粤剧表演氛围",
    description: "重构粤剧戏棚、红毯戏台、后台幕布与观演空间。",
    soundscape: ["锣鼓点", "戏棚环境声", "伶人吊嗓声"],
    soundscapeScene: "戏棚开锣",
    controls: {
      mode: "自由浏览",
      canOrbit: true,
      canPan: true,
      canZoom: true,
      canEnterScene: true,
      minDistance: 1.8,
      maxDistance: 14,
      maxPolarAngle: Math.PI * 0.48,
      minPolarAngle: Math.PI * 0.12,
      enableDamping: true,
      dampingFactor: 0.08,
      autoRotate: false
    },
    hotspots: [
      {
        id: "center-stage",
        label: "戏台中央",
        type: "观察点",
        description: "适合先看红毯戏台与主表演区的视觉中心。",
        position: [0, 1.4, 0]
      },
      {
        id: "percussion-seat",
        label: "锣鼓位",
        type: "声景点",
        description: "可联想戏棚节奏如何推动台上动作与观众情绪。",
        position: [1.9, 1.1, -0.4]
      }
    ]
  },
  {
    id: "opera-shed-2",
    name: "粤剧戏棚(2)",
    category: "场景",
    sceneType: "戏台 / 表演场景",
    sceneGroup: "戏曲空间",
    role: "用于展示粤剧身段、唱腔与舞台调度",
    description: "以不同角度呈现粤剧戏棚的舞台层次与后台空间。",
    soundscape: ["台步声", "梆子声", "幕后人声"],
    soundscapeScene: "戏棚调度",
    controls: {
      mode: "自由浏览",
      canOrbit: true,
      canPan: true,
      canZoom: true,
      canEnterScene: true,
      minDistance: 1.8,
      maxDistance: 14,
      maxPolarAngle: Math.PI * 0.48,
      minPolarAngle: Math.PI * 0.12,
      enableDamping: true,
      dampingFactor: 0.08,
      autoRotate: false
    },
    hotspots: [
      {
        id: "backstage-entry",
        label: "后台入口",
        type: "动线点",
        description: "观察演员如何从后台进入舞台，形成表演节奏。",
        position: [-1.6, 1.25, -0.9]
      },
      {
        id: "side-curtain",
        label: "舞台侧幕",
        type: "观察点",
        description: "适合观看前台与后台的空间切换层次。",
        position: [1.4, 1.2, 0.8]
      }
    ]
  },
  {
    id: "opera-shed-3",
    name: "粤剧戏棚(3)",
    category: "场景",
    sceneType: "戏台 / 声景场景",
    sceneGroup: "戏曲空间",
    role: "用于突出戏棚空间中的声音来源与观演关系",
    description: "强调观众位置、戏台声场与传统戏棚结构。",
    soundscape: ["观演空间混响", "锣鼓回声", "布幕摩擦声"],
    soundscapeScene: "戏棚声场",
    controls: {
      mode: "自由浏览",
      canOrbit: true,
      canPan: true,
      canZoom: true,
      canEnterScene: true,
      minDistance: 1.8,
      maxDistance: 14,
      maxPolarAngle: Math.PI * 0.48,
      minPolarAngle: Math.PI * 0.12,
      enableDamping: true,
      dampingFactor: 0.08,
      autoRotate: false
    },
    hotspots: [
      {
        id: "audience-zone",
        label: "观演区",
        type: "观察点",
        description: "从观众区域理解戏棚前后景之间的观看关系。",
        position: [0, 1.15, 1.8]
      },
      {
        id: "sound-center",
        label: "声场中心",
        type: "声景点",
        description: "感受锣鼓、唱腔与布幕反射形成的空间声场。",
        position: [0.4, 1.35, -0.2]
      }
    ]
  },
  {
    id: "investiture-court",
    name: "封相朝堂",
    category: "场景",
    sceneType: "朝堂 / 封相场景",
    sceneGroup: "朝堂仪式",
    role: "用于展示六国诸侯共封苏秦的仪式空间",
    description: "呈现六国诸侯、封相大典、相印与朝堂权力秩序。",
    soundscape: ["朝堂回声", "封相锣鼓点", "人群朝拜声"],
    soundscapeScene: "封相大典",
    controls: {
      mode: "场景漫游",
      canOrbit: true,
      canPan: true,
      canZoom: true,
      canEnterScene: true,
      minDistance: 2.2,
      maxDistance: 16,
      maxPolarAngle: Math.PI * 0.46,
      minPolarAngle: Math.PI * 0.1,
      enableDamping: true,
      dampingFactor: 0.08,
      autoRotate: false
    },
    hotspots: [
      {
        id: "seal-array",
        label: "六国相印",
        type: "仪式点",
        description: "观察权力信物如何在仪式中构成视觉中心。",
        position: [0, 1.5, 0]
      },
      {
        id: "lords-seat",
        label: "诸侯席位",
        type: "观察点",
        description: "适合观察诸侯站位、权力距离与盟局张力。",
        position: [2.4, 1.4, 1.2]
      },
      {
        id: "court-side-door",
        label: "朝堂侧门",
        type: "空间线索",
        description: "可联想到礼制之外的信息流动与人物出入。",
        position: [-2.1, 1.6, -1]
      }
    ]
  },
  {
    id: "courtyard",
    name: "院子",
    category: "场景",
    sceneType: "搜证 / 院落场景",
    sceneGroup: "户外空间",
    role: "用于连接朝堂、密室与戏棚之间的剧情动线",
    description: "作为剧本杀探索中的户外过渡空间，承载人物移动与暗线交流。",
    soundscape: ["风过檐角", "脚步回廊", "远处低鼓"],
    soundscapeScene: "院落搜证",
    controls: {
      mode: "场景漫游",
      canOrbit: true,
      canPan: true,
      canZoom: true,
      canEnterScene: true,
      minDistance: 2.4,
      maxDistance: 20,
      maxPolarAngle: Math.PI * 0.5,
      minPolarAngle: Math.PI * 0.08,
      enableDamping: true,
      dampingFactor: 0.08,
      autoRotate: false
    },
    hotspots: [
      {
        id: "stone-path",
        label: "院中石路",
        type: "动线点",
        description: "适合先确认人物移动路径与停留位置。",
        position: [0, 1.3, 2]
      },
      {
        id: "dark-corner",
        label: "暗处角落",
        type: "线索点",
        description: "与私语、密函和隐藏线索关系最为紧密。",
        position: [-2.2, 1.2, -0.8]
      },
      {
        id: "side-passage",
        label: "侧门通道",
        type: "空间线索",
        description: "用于理解院子如何承接朝堂、密室与戏棚之间的过渡。",
        position: [2, 1.4, -1.5]
      }
    ]
  }
].map((exhibit) => {
  const assets = sceneAssetMap[exhibit.name] ?? {};
  return {
    ...exhibit,
    assetCategory: "scene",
    viewMode: "model",
    imagePath: assets.imagePath ?? "",
    modelPath: assets.modelPath ?? "",
    hasModel: Boolean(assets.modelPath),
    archiveState: assets.modelPath ? "已接入场景" : "待补充场景"
  };
});

export const panoramaScenes = [
  {
    id: "opera-stage-360",
    name: "粤剧戏棚 360",
    category: "360全景",
    sceneGroup: "戏曲空间",
    sceneType: "360 全景 / 戏棚场景",
    viewMode: "panorama",
    role: "用于全屏观赏粤剧戏棚空间氛围",
    description: "以 360 全景方式呈现粤剧戏棚的舞台、观演空间与戏曲声景氛围。",
    soundscape: ["锣鼓点", "戏棚环境声", "观演空间混响"],
    soundscapeScene: "戏棚全景",
    defaultView: { yaw: 0, pitch: 0, fov: 75 },
    hotspots: [
      {
        id: "opera-stage-center-360",
        label: "戏台中央",
        type: "观察点",
        description: "面向戏台中央时，能最直接感受到舞台与观演关系的正轴结构。 "
      },
      {
        id: "opera-percussion-360",
        label: "锣鼓位",
        type: "声景点",
        description: "适合联想戏棚节奏如何带动人物上场、亮相与氛围起伏。"
      },
      {
        id: "opera-audience-360",
        label: "观演区",
        type: "空间线索",
        description: "从观演区回望戏台，可感受戏棚前后台与声场的完整关系。"
      }
    ]
  },
  {
    id: "court-360",
    name: "封相朝堂 360",
    category: "360全景",
    sceneGroup: "朝堂仪式",
    sceneType: "360 全景 / 封相仪式场景",
    viewMode: "panorama",
    role: "用于全屏观赏六国封相大典的朝堂空间",
    description: "以 360 全景方式呈现封相朝堂、六国席位、相印与仪式空间秩序。",
    soundscape: ["朝堂回声", "封相锣鼓点", "人群朝拜声"],
    soundscapeScene: "朝堂全景",
    defaultView: { yaw: 0.1, pitch: 0, fov: 75 },
    hotspots: [
      {
        id: "court-seals-360",
        label: "六国相印",
        type: "仪式点",
        description: "可从全景视角观察权力信物如何构成封相大礼的视觉核心。"
      },
      {
        id: "court-lords-360",
        label: "诸侯席位",
        type: "观察点",
        description: "适合比较六国诸侯的空间距离与礼制站位关系。"
      },
      {
        id: "court-side-door-360",
        label: "朝堂侧门",
        type: "空间线索",
        description: "礼制之外的信息流动，常常从不在正中的门口开始。"
      }
    ]
  },
  {
    id: "study-360",
    name: "书房密室 360",
    category: "360全景",
    sceneGroup: "搜证空间",
    sceneType: "360 全景 / 搜证暗线场景",
    viewMode: "panorama",
    role: "用于全屏观察密室中的线索与悬疑氛围",
    description: "以 360 全景方式呈现书房密室、密信、令牌、暗格与搜证动线。",
    soundscape: ["低频疑云", "翻信纸声", "烛火声"],
    soundscapeScene: "密室全景",
    defaultView: { yaw: -0.18, pitch: 0, fov: 75 },
    hotspots: [
      {
        id: "study-letter-360",
        label: "密信残页",
        type: "线索点",
        description: "信纸边缘、散落角度与桌面痕迹常能提示谁先一步到过这里。"
      },
      {
        id: "study-token-360",
        label: "朝堂令牌",
        type: "观察点",
        description: "将书房中的令牌与朝堂仪式空间对照，能看见权力如何离开正殿。"
      },
      {
        id: "study-hidden-box-360",
        label: "暗格",
        type: "空间线索",
        description: "暗格不仅是藏物的位置，也是剧情被暂时压住的地方。"
      }
    ]
  },
  {
    id: "prologue-theatre-360",
    name: "序章粤剧剧场 360",
    category: "360全景",
    sceneGroup: "戏曲空间",
    sceneType: "360 全景 / 序章剧场场景",
    viewMode: "panorama",
    role: "用于作为玩家进入《六国大封相》前的全景序章空间",
    description: "以 360 全景方式连接现实观演与虚拟入戏，让玩家从看戏人转为戏中人。",
    soundscape: ["剧场低语", "开场锣鼓", "空间混响"],
    soundscapeScene: "序章全景",
    defaultView: { yaw: 0, pitch: 0, fov: 75 },
    hotspots: [
      {
        id: "prologue-entry-360",
        label: "入戏入口",
        type: "空间线索",
        description: "站在这里，最能感受到观众身份向戏中人身份转变的临界点。"
      },
      {
        id: "prologue-stage-360",
        label: "序章舞台",
        type: "观察点",
        description: "适合先对准舞台主体，建立进入戏中世界的第一视角。"
      },
      {
        id: "prologue-audience-360",
        label: "观众视角",
        type: "声景点",
        description: "从观众席位回望舞台，可以感受到剧场混响与入戏前的等待感。"
      }
    ]
  }
].map((scene) => {
  const assets = panoramaAssetMap[scene.name] ?? {};
  return {
    ...scene,
    assetCategory: "scene",
    imagePath: assets.imagePath ?? "",
    modelPath: "",
    hasModel: Boolean(assets.imagePath),
    archiveState: assets.imagePath ? "已接入全景" : "待补充全景"
  };
});

export const categoryMeta = {
  character: {
    label: "人物馆",
    shortLabel: "人物",
    eyebrow: "人物档案 / 行当名册",
    description: "从主视角、诸侯、朝堂到戏棚人物，进入《六国大封相》的角色线索网络。",
    introTitle: "人物档案",
    introText: "行当、身段、服饰与权谋气质同场展开，适合逐件细看。",
    archiveLabel: "人物档案总览"
  },
  object: {
    label: "物件馆",
    shortLabel: "物件",
    eyebrow: "物件档案 / 道具线索库",
    description: "冠饰、令牌、密信、相印与声景碎片共同构成搜证空间。",
    introTitle: "物件档案",
    introText: "从戏曲道具到权力信物，每件物证都指向封相礼背后的暗线。",
    archiveLabel: "物件档案总览"
  },
  scene: {
    label: "场景馆",
    shortLabel: "场景",
    eyebrow: "场景档案 / 三维与全景空间库",
    description: "在 3D 场景与 360 全景之间切换，分别浏览戏棚、朝堂、密室与院落空间。",
    introTitle: "场景档案",
    introText: "可切换进入 3D 场景或 360 全景，分别浏览空间结构与沉浸式环视画面。",
    archiveLabel: "场景档案总览"
  }
};

export const filterConfigs = {
  character: [
    {
      key: "primary",
      label: "主筛选",
      options: ["全部", "主线人物", "六国诸侯", "朝堂人物", "戏棚人物", "关键线索", "隐藏线索"]
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
      key: "primary",
      label: "主筛选",
      options: ["全部", "关键线索", "隐藏线索", "声境碎片", "文书密信", "权力信物", "戏曲道具"]
    }
  ],
  scene: [
    {
      key: "primary",
      label: "主筛选",
      options: ["全部", "戏曲空间", "朝堂仪式", "搜证空间", "户外空间"]
    },
    {
      key: "mode",
      label: "浏览模式",
      options: ["全部", "3D 场景", "360 全景"]
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
    primary: "全部"
  },
  scene: {
    primary: "全部",
    mode: "全部"
  }
};

export function getExhibits(category) {
  if (category === "character") return characterExhibits;
  if (category === "object") return objectExhibits;
  return [...sceneExhibits, ...panoramaScenes];
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
  const sceneCount = sceneExhibits.length + panoramaScenes.length;
  const readyModels =
    [...characterExhibits, ...objectExhibits, ...sceneExhibits, ...panoramaScenes].filter(
      (item) => item.hasModel
    )
      .length;
  return { characterCount, objectCount, sceneCount, readyModels };
}
