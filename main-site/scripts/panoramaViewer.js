import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export function createPanoramaViewer({ canvas, sceneData, loadingOverlay, errorOverlay, errorTitle, errorMessage }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(sceneData.defaultView?.fov ?? 75, 1, 0.1, 1100);
  camera.position.set(0, 0, 0.1);

  const controls = new OrbitControls(camera, canvas);
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.enableRotate = true;
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.rotateSpeed = -0.35;
  controls.minDistance = 0.1;
  controls.maxDistance = 0.1;
  controls.minPolarAngle = 0.05;
  controls.maxPolarAngle = Math.PI - 0.05;

  let frameId = 0;
  let resizeObserver;
  let sphere = null;
  let texture = null;
  const defaultView = { yaw: sceneData.defaultView?.yaw ?? 0, pitch: sceneData.defaultView?.pitch ?? 0, fov: sceneData.defaultView?.fov ?? 75 };

  function setCameraTargetFromAngles(yaw = 0, pitch = 0) {
    const polar = Math.PI / 2 - pitch;
    const radius = 1;
    controls.target.set(Math.sin(polar) * Math.sin(yaw) * radius, Math.cos(polar) * radius, Math.sin(polar) * Math.cos(yaw) * radius);
    controls.update();
  }

  function resetView() {
    camera.position.set(0, 0, 0.1);
    camera.fov = defaultView.fov;
    camera.updateProjectionMatrix();
    setCameraTargetFromAngles(defaultView.yaw, defaultView.pitch);
  }

  function updateRendererSize() {
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function showError(title, message) {
    if (errorTitle) errorTitle.textContent = title;
    if (errorMessage) errorMessage.textContent = message;
    errorOverlay?.classList.remove("hidden");
    loadingOverlay?.classList.add("hidden");
  }

  function onWheel(event) {
    event.preventDefault();
    camera.fov = THREE.MathUtils.clamp(camera.fov + event.deltaY * 0.03, 45, 90);
    camera.updateProjectionMatrix();
  }

  function animate() {
    frameId = window.requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  new THREE.TextureLoader().load(sceneData.imagePath, (loadedTexture) => {
    texture = loadedTexture;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    sphere = new THREE.Mesh(new THREE.SphereGeometry(500, 64, 64), new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide }));
    scene.add(sphere);
    resetView();
    loadingOverlay?.classList.add("hidden");
  }, undefined, () => {
    showError("360 全景加载失败", "当前全景暂时无法打开，请返回场景馆继续浏览其他空间。");
  });

  canvas.addEventListener("wheel", onWheel, { passive: false });
  canvas.addEventListener("dblclick", resetView);
  resizeObserver = new ResizeObserver(() => updateRendererSize());
  resizeObserver.observe(canvas);
  updateRendererSize();
  animate();

  return {
    dispose() {
      window.cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("dblclick", resetView);
      controls.dispose();
      if (sphere) {
        sphere.geometry.dispose();
        sphere.material.dispose();
      }
      texture?.dispose?.();
      renderer.dispose();
    }
  };
}
