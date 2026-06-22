import * as THREE from 'three';

const WORLD_BOUNDS = new THREE.Box3();
const WORLD_SIZE = new THREE.Vector3();
const WORLD_CENTER = new THREE.Vector3();
const XR_CAMERA_POSITION = new THREE.Vector3();
const XR_RIG_POSITION = new THREE.Vector3();

export async function getWebXrDiagnostics() {
  const diagnostics = {
    isSecureContext: Boolean(window.isSecureContext),
    protocol: window.location.protocol,
    host: window.location.host,
    href: window.location.href,
    isTopLevel: true,
    isIframe: false,
    hasNavigatorXR: Boolean(navigator.xr),
    immersiveVrSupported: false,
    xrSpatialTrackingAllowed: true,
    permissionPolicySource: document.permissionsPolicy ? 'permissionsPolicy' : document.featurePolicy ? 'featurePolicy' : 'unknown',
    reason: ''
  };

  try {
    diagnostics.isTopLevel = window.self === window.top;
    diagnostics.isIframe = !diagnostics.isTopLevel;
  } catch {
    diagnostics.isTopLevel = false;
    diagnostics.isIframe = true;
  }

  const permissionsPolicy = document.permissionsPolicy ?? document.featurePolicy ?? null;
  if (permissionsPolicy?.allowsFeature) {
    try {
      diagnostics.xrSpatialTrackingAllowed = Boolean(permissionsPolicy.allowsFeature('xr-spatial-tracking'));
    } catch {
      diagnostics.xrSpatialTrackingAllowed = true;
    }
  }

  if (navigator.xr?.isSessionSupported) {
    try {
      diagnostics.immersiveVrSupported = await navigator.xr.isSessionSupported('immersive-vr');
    } catch (error) {
      diagnostics.immersiveVrSupported = false;
      diagnostics.reason = `immersive-vr 检测失败：${error?.message ?? '未知错误'}`;
    }
  }

  if (!diagnostics.isSecureContext) {
    diagnostics.reason = '当前页面不是安全上下文，WebXR 需要 HTTPS 或 localhost。';
  } else if (!diagnostics.isTopLevel && !diagnostics.xrSpatialTrackingAllowed) {
    diagnostics.reason = '当前页面被嵌入且 xr-spatial-tracking 未放行。';
  } else if (!diagnostics.hasNavigatorXR) {
    diagnostics.reason = '当前浏览器没有暴露 navigator.xr。';
  } else if (!diagnostics.immersiveVrSupported) {
    diagnostics.reason = diagnostics.reason || '当前浏览器或设备不支持 immersive-vr。';
  } else {
    diagnostics.reason = 'WebXR 可用，可点击进入 VR 模式。';
  }

  return diagnostics;
}

export function canEnterImmersiveVr(diagnostics) {
  return Boolean(
    diagnostics?.isSecureContext &&
    diagnostics?.hasNavigatorXR &&
    diagnostics?.immersiveVrSupported &&
    diagnostics?.xrSpatialTrackingAllowed !== false
  );
}

export function formatWebXrSupportMessage(diagnostics) {
  if (!diagnostics) return '正在检测 WebXR 环境……';
  return diagnostics.reason || '正在检测 WebXR 环境……';
}

export function validateXrViewAgainstSceneBounds({ engine, playerController = null } = {}) {
  const issues = [];
  const result = {
    ok: false,
    issues,
    worldVisible: Boolean(engine?.worldRoot?.visible),
    worldChildCount: engine?.worldRoot?.children?.length ?? 0,
    visibleMeshCount: 0,
    sceneBoundsEmpty: true,
    xrRigPosition: new THREE.Vector3(),
    xrCameraPosition: new THREE.Vector3(),
    message: ''
  };

  if (!engine?.worldRoot) {
    issues.push('未找到场景根节点。');
    result.message = issues.join('；');
    return result;
  }

  engine.worldRoot.updateMatrixWorld(true);
  if (!engine.worldRoot.visible) {
    issues.push('场景根节点当前不可见。');
  }

  engine.worldRoot.traverse((child) => {
    if (child.visible && child.isMesh) result.visibleMeshCount += 1;
  });
  if (!result.visibleMeshCount) {
    issues.push('场景中没有可见 Mesh。');
  }

  WORLD_BOUNDS.setFromObject(engine.worldRoot);
  result.sceneBoundsEmpty = WORLD_BOUNDS.isEmpty();
  if (result.sceneBoundsEmpty) {
    issues.push('场景包围盒为空。');
  }

  const xrCamera = engine.getActiveXrCamera?.() ?? engine.renderer?.xr?.getCamera?.(engine.camera);
  if (!xrCamera) {
    issues.push('未能取得 XR Camera。');
    result.message = issues.join('；');
    return result;
  }

  engine.xrLocomotionRig.getWorldPosition(XR_RIG_POSITION);
  xrCamera.getWorldPosition(XR_CAMERA_POSITION);
  result.xrRigPosition.copy(XR_RIG_POSITION);
  result.xrCameraPosition.copy(XR_CAMERA_POSITION);

  if (!result.sceneBoundsEmpty) {
    WORLD_BOUNDS.getSize(WORLD_SIZE);
    WORLD_BOUNDS.getCenter(WORLD_CENTER);

    const marginX = Math.max(6, WORLD_SIZE.x * 0.35);
    const marginY = Math.max(3, WORLD_SIZE.y * 0.4);
    const marginZ = Math.max(6, WORLD_SIZE.z * 0.35);
    const rigOutside =
      XR_RIG_POSITION.x < WORLD_BOUNDS.min.x - marginX || XR_RIG_POSITION.x > WORLD_BOUNDS.max.x + marginX ||
      XR_RIG_POSITION.z < WORLD_BOUNDS.min.z - marginZ || XR_RIG_POSITION.z > WORLD_BOUNDS.max.z + marginZ;
    const cameraOutside =
      XR_CAMERA_POSITION.x < WORLD_BOUNDS.min.x - marginX || XR_CAMERA_POSITION.x > WORLD_BOUNDS.max.x + marginX ||
      XR_CAMERA_POSITION.y < WORLD_BOUNDS.min.y - 1.5 || XR_CAMERA_POSITION.y > WORLD_BOUNDS.max.y + marginY ||
      XR_CAMERA_POSITION.z < WORLD_BOUNDS.min.z - marginZ || XR_CAMERA_POSITION.z > WORLD_BOUNDS.max.z + marginZ;

    if (rigOutside) {
      issues.push('XR Rig 位于场景有效范围之外。');
    }
    if (cameraOutside) {
      issues.push('XR Camera 位于场景包围盒之外。');
    }

    const sceneDistance = XR_CAMERA_POSITION.distanceTo(WORLD_CENTER);
    const farLimit = Math.max(12, WORLD_SIZE.length() * 1.6);
    if (sceneDistance > farLimit) {
      issues.push('XR Camera 距离场景中心过远。');
    }
  }

  if (playerController?.getSafeSpawnPosition) {
    const safeSpawn = playerController.getSafeSpawnPosition();
    if (!Number.isFinite(safeSpawn.y)) {
      issues.push('未能解析可用出生点高度。');
    }
  }

  result.ok = issues.length === 0;
  result.message = result.ok ? 'XR 相机已对准场景范围。' : issues.join('；');
  return result;
}

export function summarizeXrRuntimeState(runtimeState = {}, validation = null) {
  const flags = [
    runtimeState.sessionActive ? 'session' : 'no-session',
    runtimeState.renderLoopReady ? 'loop' : 'no-loop',
    runtimeState.currentSceneReady ? 'scene' : 'no-scene',
    runtimeState.xrRigReady ? 'rig' : 'no-rig',
    runtimeState.hudReady ? 'hud' : 'no-hud'
  ];
  if (validation?.ok) return `XR 运行态正常：${flags.join(' / ')}`;
  return `XR 运行态待校准：${flags.join(' / ')}${validation?.message ? ` ｜ ${validation.message}` : ''}`;
}
