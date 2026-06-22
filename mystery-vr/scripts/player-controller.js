import * as THREE from 'three';
import { scaleVisualRootWithLift } from './game-engine.js';
import { createCharacterActor } from './npc-system.js';
import { MODEL_CALIBRATION } from './data/model-calibration.js';

const UP = new THREE.Vector3(0, 1, 0);

function projectToGround(vector) {
  const flattened = vector.clone();
  flattened.y = 0;
  return flattened.lengthSq() > 0 ? flattened.normalize() : flattened.set(0, 0, 0);
}

export class PlayerController {
  constructor({ engine, manifest, hudNotice, canCapturePointer = null, worldCollisionSystem }) {
    this.engine = engine;
    this.manifest = manifest;
    this.hudNotice = hudNotice;
    this.canCapturePointer = canCapturePointer;
    this.worldCollisionSystem = worldCollisionSystem;

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
    this.noticeTimer = 0;
    this.currentGroundY = 0;
    this.lastSafePosition = new THREE.Vector3();
    this.godMode = false;
    this.godFlySpeed = 5.6;
    this.actualVelocity = 0;
    this.godModeLiftApplied = false;

    this.playerRoot = new THREE.Group();
    this.engine.addWorldObject(this.playerRoot);

    this.placeholder = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.24, 0.96, 8, 16),
      new THREE.MeshStandardMaterial({ color: '#d8ab63', roughness: 0.68, metalness: 0.08 })
    );
    this.placeholder.position.y = 0.86;
    this.placeholder.visible = false;
    this.playerRoot.add(this.placeholder);

    this.idleActor = null;
    this.walkActor = null;
    this.currentBodyMode = 'hidden';
    this._bindInput();
  }

  async init() {
    const idleManifest = {
      ...this.manifest.player,
      path: this.manifest.player.fallbackPath || this.manifest.player.path,
      fallbackPath: null,
      animationCandidates: { idle: ['Idle', 'idle', '站立', '待机'] }
    };
    const walkManifest = {
      ...this.manifest.player,
      fallbackPath: null
    };

    const [idleActor, walkActor] = await Promise.all([
      createCharacterActor({ manifest: idleManifest, engine: this.engine, fallbackColor: '#d8ab63' }),
      createCharacterActor({ manifest: walkManifest, engine: this.engine, fallbackColor: '#d8ab63' })
    ]);

    this.idleActor = idleActor;
    this.walkActor = walkActor;

    [this.idleActor, this.walkActor].forEach((actor) => {
      if (!actor?.root) return;
      this.playerRoot.add(actor.root);
      if (actor.visual) {
        actor.visual.rotation.y = (typeof this.manifest.player.modelForwardOffsetY === 'number' ? this.manifest.player.modelForwardOffsetY : 0);
      }
    });

    this.placeholder.visible = !(this.idleActor?.root || this.walkActor?.root);
    this._applySceneVisualScale();
    this._playActorAction('idle', true);
    this._setThirdPersonVisualState(false, true);
    this._updateVisibleBody();
    this.lastSafePosition.copy(this.playerRoot.position);
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

      if (this.viewMode === 'firstPerson' || this.godMode) {
        this.cameraYaw -= event.movementX * 0.0026;
        this.yaw = this.cameraYaw;
        this.pitch = THREE.MathUtils.clamp(this.pitch - event.movementY * 0.0021, -Math.PI / 2 + 0.02, Math.PI / 2 - 0.02);
        this.cameraPitch = this.pitch;
        return;
      }

      this.yaw -= event.movementX * 0.0024;
      this.cameraYaw = this.yaw;
      this.cameraPitch = THREE.MathUtils.clamp(this.cameraPitch - event.movementY * 0.0018, -0.42, 0.36);
    };

    this.onCanvasClick = () => {
      if (this.engine.renderer.xr.isPresenting) return;
      if (this.canCapturePointer && !this.canCapturePointer()) return;
      if (document.pointerLockElement !== this.engine.canvas) {
        void this.requestPointerLock();
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
    this.sceneId = sceneConfig && sceneConfig.id ? sceneConfig.id : '';
    const visualScale = sceneConfig && sceneConfig.playerVisualScale ? sceneConfig.playerVisualScale : 1;
    this.eyeHeight = sceneConfig && sceneConfig.cameraHeight ? sceneConfig.cameraHeight : this.manifest.player.targetHeight * visualScale * 0.92;
    this.worldCollisionSystem?.setSceneContext({
      sceneId: this.sceneId,
      sceneColliders: this.engine.sceneColliders,
      walkArea: sceneConfig?.walkArea ?? null,
      maxStepHeight: this.settings.maxStepHeight ?? 0.28,
      maxGroundDrop: 1.9,
      maxSnapRise: this.settings.spawnSnapRise ?? 2.6,
      probeRadius: 0.24
    });
    this._applySceneVisualScale();
    this.resetToSpawn();
  }

  setMovementLocked(locked) {
    this.movementLocked = locked;
  }

  setGodMode(enabled) {
    this.godMode = Boolean(enabled);
    if (!this.godMode) {
      this.godModeLiftApplied = false;
      this.verticalVelocity = 0;
      this._snapToGround(true);
      this.showNotice('已关闭上帝模式，玩家已贴回合法地面。');
    } else {
      if (!this.godModeLiftApplied) {
        this.playerRoot.position.y += 4.2;
        this.godModeLiftApplied = true;
      }
      this.verticalVelocity = 0;
      this.showNotice('已开启上帝模式，可自由飞行与调试跳转。');
    }
    this._updateVisibleBody();
    this._updateCamera(true);
  }

  requestPointerLock() {
    if (this.engine.renderer.xr.isPresenting) return Promise.resolve(false);
    if (this.canCapturePointer && !this.canCapturePointer()) return Promise.resolve(false);
    if (document.pointerLockElement === this.engine.canvas) return Promise.resolve(true);
    if (!this.engine.canvas.requestPointerLock) return Promise.resolve(false);

    try {
      const result = this.engine.canvas.requestPointerLock();
      if (result && typeof result.then === 'function') {
        return result.then(() => true).catch((error) => {
          if (!/WrongDocumentError|NotAllowedError/i.test(String(error?.name || error?.message || error))) {
            console.warn('[PointerLock] 请求失败', error);
          }
          return false;
        });
      }
      return Promise.resolve(true);
    } catch (error) {
      if (!/WrongDocumentError|NotAllowedError/i.test(String(error?.name || error?.message || error))) {
        console.warn('[PointerLock] 请求失败', error);
      }
      return Promise.resolve(false);
    }
  }

  releasePointerLock() {
    if (document.pointerLockElement === this.engine.canvas && document.exitPointerLock) document.exitPointerLock();
  }

  resetToSpawn() {
    const start = this.sceneConfig && this.sceneConfig.playerStart ? this.sceneConfig.playerStart : [0, 0, 4];
    const facing = this.sceneConfig && typeof this.sceneConfig.playerRotationY === 'number' ? this.sceneConfig.playerRotationY : Math.PI;
    this.playerRoot.position.set(start[0], start[1], start[2]);
    this.yaw = facing;
    this.cameraYaw = facing;
    this.pitch = -0.06;
    this.cameraPitch = this.viewMode === 'thirdPerson' ? -0.22 : -0.06;
    this.verticalVelocity = 0;
    this.isGrounded = true;
    this.jumpUpgraded = false;
    this.lastMovementDirection.set(0, 0, 0);
    this._snapToGround(true);
    this.lastSafePosition.copy(this.playerRoot.position);
    this._updateCamera(true);
  }

  teleportTo(position, { snapToGround = true } = {}) {
    if (!position) return;
    this.playerRoot.position.copy(position);
    if (snapToGround && !this.godMode) {
      this._snapToGround(true);
      this.lastSafePosition.copy(this.playerRoot.position);
    }
    this.verticalVelocity = 0;
    this._updateCamera(true);
  }

  toggleViewMode() {
    if (this.engine.renderer.xr.isPresenting) return;
    this.viewMode = this.viewMode === 'firstPerson' ? 'thirdPerson' : 'firstPerson';
    if (this.viewMode === 'thirdPerson') {
      this.cameraYaw = this.yaw;
      this.cameraPitch = -0.22;
      this.showNotice('已切换为第三人称调查视角。');
    } else {
      this.cameraYaw = this.yaw;
      this.pitch = THREE.MathUtils.clamp(this.cameraPitch, -Math.PI / 2 + 0.02, Math.PI / 2 - 0.02);
      this.cameraPitch = this.pitch;
      this.showNotice('已切换为第一人称调查视角。');
    }
    this._updateVisibleBody();
    this._updateCamera(true);
  }

  setXRMode(active) {
    if (active) this.viewMode = 'firstPerson';
    this._updateVisibleBody();
    this._updateCamera(true);
  }

  moveByWorldVector(vector) {
    if (!vector || typeof vector.lengthSq !== 'function' || !vector.lengthSq()) return;
    const previous = this.playerRoot.position.clone();

    if (this.godMode) {
      this.playerRoot.position.add(vector);
      this.actualVelocity = this.playerRoot.position.clone().sub(previous).length();
      return;
    }

    if (this.isGrounded && this.worldCollisionSystem) {
      const resolved = this.worldCollisionSystem.resolveGroundedMovement({
        currentPosition: previous,
        desiredPosition: previous.clone().add(new THREE.Vector3(vector.x, 0, vector.z)),
        lastSafePosition: this.lastSafePosition
      });
      this.playerRoot.position.copy(resolved.position);
      if (!resolved.blocked) {
        this.currentGroundY = resolved.groundY ?? this.playerRoot.position.y;
        this.lastSafePosition.copy(this.playerRoot.position);
      }
    } else {
      this.playerRoot.position.add(new THREE.Vector3(vector.x, 0, vector.z));
      this.worldCollisionSystem?.clampToWalkArea(this.playerRoot.position);
    }

    const movedDistance = this.playerRoot.position.clone().sub(previous).length();
    this.actualVelocity = movedDistance / Math.max(1 / 60, 0.0001);
  }

  update(delta) {
    if (this.engine.renderer.xr.isPresenting) return;

    if (this.godMode) {
      this._updateGodMode(delta);
      return;
    }

    const previousPosition = this.playerRoot.position.clone();
    const movementDirection = this.viewMode === 'firstPerson'
      ? this._getFirstPersonMoveDirection()
      : this._getThirdPersonMoveDirection();

    const hasMovementInput = movementDirection.lengthSq() > 0;
    const isRunning = (this.keys.has('ShiftLeft') || this.keys.has('ShiftRight')) && hasMovementInput;
    const speed = this.settings.speed * (isRunning ? this.settings.runMultiplier : 1);

    if (!this.movementLocked && hasMovementInput) {
      if (this.viewMode === 'firstPerson') {
        this.yaw = this.cameraYaw;
      } else {
        this.cameraYaw = this.yaw;
      }

      const desiredStep = movementDirection.clone().multiplyScalar(speed * delta);
      if (this.isGrounded && this.worldCollisionSystem) {
        const resolved = this.worldCollisionSystem.resolveGroundedMovement({
          currentPosition: previousPosition,
          desiredPosition: previousPosition.clone().add(desiredStep),
          lastSafePosition: this.lastSafePosition
        });
        this.playerRoot.position.copy(resolved.position);
        if (!resolved.blocked) {
          this.currentGroundY = resolved.groundY ?? this.playerRoot.position.y;
          this.lastSafePosition.copy(this.playerRoot.position);
        }
      } else {
        this.playerRoot.position.add(desiredStep);
        this.worldCollisionSystem?.clampToWalkArea(this.playerRoot.position);
      }
    } else {
      if (this.viewMode === 'firstPerson') {
        this.yaw = this.cameraYaw;
      } else {
        this.cameraYaw = this.yaw;
      }
    }

    this._updateVerticalMotion(delta);
    const movedDistance = this.playerRoot.position.clone().sub(previousPosition).setY(0).length();
    const actualMoving = movedDistance > 0.0005;
    this.actualVelocity = movedDistance / Math.max(delta, 0.0001);
    if (actualMoving) {
      this.lastMovementDirection.copy(movementDirection);
    } else {
      this.lastMovementDirection.set(0, 0, 0);
    }
    this._updateActorState({ moving: actualMoving, running: isRunning && actualMoving });
    this._updateVisibleBody();
    this._updateCamera();
  }

  _updateGodMode(delta) {
    const move = new THREE.Vector3();
    const forward = projectToGround(this.engine.camera.getWorldDirection(new THREE.Vector3()));
    if (!forward.lengthSq()) forward.set(Math.sin(this.cameraYaw), 0, Math.cos(this.cameraYaw)).normalize();
    const right = new THREE.Vector3().crossVectors(UP, forward).normalize();
    if (this.keys.has('KeyW')) move.add(forward);
    if (this.keys.has('KeyS')) move.sub(forward);
    if (this.keys.has('KeyA')) move.sub(right);
    if (this.keys.has('KeyD')) move.add(right);
    if (this.keys.has('Space')) move.y += 1;
    if (this.keys.has('KeyC')) move.y -= 1;
    const speed = (this.keys.has('ShiftLeft') || this.keys.has('ShiftRight')) ? this.godFlySpeed * 1.85 : this.godFlySpeed;
    if (!this.movementLocked && move.lengthSq() > 0) {
      move.normalize().multiplyScalar(speed * delta);
      this.playerRoot.position.add(move);
      this.actualVelocity = move.length() / Math.max(delta, 0.0001);
    } else {
      this.actualVelocity = 0;
    this.godModeLiftApplied = false;
    }
    this._updateActorState({ moving: this.actualVelocity > 0.04, running: this.actualVelocity > this.godFlySpeed });
    this._updateVisibleBody();
    this._updateCamera();
  }

  _getFirstPersonMoveDirection() {
    if (this.movementLocked) return new THREE.Vector3();

    const move = new THREE.Vector3();
    const forward = projectToGround(this.engine.camera.getWorldDirection(new THREE.Vector3()));
    if (!forward.lengthSq()) forward.set(Math.sin(this.cameraYaw), 0, Math.cos(this.cameraYaw)).normalize();
    const right = new THREE.Vector3().crossVectors(UP, forward).normalize();

    if (this.keys.has('KeyW')) move.add(forward);
    if (this.keys.has('KeyS')) move.sub(forward);
    if (this.keys.has('KeyA')) move.sub(right);
    if (this.keys.has('KeyD')) move.add(right);

    return move.lengthSq() > 0 ? move.normalize() : move;
  }

  _getThirdPersonMoveDirection() {
    if (this.movementLocked) return new THREE.Vector3();

    const forward = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw)).normalize();
    const right = new THREE.Vector3(forward.z, 0, -forward.x).normalize();
    const move = new THREE.Vector3();

    if (this.keys.has('KeyW')) move.add(forward);
    if (this.keys.has('KeyS')) move.sub(forward);
    if (this.keys.has('KeyA')) move.sub(right);
    if (this.keys.has('KeyD')) move.add(right);

    return move.lengthSq() > 0 ? move.normalize() : move;
  }

  _handleJumpPress() {
    if (this.movementLocked || this.engine.renderer.xr.isPresenting || this.godMode) return;
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
    const floor = this.worldCollisionSystem?.queryGround(this.playerRoot.position, {
      referenceY: this.playerRoot.position.y,
      maxRise: this.settings.maxStepHeight ?? 0.28,
      maxDrop: 18,
      rayStartHeight: 20
    });

    if (this.isGrounded) {
      if (floor) {
        this.playerRoot.position.y = floor.y;
        this.currentGroundY = floor.y;
        this.floorPoint.copy(floor.point);
        this.lastSafePosition.copy(this.playerRoot.position);
      }
      return;
    }

    this.verticalVelocity -= this.settings.gravity * delta;
    this.playerRoot.position.y += this.verticalVelocity * delta;

    if (floor && this.playerRoot.position.y <= floor.y) {
      this.playerRoot.position.y = floor.y;
      this.currentGroundY = floor.y;
      this.floorPoint.copy(floor.point);
      this.verticalVelocity = 0;
      this.isGrounded = true;
      this.jumpUpgraded = false;
      this.lastSafePosition.copy(this.playerRoot.position);
      return;
    }

    if (this.playerRoot.position.y < (this.lastSafePosition.y - 8)) {
      this.playerRoot.position.copy(this.lastSafePosition);
      this.verticalVelocity = 0;
      this.isGrounded = true;
      this.jumpUpgraded = false;
    }
  }

  _snapToGround(force = false) {
    const floor = this.worldCollisionSystem?.queryGround(this.playerRoot.position, {
      referenceY: this.playerRoot.position.y,
      maxRise: force ? (this.settings.spawnSnapRise ?? 2.6) : (this.settings.maxStepHeight ?? 0.28),
      maxDrop: 18,
      rayStartHeight: 20
    });
    if (!floor) return null;
    this.playerRoot.position.y = floor.y;
    this.currentGroundY = floor.y;
    this.floorPoint.copy(floor.point);
    this.verticalVelocity = 0;
    this.isGrounded = true;
    return floor;
  }

  _applySceneVisualScale() {
    const multiplier = this.sceneConfig && this.sceneConfig.playerVisualScale ? this.sceneConfig.playerVisualScale : 1;
    [this.idleActor, this.walkActor].forEach((actor) => {
      if (!actor?.visual) return;
      scaleVisualRootWithLift(actor.visual, multiplier);
      actor.visual.rotation.y = (typeof this.manifest.player.modelForwardOffsetY === 'number' ? this.manifest.player.modelForwardOffsetY : 0);
    });
  }

  _updateActorState({ moving, running }) {
    this.playerRoot.rotation.y = this.yaw;
    [this.idleActor, this.walkActor].forEach((actor) => {
      if (actor?.visual) {
        actor.visual.rotation.y = (typeof this.manifest.player.modelForwardOffsetY === 'number' ? this.manifest.player.modelForwardOffsetY : 0);
      }
    });

    this._setThirdPersonVisualState(moving, false);

    if (!this.isGrounded) {
      this._playActorAction('jump');
      return;
    }

    if (moving) {
      this._playActorAction(running ? 'run' : 'walk');
      return;
    }

    this._playActorAction('idle');
  }

  _playActorAction(actionKey, immediate = false) {
    const actions = this.walkActor ? this.walkActor.actions : null;
    const mixer = this.walkActor ? this.walkActor.mixer : null;
    if (!actions) {
      this.currentAnimationName = actionKey === 'walk' || actionKey === 'run' ? '行走' : '静止';
      return;
    }

    const hasIdle = Boolean(actions.idle);
    const nextAction = actions[actionKey] || actions.walk || actions.idle || null;

    if (actionKey === 'idle' && !hasIdle) {
      if (actions.walk) {
        actions.walk.stop();
        actions.walk.reset();
      }
      if (mixer) mixer.setTime(0);
      this.currentAnimationName = '静止';
      this.walkActor.currentAction = null;
      return;
    }

    if (!nextAction) {
      this.currentAnimationName = '静止';
      return;
    }

    if (this.walkActor.currentAction === nextAction && actionKey !== 'jump') {
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
    this.walkActor.currentAction = nextAction;
    this.currentAnimationName = actionKey === 'run' ? '奔跑' : actionKey === 'walk' ? '行走' : actionKey === 'idle' ? '静止' : '跳跃';
  }

  _setThirdPersonVisualState(isMoving, force = false) {
    const mode = isMoving ? 'walk' : 'idle';
    if (!force && this.currentBodyMode === mode) return;
    if (this.idleActor?.root) this.idleActor.root.visible = mode === 'idle';
    if (this.walkActor?.root) this.walkActor.root.visible = mode === 'walk';
    this.currentBodyMode = mode;
  }

  _updateVisibleBody() {
    const showBody = this.viewMode === 'thirdPerson' && !this.engine.renderer.xr.isPresenting && !this.godMode;
    if (!showBody) {
      if (this.idleActor?.root) this.idleActor.root.visible = false;
      if (this.walkActor?.root) this.walkActor.root.visible = false;
      this.placeholder.visible = false;
      this.currentBodyMode = 'hidden';
      return;
    }
    this._setThirdPersonVisualState(this.actualVelocity > 0.05, true);
    this.placeholder.visible = !(this.idleActor?.root || this.walkActor?.root);
  }

  _updateCamera(forceSnap = false) {
    const eye = this.playerRoot.position.clone().add(new THREE.Vector3(0, this.eyeHeight, 0));

    if (this.godMode) {
      const forward = new THREE.Vector3(
        Math.sin(this.cameraYaw) * Math.cos(this.pitch),
        Math.sin(this.pitch),
        Math.cos(this.cameraYaw) * Math.cos(this.pitch)
      ).normalize();
      this.engine.camera.position.copy(this.playerRoot.position);
      this.cameraLookTarget.copy(this.playerRoot.position).add(forward.multiplyScalar(6));
      this.engine.camera.lookAt(this.cameraLookTarget);
      return;
    }

    if (this.viewMode === 'firstPerson' || this.engine.renderer.xr.isPresenting) {
      const forward = new THREE.Vector3(
        Math.sin(this.cameraYaw) * Math.cos(this.pitch),
        Math.sin(this.pitch),
        Math.cos(this.cameraYaw) * Math.cos(this.pitch)
      ).normalize();
      this.engine.camera.position.copy(eye);
      this.cameraLookTarget.copy(eye).add(forward);
      this.engine.camera.lookAt(this.cameraLookTarget);
      return;
    }

    this.cameraYaw = this.yaw;
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
    if (this.viewMode === 'firstPerson' || this.godMode) {
      return projectToGround(this.engine.camera.getWorldDirection(new THREE.Vector3()));
    }
    return new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw)).normalize();
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
      animationNames: this.walkActor && this.walkActor.animationNames ? this.walkActor.animationNames : [],
      actualVelocity: this.actualVelocity,
      lastSafePosition: this.lastSafePosition.clone(),
      godMode: this.godMode
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





