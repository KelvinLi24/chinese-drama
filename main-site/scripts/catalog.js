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
  通用六国文官: { imagePath: assetPath("character", "通用六国文官", "png"), modelPath: assetPath("character", "通用六国文官", "glb") },
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
  "声境碎片-唱腔记忆片": { imagePath: assetPath("object", "声境碎片-唱腔记忆片", "png"), modelPath: assetPath("object", "声境碎片-唱腔记忆片", "glb") },
  "声境碎片-锣鼓记忆晶片": { imagePath: assetPath("object", "声境碎片-锣鼓记忆晶片", "png"), modelPath: assetPath("object", "声境碎片-锣鼓记忆晶片", "glb") },
  官印: { imagePath: assetPath("object", "官印", "png"), modelPath: assetPath("object", "官印", "glb") },
  封蜡密函: { imagePath: assetPath("object", "封蜡密函", "png"), modelPath: assetPath("object", "封蜡密函", "glb") },
  战国密信: { imagePath: assetPath("object", "战国密信", "png"), modelPath: assetPath("object", "战国密信", "glb") },
  数字档案碎片: { imagePath: assetPath("object", "数字档案碎片", "png"), modelPath: assetPath("object", "数字档案碎片", "glb") },
  粤剧折扇: { imagePath: assetPath("object", "粤剧折扇", "png"), modelPath: assetPath("object", "粤剧折扇", "glb") },
  舞台机关钥匙: { imagePath: assetPath("object", "舞台机关钥匙", "png"), modelPath: assetPath("object", "舞台机关钥匙", "glb") },
  蟒袍胸前补子纹样: { imagePath: assetPath("object", "蟒袍胸前补子纹样", "png"), modelPath: assetPath("object", "蟒袍胸前补子纹样", "glb") }
};

const sceneAssetMap = {
  书房密室: { imagePath: assetPath("scene", "书房密室", "png"), modelPath: assetPath("scene", "书房密室", "glb") },
  序章粤剧剧场: { imagePath: assetPath("scene", "序章粤剧剧场", "png"), modelPath: assetPath("scene", "序章粤剧剧场", "glb") },
  粤剧戏棚: { imagePath: assetPath("scene", "粤剧戏棚", "png"), modelPath: assetPath("scene", "粤剧戏棚", "glb") },
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
    clueLevel: "普通",
    stage: "开锣 / 搜证",
    quote: "戏未开锣，局已在台下悄然成形。",
    soundscape: ["戏棚脚步", "后台低语", "开场锣点"],
    visualFocus: "观察人物姿态、服饰轮廓、冠饰比例与整体舞台气质。",
    clueHint: "适合作为展陈入口角色，用来提示观众从人物、物件与场景三条线进入。",
    stance: "不直接站队，更像戏内外之间的引路人。",
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
    clueLevel: "关键",
    stage: "封相 / 疑云 / 反转",
    quote: "六印加身，亦是六国枷锁。",
    soundscape: ["朝堂回声", "低频疑云", "封相锣鼓点"],
    visualFocus: "观察冠服层次、腰间配饰、袖口纹样与主角站姿。",
    clueHint: "玩家主视角人物，所有权谋线索最终会回到苏秦的抉择。",
    stance: "身在封相荣耀中心，却也处在六国权衡的压力之中。",
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
    clueLevel: "关键",
    stage: "封相 / 疑云 / 搜证",
    quote: "合纵之名下，谁才是真正盟主？",
    soundscape: ["重靴回响", "朝堂低喝", "火色呼吸"],
    visualFocus: "观察面部神情、肩部体量与整体压迫感。",
    clueHint: "适合与封蜡密函、异常印记、朝堂右侧案台线索关联观看。",
    stance: "表面参与盟局，实际始终在衡量谁会在封相之后掌权。",
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
    clueLevel: "关键",
    stage: "封相 / 疑云",
    quote: "不争一时，方能坐收天下之局。",
    soundscape: ["冕旒轻响", "案前低语", "缓拍鼓点"],
    visualFocus: "观察站姿的收敛感、袍服垂坠与王者视线。",
    clueHint: "更适合放到群像关系中对比理解，他的重要性来自姿态与位置。",
    stance: "并不急于表态，而是借旁观姿态维持局面的可变性。",
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
    clueLevel: "关键",
    stage: "封相 / 疑云 / 搜证",
    quote: "封相可以成局，也可以困局。",
    soundscape: ["佩玉轻撞", "王席私语", "压抑礼乐"],
    visualFocus: "观察服饰厚重感、手势方向与王侯姿态的克制。",
    clueHint: "与令牌、官印、盟约相关线索放在一起看，更容易理解他的推动作用。",
    stance: "一方面推动合纵成势，另一方面也担心苏秦坐大。",
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
    clueLevel: "隐藏",
    stage: "封相 / 搜证 / 反转",
    quote: "诏令落下之前，已有暗语传开。",
    soundscape: ["诏声回廊", "纸封摩擦", "仪礼钟鸣"],
    visualFocus: "观察持诏姿态、袖口层次与神色中的迟疑。",
    clueHint: "在剧本杀世界中，他是进入封相朝堂后的首个关键交谈对象。",
    stance: "虽处朝堂中心，却更像一位看见异常又不敢直言的传话者。",
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
    clueLevel: "普通",
    stage: "封相 / 疑云 / 搜证",
    quote: "盟书可签，边关之患却无人替我承担。",
    soundscape: ["边地风声", "铠片轻响", "远鼓余震"],
    visualFocus: "观察身姿外扩感、腰间配件与边地武备气息。",
    clueHint: "更适合作为六国群像中的关系节点，而非单一核心谜面。",
    stance: "在合纵与自保之间犹疑，始终将边患置于盟局之前。",
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
    clueLevel: "隐藏",
    stage: "疑云 / 搜证 / 反转",
    quote: "弱国无忠奸，只有活路。",
    soundscape: ["密谈停顿", "短促吐息", "案角摩擦"],
    visualFocus: "观察视线游移、服饰收束感与不安的身体姿态。",
    clueHint: "适合与战国密信、隐蔽文书、侧廊支线共同观看。",
    stance: "在权力夹缝中求生，因此最容易与暗线发生勾连。",
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
    clueLevel: "普通",
    stage: "封相 / 疑云",
    quote: "北风未止，盟约又能暖几时？",
    soundscape: ["寒风余音", "沉木轻振", "远钟低回"],
    visualFocus: "观察袍服轮廓、北地气质与冷峻的整体姿态。",
    clueHint: "适合与院子、外侧场景和北地势力相关氛围一起呈现。",
    stance: "更关心大局会如何波及边地，而非立即卷入核心争夺。",
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
    clueLevel: "背景",
    stage: "开锣 / 封相 / 搜证",
    quote: "史册只记大典，不记每一声低语。",
    soundscape: ["纸页翻动", "笔锋摩擦", "远殿回声"],
    visualFocus: "观察衣褶走势、官帽比例与文场气息的层次。",
    clueHint: "适合作为环境人物强化朝堂秩序感，不必承载过多直白叙述。",
    stance: "记录仪式、传递秩序，也是最容易被忽略的背景观察者。",
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
    clueLevel: "普通",
    stage: "封相 / 疑云 / 搜证",
    quote: "守的是殿门，未必守得住人心。",
    soundscape: ["甲片轻响", "戟尾落地", "步伐震动"],
    visualFocus: "观察武行身段、兵器轮廓与守卫站位。",
    clueHint: "适合作为场景动线提示角色，强调入口、侧门与不可进入区域。",
    stance: "守卫朝堂秩序，却也可能无意间看见最关键的异常。",
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
    clueLevel: "背景",
    stage: "开锣 / 后台 / 反转",
    quote: "台上一句唱词，台下可能是一道伏笔。",
    soundscape: ["唱腔回环", "后台整冠", "锣鼓试点"],
    visualFocus: "观察水袖走势、冠饰比例与整体戏棚气质。",
    clueHint: "与声境碎片、戏棚空间、序章导览内容搭配最能体现粤剧氛围。",
    stance: "既是戏内人物，也是把观众带入世界观的舞台引路者。",
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
    objectType: "木匣",
    role: "机关线索匣 / 搜证起点装置",
    displayPosition: "机关线索匣",
    storyStage: "搜证 / 反转",
    clueLevel: "关键",
    quote: "木匣不大，藏住的却可能是整场封相的裂缝。",
    description: "观察匣盖边缘、锁扣结构、木纹磨损与是否存在反复开启的痕迹。",
    symbolism: "像一处被压低的证据入口，提醒观众真正的线索往往藏在不显眼的位置。",
    soundscape: ["木匣轻碰", "锁扣脆响", "压低呼吸"],
    soundscapeScene: "书房密室"
  },
  {
    id: "six-states-command-token",
    name: "六国封相令牌",
    category: "物件",
    objectType: "令牌",
    role: "封相仪礼信物 / 六国盟约象征",
    displayPosition: "朝堂礼器",
    storyStage: "封相 / 疑云",
    clueLevel: "关键",
    quote: "一枚令牌既可象征同盟，也可成为权力试探的凭据。",
    description: "观察牌面纹样、边缘磨损、佩系结构与礼仪象征的正反两面。",
    symbolism: "代表封相仪式表面的秩序，也暴露六国之间脆弱的信任关系。",
    soundscape: ["金属轻鸣", "礼器落案", "朝堂低语"],
    soundscapeScene: "封相朝堂"
  },
  {
    id: "phoenix-crown",
    name: "凤冠",
    category: "物件",
    objectType: "冠饰",
    role: "戏曲冠饰 / 道具展示模型",
    displayPosition: "戏曲冠饰",
    storyStage: "开锣 / 封相",
    clueLevel: "关键视觉线索",
    quote: "珠翠满冠，是盛典表象，也是身份秩序。",
    description: "观察珠饰、流苏、金属骨架、青绿羽纹与红色垂珠层次。",
    symbolism: "代表封相大典中的华丽表象与身份秩序。",
    soundscape: ["珠饰碰撞声", "后台整冠声", "远处锣鼓点"],
    soundscapeScene: "戏棚后台"
  },
  {
    id: "chancellor-jade-pendant",
    name: "丞相玉佩",
    category: "物件",
    objectType: "玉佩",
    role: "身份信物 / 苏秦关联物件",
    displayPosition: "身份信物",
    storyStage: "封相 / 反转",
    clueLevel: "关键",
    quote: "玉色沉静，真正发声的是它所代表的身份重量。",
    description: "观察玉佩轮廓、穿绳位置、边缘光泽与长期佩戴后的细节磨痕。",
    symbolism: "将人物身份、礼制等级与个人抉择绑定在一起。",
    soundscape: ["玉石轻撞", "朝服摩擦", "仪礼回声"],
    soundscapeScene: "封相朝堂"
  },
  {
    id: "vocal-memory-fragment",
    name: "声境碎片-唱腔记忆片",
    category: "物件",
    objectType: "声境碎片",
    role: "声景线索 / 戏棚唱腔片段",
    displayPosition: "声景碎片",
    storyStage: "开锣 / 后台 / 反转",
    clueLevel: "隐藏",
    quote: "唱腔留声不只为回味，也可能替真相留下回音。",
    description: "观察碎片边缘、光泽层级与它如何在戏棚氛围中充当记忆介质。",
    symbolism: "让舞台上的声音反向变成剧情证物。",
    soundscape: ["唱腔回旋", "板眼回震", "后台脚步"],
    soundscapeScene: "序章粤剧剧场"
  },
  {
    id: "drum-memory-chip",
    name: "声境碎片-锣鼓记忆晶片",
    category: "物件",
    objectType: "声境碎片",
    role: "声景线索 / 开场节奏线索",
    displayPosition: "声景碎片",
    storyStage: "开锣 / 疑云 / 反转",
    clueLevel: "隐藏",
    quote: "鼓点一旦错拍，整场礼乐都会泄露异常。",
    description: "观察晶片形态、发光节奏与它与鼓点叙事之间的关系。",
    symbolism: "提醒观众声音也是搜证的一部分，节奏同样可以说谎。",
    soundscape: ["锣鼓回响", "节拍停顿", "空场余振"],
    soundscapeScene: "封相朝堂"
  },
  {
    id: "official-seal",
    name: "官印",
    category: "物件",
    objectType: "官印",
    role: "朝堂印信 / 权力象征",
    displayPosition: "朝堂印信",
    storyStage: "封相 / 搜证 / 反转",
    clueLevel: "关键",
    quote: "印痕落下时，礼制成立，阴影也随之固定。",
    description: "观察印钮造型、底纹图案、边缘磨损与是否存在非礼制使用痕迹。",
    symbolism: "既是权力的物证，也是判断真伪与来源的直接线索。",
    soundscape: ["印纽触案", "木案回弹", "低声停顿"],
    soundscapeScene: "封相朝堂"
  },
  {
    id: "sealed-letter",
    name: "封蜡密函",
    category: "物件",
    objectType: "密函",
    role: "异常文书 / 首个调查目标",
    displayPosition: "案台密函",
    storyStage: "封相 / 搜证 / 反转",
    clueLevel: "关键",
    quote: "封蜡完整，未必意味着内容无人动过。",
    description: "观察封蜡裂纹、边角卷曲、纸面压痕与印记来源是否异常。",
    symbolism: "是沉浸式剧情中的第一道明确异常，把观众从观礼带入搜证。",
    soundscape: ["纸封摩擦", "蜡纹轻裂", "案台寂静"],
    soundscapeScene: "封相朝堂"
  },
  {
    id: "warring-letter",
    name: "战国密信",
    category: "物件",
    objectType: "密信",
    role: "暗线文书 / 外使往来线索",
    displayPosition: "隐秘文书",
    storyStage: "搜证 / 反转",
    clueLevel: "关键",
    quote: "纸薄如常，字里行间却可能决定谁与谁私下结盟。",
    description: "观察纸张折痕、墨色深浅、落款方式与传递痕迹。",
    symbolism: "把宏大的六国同盟切回个人之间的秘密往来。",
    soundscape: ["纸页翻折", "墨痕停驻", "灯火轻颤"],
    soundscapeScene: "书房密室"
  },
  {
    id: "digital-fragment",
    name: "数字档案碎片",
    category: "物件",
    objectType: "数字碎片",
    role: "数字残片 / 跨媒介提示",
    displayPosition: "数字残片",
    storyStage: "搜证 / 反转",
    clueLevel: "隐藏",
    quote: "碎片化的不只是档案，也是不愿被完整看见的真相。",
    description: "观察碎片边界、光泽断层与它与展陈系统之间的隐喻关系。",
    symbolism: "把线下戏曲与数字展陈的双重叙事联结在一起。",
    soundscape: ["电子残响", "纸面回授", "远处敲击"],
    soundscapeScene: "数字档案区"
  },
  {
    id: "folding-fan",
    name: "粤剧折扇",
    category: "物件",
    objectType: "戏曲道具",
    role: "舞台道具 / 身段延展",
    displayPosition: "戏曲道具",
    storyStage: "开锣 / 后台",
    clueLevel: "普通",
    quote: "开合之间，不只藏着身段，也藏着人物心事。",
    description: "观察扇骨、扇面留白、开合弧度与台步配合的舞台意味。",
    symbolism: "用最轻巧的道具延展人物的身份与情绪。",
    soundscape: ["扇骨轻响", "衣袖拂动", "戏台回气"],
    soundscapeScene: "粤剧戏棚"
  },
  {
    id: "stage-key",
    name: "舞台机关钥匙",
    category: "物件",
    objectType: "钥匙",
    role: "机关钥匙 / 支线入口",
    displayPosition: "机关钥匙",
    storyStage: "搜证 / 反转",
    clueLevel: "隐藏",
    quote: "能打开机关的不只是一把钥匙，也可能是一段被遮住的戏。",
    description: "观察齿口结构、金属磨损与与机关装置的匹配关系。",
    symbolism: "把空间探索与线索推进连接起来。",
    soundscape: ["金属轻碰", "暗门细响", "脚步停顿"],
    soundscapeScene: "戏棚侧廊"
  },
  {
    id: "mangpao-buzi-pattern",
    name: "蟒袍胸前补子纹样",
    category: "物件",
    objectType: "补子纹样",
    role: "服饰纹样 / 身份识别线索",
    displayPosition: "服饰纹样",
    storyStage: "封相 / 搜证",
    clueLevel: "关键视觉线索",
    quote: "一方补子并不喧哗，却足以让身份无处遁形。",
    description: "观察纹样尺寸、绣线走向、色层叠压与服饰等级信息。",
    symbolism: "让观众从服饰细部进入权力结构，而不是只看整体造型。",
    soundscape: ["布料摩擦", "绣线细响", "静场呼吸"],
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
    sceneType: "密室 / 暗线搜证空间",
    sceneGroup: "搜证空间",
    role: "查看密函、木匣与隐藏抽屉的关键搜证室",
    description: "灯火压低的书房密室中，文书、封蜡与木匣把仪式背后的私密行动全部引向桌案。",
    soundscape: ["纸页翻动", "灯火细颤", "门外低语"],
    soundscapeScene: "书房密室",
    controls: { mode: "可漫游", canOrbit: true, canPan: true, canZoom: true, canEnterScene: true, minDistance: 1.5, maxDistance: 8, maxPolarAngle: Math.PI * 0.48, minPolarAngle: Math.PI * 0.12, enableDamping: true, dampingFactor: 0.08, autoRotate: false },
    hotspots: [
      { id: "letter-fragment", label: "密函桌案", type: "关键线索", description: "从桌面文书与封蜡开始查看异常来源。", position: [-1.2, 1.1, 0.4] },
      { id: "court-token", label: "木匣与抽屉", type: "隐藏线索", description: "案边收纳位置可能藏着第二层证物。", position: [0.6, 1.25, -0.8] },
      { id: "hidden-compartment", label: "暗格角落", type: "空间观察", description: "适合寻找被刻意遮住的往来痕迹。", position: [1.4, 0.9, 1.1] }
    ]
  },
  {
    id: "prologue-theatre",
    name: "序章粤剧剧场",
    category: "场景",
    sceneType: "剧场 / 序章空间",
    sceneGroup: "戏曲空间",
    role: "进入故事之前的开锣空间与声境入口",
    description: "从剧场前场进入《六国大封相》的声景预热区，让观众先被鼓点、唱腔与灯火带入。",
    soundscape: ["开场锣鼓", "候场低语", "观众气息"],
    soundscapeScene: "序章剧场",
    controls: { mode: "轨道观察", canOrbit: true, canPan: true, canZoom: true, canEnterScene: true, minDistance: 1.8, maxDistance: 18, maxPolarAngle: Math.PI * 0.48, minPolarAngle: Math.PI * 0.12, enableDamping: true, dampingFactor: 0.08, autoRotate: false },
    hotspots: [
      { id: "immersive-entry", label: "入戏入口", type: "导览节点", description: "适合作为数字仓库进入沉浸世界的起点。", position: [0, 1.2, 0] },
      { id: "prologue-stage", label: "前场视角", type: "舞台观察", description: "先感受序章如何为封相主线预热。", position: [1.8, 1.1, -0.6] },
      { id: "audience-view", label: "观众席位", type: "声景提示", description: "从观看位置理解戏台与观演关系。", position: [-1.4, 1.5, -1.2] }
    ]
  },
  {
    id: "opera-shed",
    name: "粤剧戏棚",
    category: "场景",
    sceneType: "戏棚 / 终章舞台空间",
    sceneGroup: "戏曲空间",
    role: "作为粤剧终章演出、舞台群像与声景回收的核心场域",
    description: "戏棚既是演出空间，也是让封相礼、群像人物与第七声锣回到舞台语境中的终章场景。",
    soundscape: ["锣鼓收束", "台前唱腔", "幕布轻响"],
    soundscapeScene: "粤剧戏棚",
    controls: { mode: "轨道观察", canOrbit: true, canPan: true, canZoom: true, canEnterScene: true, minDistance: 1.8, maxDistance: 14, maxPolarAngle: Math.PI * 0.48, minPolarAngle: Math.PI * 0.12, enableDamping: true, dampingFactor: 0.08, autoRotate: false },
    hotspots: [
      { id: "opera-stage-center", label: "戏棚中心", type: "终章舞台", description: "适合观察终章群像与舞台中心调度。", position: [0, 1.4, 0] },
      { id: "opera-side-stage", label: "侧台道具", type: "戏曲陈设", description: "从侧台位置查看凤冠、折扇与令牌如何回到戏曲语境。", position: [1.8, 1.18, -0.6] },
      { id: "opera-audience-edge", label: "观演关系", type: "空间观察", description: "从观众边缘位置理解戏台、演员与叙事收束的关系。", position: [-1.5, 1.22, 1.6] }
    ]
  },
  {
    id: "investiture-court",
    name: "封相朝堂",
    category: "场景",
    sceneType: "朝堂 / 封相核心场景",
    sceneGroup: "朝堂仪式",
    role: "六国封相仪礼与权谋调查的主场域",
    description: "主台阶、案台与六国使者视线共同构成封相大典的权力中心。",
    soundscape: ["朝堂回声", "封相锣鼓", "群臣低声"],
    soundscapeScene: "封相朝堂",
    controls: { mode: "可漫游", canOrbit: true, canPan: true, canZoom: true, canEnterScene: true, minDistance: 2.2, maxDistance: 16, maxPolarAngle: Math.PI * 0.46, minPolarAngle: Math.PI * 0.1, enableDamping: true, dampingFactor: 0.08, autoRotate: false },
    hotspots: [
      { id: "seal-array", label: "封相主案", type: "仪礼中心", description: "适合观察官印、令牌与封相礼制的中心关系。", position: [0, 1.5, 0] },
      { id: "lords-seat", label: "诸侯席位", type: "人物关系", description: "从席位分布理解六国之间的张力。", position: [2.4, 1.4, 1.2] },
      { id: "court-side-door", label: "侧门线索", type: "暗线入口", description: "侧门与东侧案台常常是调查异常的起点。", position: [-2.1, 1.6, -1] }
    ]
  },
  {
    id: "courtyard",
    name: "院子",
    category: "场景",
    sceneType: "院落 / 过渡空间",
    sceneGroup: "户外空间",
    role: "连接朝堂、戏棚与密室的缓冲场域",
    description: "院子提供喘息与转场，也让隐蔽会面、绕行与暗线交换变得合理。",
    soundscape: ["夜风穿廊", "树影摩擦", "远处锣鼓"],
    soundscapeScene: "院子",
    controls: { mode: "可漫游", canOrbit: true, canPan: true, canZoom: true, canEnterScene: true, minDistance: 2.4, maxDistance: 20, maxPolarAngle: Math.PI * 0.5, minPolarAngle: Math.PI * 0.08, enableDamping: true, dampingFactor: 0.08, autoRotate: false },
    hotspots: [
      { id: "stone-path", label: "石径动线", type: "路径观察", description: "从外场动线理解各空间如何相连。", position: [0, 1.3, 2] },
      { id: "dark-corner", label: "暗角停留", type: "隐藏线索", description: "院落角落适合藏匿不愿被人看见的证物。", position: [-2.2, 1.2, -0.8] },
      { id: "side-passage", label: "侧廊出口", type: "支线入口", description: "这一侧通道可作为后续支线的延伸。", position: [2, 1.4, -1.5] }
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
    category: "场景",
    sceneGroup: "戏曲空间",
    sceneType: "360 全景 / 戏棚空间",
    viewMode: "panorama",
    role: "以环视方式进入粤剧戏棚的完整空间关系",
    description: "从 360 全景中感受戏棚的观演关系、鼓位位置与整体气氛。",
    soundscape: ["戏棚回响", "唱腔试声", "观众低语"],
    soundscapeScene: "粤剧戏棚全景",
    defaultView: { yaw: 0, pitch: 0, fov: 75 },
    hotspots: [
      { id: "opera-stage-center-360", label: "戏台中心", type: "舞台观察", description: "先从戏台中心理解整个戏棚构图。" },
      { id: "opera-percussion-360", label: "鼓位一侧", type: "声景提示", description: "观察节奏位置如何牵引人物入场。" },
      { id: "opera-audience-360", label: "观演边界", type: "空间观察", description: "从视线关系理解戏棚的包围感。" }
    ]
  },
  {
    id: "court-360",
    name: "封相朝堂 360",
    category: "场景",
    sceneGroup: "朝堂仪式",
    sceneType: "360 全景 / 封相朝堂",
    viewMode: "panorama",
    role: "环视封相主殿，梳理主案、诸侯席与侧门的空间关系",
    description: "这一视角适合先建立朝堂整体构图，再回到 3D 场景中逐点搜证。",
    soundscape: ["朝堂回声", "礼乐低鸣", "群臣呼吸"],
    soundscapeScene: "封相朝堂全景",
    defaultView: { yaw: 0.1, pitch: 0, fov: 75 },
    hotspots: [
      { id: "court-seals-360", label: "封相主案", type: "仪礼中心", description: "观察礼器与主案如何构成视觉重心。" },
      { id: "court-lords-360", label: "诸侯席位", type: "人物关系", description: "从环视中快速建立六国群像方位。" },
      { id: "court-side-door-360", label: "侧门暗线", type: "调查入口", description: "侧门方向与异常封蜡线索相互呼应。" }
    ]
  },
  {
    id: "study-360",
    name: "书房密室 360",
    category: "场景",
    sceneGroup: "搜证空间",
    sceneType: "360 全景 / 书房密室",
    viewMode: "panorama",
    role: "快速环视文书、木匣与暗格所在位置",
    description: "比起线性查看，360 视角更适合先判断证物之间的彼此关系。",
    soundscape: ["纸页轻响", "烛火低颤", "门缝风声"],
    soundscapeScene: "书房密室全景",
    defaultView: { yaw: -0.18, pitch: 0, fov: 75 },
    hotspots: [
      { id: "study-letter-360", label: "密函桌案", type: "关键线索", description: "从桌案开始回推谁先接触了文书。" },
      { id: "study-token-360", label: "木匣与柜角", type: "隐藏线索", description: "箱匣与角落经常比正中央更值得看。" },
      { id: "study-hidden-box-360", label: "暗格位置", type: "空间观察", description: "从整体视角判断暗格是否刻意被遮蔽。" }
    ]
  },
  {
    id: "prologue-theatre-360",
    name: "序章粤剧剧场 360",
    category: "场景",
    sceneGroup: "戏曲空间",
    sceneType: "360 全景 / 序章剧场",
    viewMode: "panorama",
    role: "从全景方式进入开锣前的剧场氛围",
    description: "适合在进入人物馆、物件馆或剧本杀世界之前先建立整体舞台情绪。",
    soundscape: ["开锣前息", "后台试音", "观众低语"],
    soundscapeScene: "序章剧场全景",
    defaultView: { yaw: 0, pitch: 0, fov: 75 },
    hotspots: [
      { id: "prologue-entry-360", label: "入戏入口", type: "导览节点", description: "把观众正式带入封相世界的第一步。" },
      { id: "prologue-stage-360", label: "戏台前场", type: "舞台观察", description: "观察戏台是如何成为所有后续叙事的起点。" },
      { id: "prologue-audience-360", label: "观众席位", type: "声景提示", description: "从全景中理解戏曲观看位置与声音包围。" }
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
    shortLabel: "人物馆",
    eyebrow: "人物档案 / 行当名册",
    description: "从主视角、诸侯、朝堂到戏棚人物，进入《六国大封相》的角色线索网络。",
    introTitle: "人物馆",
    introText: "重点展示角色身份、行当参考、戏剧情境与一句最有记忆点的角色短句。",
    archiveLabel: "人物档案总览"
  },
  object: {
    label: "物件馆",
    shortLabel: "物件馆",
    eyebrow: "物件档案 / 道具线索库",
    description: "冠饰、令牌、密函、官印与声景碎片共同构成《六国大封相》的搜证空间。",
    introTitle: "物件馆",
    introText: "重点展示物件类型、展示定位、可疑细节与它在封相叙事中的象征作用。",
    archiveLabel: "物件档案总览"
  },
  scene: {
    label: "场景馆",
    shortLabel: "场景馆",
    eyebrow: "场景档案 / 三维与全景空间库",
    description: "在 3D 场景与 360 全景之间切换，分别浏览戏棚、朝堂、密室与院落空间。",
    introTitle: "场景馆",
    introText: "从舞台、朝堂到搜证空间，按观看方式与空间主题逐步进入这一出封相大典。",
    archiveLabel: "场景档案总览"
  }
};

export const filterConfigs = {
  character: [
    { key: "primary", label: "主筛选", options: ["全部", "主线人物", "六国诸侯", "朝堂人物", "戏棚人物", "关键线索", "隐藏线索"] },
    { key: "camp", label: "阵营", options: ["全部", "合纵", "齐", "楚", "燕", "韩", "赵", "魏", "朝堂", "戏棚", "中立"] },
    { key: "operaRef", label: "行当参考", options: ["全部", "正生", "文武生", "大花面", "公脚", "黄门官", "武行", "旦角", "群像"] }
  ],
  object: [
    { key: "primary", label: "主筛选", options: ["全部", "关键线索", "隐藏线索", "声境碎片", "文书密信", "权谋信物", "戏曲道具"] }
  ],
  scene: [
    { key: "primary", label: "主筛选", options: ["全部", "戏曲空间", "朝堂仪式", "搜证空间", "户外空间"] },
    { key: "mode", label: "浏览模式", options: ["全部", "3D 场景", "360 全景"] }
  ]
};

export const defaultFilters = {
  character: { primary: "全部", camp: "全部", operaRef: "全部", advancedOpen: false },
  object: { primary: "全部" },
  scene: { primary: "全部", mode: "全部" }
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
  const readyModels = [...characterExhibits, ...objectExhibits, ...sceneExhibits, ...panoramaScenes].filter((item) => item.hasModel).length;
  return { characterCount, objectCount, sceneCount, readyModels };
}
