import { MODEL_CALIBRATION } from './model-calibration.js';

const resolveAsset = (relativePath) => new URL(relativePath, import.meta.url).href;

const scene = (id, title, assetBase, config, extras = {}) => ({
  id,
  title,
  path: resolveAsset(`../../assets/scenes/${assetBase}.glb`),
  preview: resolveAsset(`../../assets/scenes/${assetBase}.png`),
  panorama: extras.panorama === false ? '' : resolveAsset(`../../assets/scenes/${extras.panoramaName ?? `${assetBase}360`}.png`),
  rootScale: config.sceneRootScale,
  floorOffset: config.floorOffset,
  rotationY: extras.rotationY ?? 0,
  cameraHeight: config.playerEyeHeight,
  playerStart: config.playerStart,
  playerRotationY: config.playerFacing,
  playerVisualScale: config.playerVisualScale ?? 1,
  characterScaleMultiplier: config.characterScaleMultiplier ?? 1,
  propScaleMultiplier: config.propScaleMultiplier ?? 1,
  propHeightMultiplier: config.propHeightMultiplier ?? 1,
  walkArea: config.walkArea,
  loadCopy: extras.loadCopy,
  ambience: extras.ambience ?? title,
  unlockedByDefault: extras.unlockedByDefault ?? false,
  kind: extras.kind ?? 'scene'
});

export const VIDEO_REGISTRY = {
  prologue: {
    id: 'prologue-video',
    title: '序章影片',
    path: resolveAsset('../../assets/videos/序章影片.mp4')
  },
  ending: {
    id: 'ending-video',
    title: '终章影片',
    path: '',
    expectedPath: 'mystery-vr/assets/videos/终章影片.mp4'
  }
};

export const SCENE_REGISTRY = {
  prologue: scene('prologue', '序章粤剧剧场', '序章粤剧剧场', MODEL_CALIBRATION.scenes.prologue, {
    panoramaName: '序章粤剧剧场360',
    loadCopy: '正在调入序章粤剧剧场……',
    unlockedByDefault: true,
    kind: 'hub'
  }),
  stage: scene('stage', '粤剧戏棚', '粤剧戏棚', MODEL_CALIBRATION.scenes.stage, {
    panoramaName: '粤剧戏棚360',
    loadCopy: '正在调入粤剧戏棚终章演出……',
    kind: 'epilogue'
  }),
  court: scene('court', '封相朝堂', '封相朝堂', MODEL_CALIBRATION.scenes.court, {
    panoramaName: '封相朝堂360',
    loadCopy: '正在重构封相朝堂的礼制声境……',
    kind: 'investigation'
  }),
  courtyard: scene('courtyard', '院子', '院子', MODEL_CALIBRATION.scenes.courtyard, {
    panorama: false,
    loadCopy: '正在调入院子与回廊暗线……',
    kind: 'tracking'
  }),
  study: scene('study', '书房密室', '书房密室', MODEL_CALIBRATION.scenes.study, {
    panoramaName: '书房密室360',
    loadCopy: '正在调入书房密室与文书机关……',
    kind: 'puzzle'
  })
};

export const FORMAL_SCENE_IDS = ['prologue', 'court', 'courtyard', 'study', 'stage'];
