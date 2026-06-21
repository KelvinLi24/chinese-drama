import * as THREE from 'three';
import { sampleFloorPoint } from './game-engine.js';
import { createCharacterActor } from './npc-system.js';
import { MODEL_CALIBRATION } from './data/model-calibration.js';

function rotateTowardsAngle(current, target, maxStep) {
  let delta = target - current;
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;
  if (Math.abs(delta) <= maxStep) return target;
  return current + Math.sign(delta) * maxStep;
}

function copyScale(target, source, multiplier = 1) {
  if (!target || !source) return;
  target.copy(source).multiplyScalar(multiplier);
}

export class PlayerController {
  constructor({ engine, manifest, hudNotice, canCapturePointer = null }) {
    this.engine = engine;
    this.manifest = manifest;
    this.hudNotice = hudNotice;
    this.canCapturePointer = canCapturePointer;

    this.settings = MODEL_CALIBRATION.player;
    this.keys = new Set();
    this.viewMode = 'firstPerson';
    this.sceneConfig = null;
    this.sceneId = '';
    this.yaw = Math.PI;
    this.pitch = -0.06;
    this.cameraYaw = Math.PI;
    this.cameraPitch = -0.24;
    this.eyeHeight = 1.68;
    this.movementLocked = false;
    this.verticalVelocity = 0;
    this.isGrounded = true;
    this.jumpUpgraded = false;
    this.lastSpacePressTime = 0;
    this.lastMovementDirection = new THREE.Vector3();
    this.floorPoint = new THREE.Vector3();
    this.cameraLookTarget = new THREE.Vector3();
    this.currentAnimationName = '静止';

    this.playerRoot = new THREE.Group();
    this.engine.addWorldObject(this.playerRoot);

    this.placeholder = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.24, 0.96, 8, 16),
      new THREE.MeshStandardMaterial({ color: '#d8ab63', roughness: 0.68, metalness: 0.08 })
    );
    this.placeholder.position.y = 0.86;
    this.playerRoot.add(this.placeholder);

    this.visualActor = null;
    this.staticActor = null;
    this.currentBodyMode = 'hidden';
    this._bindInput();
  }

  async init() {
    this.visualActor = await createCharacterActor({
      manifest: this.manifest.player,
      engine: this.engine,
      fallbackColor: '#d8ab63'
    });

    if (this.manifest.player.fallbackPath) {
      this.staticActor = await createCharacterActor({
        manifest: {
          ...this.manifest.player,
          title: `${this.manifest.player.title}·静态`,
          path: this.manifest.player.fallbackPath,
          fallbackPath: ''
        },
        engine: this.engine,
        fallbackColor: '#d8ab63'
      });
    }

    this.placeholder.visible = false;

    if (this.visualActor?.root) {
      this.visualActor.root.rotation.y = this.manifest.player.modelForwardOffsetY ?? 0;
      this.visualActor.baseScale = this.visualActor.root.scale.clone();
      this.playerRoot.add(this.visualActor.root);
    }

    if (this.staticActor?.root) {
      this.staticActor.root.rotation.y = this.manifest.player.modelForwardOffsetY ?? 0;
      this.staticActor.baseScale = this.staticActor.root.scale.clone();
      this.staticActor.root.visible = false;
      this.playerRoot.add(this.staticActor.root);
    }

    this._applySceneVisualScale();
    this._playActorAction('idle', true);
    this._updateVisibleBody(false);
  }

  _bindInput() {
    this.onKeyDown = (event) => {
      if (event.code === 'Space' && !event.repeat) {
        this._handleJumpPress();
      }
      this.keys.add(event.code);
    };

    this.onKeyUp = (event) => {
      this.keys.delete(event.code);
    };

    this.onMouseMove = (event) => {
      if (this.engine.renderer.xr.isPresenting || this.movementLocked) return;
      if (document.pointerLockElement !== this.engine.canvas) return;

      if (this.viewMode === 'firstPerson') {
        this.yaw -= event.movementX * 0.0026;
        this.pitch = THREE.MathUtils.clamp(this.pitch - event.movementY * 0.0021, -0.68, 0.42);
        this.cameraYaw = this.yaw;
        this.cameraPitch = this.pitch;
        return;
      }

      this.cameraYaw -= event.movementX * 0.0024;
      this.cameraPitch = THREE.MathUtils.clamp(this.cameraPitch - event.movementY * 0.0018, -0.48, 0.34);
    };

    this.onCanvasClick = () => {
      if (this.engine.renderer.xr.isPresenting) return;
      if (this.canCapturePointer && !this.canCapturePointer()) return;
      if (document.pointerLockElement !== this.engine.canvas) {
        this.engine.canvas.requestPointerLock?.();
      }
    };

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('mousemove', this.onMouseMove);
    this.engine.canvas.addEventListener('click', this.onCanvasClick);

    this.engine.addCleanupTask(() => window.removeEventListener('keydown', this.onKeyDown));
    this.engine.addCleanupTask(() => window.removeEventListener('keyup', this.onKeyUp));
    this.engine.addCleanupTask(() => window.removeEventListener('mousemove', this.onMouseMove));
    this.engine.addCleanupTask(() => this.engine.canvas.removeEventListener('click', this.onCanvasClick));
  }

  setScene(sceneConfig) {
    this.sceneConfig = sceneConfig;
    this.sceneId = sceneConfig?.id ?? '';
    this.eyeHeight = sceneConfig?.cameraHeight ?? 1.68;
    this._applySceneVisualScale();
    this.resetToSpawn();
  }

  setMovementLocked(locked) {
    this.movementLocked = locked;
  }

  requestPointerLock() {
    if (this.engine.renderer.xr.isPresenting) return;
    if (this.canCapturePointer && !this.canCapturePointer()) return;
    if (document.pointerLockElement !== this.engine.canvas) this.engine.canvas.requestPointerLock?.();
  }

  releasePointerLock() {
    if (document.pointerLockElement === this.engine.canvas) document.exitPointerLock?.();
  }

  resetToSpawn() {
    const start = this.sceneConfig?.playerStart ?? [0, 0, 4];
    const facing = this.sceneConfig?.playerRotationY ?? Math.PI;
    this.playerRoot.position.set(start[0], start[1], start[2]);
    this.yaw = facing;
    this.pitch = -0.06;
    this.cameraYaw = facing;
    this.cameraPitch = this.viewMode === 'thirdPerson' ? -0.22 : -0.06;
    this.verticalVelocity = 0;
    this.isGrounded = true;
    this.jumpUpgraded = false;
    this.lastMovementDirection.set(0, 0, 0);
    this._snapToGround(true);
    this._updateCamera(true);
  }

  toggleViewMode() {
    if (this.engine.renderer.xr.isPresenting) return;
    this.viewMode = this.viewMode === 'firstPerson' ? 'thirdPerson' : 'firstPerson';
    if (this.viewMode === 'thirdPerson') {
      this.cameraYaw = this.yaw;
      this.cameraPitch = -0.22;
      this.showNotice('已切换为自由第三人称视角。');
    } else {
      this.yaw = this.cameraYaw;
      this.pitch = THREE.MathUtils.clamp(this.cameraPitch, -0.68, 0.42);
      this.showNotice('已切换为第一人称调查视角。');
    }
    this._updateVisibleBody(false);
    this._updateCamera(true);
  }

  setXRMode(active) {
    if (active) this.viewMode = 'firstPerson';
    this._updateVisibleBody(false);
    this._updateCamera(true);
  }

  moveByWorldVector(vector) {
    if (!vector?.lengthSq?.()) return;
    const previous = this.playerRoot.position.clone();
    this.playerRoot.position.add(new THREE.Vector3(vector.x, 0, vector.z));
    this._clampToWalkArea();
    this._snapToGround(true);
    if (!this.floorPoint) this.playerRoot.position.copy(previous);
  }

  update(delta) {
    if (this.engine.renderer.xr.isPresenting) return;

    const movementDirection = this._getCameraRelativeMoveDirection();
    const hasMovement = movementDirection.lengthSq() > 0;
    const isRunning = (this.keys.has('ShiftLeft') || this.keys.has('ShiftRight')) && hasMovement;
    const speed = this.settings.speed * (isRunning ? this.settings.runMultiplier : 1);

    if (!this.movementLocked && hasMovement) {
      const desiredYaw = Math.atan2(movementDirection.x, movementDirection.z);
      this.yaw = rotateTowardsAngle(this.yaw, desiredYaw, this.settings.turnSpeed * delta);
      this.playerRoot.position.addScaledVector(movementDirection, speed * delta);
      this._clampToWalkArea();
      this.lastMovementDirection.copy(movementDirection);
    } else {
      this.lastMovementDirection.set(0, 0, 0);
    }

    this._updateVerticalMotion(delta);
    this._updateActorState({ moving: this.lastMovementDirection.lengthSq() > 0.0001, running: isRunning });
    this._updateVisibleBody(hasMovement);
    this._updateCamera();
  }

  _getCameraRelativeMoveDirection() {
    if (this.movementLocked) return new THREE.Vector3();

    const forwardInput = (this.keys.has('KeyW') ? 1 : 0) - (this.keys.has('KeyS') ? 1 : 0);
    const rightInput = (this.keys.has('KeyD') ? 1 : 0) - (this.keys.has('KeyA') ? 1 : 0);
    if (!forwardInput && !rightInput) return new THREE.Vector3();

    const referenceYaw = this.viewMode === 'thirdPerson' ? this.cameraYaw : this.yaw;
    const forward = new THREE.Vector3(Math.sin(referenceYaw), 0, Math.cos(referenceYaw)).normalize();
    const right = new THREE.Vector3(forward.z, 0, -forward.x).normalize();
    const direction = new THREE.Vector3()
      .addScaledVector(forward, forwardInput)
      .addScaledVector(right, rightInput);

    return direction.lengthSq() > 0 ? direction.normalize() : direction;
  }

  _handleJumpPress() {
    if (this.movementLocked || this.engine.renderer.xr.isPresenting) return;
    const now = performance.now();

    if (this.isGrounded) {
      this.verticalVelocity = this.settings.jumpVelocity;
      this.isGrounded = false;
      this.jumpUpgraded = false;
      this.lastSpacePressTime = now;
      this.currentAnimationName = '跳跃';
      return;
    }

    if (!this.jumpUpgraded && now - this.lastSpacePressTime <= this.settings.doubleTapWindow) {
      this.verticalVelocity = Math.max(this.verticalVelocity, this.settings.highJumpVelocity);
      this.jumpUpgraded = true;
      this.currentAnimationName = '高跳';
    }
    this.lastSpacePressTime = now;
  }

  _updateVerticalMotion(delta) {
    const previousY = this.playerRoot.position.y;
    const floor = sampleFloorPoint(this.playerRoot.position.x, this.playerRoot.position.z, {
      sceneColliders: this.engine.sceneColliders,
      rayStartHeight: 20,
      maxDistance: 40,
      prefer: 'highest',
      referenceY: this.playerRoot.position.y,
      maxRise: 2.4,
      maxDrop: 18,
      target: this.floorPoint
    });

    if (this.isGrounded) {
      if (floor) this.playerRoot.position.y = floor.y;
      return;
    }

    this.verticalVelocity -= this.settings.gravity * delta;
    this.playerRoot.position.y += this.verticalVelocity * delta;

    if (floor && this.playerRoot.position.y <= floor.y) {
      this.playerRoot.position.y = floor.y;
      this.verticalVelocity = 0;
      this.isGrounded = true;
      this.jumpUpgraded = false;
      return;
    }

    if (Math.abs(this.playerRoot.position.y - previousY) < 0.0001 && floor) {
      this.playerRoot.position.y = floor.y;
      this.verticalVelocity = 0;
      this.isGrounded = true;
      this.jumpUpgraded = false;
    }
  }

  _snapToGround(force = false) {
    const floor = sampleFloorPoint(this.playerRoot.position.x, this.playerRoot.position.z, {
      sceneColliders: this.engine.sceneColliders,
      rayStartHeight: 20,
      maxDistance: 40,
      prefer: 'highest',
      referenceY: this.playerRoot.position.y,
      maxRise: force ? 4 : 2.4,
      maxDrop: 18,
      target: this.floorPoint
    });
    if (!floor) return null;
    this.playerRoot.position.y = floor.y;
    this.verticalVelocity = 0;
    this.isGrounded = true;
    return floor;
  }

  _clampToWalkArea() {
    const area = this.sceneConfig?.walkArea;
    if (!area) return;
    this.playerRoot.position.x = THREE.MathUtils.clamp(this.playerRoot.position.x, area.minX, area.maxX);
    this.playerRoot.position.z = THREE.MathUtils.clamp(this.playerRoot.position.z, area.minZ, area.maxZ);
  }

  _applySceneVisualScale() {
    const multiplier = this.sceneConfig?.playerVisualScale ?? 1;
    if (this.visualActor?.baseScale) copyScale(this.visualActor.root.scale, this.visualActor.baseScale, multiplier);
    if (this.staticActor?.baseScale) copyScale(this.staticActor.root.scale, this.staticActor.baseScale, multiplier);
  }

  _updateActorState({ moving, running }) {
    this.playerRoot.rotation.y = this.yaw;

    if (this.visualActor?.root) {
      this.visualActor.root.rotation.y = this.manifest.player.modelForwardOffsetY ?? 0;
    }
    if (this.staticActor?.root) {
      this.staticActor.root.rotation.y = this.manifest.player.modelForwardOffsetY ?? 0;
    }

    if (!this.isGrounded) {
      this._playActorAction('jump');
      return;
    }

    if (moving) {
      this._playActorAction(running ? 'run' : 'walk');
    } else {
      this._playActorAction('idle');
    }
  }

  _playActorAction(actionKey, immediate = false) {
    const actions = this.visualActor?.actions;
    if (!actions) return;

    const hasIdle = Boolean(actions.idle);
    const nextAction = actions[actionKey] ?? actions.walk ?? actions.idle ?? null;

    if (actionKey === 'idle' && !hasIdle) {
      if (actions.walk) {
        actions.walk.stop();
        actions.walk.reset();
      }
      this.currentAnimationName = '静止';
      this.visualActor.currentAction = null;
      return;
    }

    if (!nextAction) {
      this.currentAnimationName = '静止';
      return;
    }

    if (this.visualActor.currentAction === nextAction && actionKey !== 'jump') {
      this.currentAnimationName = actionKey === 'run' ? '奔跑' : actionKey === 'walk' ? '行走' : actionKey === 'idle' ? '静止' : '跳跃';
      return;
    }

    Object.values(actions).forEach((action) => {
      if (!action || action === nextAction) return;
      action.fadeOut(immediate ? 0.01 : 0.16);
    });

    nextAction.reset();
    nextAction.enabled = true;
    nextAction.timeScale = actionKey === 'run' && !actions.run ? 1.45 : 1;
    nextAction.fadeIn(immediate ? 0.01 : 0.16).play();
    this.visualActor.currentAction = nextAction;
    this.currentAnimationName = actionKey === 'run' ? '奔跑' : actionKey === 'walk' ? '行走' : actionKey === 'idle' ? '静止' : '跳跃';
  }

  _updateVisibleBody(isMoving) {
    const showBody = this.viewMode === 'thirdPerson' && !this.engine.renderer.xr.isPresenting;
    if (!showBody) {
      if (this.visualActor?.root) this.visualActor.root.visible = false;
      if (this.staticActor?.root) this.staticActor.root.visible = false;
      this.placeholder.visible = false;
      this.currentBodyMode = 'hidden';
      return;
    }

    const shouldUseStatic = !isMoving && this.isGrounded && this.staticActor?.root;
    if (shouldUseStatic) {
      if (this.visualActor?.root) this.visualActor.root.visible = false;
      if (this.staticActor?.root) this.staticActor.root.visible = true;
      this.placeholder.visible = false;
      this.currentBodyMode = 'static';
      return;
    }

    if (this.visualActor?.root) {
      this.visualActor.root.visible = true;
      if (this.staticActor?.root) this.staticActor.root.visible = false;
      this.placeholder.visible = false;
      this.currentBodyMode = 'animated';
      return;
    }

    this.placeholder.visible = true;
    this.currentBodyMode = 'placeholder';
  }

  _updateCamera(forceSnap = false) {
    const eye = this.playerRoot.position.clone().add(new THREE.Vector3(0, this.eyeHeight, 0));

    if (this.viewMode === 'firstPerson' || this.engine.renderer.xr.isPresenting) {
      const forward = new THREE.Vector3(
        Math.sin(this.yaw) * Math.cos(this.pitch),
        Math.sin(this.pitch),
        Math.cos(this.yaw) * Math.cos(this.pitch)
      ).normalize();
      this.engine.camera.position.copy(eye);
      this.cameraLookTarget.copy(eye).add(forward);
      this.engine.camera.lookAt(this.cameraLookTarget);
      return;
    }

    const distance = this.settings.thirdPersonDistance;
    const orbitPitch = this.cameraPitch;
    const horizontalDistance = distance * Math.cos(orbitPitch);
    const offset = new THREE.Vector3(
      -Math.sin(this.cameraYaw) * horizontalDistance,
      this.settings.thirdPersonHeight + distance * Math.sin(orbitPitch),
      -Math.cos(this.cameraYaw) * horizontalDistance
    );
    const desiredPosition = this.playerRoot.position.clone().add(offset);
    const desiredLookAt = this.playerRoot.position.clone().add(new THREE.Vector3(0, this.settings.thirdPersonLookHeight, 0));

    if (forceSnap) {
      this.engine.camera.position.copy(desiredPosition);
    } else {
      this.engine.camera.position.lerp(desiredPosition, 0.18);
    }
    this.engine.camera.lookAt(desiredLookAt);
  }

  getPosition() {
    return this.playerRoot.getWorldPosition(new THREE.Vector3());
  }

  getEyePosition() {
    return this.playerRoot.position.clone().add(new THREE.Vector3(0, this.eyeHeight, 0));
  }

  getForwardVector() {
    const referenceYaw = this.viewMode === 'thirdPerson' ? this.cameraYaw : this.yaw;
    return new THREE.Vector3(Math.sin(referenceYaw), 0, Math.cos(referenceYaw)).normalize();
  }

  getDebugState() {
    return {
      player: this.playerRoot.position.clone(),
      camera: this.engine.camera.position.clone(),
      yaw: this.yaw,
      pitch: this.pitch,
      cameraYaw: this.cameraYaw,
      cameraPitch: this.cameraPitch,
      floor: this.floorPoint.clone(),
      grounded: this.isGrounded,
      verticalVelocity: this.verticalVelocity,
      movement: this.lastMovementDirection.clone(),
      viewMode: this.viewMode,
      bodyMode: this.currentBodyMode,
      eyeHeight: this.eyeHeight,
      currentAnimationName: this.currentAnimationName,
      animationNames: this.visualActor?.animationNames ?? []
    };
  }

  showNotice(message, duration = 2600) {
    if (!this.hudNotice) return;
    this.hudNotice.textContent = message;
    this.hudNotice.classList.add('is-visible');
    window.clearTimeout(this.noticeTimer);
    this.noticeTimer = window.setTimeout(() => {
      this.hudNotice.classList.remove('is-visible');
    }, duration);
  }
}
