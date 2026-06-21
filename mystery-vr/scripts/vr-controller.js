import * as THREE from "three";

export class VRControllerSystem {
  constructor({ engine, interactionSystem, playerController, xrButtonHost, supportLabel }) {
    this.engine = engine;
    this.interactionSystem = interactionSystem;
    this.playerController = playerController;
    this.xrButtonHost = xrButtonHost;
    this.supportLabel = supportLabel;
    this.controllers = [];
    this.turnCooldown = 0;
  }

  async init() {
    if (!navigator.xr) {
      this.supportLabel.textContent = "当前浏览器或设备暂不支持 WebXR，请先使用桌面探索模式。";
      return;
    }

    const supported = await navigator.xr.isSessionSupported("immersive-vr");
    if (!supported) {
      this.supportLabel.textContent = "当前浏览器或设备暂不支持 WebXR，请先使用桌面探索模式。";
      return;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "launch-button secondary";
    button.textContent = "进入 VR 模式";
    button.addEventListener("click", () => this.enterVR());
    this.xrButtonHost.appendChild(button);

    this._setupControllers();
  }

  _setupControllers() {
    for (let index = 0; index < 2; index += 1) {
      const controller = this.engine.renderer.xr.getController(index);
      controller.addEventListener("selectstart", () => {
        this.interactionSystem.updateXRFocus(controller);
        this.interactionSystem.triggerXR();
      });

      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -3)]),
        new THREE.LineBasicMaterial({ color: "#f0cb8d" })
      );
      controller.add(line);

      this.engine.scene.add(controller);
      this.controllers.push(controller);
    }
  }

  async enterVR() {
    try {
      const session = await navigator.xr.requestSession("immersive-vr", {
        optionalFeatures: ["local-floor", "bounded-floor", "hand-tracking"]
      });
      this.engine.renderer.xr.setSession(session);
      this.supportLabel.textContent = "VR 模式已开启：右手扳机交互，左摇杆移动，右摇杆转向。";
      this.playerController.setXRMode(true);
      this.playerController.applyGrounding();
      session.addEventListener("end", () => {
        this.playerController.setXRMode(false);
        this.supportLabel.textContent = "已退出 VR 模式，当前回到桌面探索。";
      });
    } catch (error) {
      console.warn("[WebXR] 进入 VR 失败", error);
      this.supportLabel.textContent = "进入 VR 失败，请确认浏览器、设备与页面访问环境支持 WebXR。";
    }
  }

  update(delta) {
    if (!this.engine.renderer.xr.isPresenting) return;

    this.controllers.forEach((controller) => this.interactionSystem.updateXRFocus(controller));

    const session = this.engine.renderer.xr.getSession();
    const referenceSpace = this.engine.renderer.xr.getReferenceSpace();
    if (!session || !referenceSpace) return;

    const inputSources = session.inputSources ?? [];
    const leftSource = inputSources.find((source) => source.handedness === "left" && source.gamepad);
    const rightSource = inputSources.find((source) => source.handedness === "right" && source.gamepad);

    if (leftSource?.gamepad) {
      const [xAxis = 0, yAxis = 0] = leftSource.gamepad.axes;
      const moveVector = new THREE.Vector3(xAxis, 0, yAxis);
      if (moveVector.lengthSq() > 0.08) {
        const xrCamera = this.engine.renderer.xr.getCamera(this.engine.camera);
        const forward = new THREE.Vector3();
        xrCamera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();
        const right = new THREE.Vector3(forward.z, 0, -forward.x);
        const movement = new THREE.Vector3()
          .addScaledVector(right, xAxis)
          .addScaledVector(forward, yAxis)
          .multiplyScalar(delta * 2.05);
        this.playerController.moveByWorldVector(movement);
      }
    }

    this.turnCooldown -= delta;
    if (rightSource?.gamepad && this.turnCooldown <= 0) {
      const [xAxis = 0] = rightSource.gamepad.axes;
      if (Math.abs(xAxis) > 0.72) {
        this.playerController.yaw -= Math.sign(xAxis) * 0.34;
        this.turnCooldown = 0.24;
      }
    }
  }
}
