import { AudioSystem } from "./audio-system.js";
import { ASSET_MANIFEST } from "./asset-manifest.js";
import { GameEngine } from "./game-engine.js";
import { InteractionSystem } from "./interaction-system.js";
import { InventorySystem } from "./inventory-system.js";
import { NPCSystem } from "./npc-system.js";
import { PlayerController } from "./player-controller.js";
import { SceneManager } from "./scene-manager.js";
import { STORY_DATA, evaluateEnding } from "./story-data.js";
import { VRControllerSystem } from "./vr-controller.js";

const dom = {
  canvas: document.querySelector("#gameCanvas"),
  launchScreen: document.querySelector("#launchScreen"),
  storyPrompt: document.querySelector("#storyPrompt"),
  storyPromptBody: document.querySelector("#storyPromptBody"),
  storyPromptButton: document.querySelector("#storyPromptButton"),
  loadingOverlay: document.querySelector("#loadingOverlay"),
  loadingText: document.querySelector("#loadingText"),
  errorOverlay: document.querySelector("#errorOverlay"),
  errorTitle: document.querySelector("#errorTitle"),
  errorText: document.querySelector("#errorText"),
  hud: document.querySelector("#gameHud"),
  hudScene: document.querySelector("#hudScene"),
  hudObjective: document.querySelector("#hudObjective"),
  hudClueCount: document.querySelector("#hudClueCount"),
  hudKeyCount: document.querySelector("#hudKeyCount"),
  interactionPrompt: document.querySelector("#interactionPrompt"),
  controlHint: document.querySelector("#controlHint"),
  worldHint: document.querySelector("#worldHint"),
  archivePanel: document.querySelector("#archivePanel"),
  archiveList: document.querySelector("#archiveList"),
  archiveStats: document.querySelector("#archiveStats"),
  archiveObjective: document.querySelector("#archiveObjective"),
  archiveCloseButton: document.querySelector("#archiveCloseButton"),
  mapPanel: document.querySelector("#mapPanel"),
  sceneMapList: document.querySelector("#sceneMapList"),
  mapCloseButton: document.querySelector("#mapCloseButton"),
  pausePanel: document.querySelector("#pausePanel"),
  resumeButton: document.querySelector("#resumeButton"),
  resetPositionButton: document.querySelector("#resetPositionButton"),
  volumeRange: document.querySelector("#volumeRange"),
  dialoguePanel: document.querySelector("#dialoguePanel"),
  dialogueRole: document.querySelector("#dialogueRole"),
  dialogueSpeaker: document.querySelector("#dialogueSpeaker"),
  dialogueText: document.querySelector("#dialogueText"),
  dialogueResponses: document.querySelector("#dialogueResponses"),
  dialogueCloseButton: document.querySelector("#dialogueCloseButton"),
  inspectPanel: document.querySelector("#inspectPanel"),
  inspectCloseButton: document.querySelector("#inspectCloseButton"),
  inspectTitle: document.querySelector("#inspectTitle"),
  inspectMeta: document.querySelector("#inspectMeta"),
  inspectBody: document.querySelector("#inspectBody"),
  inspectImage: document.querySelector("#inspectImage"),
  helpPanel: document.querySelector("#helpPanel"),
  helpButton: document.querySelector("#helpButton"),
  pauseHelpButton: document.querySelector("#pauseHelpButton"),
  helpCloseButton: document.querySelector("#helpCloseButton"),
  startButton: document.querySelector("#startButton"),
  errorBackButton: document.querySelector("#errorBackButton"),
  statusToast: document.querySelector("#statusToast"),
  audioToast: document.querySelector("#audioToast"),
  xrButtonHost: document.querySelector("#xrButtonHost"),
  xrSupportLabel: document.querySelector("#xrSupportLabel"),
  debugPanel: document.querySelector("#debugPanel")
};

const progress = {
  storyState: "arrival",
  flags: new Set(),
  collectedClues: new Set(),
  unlockedScenes: new Set(
    Object.values(ASSET_MANIFEST.scenes)
      .filter((scene) => scene.unlockedByDefault)
      .map((scene) => scene.id)
  ),
  endingShown: false
};

const engine = new GameEngine({ canvas: dom.canvas });
const audioSystem = new AudioSystem({ toastTarget: dom.audioToast });
const inventorySystem = new InventorySystem({
  archivePanel: dom.archivePanel,
  archiveList: dom.archiveList,
  archiveStats: dom.archiveStats,
  archiveObjective: dom.archiveObjective,
  closeButton: dom.archiveCloseButton,
  toast: dom.statusToast
});
const interactionSystem = new InteractionSystem({
  engine,
  hudPrompt: dom.interactionPrompt,
  worldHint: dom.worldHint,
  inspectPanel: dom.inspectPanel,
  inspectClose: dom.inspectCloseButton,
  inspectTitle: dom.inspectTitle,
  inspectMeta: dom.inspectMeta,
  inspectBody: dom.inspectBody,
  inspectImage: dom.inspectImage
});
const ui = createUIHelpers();
const npcSystem = new NPCSystem({
  engine,
  manifest: ASSET_MANIFEST,
  story: STORY_DATA,
  interactionSystem,
  ui
});
const playerController = new PlayerController({
  engine,
  manifest: ASSET_MANIFEST,
  hudNotice: dom.statusToast
});
const sceneManager = new SceneManager({
  engine,
  manifest: ASSET_MANIFEST,
  interactionSystem,
  inventorySystem,
  npcSystem,
  audioSystem,
  ui,
  progress
});
const vrSystem = new VRControllerSystem({
  engine,
  interactionSystem,
  playerController,
  xrButtonHost: dom.xrButtonHost,
  supportLabel: dom.xrSupportLabel
});

let hasStarted = false;
let isPaused = false;
let debugEnabled = false;
let controlHintTimer = null;

function createUIHelpers() {
  return {
    showLoading(message) {
      dom.loadingText.textContent = message;
      dom.loadingOverlay.classList.remove("hidden");
    },
    hideLoading() {
      dom.loadingOverlay.classList.add("hidden");
    },
    showError(title, message) {
      dom.errorTitle.textContent = title;
      dom.errorText.textContent = message;
      dom.errorOverlay.classList.remove("hidden");
    },
    hideError() {
      dom.errorOverlay.classList.add("hidden");
    },
    setCurrentScene(title) {
      dom.hudScene.textContent = title;
    },
    setObjective(text) {
      dom.hudObjective.textContent = text;
      inventorySystem.render({
        objectiveText: text,
        total: STORY_DATA.clueTargets.total,
        keyTotal: STORY_DATA.clueTargets.keyTotal
      });
    },
    updateProgress() {
      dom.hudClueCount.textContent = `${progress.collectedClues.size} / ${STORY_DATA.clueTargets.total}`;
      const keyCount = inventorySystem.countKeyClues();
      dom.hudKeyCount.textContent = `${keyCount} / ${STORY_DATA.clueTargets.keyTotal}`;
    },
    openDialogue(dialogue) {
      const node = dialogue.lines[0];
      dom.dialogueRole.textContent = dialogue.role;
      dom.dialogueSpeaker.textContent = dialogue.speaker;
      dom.dialogueText.textContent = node.text;
      dom.dialogueResponses.innerHTML = "";

      node.responses.forEach((response) => {
        const button = document.createElement("button");
        button.className = "launch-button secondary";
        button.type = "button";
        button.textContent = response.label;
        button.addEventListener("click", () => {
          dom.dialogueText.textContent = response.nextText;
          if (response.grantsFlag) progress.flags.add(response.grantsFlag);
          if (response.setState) setStoryState(response.setState);
          handleStoryProgression();
          dom.dialogueResponses.innerHTML = '<button class="launch-button" type="button" id="dialogueDoneButton">继续搜证</button>';
          dom.dialogueResponses.querySelector("#dialogueDoneButton")?.addEventListener("click", () => {
            dom.dialoguePanel.classList.add("hidden");
          });
        });
        dom.dialogueResponses.appendChild(button);
      });

      dom.dialoguePanel.classList.remove("hidden");
    },
    showStoryPrompt(lines) {
      dom.storyPromptBody.innerHTML = lines.map((line) => `<p>${line}</p>`).join("");
      dom.storyPrompt.classList.remove("hidden");
    },
    hideStoryPrompt() {
      dom.storyPrompt.classList.add("hidden");
    }
  };
}

function isBlockingOverlayOpen() {
  return (
    !dom.storyPrompt.classList.contains("hidden") ||
    !dom.loadingOverlay.classList.contains("hidden") ||
    !dom.dialoguePanel.classList.contains("hidden") ||
    !dom.inspectPanel.classList.contains("hidden") ||
    !dom.pausePanel.classList.contains("hidden") ||
    !dom.helpPanel.classList.contains("hidden") ||
    !dom.mapPanel.classList.contains("hidden")
  );
}

function toggleHelp(forceOpen = null) {
  const shouldOpen = forceOpen ?? dom.helpPanel.classList.contains("hidden");
  dom.helpPanel.classList.toggle("hidden", !shouldOpen);
}

function togglePause(forceOpen = null) {
  if (engine.renderer.xr.isPresenting) return;
  const shouldOpen = forceOpen ?? dom.pausePanel.classList.contains("hidden");
  isPaused = shouldOpen;
  dom.pausePanel.classList.toggle("hidden", !shouldOpen);
}

function toggleMap(forceOpen = null) {
  const shouldOpen = forceOpen ?? dom.mapPanel.classList.contains("hidden");
  dom.mapPanel.classList.toggle("hidden", !shouldOpen);
  if (shouldOpen) renderSceneMap();
}

function setStoryState(stateId) {
  progress.storyState = stateId;
  ui.setObjective(STORY_DATA.states[stateId].objective);
}

function showToast(message) {
  dom.statusToast.textContent = message;
  dom.statusToast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    dom.statusToast.classList.remove("is-visible");
  }, 2400);
}

function unlockScene(sceneId) {
  if (progress.unlockedScenes.has(sceneId)) return false;
  progress.unlockedScenes.add(sceneId);
  showToast(`场景已解锁：${ASSET_MANIFEST.scenes[sceneId].title}`);
  return true;
}

function handleStoryProgression() {
  if (progress.flags.has("talked_gongsunyan") && progress.storyState === "arrival") {
    setStoryState("waxTarget");
  }

  if (progress.flags.has("inspected_wax_letter") && progress.storyState === "waxTarget") {
    setStoryState("contradictionFound");
  }

  const studyUnlocked = STORY_DATA.sceneUnlockRules.study.every((flag) => progress.flags.has(flag));
  if (studyUnlocked) {
    progress.flags.add("study_unlocked");
    unlockScene("study");
    if (progress.storyState !== "studyUnlocked") {
      setStoryState("studyUnlocked");
    }
  }

  ["shed1", "shed2", "shed3", "courtyard"].forEach((sceneId) => {
    const rules = STORY_DATA.sceneUnlockRules[sceneId];
    if (rules?.every((flag) => progress.flags.has(flag))) unlockScene(sceneId);
  });

  if (
    (progress.collectedClues.has("seal") || progress.collectedClues.has("token")) &&
    progress.collectedClues.has("warringLetter")
  ) {
    setStoryState("finalCluesReady");
  }

  if (progress.collectedClues.size >= 6 && progress.flags.has("talked_gongsunyan")) {
    setStoryState("endingReady");
  }

  ui.updateProgress();
  maybeShowEnding();
}

function maybeShowEnding() {
  if (progress.storyState !== "endingReady" || progress.endingShown) return;
  if (sceneManager.currentSceneId !== "court") return;

  progress.endingShown = true;
  const endingId = evaluateEnding(progress);
  const ending = STORY_DATA.endings[endingId];
  dom.dialogueRole.textContent = "结局推演";
  dom.dialogueSpeaker.textContent = ending.title;
  dom.dialogueText.textContent = ending.text;
  dom.dialogueResponses.innerHTML = '<button class="launch-button" type="button" id="endingCloseButton">返回搜证</button>';
  dom.dialogueResponses.querySelector("#endingCloseButton")?.addEventListener("click", () => {
    dom.dialoguePanel.classList.add("hidden");
  });
  dom.dialoguePanel.classList.remove("hidden");
}

async function enterScene(sceneId) {
  ui.hideError();
  const sceneConfig = await sceneManager.loadScene(sceneId);
  playerController.setScene(sceneConfig);
  renderSceneMap();
  handleStoryProgression();
}

function renderSceneMap() {
  dom.sceneMapList.innerHTML = [...progress.unlockedScenes]
    .map((sceneId) => ASSET_MANIFEST.scenes[sceneId])
    .map(
      (scene) => `
        <article class="scene-map-card">
          <strong>${scene.title}</strong>
          <span>${scene.loadCopy}</span>
          <button class="launch-button secondary" type="button" data-scene-switch="${scene.id}">进入场景</button>
        </article>
      `
    )
    .join("");

  dom.sceneMapList.querySelectorAll("[data-scene-switch]").forEach((button) => {
    button.addEventListener("click", async () => {
      toggleMap(false);
      await enterScene(button.dataset.sceneSwitch);
    });
  });
}

function showControlHintTemporarily(duration = 8000) {
  dom.controlHint.classList.remove("hidden");
  dom.controlHint.classList.add("is-visible");
  window.clearTimeout(controlHintTimer);
  controlHintTimer = window.setTimeout(() => {
    dom.controlHint.classList.remove("is-visible");
  }, duration);
}

function refreshDebugOverlay() {
  if (!debugEnabled) {
    dom.debugPanel.classList.add("hidden");
    return;
  }
  dom.debugPanel.classList.remove("hidden");
  const playerState = playerController.getDebugState();
  const metrics = engine.sceneMetrics;
  const anchors = sceneManager.getDebugAnchors();
  const focused = interactionSystem.focusedEntry?.promptTitle ?? "无";
  const anchorLines = anchors
    .slice(0, 4)
    .map((anchor) => `${anchor.name}: ${anchor.position.x.toFixed(2)}, ${anchor.position.y.toFixed(2)}, ${anchor.position.z.toFixed(2)}`)
    .join("<br />");

  dom.debugPanel.innerHTML = `
    <strong>调试模式</strong><br />
    玩家：${playerState.player.x.toFixed(2)}, ${playerState.player.y.toFixed(2)}, ${playerState.player.z.toFixed(2)}<br />
    相机：${playerState.camera.x.toFixed(2)}, ${playerState.camera.y.toFixed(2)}, ${playerState.camera.z.toFixed(2)}<br />
    视角：${playerState.viewMode} ｜ 眼高：${playerState.eyeHeight.toFixed(2)}<br />
    包围盒：${metrics ? `${metrics.width} × ${metrics.height} × ${metrics.depth}` : "未载入"}<br />
    当前目标：${focused}<br />
    锚点：<br />${anchorLines || "无"}
  `;

  const eye = playerController.getEyePosition();
  engine.updateDebugFloor(eye, playerState.floor);
}

function bindEvents() {
  dom.startButton.addEventListener("click", startGame);
  dom.helpButton.addEventListener("click", () => toggleHelp(true));
  dom.pauseHelpButton.addEventListener("click", () => toggleHelp(true));
  dom.helpCloseButton.addEventListener("click", () => toggleHelp(false));
  dom.storyPromptButton.addEventListener("click", () => {
    ui.hideStoryPrompt();
    showControlHintTemporarily();
  });
  dom.errorBackButton.addEventListener("click", () => {
    dom.errorOverlay.classList.add("hidden");
    dom.launchScreen.classList.remove("hidden");
  });
  dom.dialogueCloseButton.addEventListener("click", () => {
    dom.dialoguePanel.classList.add("hidden");
  });
  dom.mapCloseButton.addEventListener("click", () => toggleMap(false));
  dom.resumeButton.addEventListener("click", () => togglePause(false));
  dom.resetPositionButton.addEventListener("click", () => playerController.resetToSpawn());
  dom.volumeRange.addEventListener("input", () => audioSystem.setVolume(Number(dom.volumeRange.value)));

  window.addEventListener("keydown", (event) => {
    if (!hasStarted) return;

    if (["KeyW", "KeyA", "KeyS", "KeyD", "KeyE", "KeyI", "KeyM", "Escape"].includes(event.code)) {
      showControlHintTemporarily(2800);
    }

    if (event.code === "Backquote") {
      debugEnabled = !debugEnabled;
      engine.setDebugEnabled(debugEnabled);
      sceneManager.setDebugEnabled(debugEnabled);
      refreshDebugOverlay();
      return;
    }

    if (event.code === "KeyE" && !dom.dialoguePanel.classList.contains("hidden")) return;
    if (event.code === "KeyE" && !isBlockingOverlayOpen()) interactionSystem.triggerNearest();
    if (event.code === "KeyF") playerController.toggleViewMode();
    if (event.code === "KeyI") inventorySystem.toggle();
    if (event.code === "KeyM") toggleMap();
    if (event.code === "Escape") {
      if (!dom.helpPanel.classList.contains("hidden")) {
        toggleHelp(false);
        return;
      }
      if (!dom.inspectPanel.classList.contains("hidden")) {
        interactionSystem.closeInspect();
        return;
      }
      togglePause();
    }
    if (event.code === "KeyR") playerController.resetToSpawn();
  });
}

async function startGame() {
  if (!hasStarted) {
    hasStarted = true;
    await playerController.init();
    await vrSystem.init();
    engine.start((delta) => {
      const movementLocked = isPaused || isBlockingOverlayOpen();
      playerController.setMovementLocked(movementLocked);
      if (!isPaused) {
        playerController.update(delta);
        npcSystem.update(playerController.getPosition(), delta);
        interactionSystem.updateDesktopFocus({
          camera: engine.camera,
          playerPosition: playerController.getPosition(),
          canvasRect: dom.canvas.getBoundingClientRect()
        });
        vrSystem.update(delta);
      }
      refreshDebugOverlay();
    });
  }

  audioSystem.unlock();
  dom.launchScreen.classList.add("hidden");
  dom.hud.classList.remove("hidden");
  setStoryState("arrival");
  ui.updateProgress();
  await enterScene("court");
  ui.showStoryPrompt(STORY_DATA.arrivalPrompt);
}

bindEvents();
inventorySystem.render({
  objectiveText: STORY_DATA.states.arrival.objective,
  total: STORY_DATA.clueTargets.total,
  keyTotal: STORY_DATA.clueTargets.keyTotal
});
