import * as THREE from "three";
import { sampleFloorPoint } from "./game-engine.js";
import { createCharacterActor } from "./npc-system.js";

export class PlayerController {
  constructor({ engine, manifest, hudNotice }) {
    this.engine = engine;
    this.manifest = manifest;
    this.hudNotice = hudNotice;
    this.keys = new Set();
    this.viewMode = "firstPerson";
    this.yaw = Math.PI;
    this.pitch = -0.06;
    this.mouseDragActive = false;
    this.sceneConfig = null;
    this.speed = 2.55;
    this.runMultiplier = 1.58;
    this.eyeHeight = 1.67;
    this.movementLocked = false;
    this.floorPoint = new THREE.Vector3();
    this.lastValidPosition = new THREE.Vector3(0, 0, 0);

    this.playerRoot = new THREE.Group();
    this.playerRoot.position.set(0, 0, 0);

    this.placeholder = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.25, 0.95, 8, 16),
      new THREE.MeshStandardMaterial({
        color: "#d8ab63",
        roughness: 0.66,
        metalness: 0.08
      })
    );
    this.placeholder.position.y = 0.8;
    this.playerRoot.add(this.placeholder);
    this.engine.addWorldObject(this.playerRoot);

    this.visualActor = null;
    this.isUsingPlaceholder = true;
    this.currentActorAction = null;
    this._setupInput();
  }

  async init() {
    const actor = await createCharacterActor({
      manifest: this.manifest.player,
      engine: this.engine,
      fallbackColor: "#d8ab63"
    });

    const hasAnimations = actor.animationNames.length > 0;
    const shouldUseActor = hasAnimations || !this.manifest.player.usePlaceholderWhenNoAnimation;

    if (shouldUseActor) {
      this.visualActor = actor;
      this.placeholder.visible = false;
      actor.root.position.set(0, actor.root.userData.groundLift ?? actor.root.position.y, 0);
      this.playerRoot.add(actor.root);
      this.isUsingPlaceholder = false;
      if (!hasAnimations) {
        this.showNotice("当前苏秦模型未附带动作动画，先以静态站姿进入朝堂。", 3200);
      }
      this._playActorAction("idle", true);
      return;
    }

    this.showNotice("当前使用临时角色占位，等待导入带动作的苏秦数字人模型。", 3200);
  }

  _setupInput() {
    this.onKeyDown = (event) => {
      this.keys.add(event.code);
    };
    this.onKeyUp = (event) => {
      this.keys.delete(event.code);
    };
    this.onMouseDown = (event) => {
      if (event.button !== 0) return;
      this.mouseDragActive = true;
      if (document.pointerLockElement !== this.engine.canvas && !this.engine.renderer.xr.isPresenting) {
        this.engine.canvas.requestPointerLock?.();
      }
    };
    this.onMouseUp = () => {
      this.mouseDragActive = false;
    };
    this.onMouseMove = (event) => {
      const pointerLocked = document.pointerLockElement === this.engine.canvas;
      if ((!pointerLocked && !this.mouseDragActive) || this.engine.renderer.xr.isPresenting) return;
      if (this.movementLocked) return;
      this.yaw -= event.movementX * 0.0028;
      this.pitch = THREE.MathUtils.clamp(this.pitch - event.movementY * 0.0022, -0.64, 0.42);
    };

    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    this.engine.canvas.addEventListener("mousedown", this.onMouseDown);
    this.engine.canvas.addEventListener("click", this.onMouseDown);
    window.addEventListener("mouseup", this.onMouseUp);
    window.addEventListener("mousemove", this.onMouseMove);

    this.engine.addCleanupTask(() => window.removeEventListener("keydown", this.onKeyDown));
    this.engine.addCleanupTask(() => window.removeEventListener("keyup", this.onKeyUp));
    this.engine.addCleanupTask(() => this.engine.canvas.removeEventListener("mousedown", this.onMouseDown));
    this.engine.addCleanupTask(() => this.engine.canvas.removeEventListener("click", this.onMouseDown));
    this.engine.addCleanupTask(() => window.removeEventListener("mouseup", this.onMouseUp));
    this.engine.addCleanupTask(() => window.removeEventListener("mousemove", this.onMouseMove));
  }

  setScene(sceneConfig) {
    this.sceneConfig = sceneConfig;
    this.eyeHeight = sceneConfig?.cameraHeight ?? 1.67;
    this.resetToSpawn();
  }

  setMovementLocked(locked) {
    this.movementLocked = locked;
  }

  resetToSpawn() {
    const start = this.sceneConfig?.playerStart ?? [0, 0, 3];
    this.playerRoot.position.set(start[0], start[1], start[2]);
    this.yaw = this.sceneConfig?.playerRotationY ?? Math.PI;
    this.pitch = -0.06;
    this.applyGrounding();
    this.lastValidPosition.copy(this.playerRoot.position);
  }

  toggleViewMode() {
    this.viewMode = this.viewMode === "thirdPerson" ? "firstPerson" : "thirdPerson";
    this.showNotice(this.viewMode === "thirdPerson" ? "已切换为第三人称跟随视角。" : "已切换为第一人称调查视角。");
  }

  setXRMode(active) {
    this.placeholder.visible = !active && this.isUsingPlaceholder;
    if (this.visualActor?.root) this.visualActor.root.visible = !active && !this.isUsingPlaceholder && this.viewMode === "thirdPerson";
    if (active) this.viewMode = "firstPerson";
  }

  moveByWorldVector(vector) {
    this.playerRoot.position.add(vector);
    this._clampToWalkArea();
    this.applyGrounding();
  }

  update(delta) {
    if (this.engine.renderer.xr.isPresenting) return;

    const pointerLocked = document.pointerLockElement === this.engine.canvas;
    const allowMovement = !this.movementLocked;
    const wantsToRun = this.keys.has("ShiftLeft") || this.keys.has("ShiftRight");
    const moveSpeed = this.speed * (wantsToRun ? this.runMultiplier : 1);
    const moveDirection = new THREE.Vector3();
    const previousPosition = this.playerRoot.position.clone();

    if (allowMovement) {
      if (this.keys.has("KeyW")) moveDirection.z -= 1;
      if (this.keys.has("KeyS")) moveDirection.z += 1;
      if (this.keys.has("KeyA")) moveDirection.x -= 1;
      if (this.keys.has("KeyD")) moveDirection.x += 1;
    }

    const hasMovementInput = moveDirection.lengthSq() > 0;

    if (hasMovementInput) {
      moveDirection.normalize();
      const forward = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw));
      const right = new THREE.Vector3(forward.z, 0, -forward.x);
      const movement = new THREE.Vector3()
        .addScaledVector(forward, -moveDirection.z)
        .addScaledVector(right, moveDirection.x)
        .normalize()
        .multiplyScalar(moveSpeed * delta);
      this.playerRoot.position.add(movement);
      this._clampToWalkArea();
      const snapped = this.applyGrounding();
      if (!snapped) {
        this.playerRoot.position.copy(previousPosition);
        this.applyGrounding();
      } else {
        this.lastValidPosition.copy(this.playerRoot.position);
      }
    } else {
      this.applyGrounding();
    }

    const isMoving = hasMovementInput && this.playerRoot.position.distanceToSquared(previousPosition) > 1e-6;
    this._syncVisualActor(delta, { isMoving, isRunning: wantsToRun && isMoving });
    this._updateBodyVisibility(pointerLocked);
    this._updateCamera();
  }

  applyGrounding() {
    const point = sampleFloorPoint(this.playerRoot.position.x, this.playerRoot.position.z, {
      sceneColliders: this.engine.sceneColliders,
      rayStartHeight: 6,
      maxDistance: 24,
      prefer: "highest",
      referenceY: this.playerRoot.position.y,
      maxRise: 1.4,
      maxDrop: 7,
      target: this.floorPoint
    });
    if (!point) return null;
    this.playerRoot.position.y = point.y;
    return point;
  }

  _clampToWalkArea() {
    const area = this.sceneConfig?.walkArea;
    if (!area) return;
    this.playerRoot.position.x = THREE.MathUtils.clamp(this.playerRoot.position.x, area.minX, area.maxX);
    this.playerRoot.position.z = THREE.MathUtils.clamp(this.playerRoot.position.z, area.minZ, area.maxZ);
  }


  _syncVisualActor(delta, { isMoving, isRunning }) {
    const actorRoot = this.visualActor?.root;
    if (!actorRoot) return;

    actorRoot.rotation.y = THREE.MathUtils.lerp(
      actorRoot.rotation.y,
      Math.PI - this.yaw,
      Math.min(delta * 7.5, 0.24)
    );

    const nextAction = isMoving ? (isRunning ? "run" : "walk") : "idle";
    this._playActorAction(nextAction);
  }

  _playActorAction(actionKey, immediate = false) {
    const actions = this.visualActor?.actions;
    if (!actions) return;
    const nextAction = actions[actionKey] ?? actions.walk ?? actions.idle ?? null;
    if (!nextAction) return;
    if (this.currentActorAction === nextAction) return;

    Object.values(actions).forEach((action) => {
      if (!action || action === nextAction) return;
      action.fadeOut(immediate ? 0.01 : 0.18);
    });

    nextAction.reset();
    nextAction.enabled = true;
    nextAction.fadeIn(immediate ? 0.01 : 0.18).play();
    this.currentActorAction = nextAction;
  }

  _updateBodyVisibility(pointerLocked) {
    if (!this.visualActor?.root) return;
    const shouldShowBody = this.viewMode === "thirdPerson" && !this.engine.renderer.xr.isPresenting;
    this.visualActor.root.visible = shouldShowBody;
    this.placeholder.visible = shouldShowBody && this.isUsingPlaceholder;
  }

  _updateCamera() {
    const target = this.playerRoot.position.clone().add(new THREE.Vector3(0, this.eyeHeight, 0));
    const forward = new THREE.Vector3(
      Math.sin(this.yaw) * Math.cos(this.pitch),
      Math.sin(this.pitch),
      Math.cos(this.yaw) * Math.cos(this.pitch)
    );

    if (this.viewMode === "firstPerson" || this.engine.renderer.xr.isPresenting) {
      this.engine.camera.position.copy(target);
      this.engine.camera.lookAt(target.clone().add(forward));
      return;
    }

    const radius = 4.3;
    const cameraOffset = new THREE.Vector3(
      -Math.sin(this.yaw) * radius,
      2.15 + Math.max(this.pitch, -0.1) * 1.2,
      -Math.cos(this.yaw) * radius
    );
    const cameraTarget = target.clone().add(cameraOffset);
    this.engine.camera.position.lerp(cameraTarget, 0.16);
    this.engine.camera.lookAt(target.clone().add(new THREE.Vector3(0, 0.2, 0)));
  }

  getPosition() {
    return this.playerRoot.getWorldPosition(new THREE.Vector3());
  }

  getEyePosition() {
    return this.playerRoot.position.clone().add(new THREE.Vector3(0, this.eyeHeight, 0));
  }

  getForwardVector() {
    return new THREE.Vector3(
      Math.sin(this.yaw) * Math.cos(this.pitch),
      Math.sin(this.pitch),
      Math.cos(this.yaw) * Math.cos(this.pitch)
    ).normalize();
  }

  getDebugState() {
    return {
      player: this.playerRoot.position.clone(),
      camera: this.engine.camera.position.clone(),
      yaw: this.yaw,
      pitch: this.pitch,
      floor: this.floorPoint.clone(),
      viewMode: this.viewMode,
      eyeHeight: this.eyeHeight
    };
  }

  showNotice(message, duration = 2600) {
    if (!this.hudNotice) return;
    this.hudNotice.textContent = message;
    this.hudNotice.classList.add("is-visible");
    window.clearTimeout(this.noticeTimer);
    this.noticeTimer = window.setTimeout(() => {
      this.hudNotice.classList.remove("is-visible");
    }, duration);
  }
}
