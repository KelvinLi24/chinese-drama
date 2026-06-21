import * as THREE from "three";
import {
  collectSceneColliders,
  createFallbackMarker,
  disposeHierarchy,
  getObjectBounds,
  normalizeToTargetHeight,
  sampleFloorPoint,
  sharedLoader,
  snapObjectToFloor
} from "./game-engine.js";

const KEY_CLUE_IDS = new Set(["token", "seal", "jade", "warringLetter", "waxLetter"]);
const WOOD_COLOR = "#4a1d14";
const GOLD_COLOR = "#b98a4b";

function createWoodMaterial({ color = WOOD_COLOR, roughness = 0.84, metalness = 0.05, emissive = 0.05 } = {}) {
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
    progress
  }) {
    this.engine = engine;
    this.manifest = manifest;
    this.interactionSystem = interactionSystem;
    this.inventorySystem = inventorySystem;
    this.npcSystem = npcSystem;
    this.audioSystem = audioSystem;
    this.ui = ui;
    this.progress = progress;
    this.currentSceneId = null;
    this.currentGroup = null;
    this.currentSceneRoot = null;
    this.currentSceneConfig = null;
    this.spawnedClues = [];
    this.anchorMap = new Map();
    this.debugAnchors = [];
    this.sceneLoadToken = 0;
  }

  async loadScene(sceneId) {
    const sceneConfig = this.manifest.scenes[sceneId];
    if (!sceneConfig) throw new Error(`未找到场景配置：${sceneId}`);
    this.currentSceneId = sceneId;
    this.currentSceneConfig = sceneConfig;
    const loadToken = ++this.sceneLoadToken;
    this.ui.showLoading(sceneConfig.loadCopy);
    this.interactionSystem.clear();
    this.npcSystem.clear();
    this._clearClues();
    this.debugAnchors = [];
    this.anchorMap.clear();

    const nextGroup = new THREE.Group();
    let sceneColliders = [];

    try {
      const gltf = await sharedLoader.loadAsync(
        sceneConfig.path,
        (event) => {
          if (!event.total) return;
          const percent = Math.round((event.loaded / event.total) * 100);
          this.ui.showLoading(`${sceneConfig.loadCopy} ${percent}%`);
        }
      );

      const root = gltf.scene;
      this._prepareSceneMaterials(root);
      root.scale.setScalar(sceneConfig.rootScale ?? sceneConfig.scale ?? 1);
      root.rotation.y = sceneConfig.rotationY ?? 0;
      root.updateMatrixWorld(true);

      const initialBounds = getObjectBounds(root);
      root.position.x -= initialBounds.center.x;
      root.position.z -= initialBounds.center.z;
      root.position.y -= initialBounds.box.min.y - (sceneConfig.floorOffset ?? 0);
      root.updateMatrixWorld(true);

      const finalBounds = getObjectBounds(root);
      const size = finalBounds.size;
      console.log(`[场景包围盒] ${sceneConfig.title}`, {
        width: Number(size.x.toFixed(3)),
        height: Number(size.y.toFixed(3)),
        depth: Number(size.z.toFixed(3)),
        rootScale: sceneConfig.rootScale ?? sceneConfig.scale ?? 1
      });

      nextGroup.add(root);
      this.currentSceneRoot = root;

      if (sceneId === "court") {
        const shell = this._buildCourtEnvironmentShell(finalBounds, sceneConfig.layout);
        nextGroup.add(shell.group);
        sceneColliders = [...sceneColliders, ...shell.colliders];
        shell.anchors.forEach((anchor, key) => this.anchorMap.set(key, anchor));
        this.debugAnchors = shell.debugAnchors;
      }

      sceneColliders = [...sceneColliders, ...collectSceneColliders(root)];
      this.engine.setSceneColliders(sceneColliders);
      this.engine.setSceneMetrics({
        sceneId,
        title: sceneConfig.title,
        width: Number(size.x.toFixed(3)),
        height: Number(size.y.toFixed(3)),
        depth: Number(size.z.toFixed(3)),
        rootScale: sceneConfig.rootScale ?? sceneConfig.scale ?? 1
      });
    } catch (error) {
      console.error(`[场景加载失败] ${sceneConfig.title}`, error);
      nextGroup.add(
        createFallbackMarker({
          label: `${sceneConfig.title} 占位`,
          color: "#8d2421",
          radius: 0.6,
          height: 1.4
        })
      );
      this.engine.setSceneColliders([]);
      this.ui.showError(`场景加载失败：${sceneConfig.title}`, `资源路径：${sceneConfig.path}`);
    }

    if (this.currentGroup) {
      this.engine.removeWorldObject(this.currentGroup);
      disposeHierarchy(this.currentGroup);
    }
    this.currentGroup = nextGroup;
    this.engine.addWorldObject(nextGroup);

    this.audioSystem.setSceneAmbience(sceneConfig.ambience);
    this.ui.setCurrentScene(sceneConfig.title);
    this.ui.hideLoading();

    Promise.allSettled([
      this._spawnSceneClues(sceneId, sceneConfig),
      this.npcSystem.loadSceneNPCs(sceneId, sceneConfig)
    ]).then(() => {
      if (this.sceneLoadToken !== loadToken || this.currentSceneId !== sceneId) return;
      this.ui.hideLoading();
    });

    return sceneConfig;
  }

  _prepareSceneMaterials(root) {
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

  _buildCourtEnvironmentShell(bounds, layout) {
    const group = new THREE.Group();
    const shell = layout?.environmentShell ?? {};
    const width = bounds.size.x + (shell.paddingX ?? 8);
    const depth = bounds.size.z + (shell.paddingZ ?? 8);
    const wallHeight = shell.wallHeight ?? Math.max(bounds.size.y + 2.8, 10.5);
    const ceilingHeight = shell.ceilingHeight ?? wallHeight - 0.8;
    const floorInset = shell.floorInset ?? 2.8;

    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(width + floorInset, 0.3, depth + floorInset),
      createWoodMaterial({ color: "#2b120f", roughness: 0.92, emissive: 0.04 })
    );
    floor.position.set(0, -0.15, 0);
    group.add(floor);

    const carpet = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.28, 0.04, depth * 0.72),
      new THREE.MeshStandardMaterial({
        color: "#5c1715",
        roughness: 0.9,
        metalness: 0.02,
        emissive: new THREE.Color("#41100f").multiplyScalar(0.12)
      })
    );
    carpet.position.set(0, 0.03, 0.8);
    group.add(carpet);

    const wallMaterial = createWoodMaterial({ color: "#3a1613", roughness: 0.88, emissive: 0.08 });
    const sideWallGeometry = new THREE.BoxGeometry(0.4, wallHeight, depth + 0.4);
    const rearWallGeometry = new THREE.BoxGeometry(width + 0.8, wallHeight, 0.4);
    const ceiling = new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.6, 0.28, depth + 0.6),
      createWoodMaterial({ color: "#210d0c", roughness: 0.92, emissive: 0.03 })
    );
    ceiling.position.set(0, ceilingHeight, 0);
    group.add(ceiling);

    const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    leftWall.position.set(-(width / 2) - 0.2, wallHeight / 2 - 0.05, 0);
    const rightWall = leftWall.clone();
    rightWall.position.x *= -1;
    const rearWall = new THREE.Mesh(rearWallGeometry, wallMaterial);
    rearWall.position.set(0, wallHeight / 2 - 0.05, -(depth / 2) - 0.2);
    const frontLintel = new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.8, 1.8, 0.36),
      createWoodMaterial({ color: "#33110f", roughness: 0.86, emissive: 0.08 })
    );
    frontLintel.position.set(0, wallHeight - 0.9, (depth / 2) + 0.18);
    group.add(leftWall, rightWall, rearWall, frontLintel);

    const curtainMaterial = new THREE.MeshStandardMaterial({
      color: "#6b1f19",
      roughness: 0.92,
      metalness: 0.02,
      emissive: new THREE.Color("#531613").multiplyScalar(0.16),
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    });

    const curtain = new THREE.Mesh(
      new THREE.PlaneGeometry(width * 0.76, wallHeight * 0.72),
      curtainMaterial
    );
    curtain.position.set(0, wallHeight * 0.46, -(depth / 2) + 0.55);
    group.add(curtain);

    const columnCount = shell.columnCountPerSide ?? 4;
    for (let index = 0; index < columnCount; index += 1) {
      const t = index / Math.max(columnCount - 1, 1);
      const z = THREE.MathUtils.lerp((depth / 2) - 1.6, -(depth / 2) + 2.2, t);
      [-(width / 2) + 1.3, (width / 2) - 1.3].forEach((x) => {
        const column = new THREE.Mesh(
          new THREE.CylinderGeometry(0.34, 0.42, wallHeight * 0.94, 18),
          createWoodMaterial({ color: "#5f241a", roughness: 0.7, emissive: 0.1 })
        );
        column.position.set(x, wallHeight * 0.47 - 0.05, z);
        group.add(column);
      });
    }

    const pointLights = [
      [-width * 0.22, 4.2, 2.8],
      [width * 0.22, 4.2, 2.8],
      [-width * 0.16, 4.6, -2.4],
      [width * 0.16, 4.6, -2.4]
    ];
    pointLights.forEach((position) => {
      const light = new THREE.PointLight("#ffcd87", 1.15, 12, 2.2);
      light.position.set(...position);
      group.add(light);
      const globe = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 16, 16),
        new THREE.MeshBasicMaterial({ color: "#f5c778" })
      );
      globe.position.copy(light.position);
      group.add(globe);
    });

    const debugAnchors = [];
    Object.entries(layout?.anchors ?? {}).forEach(([key, anchor]) => {
      const deskGroup = new THREE.Group();
      const [widthSize, heightSize, depthSize] = anchor.size;
      const top = new THREE.Mesh(
        new THREE.BoxGeometry(widthSize, heightSize, depthSize),
        createWoodMaterial({ color: "#592117", roughness: 0.78, emissive: 0.08 })
      );
      deskGroup.add(top);
      const legOffsetX = widthSize * 0.38;
      const legOffsetZ = depthSize * 0.34;
      const legHeight = Math.max(anchor.position[1] - heightSize / 2, 0.6);
      [-1, 1].forEach((xSign) => {
        [-1, 1].forEach((zSign) => {
          const leg = new THREE.Mesh(
            new THREE.BoxGeometry(0.14, legHeight, 0.14),
            createWoodMaterial({ color: "#3f150f", roughness: 0.84, emissive: 0.04 })
          );
          leg.position.set(xSign * legOffsetX, -(legHeight / 2), zSign * legOffsetZ);
          deskGroup.add(leg);
        });
      });

      if (anchor.cloth) {
        const cloth = new THREE.Mesh(
          new THREE.BoxGeometry(widthSize * 0.92, 0.05, depthSize * 0.78),
          new THREE.MeshStandardMaterial({
            color: "#7a1a18",
            roughness: 0.92,
            metalness: 0.02,
            emissive: new THREE.Color("#561413").multiplyScalar(0.18)
          })
        );
        cloth.position.set(0, heightSize * 0.36, 0);
        deskGroup.add(cloth);
      }

      deskGroup.position.set(anchor.position[0], anchor.position[1], anchor.position[2]);
      deskGroup.userData.anchorName = key;
      group.add(deskGroup);
      this.anchorMap.set(key, deskGroup);

      const debugSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 12, 12),
        new THREE.MeshBasicMaterial({ color: GOLD_COLOR })
      );
      debugSphere.position.set(anchor.position[0], anchor.position[1] + 0.18, anchor.position[2]);
      debugSphere.visible = false;
      group.add(debugSphere);
      debugAnchors.push(debugSphere);
    });

    const steps = [
      { width: 7.4, depth: 1.3, height: 0.18, z: 2.15 },
      { width: 6.2, depth: 1.1, height: 0.18, z: 0.95 }
    ];
    steps.forEach((step, index) => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(step.width, step.height, step.depth),
        createWoodMaterial({ color: index === 0 ? "#603323" : "#6c2e21", roughness: 0.84, emissive: 0.07 })
      );
      mesh.position.set(0, step.height / 2, step.z);
      group.add(mesh);
    });

    return { group, colliders: collectSceneColliders(group), anchors: this.anchorMap, debugAnchors };
  }

  async _spawnSceneClues(sceneId, sceneConfig) {
    const layoutConfig = sceneConfig.layout?.evidence ?? null;
    const visibleEvidence = sceneConfig.layout?.visibleEvidence ?? null;
    const fallbackLayout = this.manifest.sceneLayout[sceneId]?.clues ?? [];

    if (layoutConfig) {
      for (const clueId of visibleEvidence ?? Object.keys(layoutConfig)) {
        const clueLayout = layoutConfig[clueId];
        if (!clueLayout) continue;
        await this._spawnConfiguredClue(clueId, clueLayout);
      }
      return;
    }

    for (const clueLayout of fallbackLayout) {
      await this._spawnConfiguredClue(clueLayout.id, clueLayout);
    }
  }

  async _spawnConfiguredClue(clueId, clueLayout) {
    const clueConfig = this.manifest.props[clueId];
    if (!clueConfig) return;

    let object = null;
    if (clueConfig.path) {
      try {
        const gltf = await sharedLoader.loadAsync(clueConfig.path);
        object = gltf.scene;
        normalizeToTargetHeight(object, clueConfig.targetHeight ?? 0.3, clueLayout.scale ?? 1);
      } catch (error) {
        console.warn(`[线索加载失败] ${clueConfig.title}`, error);
      }
    }

    if (!object) {
      object = createFallbackMarker({
        label: clueConfig.title,
        color: "#d8ab63",
        radius: 0.14,
        height: 0.22
      });
    }

    this._placeClueObject(object, clueLayout);
    object.userData.interactable = true;
    object.userData.interactionType = "clue";
    object.userData.focusHeight = 0.42;

    const clueData = {
      id: clueId,
      title: clueConfig.title,
      category: clueConfig.category,
      sourceScene: this.manifest.scenes[this.currentSceneId].title,
      relatedCharacter: clueLayout.relatedCharacter || this._inferRelatedCharacter(clueId),
      description: this._buildClueDescription(clueId),
      suspicion: this._buildClueSuspicion(clueId),
      preview: clueConfig.preview,
      placeholder: Boolean(clueConfig.placeholder),
      isKey: KEY_CLUE_IDS.has(clueId)
    };

    this.interactionSystem.register({
      id: `clue-${clueId}-${this.currentSceneId}`,
      object,
      type: "clue",
      promptTitle: clueLayout.promptTitle ?? clueConfig.title,
      promptSubtitle: clueLayout.sourceLabel ?? clueData.sourceScene,
      actionLabel: clueLayout.actionLabel ?? "调查",
      radius: clueLayout.interactionRadius ?? 2.1,
      onInteract: () => {
        this.interactionSystem.openInspect(clueData);
        const isNew = this.inventorySystem.addItem(clueData);
        if (isNew) {
          this._markClueInvestigated(object);
          this.progress.collectedClues.add(clueId);
          if (clueLayout.isPrimaryTarget) {
            this.progress.flags.add("inspected_wax_letter");
          }
        }
      }
    });

    this.engine.addWorldObject(object);
    this.spawnedClues.push(object);
  }

  _placeClueObject(object, clueLayout) {
    const anchor = clueLayout.anchor ? this.anchorMap.get(clueLayout.anchor) : null;
    const offset = new THREE.Vector3(...(clueLayout.positionOffset ?? [0, 0, 0]));
    const groundLift = object.userData.groundLift ?? 0;

    if (anchor) {
      const anchorPosition = anchor.getWorldPosition(new THREE.Vector3()).add(offset);
      object.position.copy(anchorPosition);
      object.position.y += groundLift;
      if (clueLayout.placement === "surface") {
        const point = sampleFloorPoint(anchorPosition.x, anchorPosition.z, {
          sceneColliders: this.engine.sceneColliders.length ? this.engine.sceneColliders : collectSceneColliders(anchor.parent),
          rayStartHeight: 3,
          maxDistance: 10,
          referenceY: anchorPosition.y,
          maxRise: 0.8,
          maxDrop: 2,
          target: new THREE.Vector3()
        });
        if (point) object.position.y = point.y + (offset.y || 0.018) + groundLift;
      }
    } else if (clueLayout.position) {
      object.position.set(clueLayout.position[0], clueLayout.position[1] + groundLift, clueLayout.position[2]);
      if (clueLayout.placement !== "hover") {
        snapObjectToFloor(object, {
          sceneColliders: this.engine.sceneColliders,
          offsetY: clueLayout.placement === "floor" ? 0.012 : 0.02,
          rayStartHeight: 10,
          maxRise: clueLayout.placement === "floor" ? 1.2 : 2.2,
          maxDrop: 8,
          prefer: "highest"
        });
      }
      if (clueLayout.placement === "hover") object.position.y += 0.2;
    }

    if (clueLayout.rotation) {
      object.rotation.set(...clueLayout.rotation);
    } else {
      object.rotation.y = clueLayout.rotationY ?? 0;
    }
  }

  _markClueInvestigated(object) {
    object.userData.investigated = true;
    object.traverse((child) => {
      if (!child.isMesh || !child.material) return;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        material.opacity = 0.72;
        material.transparent = true;
        if (material.emissive) {
          material.emissive.set("#2b140e");
          material.emissiveIntensity = 0.12;
        }
      });
    });
  }

  setDebugEnabled(enabled) {
    this.debugAnchors.forEach((anchor) => {
      anchor.visible = enabled;
    });
  }

  getDebugAnchors() {
    return [...this.anchorMap.entries()].map(([name, object]) => ({
      name,
      position: object.getWorldPosition(new THREE.Vector3())
    }));
  }

  _inferRelatedCharacter(clueId) {
    const map = {
      token: "苏秦",
      seal: "公孙衍",
      crown: "封相仪典",
      pattern: "苏秦",
      jade: "苏秦",
      waxLetter: "楚惠王",
      warringLetter: "公孙衍",
      clueBox: "未知",
      key: "戏棚后台",
      fan: "粤剧伶人",
      vocalShard: "粤剧伶人",
      drumShard: "锣鼓场",
      archiveFragment: "未知",
      alteredPlaybill: "粤剧戏棚",
      scoreFragment: "唱词残页"
    };
    return map[clueId] ?? "待考";
  }

  _buildClueDescription(clueId) {
    const map = {
      token: "令牌仍带着礼器表面的庄重，但它真正指向的，是谁拥有在众目睽睽下主导大局的资格。",
      seal: "官印落在主案上，看似用于诏令确认，却可能暴露出礼制与私意并不完全一致。",
      crown: "凤冠被安置在仪仗架旁，华美之外更像一层秩序外壳，把封相盛典包裹得密不透风。",
      pattern: "补子纹样本应只是服饰细节，可一旦被单独取出，就会显出身份被刻意放大的痕迹。",
      jade: "丞相玉佩与苏秦的身份相连，像一枚把公权与私人命运绑在一起的信物。",
      waxLetter: "这封密函的封蜡不属于表面上的盟约体系，它更像一封不该在此时出现在朝堂上的私下传递。",
      warringLetter: "战国密信把公开的合纵说辞撕开一道口子，露出隐藏在礼乐之后的真实交易。",
      clueBox: "木匣的留痕说明有人在仪式进行前后快速调换过内容，现场不是原貌。",
      key: "机关钥匙意味着某条隐蔽动线从未真正被封死。",
      fan: "戏棚折扇本是表演道具，一旦进入搜证视野，就意味着舞台与现实已经重叠。",
      vocalShard: "唱腔碎片像一段没写进纸面的证词，让声音本身成为调查材料。",
      drumShard: "锣鼓节奏的异常变化，可能比任何口头辩解都更早暴露行动信号。",
      archiveFragment: "数字档案碎片说明完整证据曾被人为拆散。",
      alteredPlaybill: "当前为占位条目，用于演示戏单被改写后如何影响搜证路径。",
      scoreFragment: "当前为占位条目，用于演示唱词残页对声景推理的补充作用。"
    };
    return map[clueId] ?? "这是一件尚待补充说明的线索条目。";
  }

  _buildClueSuspicion(clueId) {
    const map = {
      token: "它可能说明封相仪典的真正主导权，并不完全在公开诏令之内。",
      seal: "若印信与文书并不对应，朝堂正在上演的就不只是庆典，而是掩饰。",
      crown: "越华丽的礼制陈设，越可能被用来遮住真正的冲突。",
      pattern: "这块纹样若被刻意放大，就说明有人试图借服饰象征来操控视线。",
      jade: "玉佩让公共事件重新回到苏秦本人身上，意味着抉择并非纯粹公事。",
      waxLetter: "封蜡图纹与六国盟约用印不符，疑似来自另一套密使体系。",
      warringLetter: "它表明合纵内部早已存在各自留后手的盘算。",
      clueBox: "木匣中的空缺证明有人提前拿走了某件更关键的东西。",
      key: "既然存在钥匙，就说明封闭空间从来不是绝对封闭。",
      fan: "后台道具被卷入搜证，意味着戏台与朝堂的边界已被人为打穿。",
      vocalShard: "关键内容也许并不在纸上，而藏在表演节奏与唱词残响里。",
      drumShard: "鼓点变化可能是一种行动暗号，而不是纯粹伴奏。",
      archiveFragment: "碎片化档案说明完整真相曾被故意拆散保存。",
      alteredPlaybill: "戏单一旦被改写，众人看见的流程就未必是真正流程。",
      scoreFragment: "残缺的部分，往往比留下来的部分更能说明问题。"
    };
    return map[clueId] ?? "这件线索的指向仍待进一步比对。";
  }

  _clearClues() {
    this.spawnedClues.forEach((object) => {
      this.interactionSystem.unregisterByObject(object);
      this.engine.removeWorldObject(object);
      disposeHierarchy(object);
    });
    this.spawnedClues = [];
  }
}
