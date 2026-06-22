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
