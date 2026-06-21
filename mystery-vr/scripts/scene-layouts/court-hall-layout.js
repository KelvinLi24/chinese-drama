export const COURT_HALL_LAYOUT = {
  sceneId: "court",
  rootScale: 14.75,
  rotationY: 0,
  floorOffset: 0,
  playerStart: {
    position: [0, 0, 10.8],
    rotationY: Math.PI,
    eyeHeight: 1.67
  },
  walkArea: {
    minX: -10.8,
    maxX: 10.8,
    minZ: -12.4,
    maxZ: 12.2
  },
  environmentShell: {
    paddingX: 8,
    paddingZ: 9,
    wallHeight: 11.2,
    ceilingHeight: 10.4,
    floorInset: 2.8,
    columnCountPerSide: 4
  },
  anchors: {
    mainDesk: {
      position: [0, 1.08, -0.95],
      size: [3.2, 0.24, 1.2],
      cloth: true
    },
    eastDesk: {
      position: [4.05, 1.02, 0.85],
      size: [2.2, 0.2, 1.08],
      cloth: true
    },
    westDesk: {
      position: [-4.2, 1.02, 0.8],
      size: [2.2, 0.2, 1.08],
      cloth: true
    },
    crownStand: {
      position: [5.5, 1.2, -2.1],
      size: [1.2, 0.92, 1.2],
      cloth: false
    },
    rearStand: {
      position: [0, 1.16, -4.75],
      size: [2.4, 0.22, 1.0],
      cloth: true
    }
  },
  npcs: {
    gongsunyan: {
      position: [3.1, 0, 5.3],
      rotationY: -2.68,
      floorSnap: true,
      interactionRadius: 3.5,
      lookAtPlayer: true,
      promptTitle: "???",
      promptSubtitle: "??? ? ??????"
    },
    chuhuiwang: {
      position: [-5.1, 0, -1.35],
      rotationY: 1.15,
      floorSnap: true,
      lookAtPlayer: false,
      interactable: false,
      promptTitle: "???",
      promptSubtitle: "????"
    },
    official: {
      position: [5.7, 0, -0.55],
      rotationY: -1.3,
      floorSnap: true,
      lookAtPlayer: false,
      interactable: false,
      promptTitle: "??",
      promptSubtitle: "?????"
    },
    guard: {
      position: [0.2, 0, -5.2],
      rotationY: 0,
      floorSnap: true,
      lookAtPlayer: false,
      interactable: false,
      promptTitle: "??",
      promptSubtitle: "????"
    }
  },
  evidence: {
    waxLetter: {
      anchor: "eastDesk",
      positionOffset: [0.34, 0.028, -0.02],
      rotation: [0.06, -0.86, 0.04],
      scale: 1,
      placement: "surface",
      interactionRadius: 2.2,
      promptTitle: "??????",
      actionLabel: "??",
      sourceLabel: "????",
      relatedCharacter: "???",
      isPrimaryTarget: true
    },
    seal: {
      anchor: "mainDesk",
      positionOffset: [-0.46, 0.03, -0.06],
      rotation: [0, 0.52, 0],
      scale: 0.92,
      placement: "surface",
      interactionRadius: 2.1,
      promptTitle: "??",
      actionLabel: "??",
      sourceLabel: "????",
      relatedCharacter: "???"
    },
    token: {
      anchor: "mainDesk",
      positionOffset: [0.52, 0.03, -0.02],
      rotation: [0, -0.44, 0],
      scale: 0.96,
      placement: "surface",
      interactionRadius: 2.1,
      promptTitle: "??????",
      actionLabel: "??",
      sourceLabel: "????",
      relatedCharacter: "??"
    },
    crown: {
      anchor: "crownStand",
      positionOffset: [0, 0.07, 0],
      rotation: [0, 0.42, 0],
      scale: 0.82,
      placement: "surface",
      interactionRadius: 2.2,
      promptTitle: "??",
      actionLabel: "??",
      sourceLabel: "???",
      relatedCharacter: "????"
    }
  },
  visibleEvidence: ["waxLetter", "seal", "token", "crown"],
  debugSelectionOrder: ["eastDesk", "mainDesk", "crownStand"]
};
