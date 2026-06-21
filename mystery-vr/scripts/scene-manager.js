import * as THREE from 'three';
import {
  collectSceneColliders,
  createFallbackMarker,
  disposeHierarchy,
  getObjectBounds,
  normalizeToTargetHeight,
  sharedLoader,
  snapObjectToFloor
} from './game-engine.js';

const WOOD = '#432017';
const RED = '#6a1f1b';
const GOLD = '#d4a965';

function createMaterial(color, roughness = 0.8, metalness = 0.06, emissive = 0.06) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness,
    emissive: new THREE.Color(color).multiplyScalar(emissive)
  });
}

export class SceneManager {
  constructor({
    engine,
    manifest,
    interactionSystem,
    inventorySystem,
    npcSystem,
    audioSystem,
    ui,
    progress,
    onPropInteract,
    onExitInteract,
    onSceneReady
  }) {
    this.engine = engine;
    this.manifest = manifest;
    this.interactionSystem = interactionSystem;
    this.inventorySystem = inventorySystem;
    this.npcSystem = npcSystem;
    this.audioSystem = audioSystem;
    this.ui = ui;
    this.progress = progress;
    this.onPropInteract = onPropInteract;
    this.onExitInteract = onExitInteract;
    this.onSceneReady = onSceneReady;

    this.currentSceneId = '';
    this.currentSceneConfig = null;
    this.currentGroup = null;
    this.anchorMap = new Map();
    this.debugAnchors = [];
    this.spawnedEntries = [];
    this.sceneLoadToken = 0;
  }

  async loadScene(sceneId) {
    const sceneConfig = this.manifest.scenes[sceneId];
    if (!sceneConfig) throw new Error(`未找到场景配置：${sceneId}`);

    const loadToken = ++this.sceneLoadToken;
    this.currentSceneId = sceneId;
    this.currentSceneConfig = sceneConfig;
    this.ui.showLoading(sceneConfig.loadCopy);

    this.#clearRuntimeScene();
    this.anchorMap.clear();
    this.debugAnchors = [];

    const nextGroup = new THREE.Group();
    let sceneRoot = null;
    let colliders = [];

    try {
      const gltf = await sharedLoader.loadAsync(sceneConfig.path, (event) => {
        if (!event.total) return;
        const percent = Math.round((event.loaded / event.total) * 100);
        this.ui.showLoading(`${sceneConfig.loadCopy} ${percent}%`);
      });

      sceneRoot = gltf.scene;
      this.#prepareSceneMaterials(sceneRoot);
      sceneRoot.scale.setScalar(sceneConfig.rootScale ?? 1);
      sceneRoot.rotation.y = sceneConfig.rotationY ?? 0;
      sceneRoot.updateMatrixWorld(true);

      const initial = getObjectBounds(sceneRoot);
      sceneRoot.position.x -= initial.center.x;
      sceneRoot.position.z -= initial.center.z;
      sceneRoot.position.y -= initial.box.min.y - (sceneConfig.floorOffset ?? 0);
      sceneRoot.updateMatrixWorld(true);

      const bounds = getObjectBounds(sceneRoot);
      nextGroup.add(sceneRoot);

      const shell = this.#buildSceneShell(sceneConfig, bounds);
      nextGroup.add(shell.group);
      colliders = [...collectSceneColliders(sceneRoot), ...shell.colliders];

      Object.entries(sceneConfig.layout?.anchors ?? {}).forEach(([anchorId, anchorDef]) => {
        const anchorObject = new THREE.Group();
        anchorObject.position.set(...anchorDef.position);
        anchorObject.userData.anchorId = anchorId;
        nextGroup.add(anchorObject);
        this.anchorMap.set(anchorId, anchorObject);

        const marker = new THREE.Mesh(
          new THREE.SphereGeometry(0.1, 12, 12),
          new THREE.MeshBasicMaterial({ color: GOLD })
        );
        marker.position.copy(anchorObject.position).add(new THREE.Vector3(0, 0.2, 0));
        marker.visible = false;
        nextGroup.add(marker);
        this.debugAnchors.push({ name: anchorId, object: anchorObject, marker });
      });

      this.engine.setSceneColliders(colliders);
      this.engine.setSceneMetrics({
        sceneId,
        title: sceneConfig.title,
        width: Number(bounds.size.x.toFixed(3)),
        height: Number(bounds.size.y.toFixed(3)),
        depth: Number(bounds.size.z.toFixed(3)),
        rootScale: sceneConfig.rootScale ?? 1,
        floorOffset: sceneConfig.floorOffset ?? 0,
        playerStart: sceneConfig.playerStart
      });

      console.log(`[场景包围盒] ${sceneConfig.title}`, {
        width: Number(bounds.size.x.toFixed(3)),
        height: Number(bounds.size.y.toFixed(3)),
        depth: Number(bounds.size.z.toFixed(3)),
        rootScale: sceneConfig.rootScale ?? 1,
        floorOffset: sceneConfig.floorOffset ?? 0,
        playerStart: sceneConfig.playerStart
      });
    } catch (error) {
      console.error(`[场景加载失败] ${sceneConfig.title}`, error);
      nextGroup.add(createFallbackMarker({ label: `${sceneConfig.title} 占位`, color: '#8d2421', radius: 0.7, height: 1.6 }));
      colliders = collectSceneColliders(nextGroup);
      this.engine.setSceneColliders(colliders);
      this.ui.showError(`场景加载失败：${sceneConfig.title}`, `资源路径：${sceneConfig.path}`);
    }
    this.currentGroup = nextGroup;
    this.engine.addWorldObject(nextGroup);
    this.audioSystem.setSceneAmbience(sceneConfig.ambience);
    this.ui.setCurrentScene(sceneConfig.title);
    this.ui.hideLoading();

    Promise.all([
      this.#spawnSceneEntries(sceneId, sceneConfig, loadToken),
      this.npcSystem.loadSceneNPCs(sceneId, sceneConfig.layout, () => loadToken === this.sceneLoadToken)
    ])
      .then(() => {
        if (loadToken !== this.sceneLoadToken) return;
        this.refreshDynamicState();
        this.onSceneReady?.(sceneId, sceneConfig);
      })
      .catch((error) => {
        console.error('[scene populate failed]', sceneConfig.title, error);
      });

    if (loadToken !== this.sceneLoadToken) return sceneConfig;
    return sceneConfig;
  }

  refreshDynamicState() {
    this.spawnedEntries.forEach((entry) => {
      const visible = this.#isDefinitionVisible(entry.definition);
      entry.object.visible = visible;
      if (entry.definition.collectable && this.progress.collectedClues.has(entry.definition.clueId)) {
        this.#markObjectAsInvestigated(entry.object);
      }
    });
  }

  setDebugEnabled(enabled) {
    this.debugAnchors.forEach(({ marker }) => {
      marker.visible = enabled;
    });
  }

  getDebugAnchors() {
    return this.debugAnchors.map(({ name, object }) => ({
      name,
      position: object.getWorldPosition(new THREE.Vector3())
    }));
  }

  #clearRuntimeScene() {
    if (this.currentSceneId) this.interactionSystem.clearScene(this.currentSceneId);
    this.npcSystem.clear();
    this.spawnedEntries.forEach((entry) => {
      this.engine.removeWorldObject(entry.object);
      disposeHierarchy(entry.object);
    });
    this.spawnedEntries = [];

    if (this.currentGroup) {
      this.engine.removeWorldObject(this.currentGroup);
      disposeHierarchy(this.currentGroup);
      this.currentGroup = null;
    }
  }

  async #spawnSceneEntries(sceneId, sceneConfig, loadToken = this.sceneLoadToken) {
    const propTasks = (sceneConfig.layout?.props ?? []).map(async (propDef) => {
      if (loadToken !== this.sceneLoadToken) return;
      const manifest = this.manifest.props[propDef.propId];
      let object = null;
      if (manifest?.path) {
        try {
          const gltf = await sharedLoader.loadAsync(manifest.path);
          object = gltf.scene;
          normalizeToTargetHeight(object, manifest.targetHeight ?? 0.28, propDef.scale ?? 1);
        } catch (error) {
          console.warn(`[道具加载失败] ${propDef.title}`, error);
        }
      }
      if (!object) {
        object = createFallbackMarker({ label: propDef.title, color: '#d8ab63', radius: 0.14, height: 0.22 });
      }

      if (loadToken !== this.sceneLoadToken) return;
      this.#placeObjectByDefinition(object, propDef);
      this.engine.addWorldObject(object);
      this.spawnedEntries.push({ type: 'prop', definition: propDef, object });

      if (propDef.interactive !== false) {
        this.interactionSystem.register({
          id: propDef.id,
          sceneId,
          object3D: object,
          type: 'prop',
          displayName: propDef.title,
          promptTitle: propDef.promptTitle ?? propDef.title,
          promptSubtitle: propDef.promptSubtitle ?? manifest?.category ?? '',
          subtitle: propDef.promptSubtitle ?? manifest?.category ?? '',
          actionLabel: propDef.actionLabel ?? '调查',
          interactionRange: propDef.interactionRadius ?? 2.2,
          canInteract: () => this.#checkDefinitionInteractable(propDef),
          isVisible: () => this.#isDefinitionVisible(propDef),
          focusHeight: 0.42,
          onInteract: () => this.onPropInteract?.(propDef, manifest, object)
        });
      }
    });

    await Promise.all(propTasks);

    for (const exitDef of sceneConfig.layout?.exits ?? []) {
      if (loadToken !== this.sceneLoadToken) return;
      const portal = this.#createPortalMarker(exitDef);
      this.engine.addWorldObject(portal);
      this.spawnedEntries.push({ type: 'exit', definition: exitDef, object: portal });
      this.interactionSystem.register({
        id: exitDef.id,
        sceneId,
        object3D: portal,
        type: 'exit',
        displayName: exitDef.displayName,
        promptTitle: exitDef.promptTitle,
        promptSubtitle: exitDef.promptSubtitle,
        subtitle: exitDef.promptSubtitle,
        actionLabel: exitDef.actionLabel ?? '进入',
        interactionRange: exitDef.interactionRadius ?? 3,
        canInteract: () => this.#checkDefinitionInteractable(exitDef),
        isVisible: () => this.#isDefinitionVisible(exitDef),
        focusHeight: 2,
        onInteract: () => this.onExitInteract?.(exitDef)
      });
    }
  }

  #prepareSceneMaterials(root) {
    root.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow = false;
      child.receiveShadow = false;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        if (material.map) material.map.colorSpace = THREE.SRGBColorSpace;
        material.envMapIntensity = 0.42;
      });
    });
  }

  #buildSceneShell(sceneConfig, bounds) {
    const group = new THREE.Group();
    const colliders = [];
    const width = bounds.size.x + 10;
    const depth = bounds.size.z + 10;
    const height = Math.max(bounds.size.y + 5, 10.5);

    const floorColor = sceneConfig.kind === 'courtyard' ? '#3a1b14' : '#26110f';
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(width, 0.3, depth),
      createMaterial(floorColor, 0.92, 0.02, 0.03)
    );
    floor.position.set(0, -0.15, 0);
    group.add(floor);
    colliders.push(floor);

    if (sceneConfig.kind === 'courtyard') {
      const wallMaterial = createMaterial('#4a1f18', 0.86, 0.04, 0.08);
      const wallHeight = height * 0.78;
      const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, wallHeight, depth), wallMaterial);
      const rightWall = leftWall.clone();
      const backWall = new THREE.Mesh(new THREE.BoxGeometry(width, wallHeight, 0.4), wallMaterial);
      leftWall.position.set(-(width / 2), wallHeight / 2 - 0.1, 0);
      rightWall.position.set(width / 2, wallHeight / 2 - 0.1, 0);
      backWall.position.set(0, wallHeight / 2 - 0.1, -(depth / 2));
      group.add(leftWall, rightWall, backWall);
      colliders.push(leftWall, rightWall, backWall);
    } else {
      const wallMaterial = createMaterial(sceneConfig.kind === 'stage' || sceneConfig.kind === 'hub' ? '#511b18' : '#341613', 0.86, 0.04, 0.08);
      const sideWall = new THREE.Mesh(new THREE.BoxGeometry(0.42, height, depth), wallMaterial);
      const rightWall = sideWall.clone();
      const backWall = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.42), wallMaterial);
      const ceiling = new THREE.Mesh(new THREE.BoxGeometry(width, 0.28, depth), createMaterial('#210d0c', 0.94, 0.02, 0.02));
      sideWall.position.set(-(width / 2), height / 2 - 0.1, 0);
      rightWall.position.set(width / 2, height / 2 - 0.1, 0);
      backWall.position.set(0, height / 2 - 0.1, -(depth / 2));
      ceiling.position.set(0, height - 0.2, 0);
      group.add(sideWall, rightWall, backWall, ceiling);
      colliders.push(sideWall, rightWall, backWall, ceiling);

      if (sceneConfig.kind === 'stage' || sceneConfig.kind === 'hub') {
        const curtain = new THREE.Mesh(
          new THREE.PlaneGeometry(width * 0.76, height * 0.72),
          new THREE.MeshStandardMaterial({
            color: RED,
            roughness: 0.94,
            metalness: 0.02,
            emissive: new THREE.Color(RED).multiplyScalar(0.15),
            side: THREE.DoubleSide
          })
        );
        curtain.position.set(0, height * 0.46, -(depth / 2) + 0.5);
        group.add(curtain);
      }
    }

    if (sceneConfig.kind === 'court') {
      const carpet = new THREE.Mesh(
        new THREE.BoxGeometry(width * 0.24, 0.05, depth * 0.72),
        new THREE.MeshStandardMaterial({
          color: '#781916',
          roughness: 0.9,
          metalness: 0.02,
          emissive: new THREE.Color('#56110f').multiplyScalar(0.12)
        })
      );
      carpet.position.set(0, 0.02, 0.8);
      group.add(carpet);
      colliders.push(carpet);
    }

    const lightPositions = sceneConfig.kind === 'courtyard'
      ? [[-3.2, 3.2, 2.4], [3.2, 3.2, -1.2]]
      : [[-4.5, 4.2, 2.8], [4.5, 4.2, 2.8], [-3.2, 4.8, -2.6], [3.2, 4.8, -2.6]];
    lightPositions.forEach((position) => {
      const light = new THREE.PointLight('#ffcd87', 1.1, 14, 2.2);
      light.position.set(...position);
      group.add(light);
      const globe = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 14), new THREE.MeshBasicMaterial({ color: '#f5c778' }));
      globe.position.copy(light.position);
      group.add(globe);
    });

    return { group, colliders };
  }

  #placeObjectByDefinition(object, definition) {
    const anchorObject = definition.anchor ? this.anchorMap.get(definition.anchor) : null;
    if (anchorObject) {
      object.position.copy(anchorObject.getWorldPosition(new THREE.Vector3()));
    } else if (definition.position) {
      object.position.set(...definition.position);
    }

    if (definition.rotation) object.rotation.set(...definition.rotation);
    if (typeof definition.rotationY === 'number') object.rotation.y = definition.rotationY;

    if (definition.placement === 'floor') {
      snapObjectToFloor(object, {
        sceneColliders: this.engine.sceneColliders,
        offsetY: 0.012,
        rayStartHeight: 14,
        maxRise: 1.4,
        maxDrop: 14,
        prefer: 'highest'
      });
    }

    if (definition.placement === 'surface') {
      object.position.y += 0.02;
    }

    if (definition.placement === 'hover') {
      object.position.y += 0.22;
    }
  }

  #createPortalMarker(exitDef) {
    const portal = new THREE.Group();
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.72, 0.05, 16, 42),
      new THREE.MeshStandardMaterial({
        color: '#b98a4b',
        roughness: 0.42,
        metalness: 0.38,
        emissive: new THREE.Color('#7b3b18').multiplyScalar(0.24)
      })
    );
    ring.rotation.x = Math.PI / 2;
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.5, 18), createMaterial(RED, 0.72, 0.08, 0.12));
    pillar.position.y = 0.75;
    portal.add(ring, pillar);
    portal.position.set(...exitDef.position);
    portal.rotation.y = exitDef.rotationY ?? 0;
    return portal;
  }

  #checkDefinitionInteractable(definition) {
    const requiredFlags = definition.requiredFlags ?? [];
    const missingFlag = requiredFlags.find((flag) => !this.progress.flags.has(flag));
    if (missingFlag) return { ok: false, reason: '该线索尚未满足调查条件' };

    if (definition.collectable && definition.clueId && this.progress.collectedClues.has(definition.clueId)) {
      return { ok: false, reason: '该线索已调查' };
    }

    return { ok: true, reason: '' };
  }

  #isDefinitionVisible(definition) {
    const hiddenUntilFlags = definition.hiddenUntilFlags ?? [];
    if (!hiddenUntilFlags.length) return true;
    return hiddenUntilFlags.every((flag) => this.progress.flags.has(flag));
  }

  #markObjectAsInvestigated(object) {
    object.traverse((child) => {
      if (!child.isMesh || !child.material) return;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        material.transparent = true;
        material.opacity = 0.72;
        if (material.emissive) {
          material.emissive.set('#2b140e');
          material.emissiveIntensity = 0.1;
        }
      });
    });
  }
}





