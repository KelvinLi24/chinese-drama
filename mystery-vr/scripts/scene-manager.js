import * as THREE from 'three';
import {
  collectSceneColliders,
  createFallbackMarker,
  disposeHierarchy,
  getObjectBounds,
  normalizeToTargetHeight,
  sampleFloorPoint,
  sharedLoader,
  snapObjectToFloor,
  liftVisualModelToAnchor
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
    loadCoordinator,
    worldCollisionSystem,
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
    this.loadCoordinator = loadCoordinator;
    this.worldCollisionSystem = worldCollisionSystem;
    this.onPropInteract = onPropInteract;
    this.onExitInteract = onExitInteract;
    this.onSceneReady = onSceneReady;

    this.currentSceneId = '';
    this.currentSceneConfig = null;
    this.currentGroup = null;
    this.anchorMap = new Map();
    this.debugAnchors = [];
    this.spawnedEntries = [];
    this.placementDebug = [];
    this.sceneLoadToken = 0;
    this.pendingFinalizeSceneId = '';
  }

  async loadScene(sceneId) {
    const sceneConfig = this.manifest.scenes[sceneId];
    if (!sceneConfig) throw new Error(`未找到场景配置：${sceneId}`);

    const loadToken = ++this.sceneLoadToken;
    this.currentSceneId = sceneId;
    this.currentSceneConfig = sceneConfig;
    this.pendingFinalizeSceneId = sceneId;
    this.loadCoordinator.beginSceneLoad(sceneId, sceneConfig.title, sceneConfig.loadCopy);
    this.#registerLoadTasks(sceneConfig);

    this.#clearRuntimeScene();
    this.anchorMap.clear();
    this.debugAnchors = [];
    this.placementDebug = [];

    const nextGroup = new THREE.Group();
    let sceneRoot = null;
    let colliders = [];

    try {
      const gltf = await sharedLoader.loadAsync(sceneConfig.path, (event) => {
        this.loadCoordinator.updateTaskProgress('scene-glb', event.loaded ?? 0, event.total ?? null);
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
      this.loadCoordinator.completeTask('scene-glb');

      const bounds = getObjectBounds(sceneRoot);
      nextGroup.add(sceneRoot);

      const shell = this.#buildSceneShell(sceneConfig, bounds);
      nextGroup.add(shell.group);
      this.loadCoordinator.completeTask('scene-shell');

      colliders = [...collectSceneColliders(sceneRoot), ...shell.colliders];
      this.engine.setSceneColliders(colliders);
      this.loadCoordinator.completeTask('scene-colliders');

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
      this.loadCoordinator.completeTask('scene-layout');

      this.engine.setSceneMetrics({
        sceneId,
        title: sceneConfig.title,
        width: Number(bounds.size.x.toFixed(3)),
        height: Number(bounds.size.y.toFixed(3)),
        depth: Number(bounds.size.z.toFixed(3)),
        rootScale: sceneConfig.rootScale ?? 1,
        floorOffset: sceneConfig.floorOffset ?? 0,
        playerStart: sceneConfig.playerStart,
        playerEyeHeight: sceneConfig.cameraHeight,
        characterScaleMultiplier: sceneConfig.characterScaleMultiplier ?? 1,
        propScaleMultiplier: sceneConfig.propScaleMultiplier ?? 1
      });

      console.log(`[场景包围盒] ${sceneConfig.title}`, {
        width: Number(bounds.size.x.toFixed(3)),
        height: Number(bounds.size.y.toFixed(3)),
        depth: Number(bounds.size.z.toFixed(3)),
        rootScale: sceneConfig.rootScale ?? 1,
        floorOffset: sceneConfig.floorOffset ?? 0,
        playerStart: sceneConfig.playerStart,
        playerEyeHeight: sceneConfig.cameraHeight,
        characterScaleMultiplier: sceneConfig.characterScaleMultiplier ?? 1,
        propScaleMultiplier: sceneConfig.propScaleMultiplier ?? 1
      });
    } catch (error) {
      this.loadCoordinator.failTask('scene-glb', error);
      console.error(`[场景加载失败] ${sceneConfig.title}`, error);
      this.ui.showError(`场景加载失败：${sceneConfig.title}`, `资源路径：${sceneConfig.path}`);
      throw error;
    }

    this.currentGroup = nextGroup;
    this.engine.addWorldObject(nextGroup);
    this.audioSystem.setSceneAmbience(sceneConfig.ambience);
    this.ui.setCurrentScene(sceneConfig.title);

    try {
      await this.#spawnSceneEntries(sceneId, sceneConfig, loadToken);
      await this.npcSystem.loadSceneNPCs(
        sceneId,
        { ...sceneConfig.layout, sceneCharacterScaleMultiplier: sceneConfig.characterScaleMultiplier ?? 1 },
        () => loadToken === this.sceneLoadToken,
        (npcId) => this.loadCoordinator.completeTask(`npc:${npcId}`)
      );
      if (loadToken !== this.sceneLoadToken) return sceneConfig;
      this.loadCoordinator.completeTask('scene-interactions');
      this.refreshDynamicState();
      this.onSceneReady?.(sceneId, sceneConfig);
      return sceneConfig;
    } catch (error) {
      console.error('[场景布置失败]', sceneConfig.title, error);
      this.ui.showError(`场景布置失败：${sceneConfig.title}`, `人物、线索或互动资源未能正确初始化：${error?.message ?? String(error)}`);
      throw error;
    }
  }

  markPostLoadReady(taskId, detail = '') {
    this.loadCoordinator.completeTask(taskId);
    this.loadCoordinator.refresh(detail);
  }

  async finalizeSceneLoad(sceneId, readyCopy = '') {
    if (sceneId !== this.pendingFinalizeSceneId) return;
    this.loadCoordinator.completeTask('scene-first-frame');
    const snapshot = this.loadCoordinator.getSnapshot();
    if (!snapshot.isReady) {
      this.loadCoordinator.refresh(readyCopy || snapshot.activeTaskLabel);
      return;
    }
    this.loadCoordinator.refresh(readyCopy || `${this.currentSceneConfig?.title ?? '当前场景'}已就绪。`);
    this.ui.hideLoading();
    this.pendingFinalizeSceneId = '';
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

  getDebugPlacements() {
    return [...this.placementDebug];
  }

  #registerLoadTasks(sceneConfig) {
    this.loadCoordinator.registerTask({ id: 'scene-glb', label: `正在载入 ${sceneConfig.title} 场景主体……`, weight: 8, required: true, progressMode: 'bytes' });
    this.loadCoordinator.registerTask({ id: 'scene-shell', label: '正在补齐场景环境壳体……', weight: 1, required: true });
    this.loadCoordinator.registerTask({ id: 'scene-colliders', label: '正在初始化地面碰撞与行走区域……', weight: 1, required: true });
    this.loadCoordinator.registerTask({ id: 'scene-layout', label: '正在建立锚点与空间布局……', weight: 1, required: true });

    for (const prop of sceneConfig.layout?.props ?? []) {
      this.loadCoordinator.registerTask({ id: `prop:${prop.id}`, label: `正在布置“${prop.title}”……`, weight: 1, required: true, progressMode: 'bytes' });
    }
    for (const npc of sceneConfig.layout?.npcs ?? []) {
      this.loadCoordinator.registerTask({ id: `npc:${npc.id}`, label: `正在加载“${npc.displayName}”……`, weight: 1, required: true, progressMode: 'binary' });
    }

    this.loadCoordinator.registerTask({ id: 'scene-interactions', label: '正在注册调查、交谈与出口交互……', weight: 1, required: true });
    this.loadCoordinator.registerTask({ id: 'player-start', label: '正在校准玩家出生点与视角……', weight: 1, required: true });
    this.loadCoordinator.registerTask({ id: 'hud-ready', label: '正在同步目标、线索与 HUD……', weight: 1, required: true });
    this.loadCoordinator.registerTask({ id: 'scene-first-frame', label: '正在完成场景首帧渲染……', weight: 1, required: true });
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
      try {
        if (manifest?.path) {
          const gltf = await sharedLoader.loadAsync(manifest.path, (event) => {
            this.loadCoordinator.updateTaskProgress(`prop:${propDef.id}`, event.loaded ?? 0, event.total ?? null);
          });
          object = gltf.scene;
          normalizeToTargetHeight(
            object,
            (manifest.targetHeight ?? 0.28) * (sceneConfig.propHeightMultiplier ?? 1),
            (propDef.scale ?? 1) * (sceneConfig.propScaleMultiplier ?? 1)
          );
          this.#prepareSceneMaterials(object);
        }
      } catch (error) {
        this.loadCoordinator.failTask(`prop:${propDef.id}`, error);
        throw error;
      }

      if (!object) {
        object = createFallbackMarker({ label: propDef.title, color: '#d8ab63', radius: 0.14, height: 0.22 });
        liftVisualModelToAnchor(object, { offsetY: 0.004 });
      }

      if (loadToken !== this.sceneLoadToken) return;
      const anchorRoot = new THREE.Group();
      anchorRoot.name = propDef.id;
      anchorRoot.add(object);
      this.#placeObjectByDefinition(anchorRoot, object, propDef);
      this.engine.addWorldObject(anchorRoot);
      this.spawnedEntries.push({ type: 'prop', definition: propDef, object: anchorRoot, visual: object });
      this.loadCoordinator.completeTask(`prop:${propDef.id}`);

      if (propDef.interactive !== false) {
        this.interactionSystem.register({
          id: propDef.id,
          sceneId,
          object3D: anchorRoot,
          type: 'prop',
          displayName: propDef.title,
          promptTitle: propDef.promptTitle ?? propDef.title,
          promptSubtitle: propDef.promptSubtitle ?? manifest?.category ?? '',
          subtitle: propDef.promptSubtitle ?? manifest?.category ?? '',
          actionLabel: propDef.actionLabel ?? '调查',
          interactionRange: (propDef.interactionRadius ?? 2.2) * (sceneConfig.interactionRangeMultiplier ?? 1),
          canInteract: () => this.#checkDefinitionInteractable(propDef),
          isVisible: () => this.#isDefinitionVisible(propDef),
          focusHeight: 0.42,
          onInteract: () => this.onPropInteract?.(propDef, manifest, anchorRoot)
        });
      }
    });

    await Promise.all(propTasks);

    for (const exitDef of sceneConfig.layout?.exits ?? []) {
      if (loadToken !== this.sceneLoadToken) return;
      const portal = this.#createPortalMarker(exitDef, sceneConfig);
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
        interactionRange: (exitDef.interactionRadius ?? 3) * (sceneConfig.interactionRangeMultiplier ?? 1),
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

  #placeObjectByDefinition(anchorRoot, visualRoot, definition) {
    const anchorObject = definition.anchor ? this.anchorMap.get(definition.anchor) : null;
    const anchorPosition = anchorObject
      ? anchorObject.getWorldPosition(new THREE.Vector3())
      : definition.position
        ? new THREE.Vector3(...definition.position)
        : new THREE.Vector3();

    anchorRoot.position.copy(anchorPosition);
    if (definition.positionOffset) {
      anchorRoot.position.add(new THREE.Vector3(...definition.positionOffset));
    }

    visualRoot.position.set(0, 0, 0);
    if (definition.rotation) visualRoot.rotation.set(...definition.rotation);
    if (typeof definition.rotationY === 'number') anchorRoot.rotation.y = definition.rotationY;

    let surfaceY = anchorRoot.position.y;
    const placementMode = definition.placement ?? 'floor';
    const validation = {
      id: definition.id,
      title: definition.title,
      placement: placementMode,
      anchor: definition.anchor ?? '直接坐标',
      anchorY: Number(anchorRoot.position.y.toFixed(3)),
      floorY: null,
      surfaceY: null,
      visualBottomY: null,
      status: 'unknown'
    };

    if (placementMode === 'floor') {
      const floorPlacement = this.worldCollisionSystem?.resolveFloorPropPlacement(anchorRoot.position.x, anchorRoot.position.z, {
        referenceY: anchorRoot.position.y,
        clearance: definition.floorClearance ?? 0.008
      });
      if (!floorPlacement) {
        console.error(`[物件贴地失败] ${definition.title} 未找到合法地面`, definition);
        validation.status = 'missing-floor';
      } else {
        anchorRoot.position.set(floorPlacement.x, floorPlacement.floorY, floorPlacement.z);
        surfaceY = floorPlacement.floorY;
        validation.floorY = Number(floorPlacement.floorY.toFixed(3));
      }
    }

    if (placementMode === 'surface') {
      surfaceY = anchorObject ? anchorPosition.y : anchorRoot.position.y;
      anchorRoot.position.y = surfaceY;
      validation.surfaceY = Number(surfaceY.toFixed(3));
    }

    if (placementMode === 'hover') {
      const floorPlacement = this.worldCollisionSystem?.resolveFloorPropPlacement(anchorRoot.position.x, anchorRoot.position.z, {
        referenceY: anchorRoot.position.y,
        clearance: 0
      });
      if (floorPlacement) {
        surfaceY = floorPlacement.floorY + (definition.hoverClearance ?? 0.22);
        anchorRoot.position.y = surfaceY;
        validation.floorY = Number(floorPlacement.floorY.toFixed(3));
      } else {
        anchorRoot.position.y += definition.hoverClearance ?? 0.22;
        surfaceY = anchorRoot.position.y;
      }
    }

        const clearance = placementMode === 'surface'
      ? (definition.surfaceClearance ?? 0.012)
      : placementMode === 'floor'
        ? (definition.floorClearance ?? 0.008)
        : 0;

    const anchorYBeforeMeasure = anchorRoot.position.y;
    anchorRoot.position.y = 0;
    visualRoot.updateMatrixWorld(true);
    const bounds = getObjectBounds(visualRoot);
    const bottomOffset = -bounds.box.min.y + clearance;
    anchorRoot.position.y = anchorYBeforeMeasure;
    visualRoot.position.y += bottomOffset;
    visualRoot.updateMatrixWorld(true);

    const finalBounds = getObjectBounds(visualRoot);
    const visualBottomY = anchorRoot.position.y + finalBounds.box.min.y;
    validation.visualBottomY = Number(visualBottomY.toFixed(3));

    if (placementMode === 'floor') {
      const delta = Math.abs(visualBottomY - surfaceY);
      validation.status = delta <= 0.03 ? 'ok-floor' : visualBottomY < surfaceY ? 'buried' : 'floating';
    } else if (placementMode === 'surface') {
      const expected = surfaceY + clearance;
      const delta = Math.abs(visualBottomY - expected);
      validation.status = delta <= 0.03 ? 'ok-surface' : visualBottomY < expected ? 'buried' : 'floating';
    } else {
      validation.status = 'ok-hover';
    }

    this.placementDebug.push(validation);
  }

  #createPortalMarker(exitDef, sceneConfig) {
    const portal = new THREE.Group();
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.72, 0.05, 18, 48),
      new THREE.MeshStandardMaterial({
        color: '#b98a4b',
        roughness: 0.42,
        metalness: 0.38,
        emissive: new THREE.Color('#7b3b18').multiplyScalar(0.24)
      })
    );
    ring.position.y = 1.02;

    const glow = new THREE.Mesh(
      new THREE.CircleGeometry(0.52, 42),
      new THREE.MeshBasicMaterial({ color: '#f4d39b', transparent: true, opacity: 0.18, side: THREE.DoubleSide })
    );
    glow.position.y = 1.02;

    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.11, 0.42, 18),
      createMaterial(RED, 0.72, 0.08, 0.12)
    );
    post.position.y = 0.22;

    portal.add(ring, glow, post);
    const bounds = getObjectBounds(portal);
    const lift = -bounds.box.min.y + 0.01;
    portal.children.forEach((child) => {
      child.position.y += lift;
    });

    const anchorObject = exitDef.anchor ? this.anchorMap.get(exitDef.anchor) : null;
    const anchorPosition = anchorObject
      ? anchorObject.getWorldPosition(new THREE.Vector3())
      : exitDef.position
        ? new THREE.Vector3(...exitDef.position)
        : new THREE.Vector3();
    portal.position.copy(anchorPosition);
    if (exitDef.positionOffset) {
      portal.position.add(new THREE.Vector3(...exitDef.positionOffset));
    }

    const floorPlacement = this.worldCollisionSystem?.resolveFloorPropPlacement(portal.position.x, portal.position.z, {
      referenceY: portal.position.y,
      clearance: 0
    });
    if (floorPlacement) portal.position.y = floorPlacement.floorY;
    portal.rotation.y = exitDef.rotationY ?? 0;
    portal.scale.setScalar((exitDef.portalScale ?? 1) * (sceneConfig.portalScaleMultiplier ?? 1));

    this.placementDebug.push({
      id: exitDef.id,
      title: exitDef.displayName,
      placement: 'portal',
      anchor: exitDef.anchor ?? '直接坐标',
      anchorY: Number(portal.position.y.toFixed(3)),
      floorY: floorPlacement ? Number(floorPlacement.floorY.toFixed(3)) : null,
      surfaceY: null,
      visualBottomY: Number(portal.position.y.toFixed(3)),
      status: floorPlacement ? 'ok-portal' : 'missing-floor'
    });
    return portal;
  }

  #checkDefinitionInteractable(definition) {
    const requiredFlags = definition.requiredFlags ?? [];
    const missingFlag = requiredFlags.find((flag) => !this.progress.flags.has(flag));
    if (missingFlag) {
      return { ok: false, reason: definition.toScene ? '当前剧情尚未解锁此入口' : '该线索尚未满足调查条件' };
    }

    if (definition.collectable && definition.clueId && this.progress.collectedClues.has(definition.clueId)) {
      return { ok: false, reason: '该线索已调查' };
    }

    return { ok: true, reason: '' };
  }

  #isDefinitionVisible(definition) {
    const hiddenUntilFlags = definition.hiddenUntilFlags ?? [];
    const hideWhenFlags = definition.hideWhenFlags ?? [];
    if (hideWhenFlags.some((flag) => this.progress.flags.has(flag))) return false;
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






