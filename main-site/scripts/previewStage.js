import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export function createHeroPreview({ canvas, loadingElement }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0.18, 1.15, 4.5);

  const ambient = new THREE.AmbientLight("#f7dfbe", 1.55);
  const hemi = new THREE.HemisphereLight("#f8d7a5", "#471617", 1.2);
  const key = new THREE.DirectionalLight("#ffe4b5", 2.3);
  const fill = new THREE.DirectionalLight("#ca6048", 1.1);
  const rim = new THREE.DirectionalLight("#d1a25d", 1.85);
  const accent = new THREE.DirectionalLight("#8b4c24", 0.42);
  key.position.set(2.8, 4, 3.6);
  fill.position.set(-3, 1.8, 2.4);
  rim.position.set(-0.5, 3.2, -3.5);
  accent.position.set(1.6, 1.4, -2.4);
  scene.add(ambient, hemi, key, fill, rim, accent);

  const stage = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.18, 0.12, 72), new THREE.MeshStandardMaterial({ color: "#8b2421", roughness: 0.58, metalness: 0.12 }));
  stage.position.y = -0.12;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.16, 0.03, 18, 120), new THREE.MeshStandardMaterial({ color: "#d3a157", metalness: 0.72, roughness: 0.24, emissive: "#6d4415", emissiveIntensity: 0.14 }));
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -0.02;
  const shadowDisc = new THREE.Mesh(new THREE.CircleGeometry(0.72, 64), new THREE.MeshBasicMaterial({ color: "#080304", transparent: true, opacity: 0.24 }));
  shadowDisc.rotation.x = -Math.PI / 2;
  shadowDisc.position.y = 0.012;
  scene.add(stage, ring, shadowDisc);

  const loader = new GLTFLoader();
  const clock = new THREE.Clock();
  let modelRoot = null;
  let frameId = 0;
  let resizeObserver;

  function updateRendererSize() {
    const width = canvas.clientWidth || canvas.parentElement.clientWidth;
    const height = canvas.clientHeight || canvas.parentElement.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function prepareModel(object) {
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    object.position.x = -center.x;
    object.position.z = -center.z;
    object.position.y = 0.03 - box.min.y;

    const reframedBox = new THREE.Box3().setFromObject(object);
    const reframedSize = reframedBox.getSize(new THREE.Vector3());
    const reframedCenter = reframedBox.getCenter(new THREE.Vector3());
    const distance = Math.max((reframedSize.y * 1.32) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5))), 2.55);
    camera.position.set(distance * 0.15, reframedCenter.y + reframedSize.y * 0.08, distance);
    camera.lookAt(0, reframedCenter.y + reframedSize.y * 0.04, 0);
    shadowDisc.scale.setScalar(Math.min(1.18, Math.max(0.76, Math.max(size.x, size.z))));
  }

  loader.load("./assets/character/苏秦.glb", (gltf) => {
    modelRoot = gltf.scene;
    modelRoot.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = false;
      }
    });
    scene.add(modelRoot);
    prepareModel(modelRoot);
    loadingElement?.classList.add("hidden");
  }, undefined, () => {
    loadingElement?.classList.add("hidden");
  });

  function animate() {
    frameId = window.requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();
    if (modelRoot) modelRoot.rotation.y = elapsed * 0.36;
    ring.rotation.z = Math.sin(elapsed * 0.65) * 0.03;
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
      renderer.dispose();
      scene.traverse((child) => {
        if (child.geometry) child.geometry.dispose?.();
        if (child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach((material) => material.dispose?.());
        }
      });
    }
  };
}
