import * as THREE from 'three';
import { waitForNextFrame } from './game-engine.js';
import { beginImmersiveVRFromUserGesture, getXrSessionState } from './systems/xr-session-manager.js';
import { XRLoadingRoom } from './systems/xr-loading-room.js';
import {
  canEnterImmersiveVr,
  formatWebXrSupportMessage,
  getWebXrDiagnostics,
  summarizeXrRuntimeState,
  validateXrViewAgainstSceneBounds
} from './systems/webxr-diagnostics.js';

const DEADZONE = 0.18;
const SNAP_TURN_ANGLE = Math.PI / 6;
const XR_PROMPT_DISTANCE = 1.45;
const UP = new THREE.Vector3(0, 1, 0);

function applyDeadzone(value, threshold = DEADZONE) {
  return Math.abs(value) < threshold ? 0 : value;
}

export class VRControllerSystem {
  constructor({
    engine,
    interactionSystem,
    playerController,
    buttonHosts = [],
    supportLabels = [],
    getMode,
    getObjective = () => '',
    getFocusedInteractable = () => null,
    ensureRuntimeStarted = async () => {}
  }) {
    this.engine = engine;
    this.interactionSystem = interactionSystem;
    this.playerController = playerController;
    this.buttonHosts = buttonHosts.filter(Boolean);
    this.supportLabels = supportLabels.filter(Boolean);
    this.getMode = getMode;
    this.getObjective = getObjective;
    this.getFocusedInteractable = getFocusedInteractable;
    this.ensureRuntimeStarted = ensureRuntimeStarted;
    this.controllers = [];
    this.turnCooldown = 0;
    this.supported = false;
    this.sessionActive = false;
    this.diagnostics = null;
    this.xrButtonElements = [];
    this.xrHud = null;
    this.xrHudCanvas = null;
    this.xrHudTexture = null;
    this.xrLoadingRoom = null;
    this.lastPrompt = '';
    this.lastObjective = '';
    this.lastValidation = null;
    this.validationCooldown = 0;
    this.xrRuntimeState = {
      sessionActive: false,
      renderLoopReady: false,
      xrLoadingRoomVisible: false,
      currentSceneReady: false,
      xrRigReady: false,
      hudReady: false
    };
  }

  async init() {
    this.diagnostics = await getWebXrDiagnostics();
    this.supported = canEnterImmersiveVr(this.diagnostics);
    this.#broadcastSupport(formatWebXrSupportMessage(this.diagnostics));
    this.#createButtons(this.supported);

    this.xrLoadingRoom = new XRLoadingRoom({ engine: this.engine });
    this.#setupXRHud();

    if (!this.supported) return;
    this.#setupControllers();
  }

  #broadcastSupport(message) {
    this.supportLabels.forEach((label) => {
      label.textContent = message;
    });
  }

  #createButtons(enabled = this.supported) {
    this.xrButtonElements.forEach((button) => button.remove());
    this.xrButtonElements = [];

    this.buttonHosts.forEach((host) => {
      host.innerHTML = '';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'launch-button';
      button.textContent = this.sessionActive ? '退出 VR 模式' : '进入 VR 模式';
      button.disabled = !enabled;
      if (enabled) {
        button.addEventListener('click', () => {
          if (this.sessionActive) {
            this.exitVR();
          } else {
            void this.enterVR();
          }
        });
      }
      host.appendChild(button);
      this.xrButtonElements.push(button);
    });
  }

  #setupControllers() {
    if (this.controllers.length) return;
    for (let index = 0; index < 2; index += 1) {
      const controller = this.engine.renderer.xr.getController(index);
      controller.userData.controllerIndex = index;
      controller.addEventListener('selectstart', () => {
        if (this.getMode?.() !== 'explore') return;
        this.interactionSystem.updateXRFocus(controller, this.playerController.getPosition(), 'explore');
        this.interactionSystem.tryInteract({ mode: 'explore', source: 'xr', playerPosition: this.playerController.getPosition() });
      });

      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -4)]),
        new THREE.LineBasicMaterial({ color: '#f0cb8d' })
      );
      line.name = 'xr-ray';
      controller.add(line);
      this.engine.scene.add(controller);
      this.controllers.push(controller);
    }
  }

  #setupXRHud() {
    if (this.xrHud) return;
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false });
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(1.28, 0.64), material);
    panel.position.set(0, -0.1, -XR_PROMPT_DISTANCE);
    panel.visible = false;

    this.xrHud = panel;
    this.xrHudCanvas = canvas;
    this.xrHudTexture = texture;
    this.engine.xrHudRoot.add(panel);
    this.xrRuntimeState.hudReady = true;
  }

  #renderXRHud(objectiveText, promptText) {
    if (!this.xrHudCanvas || !this.xrHudTexture) return;
    const context = this.xrHudCanvas.getContext('2d');
    context.clearRect(0, 0, this.xrHudCanvas.width, this.xrHudCanvas.height);
    context.fillStyle = 'rgba(36, 13, 12, 0.88)';
    context.strokeStyle = 'rgba(212, 169, 101, 0.72)';
    context.lineWidth = 4;
    context.beginPath();
    context.roundRect(18, 18, this.xrHudCanvas.width - 36, this.xrHudCanvas.height - 36, 24);
    context.fill();
    context.stroke();

    context.fillStyle = '#f3d8ab';
    context.font = 'bold 42px Microsoft YaHei, PingFang SC, Noto Sans SC, sans-serif';
    context.fillText('VR 调查提示', 48, 84);

    context.fillStyle = '#f9e7c3';
    context.font = '28px Microsoft YaHei, PingFang SC, Noto Sans SC, sans-serif';
    context.fillText('当前目标', 48, 156);
    context.font = '30px Microsoft YaHei, PingFang SC, Noto Sans SC, sans-serif';
    this.#drawWrappedText(context, objectiveText || '正在同步当前任务……', 48, 198, 928, 42);

    context.fillStyle = '#d8ab63';
    context.font = '28px Microsoft YaHei, PingFang SC, Noto Sans SC, sans-serif';
    context.fillText('互动提示', 48, 344);
    context.fillStyle = '#fff2d6';
    context.font = '30px Microsoft YaHei, PingFang SC, Noto Sans SC, sans-serif';
    this.#drawWrappedText(context, promptText || '将控制器射线对准 NPC、物件或传送门后按下扳机。', 48, 386, 928, 40);

    this.xrHudTexture.needsUpdate = true;
  }

  #drawWrappedText(context, text, x, startY, maxWidth, lineHeight) {
    const chars = Array.from(text || '');
    let line = '';
    let y = startY;
    chars.forEach((char) => {
      const testLine = line + char;
      if (context.measureText(testLine).width > maxWidth && line) {
        context.fillText(line, x, y);
        line = char;
        y += lineHeight;
      } else {
        line = testLine;
      }
    });
    if (line) context.fillText(line, x, y);
  }

  #setHudVisible(visible) {
    if (this.xrHud) this.xrHud.visible = visible;
    this.xrRuntimeState.hudReady = Boolean(this.xrHud);
  }

  #refreshRuntimeState() {
    this.xrRuntimeState.sessionActive = this.sessionActive;
    this.xrRuntimeState.renderLoopReady = this.engine.renderLoopActive;
    this.xrRuntimeState.xrLoadingRoomVisible = this.xrLoadingRoom?.isVisible?.() ?? false;
    this.xrRuntimeState.currentSceneReady = this.engine.worldRoot.visible && this.engine.worldRoot.children.length > 0;
    this.xrRuntimeState.xrRigReady = this.playerController.xrActive && this.engine.camera.parent === this.engine.xrLocomotionRig;
    this.xrRuntimeState.hudReady = Boolean(this.xrHud);
  }

  async #stabilizeXrView() {
    let validation = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await waitForNextFrame();
      await waitForNextFrame();
      validation = validateXrViewAgainstSceneBounds({ engine: this.engine, playerController: this.playerController });
      this.lastValidation = validation;
      this.#refreshRuntimeState();
      if (validation.ok) {
        this.xrLoadingRoom?.hide();
        this.#refreshRuntimeState();
        this.#broadcastSupport('VR 模式已开启：左摇杆移动，右摇杆转向，扳机互动。');
        return validation;
      }
      this.xrLoadingRoom?.show(validation.message || '正在重新校准 XR 视野……');
      this.playerController.enterXRMode({ spawn: this.playerController.getSafeSpawnPosition() });
    }

    this.#broadcastSupport(summarizeXrRuntimeState(this.xrRuntimeState, validation));
    return validation;
  }

  onSceneLoadStart(sceneId = '') {
    if (!this.sessionActive) return;
    this.xrLoadingRoom?.show(sceneId ? `正在切换至 ${sceneId} 对应场景……` : '正在切换场景……');
    this.#refreshRuntimeState();
  }

  async onSceneReady(sceneId = '') {
    if (!this.sessionActive) return;
    this.xrLoadingRoom?.show(sceneId ? `正在校验 ${sceneId} 的 XR 视野……` : '正在校验 XR 视野……');
    await this.#stabilizeXrView();
  }

  exitVR() {
    const session = this.engine.renderer.xr.getSession();
    if (session) {
      session.end().catch((error) => {
        console.warn('[WebXR] 退出 VR 失败', error);
      });
    }
  }

  async enterVR() {
    if (!this.supported) {
      this.#broadcastSupport(formatWebXrSupportMessage(this.diagnostics));
      return;
    }

    await this.ensureRuntimeStarted?.();
    this.xrLoadingRoom?.show('正在请求 immersive-vr 会话……');
    this.#refreshRuntimeState();

    try {
      const session = await beginImmersiveVRFromUserGesture({
        navigatorXR: navigator.xr,
        renderer: this.engine.renderer,
        diagnostics: this.diagnostics
      });
      this.sessionActive = true;
      this.playerController.enterXRMode({ spawn: this.playerController.getSafeSpawnPosition() });
      this.#createButtons(true);
      this.#setHudVisible(true);
      this.#refreshRuntimeState();
      await this.#stabilizeXrView();
      session.addEventListener('end', async () => {
        this.sessionActive = false;
        this.playerController.exitXRMode();
        this.xrLoadingRoom?.hide();
        this.#setHudVisible(false);
        this.diagnostics = await getWebXrDiagnostics();
        this.supported = canEnterImmersiveVr(this.diagnostics);
        this.#broadcastSupport(formatWebXrSupportMessage(this.diagnostics));
        this.#createButtons(this.supported);
        this.#refreshRuntimeState();
      });
    } catch (error) {
      console.warn('[WebXR] 进入 VR 失败', error);
      this.xrLoadingRoom?.show(error?.message || '进入 VR 失败，请检查 HTTPS、浏览器与设备支持。');
      this.#broadcastSupport(error?.message || '进入 VR 失败，请确认浏览器、设备与访问环境支持 WebXR。');
      this.#createButtons(this.supported);
      this.#refreshRuntimeState();
    }
  }

  update(delta, mode, playerPosition) {
    if (!this.engine.renderer.xr.isPresenting) return;

    this.validationCooldown -= delta;
    if (this.validationCooldown <= 0) {
      this.lastValidation = validateXrViewAgainstSceneBounds({ engine: this.engine, playerController: this.playerController });
      this.validationCooldown = 0.75;
      this.#refreshRuntimeState();
    }

    if (mode !== 'explore') {
      this.#setHudVisible(true);
      this.#renderXRHud(this.getObjective?.() ?? '', '当前处于对话或调查状态，已暂停移动。');
      return;
    }

    this.controllers.forEach((controller) => this.interactionSystem.updateXRFocus(controller, playerPosition, 'explore'));

    const focused = this.interactionSystem.xrFocus ?? this.getFocusedInteractable?.() ?? null;
    const promptText = focused
      ? '按下扳机' + focused.actionLabel + (focused.promptTitle ? '：' + focused.promptTitle : '')
      : '将控制器射线对准 NPC、物件或传送门后按下扳机。';
    const objectiveText = this.getObjective?.() ?? '';
    if (promptText !== this.lastPrompt || objectiveText !== this.lastObjective) {
      this.#setHudVisible(true);
      this.#renderXRHud(objectiveText, promptText);
      this.lastPrompt = promptText;
      this.lastObjective = objectiveText;
    }

    const session = this.engine.renderer.xr.getSession();
    if (!session) return;
    const inputSources = session.inputSources ?? [];
    const leftSource = inputSources.find((source) => source.handedness === 'left' && source.gamepad);
    const rightSource = inputSources.find((source) => source.handedness === 'right' && source.gamepad);

    if (leftSource?.gamepad) {
      const xAxis = applyDeadzone(leftSource.gamepad.axes?.[0] ?? 0);
      const yAxis = applyDeadzone(leftSource.gamepad.axes?.[1] ?? 0);
      const magnitude = xAxis * xAxis + yAxis * yAxis;
      if (magnitude > 0.001) {
        const xrCamera = this.engine.getActiveXrCamera();
        const forward = new THREE.Vector3();
        xrCamera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();
        const right = new THREE.Vector3().crossVectors(UP, forward).normalize();
        const movement = new THREE.Vector3()
          .addScaledVector(right, xAxis)
          .addScaledVector(forward, -yAxis)
          .multiplyScalar(delta * 2.45);
        this.playerController.moveXrRigByWorldVector(movement);
      }
    }

    this.turnCooldown -= delta;
    if (rightSource?.gamepad && this.turnCooldown <= 0) {
      const turnAxis = applyDeadzone(rightSource.gamepad.axes?.[0] ?? 0, 0.55);
      if (Math.abs(turnAxis) > 0) {
        this.playerController.rotateXrRigByRadians(-Math.sign(turnAxis) * SNAP_TURN_ANGLE);
        this.turnCooldown = 0.24;
      }
    }
  }

  getDebugState() {
    const session = this.engine.renderer.xr.getSession();
    const inputSources = session?.inputSources ?? [];
    const leftSource = inputSources.find((source) => source.handedness === 'left' && source.gamepad);
    const rightSource = inputSources.find((source) => source.handedness === 'right' && source.gamepad);
    return {
      supported: this.supported,
      sessionActive: this.sessionActive,
      controllerCount: this.controllers.length,
      leftAxes: leftSource?.gamepad?.axes ?? [],
      rightAxes: rightSource?.gamepad?.axes ?? [],
      diagnostics: this.diagnostics ?? null,
      sessionState: getXrSessionState(),
      runtimeState: { ...this.xrRuntimeState },
      validation: this.lastValidation
    };
  }
}
