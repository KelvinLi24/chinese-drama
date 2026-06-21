import * as THREE from "three";
import {
  createFallbackMarker,
  findBestClip,
  logAnimationNames,
  normalizeToTargetHeight,
  sharedLoader,
  snapObjectToFloor
} from "./game-engine.js";

export async function createCharacterActor({ manifest, engine, fallbackColor }) {
  if (!manifest?.path) {
    return {
      root: createFallbackMarker({ label: manifest?.title ?? "占位角色", color: fallbackColor }),
      mixer: null,
      actions: {},
      animationNames: []
    };
  }

  try {
    const gltf = await sharedLoader.loadAsync(manifest.path);
    const root = gltf.scene;
    root.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = false;
        if (child.material?.map) child.material.map.colorSpace = THREE.SRGBColorSpace;
      }
    });
    const normalized = normalizeToTargetHeight(root, manifest.targetHeight ?? 1.75, manifest.scaleCorrection ?? 1);
    const mixer = gltf.animations.length ? new THREE.AnimationMixer(root) : null;
    const animationNames = logAnimationNames(manifest.title, gltf.animations);
    const actions = {};
    if (mixer) {
      const pairs = [
        ["idle", manifest.animationCandidates?.idle ?? []],
        ["walk", manifest.animationCandidates?.walk ?? []],
        ["run", manifest.animationCandidates?.run ?? []],
        ["talk", manifest.animationCandidates?.talk ?? []]
      ];
      pairs.forEach(([key, candidates]) => {
        const clip = findBestClip(gltf.animations, candidates);
        if (clip) actions[key] = mixer.clipAction(clip);
      });
      actions.idle?.reset().fadeIn(0.2).play();
      engine.addMixer(mixer);
    }

    return { root, mixer, actions, animationNames };
  } catch (error) {
    console.warn(`[角色加载失败] ${manifest.title}`, error);
    return {
      root: createFallbackMarker({ label: `${manifest.title} 占位`, color: fallbackColor ?? "#8d2421" }),
      mixer: null,
      actions: {},
      animationNames: []
    };
  }
}

export class NPCSystem {
  constructor({ engine, manifest, story, interactionSystem, ui }) {
    this.engine = engine;
    this.manifest = manifest;
    this.story = story;
    this.interactionSystem = interactionSystem;
    this.ui = ui;
    this.spawnedNPCs = [];
  }

  async loadSceneNPCs(sceneId, sceneConfig = {}) {
    this.clear();
    const layout = sceneConfig.layout?.npcs ?? this.manifest.sceneLayout[sceneId]?.npcs;
    if (!layout) return;

    const npcEntries = Array.isArray(layout)
      ? layout.map((entry) => [entry.id, entry])
      : Object.entries(layout);

    for (const [npcId, npcLayout] of npcEntries) {
      const manifest = this.manifest.characters[npcId];
      if (!manifest) continue;
      const actor = await createCharacterActor({
        manifest,
        engine: this.engine,
        fallbackColor: "#7f3b2c"
      });

      actor.root.position.set(...npcLayout.position);
      actor.root.rotation.y = npcLayout.rotationY ?? 0;
      actor.root.scale.multiplyScalar(npcLayout.scale ?? 1);
      if (npcLayout.floorSnap !== false) {
        snapObjectToFloor(actor.root, {
          sceneColliders: this.engine.sceneColliders,
          offsetY: 0.01,
          rayStartHeight: 10,
          maxRise: 2.2,
          maxDrop: 10,
          prefer: "highest"
        });
      }

      actor.root.userData.interactable = npcLayout.interactable !== false;
      actor.root.userData.interactionType = "npc";
      actor.root.userData.interactionTitle = npcLayout.promptTitle ?? manifest.title;
      actor.root.userData.interactionSubtitle = npcLayout.promptSubtitle ?? manifest.role;
      actor.root.userData.actionLabel = actor.root.userData.interactable ? "交谈" : "观察";
      actor.root.userData.actor = actor;
      actor.root.userData.npcId = npcId;
      actor.root.userData.lookAtPlayer = Boolean(npcLayout.lookAtPlayer);
      actor.root.userData.focusHeight = (manifest.targetHeight ?? 1.72) + 0.22;

      const dialogueKey = manifest.dialogueTree;
      if (actor.root.userData.interactable) {
        this.interactionSystem.register({
          id: `npc-${npcId}`,
          object: actor.root,
          type: "npc",
          radius: npcLayout.interactionRadius ?? 3.2,
          promptTitle: npcLayout.promptTitle ?? manifest.title,
          promptSubtitle: npcLayout.promptSubtitle ?? manifest.role,
          actionLabel: "交谈",
          onInteract: () => this.startDialogue(dialogueKey)
        });
      }

      this.engine.addWorldObject(actor.root);
      this.spawnedNPCs.push(actor);
    }
  }

  update(playerPosition, delta) {
    if (!playerPosition) return;
    this.spawnedNPCs.forEach((actor) => {
      if (!actor?.root?.userData?.lookAtPlayer) return;
      const target = playerPosition.clone();
      target.y = actor.root.position.y;
      const direction = target.sub(actor.root.position);
      const desired = Math.atan2(direction.x, direction.z);
      actor.root.rotation.y = THREE.MathUtils.lerp(actor.root.rotation.y, desired, Math.min(delta * 1.8, 0.12));
    });
  }

  startDialogue(dialogueKey) {
    const dialogue = this.story.dialogue[dialogueKey];
    if (!dialogue) return;
    this.ui.openDialogue(dialogue);
  }

  clear() {
    this.spawnedNPCs.forEach((actor) => {
      this.interactionSystem.unregisterByObject(actor.root);
      this.engine.removeWorldObject(actor.root);
    });
    this.spawnedNPCs = [];
  }
}
