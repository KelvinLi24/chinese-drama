import * as THREE from "three";

export class InteractionSystem {
  constructor({
    engine,
    hudPrompt,
    worldHint,
    inspectPanel,
    inspectClose,
    inspectTitle,
    inspectMeta,
    inspectBody,
    inspectImage
  }) {
    this.engine = engine;
    this.hudPrompt = hudPrompt;
    this.worldHint = worldHint;
    this.inspectPanel = inspectPanel;
    this.inspectClose = inspectClose;
    this.inspectTitle = inspectTitle;
    this.inspectMeta = inspectMeta;
    this.inspectBody = inspectBody;
    this.inspectImage = inspectImage;
    this.entries = [];
    this.focusedEntry = null;
    this.raycaster = new THREE.Raycaster();
    this.xrFocus = null;

    this.inspectClose?.addEventListener("click", () => this.closeInspect());
  }

  register(entry) {
    this.entries.push(entry);
  }

  unregisterByObject(object) {
    this.entries = this.entries.filter((entry) => entry.object !== object);
  }

  clear() {
    this.entries = [];
    this.focusedEntry = null;
    this.xrFocus = null;
    this.hudPrompt.classList.add("hidden");
    this.worldHint.classList.add("hidden");
  }

  updateDesktopFocus({ camera, playerPosition, canvasRect }) {
    this.entries.forEach((entry) => this._setHighlight(entry, false));
    this.focusedEntry = null;

    if (!camera || !playerPosition) {
      this._hideHints();
      return;
    }

    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const candidateHits = [];
    let nearestByDistance = null;
    let nearestDistance = Infinity;

    this.entries.forEach((entry) => {
      if (!entry.object?.parent) return;
      const worldPosition = entry.object.getWorldPosition(new THREE.Vector3());
      const distance = worldPosition.distanceTo(playerPosition);
      if (distance > (entry.radius ?? 2.2)) return;
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestByDistance = entry;
      }
      const hits = this.raycaster.intersectObject(entry.object, true);
      if (!hits.length) return;
      candidateHits.push({ entry, hit: hits[0], distance });
    });

    candidateHits.sort((a, b) => a.hit.distance - b.hit.distance || a.distance - b.distance);
    const nearest = candidateHits[0]?.entry ?? nearestByDistance;
    this.focusedEntry = nearest;

    if (!nearest) {
      this._hideHints();
      return;
    }

    this._setHighlight(nearest, true);
    this._showPrompt(nearest);
    if (nearest.type === "npc") {
      this._showWorldHint(nearest, camera, canvasRect);
    } else {
      this.worldHint.classList.add("hidden");
    }
  }

  triggerNearest() {
    this.focusedEntry?.onInteract?.();
  }

  updateXRFocus(controller) {
    const intersections = this.raycastFromController(controller);
    this.entries.forEach((entry) => this._setHighlight(entry, false));
    if (!intersections.length) {
      this.xrFocus = null;
      return null;
    }
    const found = intersections.find((intersection) =>
      this.entries.find((entry) => entry.object === intersection.object || entry.object.children.includes(intersection.object))
    );
    if (!found) return null;
    const entry = this.entries.find((candidate) => candidate.object === found.object || candidate.object.children.includes(found.object));
    if (!entry) return null;
    this.xrFocus = entry;
    this._setHighlight(entry, true);
    this._showPrompt(entry);
    return entry;
  }

  triggerXR() {
    this.xrFocus?.onInteract?.();
  }

  raycastFromController(controller) {
    const tempMatrix = new THREE.Matrix4();
    tempMatrix.identity().extractRotation(controller.matrixWorld);
    this.raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
    return this.raycaster.intersectObjects(this.entries.map((entry) => entry.object), true);
  }

  openInspect(data) {
    this.inspectTitle.textContent = data.title;
    this.inspectMeta.textContent = `${data.category} · ${data.sourceScene} · 关联人物：${data.relatedCharacter || "未标注"}`;

    const placeholderNote = data.placeholder
      ? '<p><strong>占位说明：</strong>当前条目为流程占位资源，用于保持搜证链路完整。</p>'
      : "";

    this.inspectBody.innerHTML = `
      <p>${data.description}</p>
      <p><strong>可疑点：</strong>${data.suspicion}</p>
      ${placeholderNote}
    `;
    if (data.preview) {
      this.inspectImage.src = data.preview;
      this.inspectImage.alt = data.title;
      this.inspectImage.classList.remove("hidden");
    } else {
      this.inspectImage.classList.add("hidden");
    }
    this.inspectPanel.classList.remove("hidden");
  }

  closeInspect() {
    this.inspectPanel.classList.add("hidden");
  }

  _showPrompt(entry) {
    this.hudPrompt.innerHTML = `<span class="prompt-action">[E]</span><span>${entry.actionLabel ?? "调查"}${entry.promptTitle ? ` ${entry.promptTitle}` : ""}</span>`;
    this.hudPrompt.classList.remove("hidden");
  }

  _showWorldHint(entry, camera, canvasRect = this.engine.canvas.getBoundingClientRect()) {
    if (!entry.object || !camera) return;
    const focusHeight = entry.object.userData.focusHeight ?? 2.0;
    const anchor = entry.object.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, focusHeight, 0));
    anchor.project(camera);
    const x = ((anchor.x + 1) / 2) * canvasRect.width + canvasRect.left;
    const y = ((-anchor.y + 1) / 2) * canvasRect.height + canvasRect.top;
    this.worldHint.style.left = `${x}px`;
    this.worldHint.style.top = `${y}px`;
    this.worldHint.innerHTML = `
      <strong>${entry.promptTitle ?? "可交谈角色"}</strong>
      <span>${entry.promptSubtitle ?? ""}</span>
      <em>[E] 交谈</em>
    `;
    this.worldHint.classList.remove("hidden");
  }

  _hideHints() {
    this.hudPrompt.classList.add("hidden");
    this.worldHint.classList.add("hidden");
  }

  _setHighlight(entry, active) {
    if (!entry.object) return;
    entry.object.traverse((child) => {
      if (!child.isMesh || !child.material) return;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        if (!material.emissive) return;
        material.emissive.set(active ? "#6b3a16" : "#000000");
        material.emissiveIntensity = active ? 0.42 : 0;
      });
    });
  }
}
