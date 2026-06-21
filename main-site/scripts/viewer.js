import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export function createViewer({ canvas, exhibit, loadingOverlay, loadingProgress, errorOverlay, errorTitle, errorMessage, interactionHint }) {
  const isCharacter = exhibit.assetCategory === "character";
  const isScene = exhibit.assetCategory === "scene";
  const isObject = exhibit.assetCategory === "object";
  const isEvidenceObject = isObject && ["密函", "密信", "木匣", "声境碎片", "数字碎片", "钥匙", "补子纹样"].includes(exhibit.objectType);
  const isDisplayObject = isObject && ["冠饰", "玉佩", "令牌", "官印", "戏曲道具"].includes(exhibit.objectType);
  const isPatternObject = isObject && exhibit.id === "mangpao-buzi-pattern";

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = isScene ? 1.0 : 1.05;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#180908");
  scene.fog = new THREE.Fog("#180908", isScene ? 16 : 8, isScene ? 48 : 18);

  const camera = new THREE.PerspectiveCamera(isScene ? 44 : 34, 1, 0.1, 180);
  camera.position.set(0.2, isScene ? 2.4 : 1.6, isScene ? 8.5 : 5.8);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = exhibit.controls?.dampingFactor ?? 0.055;
  controls.minDistance = exhibit.controls?.minDistance ?? 1.1;
  controls.maxDistance = exhibit.controls?.maxDistance ?? 14;
  controls.minPolarAngle = exhibit.controls?.minPolarAngle ?? 0;
  controls.maxPolarAngle = exhibit.controls?.maxPolarAngle ?? Math.PI * 0.48;
  controls.enablePan = exhibit.controls?.canPan ?? isScene;
  controls.enableZoom = exhibit.controls?.canZoom ?? true;
  controls.enableRotate = exhibit.controls?.canOrbit ?? true;
  controls.autoRotate = exhibit.controls?.autoRotate ?? !isScene;
  controls.autoRotateSpeed = isScene ? 0.2 : 0.45;
  let autoRotateEnabled = controls.autoRotate;

  const lights = {
    ambient: new THREE.AmbientLight("#f8e1c7", isScene ? 1.85 : 1.55),
    hemi: new THREE.HemisphereLight("#f4d4b0", "#34100e", isScene ? 1.6 : 1.45),
    key: new THREE.DirectionalLight("#ffe4b8", isScene ? 2.3 : 2.8),
    fill: new THREE.DirectionalLight("#d4654b", isScene ? 1.1 : 1.55),
    rim: new THREE.DirectionalLight("#d5a767", isScene ? 1.5 : 2.2),
    mystery: new THREE.DirectionalLight("#4f847f", 0),
    spot: new THREE.SpotLight("#ffefc7", isScene ? 2.8 : 5.3, 40, Math.PI * 0.24, 0.5, 1)
  };
  lights.key.position.set(3.5, 5.4, 4.8);
  lights.fill.position.set(-4.4, 2.8, 3.1);
  lights.rim.position.set(-0.8, 3.6, -4.2);
  lights.mystery.position.set(2.2, 2.3, -2.5);
  lights.spot.position.set(0, isScene ? 10 : 8.2, 2);
  lights.spot.target.position.set(0, 1, 0);
  scene.add(lights.ambient, lights.hemi, lights.key, lights.fill, lights.rim, lights.mystery, lights.spot, lights.spot.target);

  const stageGroup = new THREE.Group();
  const carpet = new THREE.Mesh(new THREE.CylinderGeometry(isScene ? 6.5 : 1.92, isScene ? 6.9 : 2.2, isScene ? 0.08 : 0.18, 96), new THREE.MeshStandardMaterial({ color: isScene ? "#53201d" : "#761d1d", roughness: 0.84, metalness: 0.08 }));
  carpet.position.y = isScene ? -0.04 : -0.16;
  const carpetTrim = new THREE.Mesh(new THREE.TorusGeometry(isScene ? 6.58 : 1.98, isScene ? 0.06 : 0.045, 24, 160), new THREE.MeshStandardMaterial({ color: "#d4a157", metalness: 0.72, roughness: 0.25, emissive: "#6b4117", emissiveIntensity: 0.18 }));
  carpetTrim.rotation.x = Math.PI / 2;
  carpetTrim.position.y = isScene ? 0.005 : -0.04;
  const stageTop = new THREE.Mesh(new THREE.CylinderGeometry(isScene ? 5.8 : 1.46, isScene ? 6.15 : 1.6, isScene ? 0.04 : 0.12, 96), new THREE.MeshStandardMaterial({ color: isScene ? "#68211e" : "#952626", roughness: 0.44, metalness: 0.18 }));
  stageTop.position.y = isScene ? 0.015 : -0.02;
  const stageBack = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, 5.6, 48, 1, true, Math.PI * 0.16, Math.PI * 0.68), new THREE.MeshStandardMaterial({ color: "#3f1113", side: THREE.BackSide, roughness: 0.9, metalness: 0.02 }));
  stageBack.position.set(0, 2.35, -1.9);
  stageBack.rotation.y = Math.PI;
  stageBack.visible = !isScene;
  const shadowDisc = new THREE.Mesh(new THREE.CircleGeometry(isScene ? 2.2 : 0.86, 80), new THREE.MeshBasicMaterial({ color: "#080405", transparent: true, opacity: isScene ? 0.12 : isCharacter ? 0.28 : 0.18 }));
  shadowDisc.rotation.x = -Math.PI / 2;
  shadowDisc.position.y = isScene ? 0.03 : 0.018;
  stageGroup.add(carpet, carpetTrim, stageTop, shadowDisc);
  scene.add(stageGroup, stageBack);

  if (isObject) {
    const glassCover = new THREE.Mesh(new THREE.CylinderGeometry(0.98, 1.08, 2.2, 72, 1, true), new THREE.MeshPhysicalMaterial({ color: "#f5e3bf", transmission: 0.78, transparent: true, opacity: 0.12, roughness: 0.1, thickness: 0.25 }));
    glassCover.position.set(0, 1.08, 0);
    scene.add(glassCover);
  }

  const loader = new GLTFLoader();
  const clock = new THREE.Clock();
  let frameId = 0;
  let resizeObserver;
  let modelRoot = null;
  let animationState = null;
  let lightingMode = isScene ? "stage" : isCharacter ? (exhibit.isSuspicious ? "darkline" : "stage") : isEvidenceObject ? "darkline" : isDisplayObject ? "soft" : "stage";
  let currentView = "front";
  let fadeStart = null;
  let fadeMaterials = [];

  const handlePointerDown = () => { controls.autoRotate = false; };
  const handlePointerUp = () => { controls.autoRotate = autoRotateEnabled; };
  const updateRendererSize = () => {
    const width = canvas.clientWidth || canvas.parentElement.clientWidth;
    const height = canvas.clientHeight || canvas.parentElement.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  const setLoadingText = (message) => { if (loadingProgress) loadingProgress.textContent = message; };

  function showFallback(title, message) {
    errorTitle.textContent = title;
    errorMessage.textContent = message;
    errorOverlay.classList.remove("hidden");
    loadingOverlay.classList.add("hidden");
    interactionHint.classList.add("hidden");
  }

  function collectFadeMaterials(object) {
    fadeMaterials = [];
    object.traverse((child) => {
      if (!child.isMesh) return;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        if (!material || fadeMaterials.includes(material)) return;
        fadeMaterials.push(material);
        material.transparent = true;
        material.userData.originalOpacity = material.opacity ?? 1;
        material.opacity = 0;
      });
    });
  }

  function applyLighting(mode) {
    lightingMode = mode;
    if (mode === "soft") {
      lights.ambient.intensity = 1.95; lights.hemi.intensity = 1.4; lights.key.intensity = 2.2; lights.fill.intensity = 1.2; lights.rim.intensity = 1.6; lights.mystery.intensity = 0; lights.spot.intensity = 3.8; return;
    }
    if (mode === "darkline") {
      lights.ambient.intensity = 1.15; lights.hemi.intensity = 1.0; lights.key.intensity = 2.4; lights.fill.intensity = 0.9; lights.rim.intensity = 1.8; lights.mystery.intensity = 1.5; lights.spot.intensity = 4.3; return;
    }
    lights.ambient.intensity = isScene ? 1.85 : 1.55;
    lights.hemi.intensity = isScene ? 1.6 : 1.45;
    lights.key.intensity = isScene ? 2.3 : 2.8;
    lights.fill.intensity = isScene ? 1.1 : 1.55;
    lights.rim.intensity = isScene ? 1.5 : 2.2;
    lights.mystery.intensity = exhibit.isSuspicious || isEvidenceObject ? 0.36 : 0;
    lights.spot.intensity = isScene ? 2.8 : 5.3;
  }

  function setView(mode) {
    if (!animationState) return;
    currentView = mode === "reset" ? "front" : mode;
    const { distance, centerY, targetY } = animationState;
    const heightOffset = isScene ? distance * 0.12 : 0;
    if (mode === "side") camera.position.set(distance, centerY + heightOffset, distance * 0.08);
    else if (mode === "back") camera.position.set(-distance * 0.12, centerY + heightOffset, -distance);
    else camera.position.set(distance * 0.12, centerY + heightOffset, distance);
    controls.target.set(0, targetY, 0);
    controls.update();
  }

  function prepareModel(object) {
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    object.position.x = -center.x;
    object.position.z = -center.z;
    object.position.y = isScene ? -box.min.y + 0.04 : (isCharacter ? 0.07 : Math.max(0.42, size.y * 0.18)) - box.min.y;

    const reframedBox = new THREE.Box3().setFromObject(object);
    const reframedSize = reframedBox.getSize(new THREE.Vector3());
    const reframedCenter = reframedBox.getCenter(new THREE.Vector3());
    const fitHeightDistance = (reframedSize.y * (isScene ? 1.15 : isCharacter ? 1.34 : 1.52)) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)));
    const fitWidthDistance = (Math.max(reframedSize.x, reframedSize.z) * (isScene ? 1.2 : isCharacter ? 1.42 : 1.58)) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)) * camera.aspect);
    const minDistance = isScene ? 5.2 : isCharacter ? 2.8 : isPatternObject ? 2.1 : 2.4;
    const distance = Math.max(fitHeightDistance, fitWidthDistance, minDistance);
    const centerY = reframedCenter.y + reframedSize.y * (isScene ? 0.18 : isCharacter ? 0.1 : 0.08);
    const targetY = reframedCenter.y + reframedSize.y * (isScene ? 0.1 : isCharacter ? 0.05 : 0.02);
    camera.position.set(isPatternObject ? 0 : distance * 0.12, centerY + (isScene ? distance * 0.12 : 0), distance);
    controls.target.set(0, targetY, 0);
    controls.minDistance = exhibit.controls?.minDistance ?? Math.max(0.9, distance * 0.5);
    controls.maxDistance = exhibit.controls?.maxDistance ?? distance * 2.35;
    camera.near = Math.max(0.05, distance / 100);
    camera.far = distance * (isScene ? 24 : 14);
    camera.updateProjectionMatrix();
    controls.update();
    shadowDisc.visible = !isScene;
    shadowDisc.scale.setScalar(Math.min(isScene ? 3 : 1.7, Math.max(isScene ? 1.8 : 0.82, Math.max(reframedSize.x, reframedSize.z))));
    animationState = { baseY: object.position.y, floatAmplitude: !isCharacter && !isScene ? Math.min(0.1, reframedSize.y * 0.03) : 0, floatSpeed: 0.85, distance, centerY, targetY };
    if (isPatternObject) object.rotation.y = 0;
  }

  function toggleAutoRotate() { autoRotateEnabled = !autoRotateEnabled; controls.autoRotate = autoRotateEnabled; }

  if (!exhibit.hasModel) {
    showFallback("模型暂未接入", "当前档案尚未接入可浏览的 3D 模型，请先返回上一页查看其他档案。");
  } else {
    loader.load(exhibit.modelPath, (gltf) => {
      modelRoot = gltf.scene;
      modelRoot.traverse((child) => { if (child.isMesh) { child.castShadow = false; child.receiveShadow = false; } });
      collectFadeMaterials(modelRoot);
      scene.add(modelRoot);
      prepareModel(modelRoot);
      applyLighting(lightingMode);
      fadeStart = performance.now();
      window.setTimeout(() => loadingOverlay.classList.add("hidden"), 180);
    }, (event) => {
      if (!event.total) {
        setLoadingText(isScene ? "正在载入 3D 场景，并校准机位、灯光与漫游构图……" : isCharacter ? "正在为人物调整灯光、机位与展示姿态……" : "正在为物件校准悬浮高度、灯光与展示构图……");
        return;
      }
      setLoadingText(`模型加载中 ${Math.min(100, Math.round((event.loaded / event.total) * 100))}%`);
    }, () => {
      showFallback("模型加载失败", "当前模型暂时无法载入，请返回上一页继续浏览其他档案。");
    });
  }

  applyLighting(lightingMode);
  canvas.addEventListener("pointerdown", handlePointerDown);
  window.addEventListener("pointerup", handlePointerUp);
  canvas.addEventListener("touchstart", handlePointerDown, { passive: true });
  window.addEventListener("touchend", handlePointerUp, { passive: true });

  function animate() {
    frameId = window.requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();
    if (modelRoot && animationState) {
      if (!isCharacter && !isScene) modelRoot.position.y = animationState.baseY + Math.sin(elapsed * animationState.floatSpeed) * animationState.floatAmplitude;
      if (isPatternObject) modelRoot.rotation.y = 0;
      if (fadeStart) {
        const progress = Math.min(1, (performance.now() - fadeStart) / 680);
        fadeMaterials.forEach((material) => {
          material.opacity = (material.userData.originalOpacity ?? 1) * progress;
          if (progress >= 1) material.transparent = material.userData.originalOpacity < 1;
        });
      }
    }
    carpetTrim.rotation.z = Math.sin(elapsed * 0.24) * 0.02;
    lights.spot.intensity = (lightingMode === "soft" ? 3.8 : lightingMode === "darkline" ? 4.3 : isScene ? 2.8 : 5.3) + Math.sin(elapsed * 1.1) * 0.06;
    controls.update();
    renderer.render(scene, camera);
  }

  resizeObserver = new ResizeObserver(() => updateRendererSize());
  resizeObserver.observe(canvas.parentElement);
  updateRendererSize();
  animate();

  return {
    dispose() {
      window.cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      canvas.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("touchend", handlePointerUp);
      controls.dispose();
      renderer.dispose();
      scene.traverse((child) => {
        if (child.geometry) child.geometry.dispose?.();
        if (child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach((material) => material.dispose?.());
        }
      });
    },
    setView,
    setLighting(mode) { applyLighting(mode); },
    toggleAutoRotate,
    getAutoRotate() { return autoRotateEnabled; },
    getLighting() { return lightingMode; },
    getView() { return currentView; }
  };
}
