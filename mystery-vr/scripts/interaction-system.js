import * as THREE from 'three';

const HIGHLIGHT_COLOR = new THREE.Color('#6b3a16');
const DARK_COLOR = new THREE.Color('#000000');

export class InteractionSystem {
  constructor({ engine, hudPrompt, worldHint, debugLogger = null }) {
    this.engine = engine;
    this.hudPrompt = hudPrompt;
    this.worldHint = worldHint;
    this.debugLogger = debugLogger;
    this.entries = new Map();
    this.sceneEntries = new Map();
    this.focusedEntry = null;
    this.lastFocusedEntry = null;
    this.xrFocus = null;
    this.raycaster = new THREE.Raycaster();
    this.tempPromptTimer = 0;
    this._tmpCameraVec = new THREE.Vector3();
    this._tmpPlayerTarget = new THREE.Vector3();
  }

  register(config) {
    const entry = this.#normalizeEntry(config);
    if (!entry) return null;
    this.entries.set(entry.id, entry);
    if (!this.sceneEntries.has(entry.sceneId)) this.sceneEntries.set(entry.sceneId, new Set());
    this.sceneEntries.get(entry.sceneId).add(entry.id);
    entry.object3D.userData.interactableId = entry.id;
    entry.object3D.userData.interactableType = entry.type;
    return entry;
  }

  unregister(id) {
    const entry = this.entries.get(id);
    if (!entry) return;
    this.#setHighlight(entry, false);
    if (entry.object3D?.userData?.interactableId === id) {
      delete entry.object3D.userData.interactableId;
      delete entry.object3D.userData.interactableType;
    }
    this.entries.delete(id);
    this.sceneEntries.get(entry.sceneId)?.delete(id);
    if (this.focusedEntry?.id === id) this.focusedEntry = null;
    if (this.xrFocus?.id === id) this.xrFocus = null;
  }

  unregisterByObject(object3D) {
    const match = [...this.entries.values()].find((entry) => entry.object3D === object3D);
    if (match) this.unregister(match.id);
  }

  clearScene(sceneId) {
    const ids = [...(this.sceneEntries.get(sceneId) ?? [])];
    ids.forEach((id) => this.unregister(id));
    this.sceneEntries.delete(sceneId);
    this.#hideHints();
  }

  clearAll() {
    [...this.entries.keys()].forEach((id) => this.unregister(id));
    this.sceneEntries.clear();
    this.focusedEntry = null;
    this.lastFocusedEntry = null;
    this.xrFocus = null;
    this.#hideHints();
  }

  updateDesktopFocus({ camera, playerPosition, mode, canvasRect }) {
    if (mode !== 'explore') {
      this.#clearFocus();
      return;
    }

    const visibleEntries = [...this.entries.values()].filter((entry) => this.#isEntryVisible(entry));
    if (!visibleEntries.length || !camera || !playerPosition) {
      this.#applyDesktopFocus(null);
      this.#hideHints();
      return;
    }

    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    this.engine.recordRaycast?.();
    const roots = visibleEntries.map((entry) => entry.object3D);
    const intersections = this.raycaster.intersectObjects(roots, true);
    let chosen = intersections
      .map((intersection) => this.#resolveEntryFromObject(intersection.object))
      .find(Boolean) ?? null;

    if (!chosen) {
      const forward = camera.getWorldDirection(this._tmpCameraVec).setY(0).normalize();
      let bestScore = -Infinity;
      visibleEntries.forEach((entry) => {
        const target = entry.object3D.getWorldPosition(this._tmpPlayerTarget).clone();
        const delta = target.sub(playerPosition);
        const distance = delta.length();
        if (distance > entry.interactionRange * 1.2) return;
        delta.normalize();
        const facingScore = delta.dot(forward);
        if (facingScore < 0.42) return;
        const score = facingScore * 5 - distance;
        if (score > bestScore) {
          bestScore = score;
          chosen = entry;
        }
      });
    }

    if (!chosen) {
      this.#applyDesktopFocus(null);
      this.#hideHints();
      return;
    }

    this.#applyDesktopFocus(chosen);
    this.#showPrompt(chosen, playerPosition);
    if (chosen.type === 'npc') {
      this.#showWorldHint(chosen, camera, canvasRect, playerPosition);
    } else {
      this.worldHint?.classList.add('hidden');
    }
  }

  updateXRFocus(controller, playerPosition, mode) {
    if (mode !== 'explore') {
      if (this.xrFocus) this.#setHighlight(this.xrFocus, false);
      this.xrFocus = null;
      return null;
    }

    const intersections = this.raycastFromController(controller);
    const match = intersections
      .map((intersection) => this.#resolveEntryFromObject(intersection.object))
      .find(Boolean);

    if (!match || !this.#isEntryVisible(match)) {
      if (this.xrFocus) this.#setHighlight(this.xrFocus, false);
      this.xrFocus = null;
      return null;
    }

    if (this.xrFocus && this.xrFocus.id !== match.id && this.xrFocus.id !== this.focusedEntry?.id) {
      this.#setHighlight(this.xrFocus, false);
    }

    this.xrFocus = match;
    this.#setHighlight(match, true);
    this.#showPrompt(match, playerPosition);
    return match;
  }

  raycastFromController(controller) {
    const tempMatrix = new THREE.Matrix4();
    tempMatrix.identity().extractRotation(controller.matrixWorld);
    this.raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
    const roots = [...this.entries.values()].filter((entry) => this.#isEntryVisible(entry)).map((entry) => entry.object3D);
    this.engine.recordRaycast?.();
    return this.raycaster.intersectObjects(roots, true);
  }

  tryInteract({ mode, source = 'desktop', playerPosition = null } = {}) {
    if (mode !== 'explore') {
      this.#debug('当前状态不允许互动');
      return { ok: false, reason: '当前状态不允许互动' };
    }

    const entry = source === 'xr' ? this.xrFocus : (this.focusedEntry ?? this.lastFocusedEntry);
    if (!entry) {
      this.#debug('未命中可交互对象');
      return { ok: false, reason: '未命中可交互对象' };
    }

    const check = this.#canInteract(entry, playerPosition);
    if (!check.ok) {
      this.showTemporaryPrompt(check.reason);
      this.#debug(check.reason);
      return check;
    }

    entry.onInteract?.(entry);
    return { ok: true, entry };
  }

  getFocusedInteractable() {
    return this.focusedEntry;
  }

  showTemporaryPrompt(message, duration = 1800) {
    if (!this.hudPrompt) return;
    this.hudPrompt.textContent = message;
    this.hudPrompt.classList.remove('hidden');
    window.clearTimeout(this.tempPromptTimer);
    this.tempPromptTimer = window.setTimeout(() => {
      if (!this.focusedEntry) this.hudPrompt.classList.add('hidden');
    }, duration);
  }

  #normalizeEntry(config) {
    const requiredFields = ['id', 'sceneId', 'object3D', 'type', 'displayName', 'actionLabel', 'onInteract'];
    const missing = requiredFields.filter((field) => !config?.[field]);
    if (missing.length) {
      console.error(`[互动注册失败] ${config?.id ?? '未命名对象'} 缺少字段：${missing.join('、')}`);
      return null;
    }

    return {
      id: config.id,
      sceneId: config.sceneId,
      object3D: config.object3D,
      type: config.type,
      displayName: config.displayName,
      subtitle: config.subtitle ?? '',
      promptTitle: config.promptTitle ?? config.displayName,
      promptSubtitle: config.promptSubtitle ?? config.subtitle ?? '',
      actionLabel: config.actionLabel,
      interactionRange: config.interactionRange ?? 2.8,
      onInteract: config.onInteract,
      canInteract: config.canInteract ?? (() => ({ ok: true, reason: '' })),
      enabled: config.enabled ?? (() => true),
      isVisible: config.isVisible ?? (() => true),
      focusHeight: config.focusHeight ?? 1.8
    };
  }

  #resolveEntryFromObject(object) {
    let current = object;
    while (current) {
      const interactableId = current.userData?.interactableId;
      if (interactableId && this.entries.has(interactableId)) return this.entries.get(interactableId);
      current = current.parent;
    }
    return null;
  }

  #isEntryVisible(entry) {
    return Boolean(entry.object3D?.parent) && entry.enabled() && entry.isVisible();
  }

  #canInteract(entry, playerPosition) {
    if (!entry.enabled()) return { ok: false, reason: '该对象当前不可互动' };
    if (playerPosition) {
      const distance = entry.object3D.getWorldPosition(new THREE.Vector3()).distanceTo(playerPosition);
      if (distance > entry.interactionRange) return { ok: false, reason: '距离太远，无法调查' };
    }
    return entry.canInteract();
  }

  #showPrompt(entry, playerPosition) {
    if (!this.hudPrompt) return;
    const check = this.#canInteract(entry, playerPosition);
    const actionText = check.ok ? `[E] ${entry.actionLabel}${entry.promptTitle ? ` ${entry.promptTitle}` : ''}` : check.reason;
    this.hudPrompt.textContent = actionText;
    this.hudPrompt.classList.remove('hidden');
  }

  #showWorldHint(entry, camera, canvasRect = this.engine.canvas.getBoundingClientRect(), playerPosition = null) {
    if (!entry.object3D || !camera || !this.worldHint) return;
    const anchor = entry.object3D.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, entry.focusHeight, 0));
    anchor.project(camera);
    const x = ((anchor.x + 1) / 2) * canvasRect.width + canvasRect.left;
    const y = ((-anchor.y + 1) / 2) * canvasRect.height + canvasRect.top;
    const check = this.#canInteract(entry, playerPosition);

    this.worldHint.style.left = `${x}px`;
    this.worldHint.style.top = `${y}px`;
    this.worldHint.innerHTML = `
      <strong>${entry.promptTitle}</strong>
      <span>${entry.promptSubtitle}</span>
      <em>${check.ok ? `[E] ${entry.actionLabel}` : check.reason}</em>
    `;
    this.worldHint.classList.remove('hidden');
  }

  #setHighlight(entry, active) {
    if (!entry?.object3D) return;
    entry.object3D.traverse((child) => {
      if (!child.isMesh || !child.material) return;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        if (!material.emissive) return;
        material.emissive.copy(active ? HIGHLIGHT_COLOR : DARK_COLOR);
        material.emissiveIntensity = active ? 0.3 : 0;
      });
    });
  }

  #hideHints() {
    this.hudPrompt?.classList.add('hidden');
    this.worldHint?.classList.add('hidden');
  }

  #clearFocus() {
    if (this.focusedEntry) this.#setHighlight(this.focusedEntry, false);
    if (this.xrFocus && this.xrFocus.id !== this.focusedEntry?.id) this.#setHighlight(this.xrFocus, false);
    this.focusedEntry = null;
    this.lastFocusedEntry = null;
    this.xrFocus = null;
    this.#hideHints();
  }

  #applyDesktopFocus(entry) {
    if (this.focusedEntry && this.focusedEntry.id !== entry?.id && this.focusedEntry.id !== this.xrFocus?.id) {
      this.#setHighlight(this.focusedEntry, false);
    }
    this.focusedEntry = entry;
    if (entry) {
      this.lastFocusedEntry = entry;
      this.#setHighlight(entry, true);
    }
  }

  #debug(message) {
    this.debugLogger?.(message);
  }
}
