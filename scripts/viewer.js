import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export function createViewer({
  canvas,
  exhibit,
  loadingOverlay,
  loadingProgress,
  errorOverlay,
  errorTitle,
  errorMessage,
  interactionHint
}) {
  const isCharacter = exhibit.assetCategory === "character";
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#180908");
  scene.fog = new THREE.Fog("#180908", 8, 18);

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 120);
  camera.position.set(0.2, 1.6, 5.8);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.055;
  controls.minDistance = 1.1;
  controls.maxDistance = 14;
  controls.maxPolarAngle = Math.PI * 0.48;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.45;
  let autoRotateEnabled = true;

  const lights = {
    ambient: new THREE.AmbientLight("#f8e1c7", 1.55),
    hemi: new THREE.HemisphereLight("#f4d4b0", "#34100e", 1.45),
    key: new THREE.DirectionalLight("#ffe4b8", 2.8),
    fill: new THREE.DirectionalLight("#d4654b", 1.55),
    rim: new THREE.DirectionalLight("#d5a767", 2.2),
    mystery: new THREE.DirectionalLight("#4f847f", 0),
    spot: new THREE.SpotLight("#ffefc7", 5.3, 25, Math.PI * 0.24, 0.5, 1)
  };

  lights.key.position.set(3.5, 5.4, 4.8);
  lights.fill.position.set(-4.4, 2.8, 3.1);
  lights.rim.position.set(-0.8, 3.6, -4.2);
  lights.mystery.position.set(2.2, 2.3, -2.5);
  lights.spot.position.set(0, 8.2, 2);
  lights.spot.target.position.set(0, 1, 0);

  scene.add(
    lights.ambient,
    lights.hemi,
    lights.key,
    lights.fill,
    lights.rim,
    lights.mystery,
    lights.spot,
    lights.spot.target
  );

  const stageGroup = new THREE.Group();
  const carpet = new THREE.Mesh(
    new THREE.CylinderGeometry(1.92, 2.2, 0.18, 96),
    new THREE.MeshStandardMaterial({
      color: "#761d1d",
      roughness: 0.84,
      metalness: 0.08
    })
  );
  carpet.position.y = -0.16;

  const carpetTrim = new THREE.Mesh(
    new THREE.TorusGeometry(1.98, 0.045, 24, 160),
    new THREE.MeshStandardMaterial({
      color: "#d4a157",
      metalness: 0.72,
      roughness: 0.25,
      emissive: "#6b4117",
      emissiveIntensity: 0.18
    })
  );
  carpetTrim.rotation.x = Math.PI / 2;
  carpetTrim.position.y = -0.04;

  const stageTop = new THREE.Mesh(
    new THREE.CylinderGeometry(1.46, 1.6, 0.12, 96),
    new THREE.MeshStandardMaterial({
      color: "#952626",
      roughness: 0.44,
      metalness: 0.18
    })
  );
  stageTop.position.y = -0.02;

  const stageBack = new THREE.Mesh(
    new THREE.CylinderGeometry(4.2, 4.2, 5.6, 48, 1, true, Math.PI * 0.16, Math.PI * 0.68),
    new THREE.MeshStandardMaterial({
      color: "#3f1113",
      side: THREE.BackSide,
      roughness: 0.9,
      metalness: 0.02
    })
  );
  stageBack.position.set(0, 2.35, -1.9);
  stageBack.rotation.y = Math.PI;

  const shadowDisc = new THREE.Mesh(
    new THREE.CircleGeometry(0.86, 80),
    new THREE.MeshBasicMaterial({
      color: "#080405",
      transparent: true,
      opacity: isCharacter ? 0.28 : 0.18
    })
  );
  shadowDisc.rotation.x = -Math.PI / 2;
  shadowDisc.position.y = 0.018;

  stageGroup.add(carpet, carpetTrim, stageTop, shadowDisc);
  scene.add(stageGroup, stageBack);

  if (!isCharacter) {
    const glassCover = new THREE.Mesh(
      new THREE.CylinderGeometry(0.98, 1.08, 2.2, 72, 1, true),
      new THREE.MeshPhysicalMaterial({
        color: "#f5e3bf",
        transmission: 0.78,
        transparent: true,
        opacity: 0.12,
        roughness: 0.1,
        thickness: 0.25
      })
    );
    glassCover.position.set(0, 1.08, 0);
    scene.add(glassCover);
  }

  const loader = new GLTFLoader();
  const clock = new THREE.Clock();
  let frameId = 0;
  let resizeObserver;
  let modelRoot = null;
  let animationState = null;
  let lightingMode = exhibit.isSuspicious ? "darkline" : "stage";
  let currentView = "front";
  let fadeStart = null;
  let fadeMaterials = [];

  const handlePointerDown = () => {
    controls.autoRotate = false;
  };
  const handlePointerUp = () => {
    controls.autoRotate = autoRotateEnabled;
  };

  function updateRendererSize() {
    const width = canvas.clientWidth || canvas.parentElement.clientWidth;
    const height = canvas.clientHeight || canvas.parentElement.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function setLoadingText(message) {
    loadingProgress.textContent = message;
  }

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
      lights.ambient.intensity = 1.95;
      lights.hemi.intensity = 1.4;
      lights.key.intensity = 2.2;
      lights.fill.intensity = 1.2;
      lights.rim.intensity = 1.6;
      lights.mystery.intensity = 0;
      lights.spot.intensity = 3.8;
      return;
    }
    if (mode === "darkline") {
      lights.ambient.intensity = 1.15;
      lights.hemi.intensity = 1.0;
      lights.key.intensity = 2.4;
      lights.fill.intensity = 0.9;
      lights.rim.intensity = 1.8;
      lights.mystery.intensity = 1.5;
      lights.spot.intensity = 4.3;
      return;
    }
    lights.ambient.intensity = 1.55;
    lights.hemi.intensity = 1.45;
    lights.key.intensity = 2.8;
    lights.fill.intensity = 1.55;
    lights.rim.intensity = 2.2;
    lights.mystery.intensity = exhibit.isSuspicious ? 0.36 : 0;
    lights.spot.intensity = 5.3;
  }

  function setView(mode) {
    if (!animationState) return;
    currentView = mode;
    const { distance, centerY, targetY } = animationState;
    if (mode === "side") {
      camera.position.set(distance, centerY, distance * 0.08);
    } else if (mode === "back") {
      camera.position.set(-distance * 0.12, centerY, -distance);
    } else {
      camera.position.set(distance * 0.12, centerY, distance);
      currentView = mode === "reset" ? "front" : mode;
    }
    controls.target.set(0, targetY, 0);
    controls.update();
  }

  function prepareModel(object) {
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    object.position.x = -center.x;
    object.position.z = -center.z;

    const standY = isCharacter ? 0.07 : Math.max(0.42, size.y * 0.18);
    object.position.y = standY - box.min.y;

    const reframedBox = new THREE.Box3().setFromObject(object);
    const reframedSize = reframedBox.getSize(new THREE.Vector3());
    const reframedCenter = reframedBox.getCenter(new THREE.Vector3());
    const fitHeightDistance =
      (reframedSize.y * (isCharacter ? 1.34 : 1.52)) /
      (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)));
    const fitWidthDistance =
      (Math.max(reframedSize.x, reframedSize.z) * (isCharacter ? 1.42 : 1.58)) /
      (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)) * camera.aspect);
    const distance = Math.max(fitHeightDistance, fitWidthDistance, isCharacter ? 2.8 : 2.4);
    const centerY = reframedCenter.y + reframedSize.y * (isCharacter ? 0.1 : 0.08);
    const targetY = reframedCenter.y + reframedSize.y * (isCharacter ? 0.05 : 0.02);

    camera.position.set(distance * 0.12, centerY, distance);
    controls.target.set(0, targetY, 0);
    controls.minDistance = Math.max(0.9, distance * 0.5);
    controls.maxDistance = distance * 2.35;
    camera.near = Math.max(0.05, distance / 100);
    camera.far = distance * 14;
    camera.updateProjectionMatrix();
    controls.update();

    shadowDisc.scale.setScalar(Math.min(1.7, Math.max(0.82, Math.max(reframedSize.x, reframedSize.z))));

    animationState = {
      baseY: object.position.y,
      floatAmplitude: isCharacter ? 0 : Math.min(0.1, reframedSize.y * 0.03),
      floatSpeed: 0.85,
      distance,
      centerY,
      targetY
    };
  }

  function setAutoRotate(enabled) {
    autoRotateEnabled = enabled;
    controls.autoRotate = enabled;
  }

  function toggleAutoRotate() {
    setAutoRotate(!autoRotateEnabled);
  }

  if (!exhibit.hasModel) {
    showFallback("展品尚未入库", "模型文件暂未完成，请返回档案库查看其他展品。");
  } else {
    loader.load(
      exhibit.modelPath,
      (gltf) => {
        modelRoot = gltf.scene;
        modelRoot.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = false;
            child.receiveShadow = false;
          }
        });
        collectFadeMaterials(modelRoot);
        scene.add(modelRoot);
        prepareModel(modelRoot);
        applyLighting(lightingMode);
        fadeStart = performance.now();
        window.setTimeout(() => {
          loadingOverlay.classList.add("hidden");
        }, 180);
      },
      (event) => {
        if (!event.total) {
          setLoadingText("正在为《六国大封相》模型调整灯光、机位与展示姿态。");
          return;
        }
        const percent = Math.min(100, Math.round((event.loaded / event.total) * 100));
        setLoadingText(`模型加载中 ${percent}%`);
      },
      () => {
        showFallback("展品尚未入库", "模型文件暂未完成，请返回档案库查看其他展品。");
      }
    );
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
      if (!isCharacter) {
        modelRoot.position.y =
          animationState.baseY +
          Math.sin(elapsed * animationState.floatSpeed) * animationState.floatAmplitude;
      }
      if (fadeStart) {
        const progress = Math.min(1, (performance.now() - fadeStart) / 680);
        fadeMaterials.forEach((material) => {
          material.opacity = (material.userData.originalOpacity ?? 1) * progress;
          if (progress >= 1) material.transparent = material.userData.originalOpacity < 1;
        });
      }
    }

    carpetTrim.rotation.z = Math.sin(elapsed * 0.24) * 0.02;
    lights.spot.intensity =
      (lightingMode === "soft" ? 3.8 : lightingMode === "darkline" ? 4.3 : 5.3) +
      Math.sin(elapsed * 1.1) * 0.06;
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
    setLighting(mode) {
      applyLighting(mode);
    },
    toggleAutoRotate,
    getAutoRotate() {
      return autoRotateEnabled;
    },
    getLighting() {
      return lightingMode;
    },
    getView() {
      return currentView;
    },
    setAutoRotate
  };
}
