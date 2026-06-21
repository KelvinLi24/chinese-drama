export const MODEL_CALIBRATION = {
  scenes: {
    prologue: {
      sceneRootScale: 10.5,
      floorOffset: 0,
      playerEyeHeight: 1.68,
      playerStart: [0, 0, 1.85],
      playerFacing: Math.PI,
      playerVisualScale: 1,
      walkArea: { minX: -9.5, maxX: 9.5, minZ: -9.2, maxZ: 10.8 }
    },
    stage: {
      sceneRootScale: 8.9,
      floorOffset: 0,
      playerEyeHeight: 1.68,
      playerStart: [0, 0, 7.4],
      playerFacing: Math.PI,
      playerVisualScale: 1,
      walkArea: { minX: -7.4, maxX: 7.4, minZ: -7.4, maxZ: 8.4 }
    },
    court: {
      sceneRootScale: 14.75,
      floorOffset: 0,
      playerEyeHeight: 1.68,
      playerStart: [0, 0, 9.6],
      playerFacing: Math.PI,
      playerVisualScale: 1.28,
      walkArea: { minX: -11.4, maxX: 11.4, minZ: -12.8, maxZ: 12.4 }
    },
    courtyard: {
      sceneRootScale: 9.6,
      floorOffset: 0,
      playerEyeHeight: 1.68,
      playerStart: [0, 0, 5.8],
      playerFacing: Math.PI,
      playerVisualScale: 1.08,
      walkArea: { minX: -8.2, maxX: 8.2, minZ: -8.2, maxZ: 8.6 }
    },
    study: {
      sceneRootScale: 8.4,
      floorOffset: 0,
      playerEyeHeight: 1.68,
      playerStart: [0, 0, 4.9],
      playerFacing: Math.PI,
      playerVisualScale: 1.06,
      walkArea: { minX: -6.2, maxX: 6.2, minZ: -6.4, maxZ: 6.4 }
    }
  },
  player: {
    targetHeight: 1.78,
    modelForwardOffsetY: 0,
    speed: 2.8,
    runMultiplier: 1.62,
    turnSpeed: 8.4,
    jumpVelocity: 5.5,
    highJumpVelocity: 8.5,
    doubleTapWindow: 280,
    gravity: 18,
    thirdPersonDistance: 4.6,
    thirdPersonHeight: 2.1,
    thirdPersonLookHeight: 1.34
  },
  characters: {
    default: 1.74,
    npc: 1.72,
    performer: 1.7,
    gongsunyan: 1.76,
    lianghuiwang: 1.8,
    chuhuiwang: 1.82,
    qizhuangwang: 1.8,
    zhaolord: 1.8,
    hanlord: 1.8,
    yanlord: 1.8,
    official: 1.72,
    guard: 1.78
  },
  props: {
    token: 0.52,
    seal: 0.42,
    crown: 0.68,
    pattern: 0.26,
    jade: 0.26,
    waxLetter: 0.32,
    warringLetter: 0.34,
    clueBox: 0.42,
    key: 0.2,
    fan: 0.36,
    vocalShard: 0.22,
    drumShard: 0.22,
    archiveFragment: 0.32
  }
};
