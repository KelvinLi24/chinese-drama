import * as THREE from 'three';
import { sampleFloorPoint } from '../game-engine.js';

export class WorldCollisionSystem {
  constructor({ debugLogger = null } = {}) {
    this.debugLogger = debugLogger;
    this.sceneId = '';
    this.sceneColliders = [];
    this.walkArea = null;
    this.maxStepHeight = 0.28;
    this.maxGroundDrop = 1.6;
    this.maxSnapRise = 0.7;
    this.probeRadius = 0.22;
    this.debugEnabled = false;
    this.lastGroundReport = null;
    this.tempPoint = new THREE.Vector3();
  }

  setSceneContext({ sceneId = '', sceneColliders = [], walkArea = null, maxStepHeight = 0.28, maxGroundDrop = 1.6, maxSnapRise = 0.7, probeRadius = 0.22 } = {}) {
    this.sceneId = sceneId;
    this.sceneColliders = sceneColliders;
    this.walkArea = walkArea;
    this.maxStepHeight = maxStepHeight;
    this.maxGroundDrop = maxGroundDrop;
    this.maxSnapRise = maxSnapRise;
    this.probeRadius = probeRadius;
    this.lastGroundReport = null;
  }

  setDebugEnabled(enabled) {
    this.debugEnabled = Boolean(enabled);
  }

  clampToWalkArea(position) {
    if (!this.walkArea) return position;
    position.x = THREE.MathUtils.clamp(position.x, this.walkArea.minX, this.walkArea.maxX);
    position.z = THREE.MathUtils.clamp(position.z, this.walkArea.minZ, this.walkArea.maxZ);
    return position;
  }

  queryGround(position, { referenceY = null, rayStartHeight = 20, maxDrop = null, maxRise = null } = {}) {
    const localReferenceY = referenceY ?? position.y;
    const point = sampleFloorPoint(position.x, position.z, {
      sceneColliders: this.sceneColliders,
      rayStartHeight,
      maxDistance: 48,
      prefer: 'highest',
      referenceY: localReferenceY,
      maxRise: maxRise ?? this.maxSnapRise,
      maxDrop: maxDrop ?? this.maxGroundDrop,
      target: this.tempPoint
    });

    if (!point) {
      this.lastGroundReport = {
        sceneId: this.sceneId,
        probes: 1,
        grounded: false,
        reason: '未命中可行走地面'
      };
      return null;
    }

    this.lastGroundReport = {
      sceneId: this.sceneId,
      probes: 1,
      grounded: true,
      y: point.y,
      minY: point.y,
      maxY: point.y,
      stableCount: 1,
      reason: '已找到稳定地面'
    };

    return {
      point: new THREE.Vector3(position.x, point.y, position.z),
      y: point.y,
      probes: [point.clone()],
      stableCount: 1
    };
  }

  resolveGroundedMovement({ currentPosition, desiredPosition, lastSafePosition = null } = {}) {
    const nextPosition = desiredPosition.clone();
    this.clampToWalkArea(nextPosition);

    const currentGround = this.queryGround(currentPosition, {
      referenceY: currentPosition.y,
      maxRise: this.maxSnapRise,
      maxDrop: this.maxGroundDrop
    });
    const desiredGround = this.queryGround(nextPosition, {
      referenceY: currentGround?.y ?? currentPosition.y,
      maxRise: this.maxSnapRise,
      maxDrop: this.maxGroundDrop
    });

    if (!desiredGround) {
      const fallback = lastSafePosition ? lastSafePosition.clone() : currentPosition.clone();
      return {
        position: fallback,
        blocked: true,
        grounded: true,
        usedFallback: true,
        reason: '目标位置下方没有稳定地面'
      };
    }

    const currentY = currentGround?.y ?? currentPosition.y;
    const rise = desiredGround.y - currentY;
    const drop = currentY - desiredGround.y;

    if (rise > this.maxStepHeight) {
      return {
        position: currentPosition.clone(),
        blocked: true,
        grounded: true,
        usedFallback: false,
        reason: `前方高度变化 ${rise.toFixed(3)} 超出可跨越台阶`
      };
    }

    if (drop > this.maxGroundDrop) {
      const fallback = lastSafePosition ? lastSafePosition.clone() : currentPosition.clone();
      return {
        position: fallback,
        blocked: true,
        grounded: true,
        usedFallback: true,
        reason: `目标落差 ${drop.toFixed(3)} 超出安全范围`
      };
    }

    nextPosition.y = desiredGround.y;
    return {
      position: nextPosition,
      blocked: false,
      grounded: true,
      usedFallback: false,
      groundY: desiredGround.y,
      rise,
      drop,
      reason: '移动合法'
    };
  }

  resolveFloorPropPlacement(worldX, worldZ, { referenceY = 0, clearance = 0.01 } = {}) {
    const floor = this.queryGround(new THREE.Vector3(worldX, referenceY, worldZ), {
      referenceY,
      maxRise: 2,
      maxDrop: 24,
      rayStartHeight: 24
    });
    if (!floor) return null;
    return {
      x: worldX,
      y: floor.y + clearance,
      z: worldZ,
      floorY: floor.y
    };
  }

  getDebugState() {
    return {
      sceneId: this.sceneId,
      walkArea: this.walkArea,
      maxStepHeight: this.maxStepHeight,
      maxGroundDrop: this.maxGroundDrop,
      maxSnapRise: this.maxSnapRise,
      probeRadius: this.probeRadius,
      lastGroundReport: this.lastGroundReport
    };
  }
}
