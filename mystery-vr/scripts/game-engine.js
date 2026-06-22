import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export const sharedLoader = new GLTFLoader();
const DOWN = new THREE.Vector3(0, -1, 0);
const SHARED_FLOOR_RAYCASTER = new THREE.Raycaster();
const SHARED_NORMAL_MATRIX = new THREE.Matrix3();
const PERF = {
  fps: 0,
  frameTimeMs: 0,
  avgFrameTimeMs: 0,
  last60: [],
  renderMode: '桌面',
  raycastsThisFrame: 0,
  box3ThisFrame: 0,
  traverseThisFrame: 0
};

function resetPerfFrame(delta, xrPresenting) {
  PERF.frameTimeMs = Number((delta * 1000).toFixed(2));
  PERF.fps = delta > 0 ? Math.round(1 / delta) : 0;
  PERF.renderMode = xrPresenting ? 'XR' : '桌面';
  PERF.raycastsThisFrame = 0;
  PERF.box3ThisFrame = 0;
  PERF.traverseThisFrame = 0;
}

function finalizePerfFrame() {
  PERF.last60.push(PERF.frameTimeMs);
  if (PERF.last60.length > 60) PERF.last60.shift();
  const total = PERF.last60.reduce((sum, value) => sum + value, 0);
  PERF.avgFrameTimeMs = Number((total / Math.max(PERF.last60.length, 1)).toFixed(2));
}

export function getPerformanceSnapshot() {
  return {
    fps: PERF.fps,
    frameTimeMs: PERF.frameTimeMs,
    avgFrameTimeMs: PERF.avgFrameTimeMs,
    renderMode: PERF.renderMode,
    raycastsThisFrame: PERF.raycastsThisFrame,
    box3ThisFrame: PERF.box3ThisFrame,
    traverseThisFrame: PERF.traverseThisFrame
  };
}

export function recordRaycast(count = 1) {
  PERF.raycastsThisFrame += count;
}

export function recordBox3(count = 1) {
  PERF.box3ThisFrame += count;
}

export function recordTraverse(count = 1) {
  PERF.traverseThisFrame += count;
}

export function normalizeToTargetHeight(object, targetHeight = 1.75, correctionScale = 1) {
  object.updateMatrixWorld(true);
  recordBox3();
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const height = Math.max(size.y, 0.0001);
  const scale = (targetHeight / height) * correctionScale;
  object.scale.setScalar(scale);

  object.updateMatrixWorld(true);
  recordBox3();
  const nextBox = new THREE.Box3().setFromObject(object);
  const nextCenter = nextBox.getCenter(new THREE.Vector3());
  object.position.x -= nextCenter.x;
  object.position.z -= nextCenter.z;
  object.position.y -= nextBox.min.y;
  object.userData.groundLift = object.position.y;
  object.updateMatrixWorld(true);

  recordBox3();
  const finalBox = new THREE.Box3().setFromObject(object);
  return {
    scale,
    size: finalBox.getSize(new THREE.Vector3())
  };
}

export function liftVisualModelToAnchor(visualRoot, { offsetY = 0.01 } = {}) {
  if (!visualRoot) return { footOffset: 0, height: 0 };
  visualRoot.updateMatrixWorld(true);
  recordBox3();
  const box = new THREE.Box3().setFromObject(visualRoot);
  const footOffset = -box.min.y + offsetY;
  visualRoot.position.y += footOffset;
  visualRoot.userData.baseLiftOffset = visualRoot.position.y;
  visualRoot.userData.baseScale = visualRoot.scale.clone();
  visualRoot.updateMatrixWorld(true);
  recordBox3();
  const liftedBox = new THREE.Box3().setFromObject(visualRoot);
  return {
    footOffset,
    height: liftedBox.getSize(new THREE.Vector3()).y
  };
}

export function scaleVisualRootWithLift(visualRoot, multiplier = 1) {
  if (!visualRoot) return { liftOffset: 0, scale: new THREE.Vector3(1, 1, 1) };
  const baseScale = visualRoot.userData.baseScale?.clone?.() ?? visualRoot.scale.clone();
  const baseLiftOffset = visualRoot.userData.baseLiftOffset ?? visualRoot.position.y ?? 0;
  const safeMultiplier = Number.isFinite(multiplier) ? multiplier : 1;
  visualRoot.scale.copy(baseScale).multiplyScalar(safeMultiplier);
  visualRoot.position.y = baseLiftOffset * safeMultiplier;
  visualRoot.updateMatrixWorld(true);
  return {
    liftOffset: visualRoot.position.y,
    scale: visualRoot.scale.clone()
  };
}

export function centerObjectToWorld(object) {
  object.updateMatrixWorld(true);
  recordBox3();
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  object.position.x -= center.x;
  object.position.z -= center.z;
  object.position.y -= box.min.y;
  object.updateMatrixWorld(true);
  return box;
}

export function getObjectBounds(object) {
  object.updateMatrixWorld(true);
  recordBox3();
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  return { box, size, center };
}

export function disposeHierarchy(root) {
  if (!root) return;
  recordTraverse();
  root.traverse((child) => {
    if (child.geometry) child.geometry.dispose?.();
    if (child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        Object.values(material).forEach((value) => {
          if (value?.isTexture) value.dispose?.();
        });
        material.dispose?.();
      });
    }
  });
}

export function createFallbackMarker({
  label = "占位资源",
  color = "#d8ab63",
  radius = 0.2,
  height = 0.45
} = {}) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(radius, height, 8, 16),
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.58,
      metalness: 0.08,
      emissive: new THREE.Color(color).multiplyScalar(0.08)
    })
  );
  body.castShadow = false;
  body.receiveShadow = false;
  group.add(body);
  group.userData.fallbackLabel = label;
  return group;
}

export function findBestClip(animations = [], candidates = []) {
  if (!animations.length) return null;
  const lowerCandidates = candidates.map((candidate) => candidate.toLowerCase());
  const matched =
    animations.find((clip) =>
      lowerCandidates.some((candidate) => clip.name?.toLowerCase() === candidate)
    ) ??
    animations.find((clip) =>
      lowerCandidates.some((candidate) => clip.name?.toLowerCase().includes(candidate))
    );
  return matched ?? animations[0];
}

export function logAnimationNames(title, animations = []) {
  const names = animations.map((clip) => clip.name || "未命名动画");
  console.log(`[动画检测] ${title}`, names);
  return names;
}

export function collectSceneColliders(root, { includeInvisible = false } = {}) {
  const colliders = [];
  recordTraverse();
  root?.traverse((child) => {
    if (!child.isMesh) return;
    if (!includeInvisible && child.visible === false) return;
    child.updateMatrixWorld(true);
    colliders.push(child);
  });
  return colliders;
}

export function sampleFloorPoint(x, z, {
  sceneColliders = [],
  rayStartHeight = 30,
  maxDistance = 80,
  prefer = "highest",
  referenceY = null,
  maxRise = 2.2,
  maxDrop = 12,
  minUpwardNormal = 0.55,
  target = new THREE.Vector3()
} = {}) {
  if (!sceneColliders.length) return null;
  const originY = referenceY == null ? rayStartHeight : referenceY + rayStartHeight;
  SHARED_FLOOR_RAYCASTER.ray.origin.set(x, originY, z);
  SHARED_FLOOR_RAYCASTER.ray.direction.copy(DOWN);
  SHARED_FLOOR_RAYCASTER.near = 0;
  SHARED_FLOOR_RAYCASTER.far = maxDistance;
  recordRaycast();
  const hits = SHARED_FLOOR_RAYCASTER.intersectObjects(sceneColliders, true);
  if (!hits.length) return null;

  const upwardHits = hits.filter((hit) => {
    if (!hit.face?.normal || !hit.object?.matrixWorld) return true;
    const worldNormal = hit.face.normal.clone().applyMatrix3(SHARED_NORMAL_MATRIX.getNormalMatrix(hit.object.matrixWorld)).normalize();
    return worldNormal.y >= minUpwardNormal;
  });

  const candidateHits =
    referenceY == null
      ? upwardHits
      : upwardHits.filter((hit) => hit.point.y <= referenceY + maxRise && hit.point.y >= referenceY - maxDrop);

  if (!candidateHits.length) return null;
  target.copy((prefer === "lowest" ? candidateHits[candidateHits.length - 1] : candidateHits[0]).point);
  return target;
}

export function snapObjectToFloor(object, {
  sceneColliders = [],
  rayStartHeight = 30,
  offsetY = 0.01,
  maxDistance = 80,
  prefer = "highest",
  maxRise = 2.2,
  maxDrop = 12
} = {}) {
  if (!object || !sceneColliders.length) return null;
  object.updateMatrixWorld(true);
  const worldPosition = object.getWorldPosition(new THREE.Vector3());
  const point = sampleFloorPoint(worldPosition.x, worldPosition.z, {
    sceneColliders,
    rayStartHeight,
    maxDistance,
    prefer,
    referenceY: worldPosition.y,
    maxRise,
    maxDrop,
    target: new THREE.Vector3()
  });
  if (!point) return null;
  object.position.y = point.y + offsetY + (object.userData.groundLift ?? 0);
  object.updateMatrixWorld(true);
  return point;
}

export function waitForNextFrame() {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });
}

export class GameEngine {
  constructor({ canvas, dom, onResize }) {
    this.canvas = canvas;
    this.dom = dom;
    this.onResize = onResize;
    this.clock = new THREE.Clock();
    this.updaters = new Set();
    this.mixers = new Set();
    this.cleanupTasks = [];
    this.frameId = 0;
    this.sceneColliders = [];
    this.sceneMetrics = null;
    this.debugEnabled = false;
    this.renderLoopActive = false;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#150809");
    this.scene.fog = new THREE.FogExp2("#17090a", 0.028);

    this.camera = new THREE.PerspectiveCamera(62, 1, 0.1, 220);
    this.camera.position.set(0, 1.7, 5.5);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.canvas.clientWidth || window.innerWidth, this.canvas.clientHeight || window.innerHeight, false);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.98;
    this.renderer.xr.enabled = true;
    this.renderer.xr.setReferenceSpaceType('local-floor');

    this.worldRoot = new THREE.Group();
    this.scene.add(this.worldRoot);

    this.uiRoot = new THREE.Group();
    this.scene.add(this.uiRoot);

    this.debugRoot = new THREE.Group();
    this.debugRoot.visible = false;
    this.scene.add(this.debugRoot);

    this.debugFloorMarker = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 16, 16),
      new THREE.MeshBasicMaterial({ color: "#f4d39b" })
    );
    this.debugFloorMarker.visible = false;
    this.debugRoot.add(this.debugFloorMarker);

    this.debugRay = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
      new THREE.LineBasicMaterial({ color: "#e0ba73" })
    );
    this.debugRay.visible = false;
    this.debugRoot.add(this.debugRay);

    this._setupLights();
    this._setupResize();
  }

  _setupLights() {
    const ambient = new THREE.AmbientLight("#f4d5b0", 0.36);
    const hemi = new THREE.HemisphereLight("#9b4f34", "#120708", 0.72);
    const key = new THREE.DirectionalLight("#ffd9a2", 1.38);
    const fill = new THREE.DirectionalLight("#9d442e", 0.58);
    const rim = new THREE.DirectionalLight("#c98b52", 0.42);
    key.position.set(6, 9, 5);
    fill.position.set(-5, 4, 3);
    rim.position.set(0, 6, -7);
    this.scene.add(ambient, hemi, key, fill, rim);
  }

  _setupResize() {
    const handleResize = () => {
      const width = this.canvas.clientWidth || window.innerWidth;
      const height = this.canvas.clientHeight || window.innerHeight;
      this.camera.aspect = width / Math.max(height, 1);
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height, false);
      this.onResize?.({ width, height });
    };
    this.cleanupTasks.push(() => window.removeEventListener("resize", handleResize));
    window.addEventListener("resize", handleResize);
    handleResize();
  }

  addUpdater(updater) {
    this.updaters.add(updater);
    return () => this.updaters.delete(updater);
  }

  addMixer(mixer) {
    this.mixers.add(mixer);
    return () => this.mixers.delete(mixer);
  }

  addCleanupTask(task) {
    this.cleanupTasks.push(task);
  }

  setSceneColliders(colliders = []) {
    this.sceneColliders = colliders;
  }

  setSceneMetrics(metrics) {
    this.sceneMetrics = metrics;
  }

  setDebugEnabled(enabled) {
    this.debugEnabled = enabled;
    this.debugRoot.visible = enabled;
    if (!enabled) {
      this.debugFloorMarker.visible = false;
      this.debugRay.visible = false;
    }
  }

  updateDebugFloor(origin, floorPoint) {
    if (!this.debugEnabled || !origin || !floorPoint) {
      this.debugFloorMarker.visible = false;
      this.debugRay.visible = false;
      return;
    }
    this.debugFloorMarker.visible = true;
    this.debugFloorMarker.position.copy(floorPoint);
    this.debugRay.visible = true;
    this.debugRay.geometry.setFromPoints([origin, floorPoint]);
  }

  addWorldObject(object) {
    this.worldRoot.add(object);
  }

  removeWorldObject(object) {
    this.worldRoot.remove(object);
  }

  recordRaycast(count = 1) {
    recordRaycast(count);
  }

  start(renderHook) {
    this.renderLoopActive = true;
    const tick = () => {
      const delta = Math.min(this.clock.getDelta(), 0.05);
      resetPerfFrame(delta, this.renderer.xr.isPresenting);
      this.mixers.forEach((mixer) => mixer.update(delta));
      this.updaters.forEach((updater) => updater(delta));
      renderHook?.(delta);
      this.renderer.render(this.scene, this.camera);
      finalizePerfFrame();
    };
    this.renderer.setAnimationLoop(tick);
  }

  stop() {
    this.renderLoopActive = false;
    this.renderer.setAnimationLoop(null);
    window.cancelAnimationFrame(this.frameId);
  }

  getPerformanceSnapshot() {
    return {
      ...getPerformanceSnapshot(),
      rendererXrEnabled: this.renderer.xr.enabled,
      xrPresenting: this.renderer.xr.isPresenting,
      renderLoopActive: this.renderLoopActive,
      sceneColliderCount: this.sceneColliders.length,
      extraAnimationFrameLoop: false
    };
  }

  dispose() {
    this.stop();
    this.cleanupTasks.forEach((task) => task());
    disposeHierarchy(this.scene);
    this.renderer.dispose();
  }
}
