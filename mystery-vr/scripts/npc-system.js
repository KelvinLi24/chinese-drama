import * as THREE from 'three';
import {
  createFallbackMarker,
  findBestClip,
  logAnimationNames,
  normalizeToTargetHeight,
  sharedLoader,
  snapObjectToFloor
} from './game-engine.js';

function sanitizeAnimationClip(clip) {
  const tracks = (clip.tracks ?? []).filter((track) => {
    const name = track.name?.toLowerCase?.() ?? '';
    if (!name.endsWith('.position')) return true;
    return !(name.includes('root') || name.includes('hips') || name.includes('armature') || name.includes('mixamorighips'));
  });
  if (tracks.length === (clip.tracks ?? []).length) return clip;
  const clone = clip.clone();
  clone.tracks = tracks;
  clone.resetDuration();
  return clone;
}

export async function createCharacterActor({ manifest, engine, fallbackColor }) {
  const loadCharacter = async (path) => {
    const gltf = await sharedLoader.loadAsync(path);
    const root = gltf.scene;
    root.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow = false;
      child.receiveShadow = false;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        if (material.map) material.map.colorSpace = THREE.SRGBColorSpace;
      });
    });

    normalizeToTargetHeight(root, manifest.targetHeight ?? 1.75, manifest.scaleCorrection ?? 1);
    const sanitizedAnimations = (gltf.animations ?? []).map((clip) => sanitizeAnimationClip(clip));
    const mixer = sanitizedAnimations.length ? new THREE.AnimationMixer(root) : null;
    const animationNames = logAnimationNames(manifest.title, sanitizedAnimations);
    const actions = {};

    if (mixer) {
      const actionPairs = [
        ['idle', manifest.animationCandidates?.idle ?? []],
        ['walk', manifest.animationCandidates?.walk ?? []],
        ['run', manifest.animationCandidates?.run ?? []],
        ['talk', manifest.animationCandidates?.talk ?? []]
      ];
      actionPairs.forEach(([key, candidates]) => {
        const clip = findBestClip(sanitizedAnimations, candidates);
        if (clip) actions[key] = mixer.clipAction(clip);
      });
      engine.addMixer(mixer);
    }

    return { root, mixer, actions, animationNames, currentAction: null };
  };

  try {
    return await loadCharacter(manifest.path);
  } catch (error) {
    if (manifest.fallbackPath) {
      console.warn(`[角色回退加载] ${manifest.title}`, error);
      try {
        return await loadCharacter(manifest.fallbackPath);
      } catch (fallbackError) {
        console.warn(`[角色回退失败] ${manifest.title}`, fallbackError);
      }
    } else {
      console.warn(`[角色加载失败] ${manifest.title}`, error);
    }
  }

  return {
    root: createFallbackMarker({ label: `${manifest?.title ?? '角色'}占位`, color: fallbackColor ?? '#8d2421' }),
    mixer: null,
    actions: {},
    animationNames: [],
    currentAction: null
  };
}

export class NPCSystem {
  constructor({ engine, manifest, interactionSystem, onNpcInteract, getProgress }) {
    this.engine = engine;
    this.manifest = manifest;
    this.interactionSystem = interactionSystem;
    this.onNpcInteract = onNpcInteract;
    this.getProgress = getProgress;
    this.spawnedNPCs = [];
    this.actorMap = new Map();
  }

  async loadSceneNPCs(sceneId, sceneLayout = {}, canSpawn = () => true) {
    if (!canSpawn()) return;
    this.clear();
    const layout = sceneLayout?.npcs ?? [];
    const tasks = layout.map(async (npcLayout) => {
      if (!canSpawn()) return;
      const manifest = this.manifest.characters[npcLayout.characterId];
      if (!manifest) return;
      const actor = await createCharacterActor({ manifest, engine: this.engine, fallbackColor: '#7f3b2c' });
      if (!canSpawn()) return;

      actor.root.position.set(...npcLayout.position);
      actor.root.rotation.y = npcLayout.rotationY ?? 0;
      actor.root.scale.multiplyScalar(npcLayout.scale ?? 1);
      if (npcLayout.floorSnap !== false) {
        snapObjectToFloor(actor.root, {
          sceneColliders: this.engine.sceneColliders,
          offsetY: 0.01,
          rayStartHeight: 12,
          maxRise: 2.2,
          maxDrop: 14,
          prefer: 'highest'
        });
      }

      actor.root.userData.npcId = npcLayout.id;
      actor.root.userData.lookAtPlayer = Boolean(npcLayout.lookAtPlayer);
      actor.root.userData.focusHeight = manifest.targetHeight ?? 1.75;
      actor.root.userData.actions = actor.actions;
      this.#playActorAction(actor, 'idle', true);

      this.engine.addWorldObject(actor.root);
      this.spawnedNPCs.push({ sceneId, definition: npcLayout, actor });
      this.actorMap.set(npcLayout.id, actor);

      if (npcLayout.interactable === false) return;
      this.interactionSystem.register({
        id: npcLayout.id,
        sceneId,
        object3D: actor.root,
        type: 'npc',
        displayName: npcLayout.displayName ?? manifest.title,
        promptTitle: npcLayout.displayName ?? manifest.title,
        promptSubtitle: npcLayout.subtitle ?? manifest.role,
        subtitle: npcLayout.subtitle ?? manifest.role,
        actionLabel: '交谈',
        interactionRange: npcLayout.interactionRadius ?? 3.2,
        canInteract: () => this.#checkNpcAvailability(npcLayout),
        enabled: () => npcLayout.interactable !== false,
        isVisible: () => this.#isNpcVisible(npcLayout),
        focusHeight: (manifest.targetHeight ?? 1.75) + 0.18,
        onInteract: () => this.onNpcInteract?.(npcLayout, actor)
      });
    });

    await Promise.all(tasks);
  }

  update(playerPosition, delta) {
    if (!playerPosition) return;
    this.spawnedNPCs.forEach(({ definition, actor }) => {
      if (!definition.lookAtPlayer) return;
      const target = playerPosition.clone();
      target.y = actor.root.position.y;
      const direction = target.sub(actor.root.position);
      if (direction.lengthSq() < 0.01) return;
      const desired = Math.atan2(direction.x, direction.z);
      actor.root.rotation.y = THREE.MathUtils.lerp(actor.root.rotation.y, desired, Math.min(delta * 1.8, 0.12));
    });
  }

  setTalkState(npcId, active) {
    const actor = this.actorMap.get(npcId);
    if (!actor) return;
    this.#playActorAction(actor, active ? 'talk' : 'idle');
  }

  resetTalkStates() {
    this.actorMap.forEach((actor) => this.#playActorAction(actor, 'idle'));
  }

  clear() {
    this.spawnedNPCs.forEach(({ definition, actor }) => {
      this.interactionSystem.unregister(definition.id);
      this.engine.removeWorldObject(actor.root);
    });
    this.spawnedNPCs = [];
    this.actorMap.clear();
  }

  #checkNpcAvailability(npcLayout) {
    const progress = this.getProgress?.();
    const requiredFlags = npcLayout.requiredFlags ?? [];
    const missing = requiredFlags.find((flag) => !progress?.flags?.has(flag));
    if (missing) return { ok: false, reason: '剧情尚未推进到这里' };
    return { ok: true, reason: '' };
  }

  #isNpcVisible(npcLayout) {
    const progress = this.getProgress?.();
    const hiddenUntilFlags = npcLayout.hiddenUntilFlags ?? [];
    if (!hiddenUntilFlags.length) return true;
    return hiddenUntilFlags.every((flag) => progress?.flags?.has(flag));
  }

  #playActorAction(actor, actionKey, immediate = false) {
    if (!actor?.actions) return;
    const actions = actor.actions;
    const nextAction = actions[actionKey] ?? (actionKey === 'idle' ? null : actions.idle ?? actions.walk ?? null);

    Object.values(actions).forEach((action) => {
      if (!action) return;
      if (nextAction && action === nextAction) return;
      action.fadeOut(immediate ? 0.01 : 0.18);
      if (actionKey === 'idle' && !actions.idle && action === actions.walk) {
        action.stop();
      }
    });

    if (!nextAction) return;
    if (actor.currentAction === nextAction) return;
    nextAction.reset();
    nextAction.enabled = true;
    nextAction.fadeIn(immediate ? 0.01 : 0.18).play();
    actor.currentAction = nextAction;
  }
}

