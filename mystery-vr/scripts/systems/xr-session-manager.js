const XR_SESSION_STATE = {
  status: '未开始',
  lastErrorName: '',
  lastErrorMessage: '',
  requestInUserGestureChain: false,
  requiredFeatures: ['local-floor'],
  optionalFeatures: ['bounded-floor', 'hand-tracking', 'layers', 'dom-overlay']
};

export function getXrSessionState() {
  return { ...XR_SESSION_STATE };
}

export async function beginImmersiveVRFromUserGesture({ navigatorXR, renderer, sessionOptions = {}, diagnostics = null }) {
  XR_SESSION_STATE.status = '正在请求';
  XR_SESSION_STATE.lastErrorName = '';
  XR_SESSION_STATE.lastErrorMessage = '';
  XR_SESSION_STATE.requestInUserGestureChain = true;

  if (!window.isSecureContext || window.location.protocol !== 'https:') {
    XR_SESSION_STATE.status = '失败';
    XR_SESSION_STATE.lastErrorName = 'InsecureContext';
    XR_SESSION_STATE.lastErrorMessage = '当前页面不是 HTTPS 安全上下文，WebXR 无法启动。';
    throw new Error(XR_SESSION_STATE.lastErrorMessage);
  }

  if (!navigatorXR?.requestSession) {
    XR_SESSION_STATE.status = '失败';
    XR_SESSION_STATE.lastErrorName = 'NavigatorXrUnavailable';
    XR_SESSION_STATE.lastErrorMessage = '当前浏览器未提供 WebXR 能力。';
    throw new Error(XR_SESSION_STATE.lastErrorMessage);
  }

  if (diagnostics && diagnostics.immersiveVrSupported === false) {
    XR_SESSION_STATE.status = '失败';
    XR_SESSION_STATE.lastErrorName = 'ImmersiveVrUnsupported';
    XR_SESSION_STATE.lastErrorMessage = diagnostics.reason || '当前设备或浏览器暂不支持 immersive-vr。';
    throw new Error(XR_SESSION_STATE.lastErrorMessage);
  }

  const requiredFeatures = sessionOptions.requiredFeatures ?? XR_SESSION_STATE.requiredFeatures;
  const optionalFeatures = sessionOptions.optionalFeatures ?? XR_SESSION_STATE.optionalFeatures;
  XR_SESSION_STATE.requiredFeatures = [...requiredFeatures];
  XR_SESSION_STATE.optionalFeatures = [...optionalFeatures];

  try {
    const session = await navigatorXR.requestSession('immersive-vr', {
      requiredFeatures,
      optionalFeatures,
      ...sessionOptions
    });

    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType?.('local-floor');
    await renderer.xr.setSession(session);
    XR_SESSION_STATE.status = '已进入';
    session.addEventListener('end', () => {
      XR_SESSION_STATE.status = '已结束';
    });
    return session;
  } catch (error) {
    XR_SESSION_STATE.status = '失败';
    XR_SESSION_STATE.lastErrorName = error?.name ?? 'UnknownError';
    XR_SESSION_STATE.lastErrorMessage = error?.message ?? 'WebXR 会话请求失败。';
    throw error;
  }
}
