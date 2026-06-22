import { AudioSystem } from './audio-system.js';
import { ASSET_MANIFEST } from './asset-manifest.js';
import { FORMAL_SCENE_IDS, VIDEO_REGISTRY } from './data/scene-registry.js';
import { GAME_MODES, STORY_TEXT, createInitialProgress, evaluateEnding, getCurrentObjective, getEvidenceChainState, syncSceneUnlocks } from './data/story-state.js';
import { CLUE_DEFINITIONS, DIALOGUE_DATA, ENDING_DATA } from './story-data.js';
import { getCollectedClueStats } from './data/clue-registry.js';
import { GameEngine, waitForNextFrame } from './game-engine.js';
import { InteractionSystem } from './interaction-system.js';
import { InventorySystem } from './inventory-system.js';
import { NPCSystem } from './npc-system.js';
import { PlayerController } from './player-controller.js';
import { SceneManager } from './scene-manager.js';
import { SceneLoadCoordinator } from './systems/scene-load-coordinator.js';
import { VRControllerSystem } from './vr-controller.js';
import { WorldCollisionSystem } from './systems/world-collision-system.js';

const dom = {
  canvas: document.querySelector('#gameCanvas'),
  launchScreen: document.querySelector('#launchScreen'),
  loadingOverlay: document.querySelector('#loadingOverlay'),
  loadingTitle: document.querySelector('#loadingTitle'),
  loadingText: document.querySelector('#loadingText'),
  loadingMeta: document.querySelector('#loadingMeta'),
  errorOverlay: document.querySelector('#errorOverlay'),
  errorTitle: document.querySelector('#errorTitle'),
  errorText: document.querySelector('#errorText'),
  errorRetryButton: document.querySelector('#errorRetryButton'),
  errorBackButton: document.querySelector('#errorBackButton'),
  videoOverlay: document.querySelector('#videoOverlay'),
  prologueVideo: document.querySelector('#prologueVideo'),
  videoStatus: document.querySelector('#videoStatus'),
  skipVideoButton: document.querySelector('#skipVideoButton'),
  fallbackVideoButton: document.querySelector('#fallbackVideoButton'),
  storyPrompt: document.querySelector('#storyPrompt'),
  storyPromptTitle: document.querySelector('#storyPromptTitle'),
  storyPromptBody: document.querySelector('#storyPromptBody'),
  storyPromptButton: document.querySelector('#storyPromptButton'),
  hud: document.querySelector('#gameHud'),
  hudScene: document.querySelector('#hudScene'),
  hudObjective: document.querySelector('#hudObjective'),
  hudClueCount: document.querySelector('#hudClueCount'),
  hudKeyCount: document.querySelector('#hudKeyCount'),
  interactionPrompt: document.querySelector('#interactionPrompt'),
  controlHint: document.querySelector('#controlHint'),
  worldHint: document.querySelector('#worldHint'),
  archivePanel: document.querySelector('#archivePanel'),
  archiveList: document.querySelector('#archiveList'),
  archiveStats: document.querySelector('#archiveStats'),
  archiveObjective: document.querySelector('#archiveObjective'),
  archiveCloseButton: document.querySelector('#archiveCloseButton'),
  mapPanel: document.querySelector('#mapPanel'),
  sceneMapList: document.querySelector('#sceneMapList'),
  mapCloseButton: document.querySelector('#mapCloseButton'),
  pausePanel: document.querySelector('#pausePanel'),
  resumeButton: document.querySelector('#resumeButton'),
  resetPositionButton: document.querySelector('#resetPositionButton'),
  volumeRange: document.querySelector('#volumeRange'),
  dialoguePanel: document.querySelector('#dialoguePanel'),
  dialogueRole: document.querySelector('#dialogueRole'),
  dialogueSpeaker: document.querySelector('#dialogueSpeaker'),
  dialogueText: document.querySelector('#dialogueText'),
  dialogueResponses: document.querySelector('#dialogueResponses'),
  dialogueCloseButton: document.querySelector('#dialogueCloseButton'),
  inspectPanel: document.querySelector('#inspectPanel'),
  inspectCloseButton: document.querySelector('#inspectCloseButton'),
  inspectTitle: document.querySelector('#inspectTitle'),
  inspectMeta: document.querySelector('#inspectMeta'),
  inspectBody: document.querySelector('#inspectBody'),
  inspectImage: document.querySelector('#inspectImage'),
  inspectVideo: document.querySelector('#inspectVideo'),
  helpPanel: document.querySelector('#helpPanel'),
  helpButton: document.querySelector('#helpButton'),
  pauseHelpButton: document.querySelector('#pauseHelpButton'),
  helpCloseButton: document.querySelector('#helpCloseButton'),
  startButton: document.querySelector('#startButton'),
  statusToast: document.querySelector('#statusToast'),
  audioToast: document.querySelector('#audioToast'),
  xrButtonHost: document.querySelector('#xrButtonHost'),
  xrHudButtonDock: document.querySelector('#xrHudButtonDock'),
  xrPauseDock: document.querySelector('#xrPauseDock'),
  xrSupportLabel: document.querySelector('#xrSupportLabel'),
  xrHudSupportLabel: document.querySelector('#xrHudSupportLabel'),
  xrPauseSupportLabel: document.querySelector('#xrPauseSupportLabel'),
  endingPanel: document.querySelector('#endingPanel'),
  endingTitle: document.querySelector('#endingTitle'),
  endingBody: document.querySelector('#endingBody'),
  endingStats: document.querySelector('#endingStats'),
  endingChains: document.querySelector('#endingChains'),
  endingRestartButton: document.querySelector('#endingRestartButton'),
  endingContinueButton: document.querySelector('#endingContinueButton'),
  endingReturnButton: document.querySelector('#endingReturnButton'),
  debugPanel: document.querySelector('#debugPanel')
};

const progress = createInitialProgress();
const gameState = {
  mode: GAME_MODES.MENU,
  hasStarted: false,
  debugEnabled: false,
  lastFps: 0,
  controlHintTimer: 0,
  activeDialogueNpcId: '',
  failedSceneId: '',
  currentVideoFlow: ''
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
const interactionSystem = new InteractionSystem({ engine, hudPrompt: dom.interactionPrompt, worldHint: dom.worldHint, debugLogger: console.warn });
const worldCollisionSystem = new WorldCollisionSystem({ debugLogger: console.warn });
const playerController = new PlayerController({
  engine,
  manifest: ASSET_MANIFEST,
  hudNotice: dom.statusToast,
  canCapturePointer: () => gameState.mode === GAME_MODES.EXPLORE,
  worldCollisionSystem
});
const npcSystem = new NPCSystem({
  engine,
  manifest: ASSET_MANIFEST,
  interactionSystem,
  onNpcInteract: handleNpcInteraction,
  getProgress: () => progress
});
const loadCoordinator = new SceneLoadCoordinator({ ui: createUiHelpers() });
const sceneManager = new SceneManager({
  engine,
  manifest: ASSET_MANIFEST,
  interactionSystem,
  inventorySystem,
  worldCollisionSystem,
  npcSystem,
  audioSystem,
  ui: createUiHelpers(),
  progress,
  loadCoordinator,
  onPropInteract: handlePropInteraction,
  onExitInteract: handleExitInteraction,
  onSceneReady: () => updateAllUi()
});
const vrSystem = new VRControllerSystem({
  engine,
  interactionSystem,
  playerController,
  buttonHosts: [dom.xrButtonHost, dom.xrHudButtonDock, dom.xrPauseDock],
  supportLabels: [dom.xrSupportLabel, dom.xrHudSupportLabel, dom.xrPauseSupportLabel],
  getMode: () => gameState.mode,
  getObjective: () => getCurrentObjective(progress, progress.currentSceneId || 'prologue'),
  getFocusedInteractable: () => interactionSystem.getFocusedInteractable()
});

function createUiHelpers() {
  return {
    showLoading(payload) {
      const detail = typeof payload === 'string'
        ? { title: '正在重构戏中声境……', detail: payload, percent: 0, ready: 0, total: 0 }
        : payload;
      dom.loadingTitle.textContent = detail.title || '正在重构戏中声境……';
      dom.loadingText.textContent = detail.detail || '正在调入场景资源……';
      dom.loadingMeta.textContent = detail.total
        ? `当前进度：${detail.percent}% ｜ 已就绪 ${detail.ready} / ${detail.total} 项`
        : `当前进度：${detail.percent ?? 0}%`;
      dom.loadingOverlay.classList.remove('hidden');
      setMode(GAME_MODES.LOADING, { silent: true });
    },
    hideLoading() {
      dom.loadingOverlay.classList.add('hidden');
    },
    showError(title, message) {
      dom.errorTitle.textContent = title;
      dom.errorText.textContent = message;
      dom.errorOverlay.classList.remove('hidden');
      setMode(GAME_MODES.PAUSED, { silent: true });
    },
    hideError() {
      dom.errorOverlay.classList.add('hidden');
    },
    setCurrentScene(text) {
      dom.hudScene.textContent = text;
    },
    setObjective(text) {
      dom.hudObjective.textContent = text;
    }
  };
}

function bindDomEvent(element, eventName, handler, label) {
  if (!element) {
    console.warn(`[界面元素缺失] ${label}`);
    return;
  }
  element.addEventListener(eventName, handler);
}
function bindEvents() {
  bindDomEvent(dom.startButton, 'click', startGame, '开始探索按钮');
  bindDomEvent(dom.helpButton, 'click', () => openHelp(), '操作说明按钮');
  bindDomEvent(dom.pauseHelpButton, 'click', () => openHelp(), '暂停菜单操作说明按钮');
  bindDomEvent(dom.helpCloseButton, 'click', () => closeHelp(), '关闭操作说明按钮');
  bindDomEvent(dom.errorBackButton, 'click', () => {
    dom.errorOverlay.classList.add('hidden');
    dom.launchScreen.classList.remove('hidden');
    setMode(GAME_MODES.MENU, { silent: true });
  }, '错误返回按钮');
  bindDomEvent(dom.dialogueCloseButton, 'click', () => closeDialogue(), '关闭对话按钮');
  bindDomEvent(dom.errorRetryButton, 'click', async () => {
    if (!gameState.failedSceneId) return;
    dom.errorOverlay.classList.add('hidden');
    await enterScene(gameState.failedSceneId);
  }, '重试当前场景按钮');
  bindDomEvent(dom.endingRestartButton, 'click', () => window.location.reload(), '重新开始按钮');
  bindDomEvent(dom.endingContinueButton, 'click', () => continueEndingExploration(), '继续探索场景按钮');
  bindDomEvent(dom.debugPanel, 'click', handleDebugPanelClick, '开发调试面板');
  bindDomEvent(dom.mapCloseButton, 'click', () => closeMap(), '关闭地图按钮');
  bindDomEvent(dom.resumeButton, 'click', () => closePause(), '继续探索按钮');
  bindDomEvent(dom.resetPositionButton, 'click', () => playerController.resetToSpawn(), '重置站位按钮');
  bindDomEvent(dom.volumeRange, 'input', () => audioSystem.setVolume(Number(dom.volumeRange.value)), '音量滑杆');
  bindDomEvent(dom.inspectCloseButton, 'click', () => closeInspect(), '关闭线索观察按钮');
  bindDomEvent(dom.endingReturnButton, 'click', () => {
    window.location.href = '../main-site/index.html';
  }, '返回资料馆按钮');

  window.addEventListener('keydown', async (event) => {
    if (!gameState.hasStarted) return;

    if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyE', 'KeyI', 'KeyM', 'Escape', 'Space', 'KeyR', 'KeyF'].includes(event.code)) {
      showControlHintTemporarily(2600);
    }

    if (event.code === 'Backquote') {
      gameState.debugEnabled = !gameState.debugEnabled;
      engine.setDebugEnabled(gameState.debugEnabled);
      worldCollisionSystem.setDebugEnabled(gameState.debugEnabled);
      sceneManager.setDebugEnabled(gameState.debugEnabled);
      return;
    }

    if (event.code === 'KeyF' && gameState.mode === GAME_MODES.EXPLORE) playerController.toggleViewMode();
    if (event.code === 'KeyR' && gameState.mode === GAME_MODES.EXPLORE) playerController.resetToSpawn();
    if (event.code === 'KeyI') inventorySystem.isOpen ? closeArchive() : openArchive();
    if (event.code === 'KeyM') dom.mapPanel.classList.contains('hidden') ? openMap() : closeMap();

    if (event.code === 'Escape') {
      if (!dom.helpPanel.classList.contains('hidden')) return closeHelp();
      if (!dom.inspectPanel.classList.contains('hidden')) return closeInspect();
      if (!dom.dialoguePanel.classList.contains('hidden')) return closeDialogue();
      if (!dom.mapPanel.classList.contains('hidden')) return closeMap();
      if (!dom.archivePanel.classList.contains('hidden')) return closeArchive();
      if (!dom.pausePanel.classList.contains('hidden')) return closePause();
      if (!dom.endingPanel.classList.contains('hidden')) return closeEndingPanel();
      return openPause();
    }

    if (event.code === 'KeyE') {
      interactionSystem.updateDesktopFocus({
        camera: engine.camera,
        playerPosition: playerController.getPosition(),
        mode: gameState.mode,
        canvasRect: dom.canvas.getBoundingClientRect()
      });
      const result = interactionSystem.tryInteract({ mode: gameState.mode, playerPosition: playerController.getPosition() });
      if (!result.ok) console.warn('[互动失败]', result.reason);
    }
  });
}
function setMode(mode, { silent = false } = {}) {
  gameState.mode = mode;
  if (mode !== GAME_MODES.EXPLORE) {
    playerController.releasePointerLock();
    dom.canvas.style.cursor = 'default';
    dom.canvas.style.pointerEvents = 'none';
  } else {
    dom.canvas.style.cursor = 'none';
    dom.canvas.style.pointerEvents = 'auto';
  }
  if (!silent) updateAllUi();
}

function updateAllUi() {
  syncSceneUnlocks(progress);
  const objective = getCurrentObjective(progress, progress.currentSceneId || 'prologue');
  const clueStats = getCollectedClueStats(progress.collectedClues);
  dom.hudObjective.textContent = objective;
  dom.hudScene.textContent = ASSET_MANIFEST.scenes[progress.currentSceneId]?.title ?? '序章粤剧剧场';
  dom.hudClueCount.textContent = `${clueStats.collectedCount} / ${clueStats.total}`;
  dom.hudKeyCount.textContent = `${clueStats.collectedKeyCount} / ${clueStats.keyTotal}`;
  inventorySystem.render({ objectiveText: objective, stats: clueStats });
  renderSceneMap();
  sceneManager.refreshDynamicState();
}

async function startGame() {
  if (gameState.mode === GAME_MODES.LOADING || gameState.mode === GAME_MODES.VIDEO) return;
  dom.startButton?.setAttribute('disabled', 'disabled');
  createUiHelpers().showLoading({
    title: '正在启动戏中世界……',
    detail: '正在初始化角色、视角与 WebXR 控制……',
    percent: 0,
    ready: 0,
    total: 0
  });

  try {
    if (!gameState.hasStarted) {
      gameState.hasStarted = true;
      await playerController.init();
      engine.start((delta) => {
        gameState.lastFps = Math.round(1 / Math.max(delta, 0.0001));
        playerController.setMovementLocked(gameState.mode !== GAME_MODES.EXPLORE);
        playerController.update(delta);
        npcSystem.update(playerController.getPosition(), delta);
        interactionSystem.updateDesktopFocus({
          camera: engine.camera,
          playerPosition: playerController.getPosition(),
          mode: gameState.mode,
          canvasRect: dom.canvas.getBoundingClientRect()
        });
        vrSystem.update(delta, gameState.mode, playerController.getPosition());
        refreshDebugOverlay();
      });
    }

    audioSystem.unlock();
    dom.launchScreen.classList.add('hidden');
    dom.hud.classList.remove('hidden');
    createUiHelpers().hideLoading();
    await playPrologueVideo();
  } catch (error) {
    console.error('[开始探索失败]', error);
    gameState.hasStarted = false;
    createUiHelpers().hideLoading();
    createUiHelpers().showError('启动失败', `剧本杀模块初始化时发生异常：${error?.message ?? String(error)}。`);
    dom.launchScreen.classList.remove('hidden');
    setMode(GAME_MODES.MENU, { silent: true });
  } finally {
    dom.startButton?.removeAttribute('disabled');
  }
}

async function playPrologueVideo() {
  await playVideoFlow({
    path: VIDEO_REGISTRY.prologue.path,
    statusText: STORY_TEXT.videoLoading[0],
    skipLabel: '跳过序章',
    fallbackLabel: '视频异常，直接进入剧场',
    onFinish: async (reason) => {
      if (reason === 'error' || reason === 'fallback') {
        showToast('序章影片未能正常播放，已直接进入序章粤剧剧场。');
      }
      progress.flags.add('prologue_video_done');
      collectClue('vocalShard', '序章影片');
      collectClue('drumShard', '序章影片');
      await enterScene('prologue');
      showStoryPrompt(STORY_TEXT.prologueTransition, '序章粤剧剧场');
    }
  });
}

async function playVideoFlow({ path, statusText, skipLabel, fallbackLabel, onFinish }) {
  dom.prologueVideo.pause();
  dom.prologueVideo.currentTime = 0;
  dom.prologueVideo.src = path;
  dom.videoStatus.textContent = statusText;
  dom.skipVideoButton.textContent = skipLabel;
  dom.fallbackVideoButton.textContent = fallbackLabel;
  dom.videoOverlay.classList.remove('hidden');
  setMode(GAME_MODES.VIDEO, { silent: true });

  return new Promise((resolve) => {
    let finished = false;
    const cleanup = () => {
      dom.prologueVideo.removeEventListener('ended', handleEnded);
      dom.prologueVideo.removeEventListener('error', handleError);
      dom.skipVideoButton.removeEventListener('click', handleSkip);
      dom.fallbackVideoButton.removeEventListener('click', handleFallback);
    };

    const finalize = async (reason) => {
      if (finished) return;
      finished = true;
      cleanup();
      dom.prologueVideo.pause();
      dom.videoOverlay.classList.add('hidden');
      await onFinish(reason);
      resolve();
    };

    const handleEnded = () => finalize('ended');
    const handleError = () => finalize('error');
    const handleSkip = () => finalize('skip');
    const handleFallback = () => finalize('fallback');

    dom.prologueVideo.addEventListener('ended', handleEnded, { once: true });
    dom.prologueVideo.addEventListener('error', handleError, { once: true });
    dom.skipVideoButton.addEventListener('click', handleSkip, { once: true });
    dom.fallbackVideoButton.addEventListener('click', handleFallback, { once: true });

    dom.prologueVideo.play().catch(() => {
      dom.videoStatus.textContent = statusText + '（视频暂未正常播放，可直接跳过。）';
    });
  });
}

async function playEndingVideoFlow() {
  if (!VIDEO_REGISTRY.ending.path) {
    showToast('未找到终章影片资源，已进入文字结局页。');
    showEndingPanel();
    return;
  }

  await playVideoFlow({
    path: VIDEO_REGISTRY.ending.path,
    statusText: '正在回看终章锣鼓……',
    skipLabel: '跳过终章',
    fallbackLabel: '影片异常，直接查看结局',
    onFinish: async (reason) => {
      if (reason === 'error' || reason === 'fallback') {
        showToast('终章影片未能正常播放，已进入文字结局页。');
      }
      showEndingPanel();
    }
  });
}

async function enterScene(sceneId, promptLines = null, promptTitle = '') {
  try {
    setMode(GAME_MODES.LOADING, { silent: true });
    gameState.failedSceneId = sceneId;
    const sceneConfig = await sceneManager.loadScene(sceneId);
    progress.currentSceneId = sceneId;
    playerController.setScene(sceneConfig);
    sceneManager.markPostLoadReady('player-start', `正在校准 ${sceneConfig.title} 的出生点与视角……`);
    updateAllUi();
    sceneManager.markPostLoadReady('hud-ready', `正在同步 ${sceneConfig.title} 的任务与线索……`);
    await waitForNextFrame();
    await sceneManager.finalizeSceneLoad(sceneId, `${sceneConfig.title}已就绪。`);
    gameState.failedSceneId = '';
    handleSceneArrival(sceneId, sceneConfig, promptLines, promptTitle);
  } catch (error) {
    console.error('[场景切换失败]', sceneId, error);
  }
}

function handleSceneArrival(sceneId, sceneConfig, promptLines, promptTitle) {
  const shouldSkipDefaultPrompt = promptLines === false;
  let lines = promptLines;
  let title = promptTitle || sceneConfig.title;
  let afterClose = null;

  if (!shouldSkipDefaultPrompt && !lines && sceneId === 'court' && !progress.flags.has('court_arrival_prompt')) {
    progress.flags.add('court_arrival_prompt');
    lines = STORY_TEXT.courtArrival;
    title = '封相朝堂';
  }

  if (!shouldSkipDefaultPrompt && !lines && sceneId === 'courtyard' && !progress.flags.has('courtyard_overheard')) {
    lines = STORY_TEXT.courtyardOverhear;
    title = '院子';
    afterClose = () => {
      progress.flags.add('courtyard_overheard');
      showToast('你已听清第七响后的封门暗令。');
      updateStoryProgress();
    };
  }

  if (!shouldSkipDefaultPrompt && !lines && sceneId === 'stage' && !progress.flags.has('stage_entry_prompt')) {
    progress.flags.add('stage_entry_prompt');
    lines = [
      '你已踏入粤剧戏棚的终章舞台。',
      '朝堂里的权谋与伪诏，将在此被重新唱回戏台。',
      '靠近粤剧伶人并按下 E，才能正式触发终章演出。'
    ];
    title = '粤剧戏棚';
  }

  if (!shouldSkipDefaultPrompt && !lines && sceneId === 'prologue' && progress.guideNpcDialogueState === 'ending' && progress.flags.has('ending_returned')) {
    lines = STORY_TEXT.endingReturn;
    title = '终局回返';
  }

  if (Array.isArray(lines) && lines.length) {
    showStoryPrompt(lines, title, afterClose);
    return;
  }

  resumeExploreControl();
}

function openGuideDialogue() {
  openDialogue(progress.guideNpcDialogueState === 'ending' ? 'guide_ending' : 'guide_intro', 'guide-performer');
}

function showStoryPrompt(lines, title = '入场提示', afterClose = null) {
  dom.storyPromptTitle.textContent = title;
  dom.storyPromptBody.innerHTML = lines.map((line) => `<p>${line}</p>`).join('');
  dom.storyPrompt.classList.remove('hidden');
  dom.storyPromptButton.onclick = () => {
    dom.storyPrompt.classList.add('hidden');
    resumeExploreControl({ recapturePointer: false });
    showControlHintTemporarily(8000);
    afterClose?.();
  };
  setMode(GAME_MODES.CUTSCENE, { silent: true });
}

function hideStoryPrompt() {
  dom.storyPrompt.classList.add('hidden');
  resumeExploreControl();
}

function resumeExploreControl({ recapturePointer = true } = {}) {
  if (hasAnyBlockingPanel()) return;
  setMode(GAME_MODES.EXPLORE, { silent: false });
  if (recapturePointer && !engine.renderer.xr.isPresenting) {
    playerController.requestPointerLock();
  }
}

function showControlHintTemporarily(duration = 8000) {
  dom.controlHint.classList.remove('hidden');
  dom.controlHint.classList.add('is-visible');
  window.clearTimeout(gameState.controlHintTimer);
  gameState.controlHintTimer = window.setTimeout(() => {
    dom.controlHint.classList.remove('is-visible');
  }, duration);
}

function openHelp() {
  dom.helpPanel.classList.remove('hidden');
  setMode(GAME_MODES.PAUSED, { silent: true });
}

function closeHelp() {
  dom.helpPanel.classList.add('hidden');
  resumeExploreControl();
}

function openPause() {
  dom.pausePanel.classList.remove('hidden');
  setMode(GAME_MODES.PAUSED, { silent: true });
}

function closePause() {
  dom.pausePanel.classList.add('hidden');
  resumeExploreControl();
}

function openArchive() {
  inventorySystem.open();
  setMode(GAME_MODES.PAUSED, { silent: true });
}

function closeArchive() {
  inventorySystem.close();
  resumeExploreControl();
}

function openMap() {
  renderSceneMap();
  dom.mapPanel.classList.remove('hidden');
  setMode(GAME_MODES.MAP, { silent: true });
}

function closeMap() {
  dom.mapPanel.classList.add('hidden');
  resumeExploreControl();
}

function hasAnyBlockingPanel() {
  return [dom.helpPanel, dom.pausePanel, dom.archivePanel, dom.mapPanel, dom.dialoguePanel, dom.inspectPanel, dom.endingPanel].some((panel) => panel && !panel.classList.contains('hidden'));
}

function closeEndingPanel() {
  dom.endingPanel.classList.add('hidden');
  setMode(GAME_MODES.PAUSED, { silent: true });
}

async function handleDebugPanelClick(event) {
  const godToggle = event.target.closest('[data-debug-god]');
  if (godToggle) {
    playerController.setGodMode(!playerController.getDebugState().godMode);
    refreshDebugOverlay();
    return;
  }

  const sceneTarget = event.target.closest('[data-debug-scene]');
  if (sceneTarget) {
    enterScene(sceneTarget.dataset.debugScene, false, '调试跳转');
    return;
  }

  const anchorTarget = event.target.closest('[data-debug-anchor]');
  if (anchorTarget) {
    const target = sceneManager.getDebugAnchors().find((anchor) => anchor.name === anchorTarget.dataset.debugAnchor);
    if (target) {
      playerController.teleportTo(target.position.clone());
      showToast(`已跳转到锚点：${target.name}`);
    }
  }
}

async function continueEndingExploration() {
  dom.endingPanel.classList.add('hidden');
  progress.guideNpcDialogueState = 'ending';
  progress.flags.add('ending_returned');
  await enterScene('prologue', false);
}

function openDialogue(dialogueId, npcId = '') {
  const dialogue = DIALOGUE_DATA[dialogueId];
  if (!dialogue) return;
  gameState.activeDialogueNpcId = npcId;
  npcSystem.resetTalkStates();
  if (npcId) npcSystem.setTalkState(npcId, true);
  dom.dialogueRole.textContent = dialogue.role;
  dom.dialogueSpeaker.textContent = dialogue.speaker;
  dom.dialogueText.textContent = dialogue.text;
  dom.dialogueResponses.innerHTML = '';
  dialogue.responses.forEach((response) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'launch-button secondary';
    button.textContent = response.label;
    button.addEventListener('click', () => handleDialogueAction(response.action, dialogueId, npcId));
    dom.dialogueResponses.appendChild(button);
  });
  dom.dialoguePanel.classList.remove('hidden');
  setMode(GAME_MODES.DIALOGUE, { silent: true });
}

function closeDialogue(restoreControl = true) {
  gameState.activeDialogueNpcId = '';
  npcSystem.resetTalkStates();
  dom.dialoguePanel.classList.add('hidden');
  if (restoreControl) resumeExploreControl();
}

function openInspect(record) {
  dom.inspectTitle.textContent = record.title;
  dom.inspectMeta.textContent = `${record.category} · ${record.sourceScene} · 关联人物：${record.relatedCharacter}`;
  dom.inspectBody.innerHTML = `<p>${record.description}</p><p><strong>可疑点：</strong>${record.suspicion}</p>`;

  if (record.previewVideo) {
    dom.inspectVideo.src = record.previewVideo;
    dom.inspectVideo.classList.remove('hidden');
    dom.inspectVideo.play().catch(() => {});
  } else {
    dom.inspectVideo.pause();
    dom.inspectVideo.classList.add('hidden');
    dom.inspectVideo.removeAttribute('src');
  }

  if (record.preview) {
    dom.inspectImage.src = record.preview;
    dom.inspectImage.classList.remove('hidden');
  } else {
    dom.inspectImage.classList.add('hidden');
  }

  dom.inspectPanel.classList.remove('hidden');
  setMode(GAME_MODES.INSPECT, { silent: true });
}

function closeInspect() {
  dom.inspectVideo.pause();
  dom.inspectPanel.classList.add('hidden');
  resumeExploreControl();
}

function renderSceneMap() {
  dom.sceneMapList.innerHTML = FORMAL_SCENE_IDS
    .map((sceneId) => ASSET_MANIFEST.scenes[sceneId])
    .filter(Boolean)
    .map((scene) => {
      const unlocked = progress.unlockedScenes.has(scene.id);
      const isCurrent = progress.currentSceneId === scene.id;
      const status = isCurrent ? '当前所在场景' : unlocked ? '已解锁，可进入' : '未解锁，需推进主线';
      const action = isCurrent ? '当前场景' : unlocked ? '进入场景' : '未解锁';
      return `
        <article class="scene-map-card ${unlocked ? 'is-unlocked' : 'is-locked'}">
          <strong>${scene.title}</strong>
          <span>${status}</span>
          <small>${scene.loadCopy}</small>
          <button class="launch-button secondary" type="button" data-scene-switch="${scene.id}" ${!unlocked || isCurrent ? 'disabled' : ''}>${action}</button>
        </article>
      `;
    })
    .join('');

  dom.sceneMapList.querySelectorAll('[data-scene-switch]').forEach((button) => {
    button.addEventListener('click', async () => {
      if (button.disabled) return;
      closeMap();
      await enterScene(button.dataset.sceneSwitch);
    });
  });
}

function collectClue(clueId, sourceScene, overrides = {}) {
  const definition = CLUE_DEFINITIONS[clueId];
  if (!definition) return false;
  const item = {
    id: clueId,
    title: definition.title,
    category: definition.category,
    relatedCharacter: overrides.relatedCharacter ?? definition.relatedCharacter,
    description: definition.description,
    suspicion: definition.suspicion,
    sourceScene,
    preview: overrides.preview ?? overrides.previewVideo ?? '',
    previewVideo: overrides.previewVideo ?? '',
    isKey: definition.isKey
  };
  const isNew = inventorySystem.addItem(item);
  if (isNew) {
    progress.collectedClues.add(clueId);
    updateStoryProgress();
  }
  return isNew;
}

function handleNpcInteraction(npcLayout) {
  if (npcLayout.id === 'guide-performer') {
    openGuideDialogue();
    return;
  }
  if (progress.currentSceneId === 'court' && npcLayout.id === 'court-gongsunyan' && progress.flags.has('final_court_ready')) {
    openDialogue('final_accusation', npcLayout.id);
    return;
  }
  openDialogue(npcLayout.dialogueId, npcLayout.id);
}

function handlePropInteraction(definition, manifest) {
  if (definition.id === 'study-clue-box') {
    progress.puzzleState.clueBoxPicked = true;
    collectClue('clueBox', '书房密室', {
      relatedCharacter: definition.relatedCharacter,
      preview: manifest?.preview,
      previewVideo: manifest?.previewVideo
    });
    showToast('你取出了小型线索木匣。');
    openInspect({
      ...CLUE_DEFINITIONS.clueBox,
      sourceScene: '书房密室',
      preview: manifest?.preview,
      previewVideo: manifest?.previewVideo
    });
    updateStoryProgress();
    return;
  }

  if (definition.eventFlag === 'open_hidden_shelf') {
    return openHiddenShelfInteraction();
  }
  if (definition.eventFlag === 'study_puzzle') {
    return openStudyVerification();
  }
  if (definition.collectable && definition.clueId) {
    const collected = collectClue(definition.clueId, ASSET_MANIFEST.scenes[progress.currentSceneId].title, {
      relatedCharacter: definition.relatedCharacter,
      preview: manifest?.preview,
      previewVideo: manifest?.previewVideo
    });
    if (collected) {
      if (definition.eventFlag) progress.flags.add(definition.eventFlag);
      if (definition.clueId === 'clueBox') progress.puzzleState.clueBoxPicked = true;
      if (definition.id === 'court-decree') progress.flags.add('court_intro_seen');
      if (definition.id === 'courtyard-wax-letter') progress.flags.add('wax_letter_found');
      if (definition.id === 'courtyard-stage-key') progress.flags.add('stage_key_found');
      openInspect({
        ...CLUE_DEFINITIONS[definition.clueId],
        sourceScene: ASSET_MANIFEST.scenes[progress.currentSceneId].title,
        preview: manifest?.preview,
        previewVideo: manifest?.previewVideo
      });
      sceneManager.refreshDynamicState();
    }
    return;
  }

  openInspect({
    title: definition.title,
    category: manifest?.category ?? '场景物件',
    relatedCharacter: definition.relatedCharacter ?? '未标注',
    sourceScene: ASSET_MANIFEST.scenes[progress.currentSceneId].title,
    description: `${definition.title} 当前仅作为场景叙事节点使用。`,
    suspicion: '请继续沿着主线调查。',
    preview: manifest?.preview,
    previewVideo: manifest?.previewVideo
  });
}

function handleExitInteraction(exitDef) {
  enterScene(exitDef.toScene);
}

function handleDialogueAction(action) {
  switch (action) {
    case 'closeDialogue':
      closeDialogue();
      return;
    case 'openHelp':
      closeDialogue(false);
      openHelp();
      return;
    case 'openArchiveFromDialogue':
      closeDialogue(false);
      openArchive();
      return;
    case 'showEndingSummary':
      closeDialogue(false);
      showEndingPanel();
      return;
    case 'playEndingVideo':
      progress.flags.add('ending_played');
      closeDialogue(false);
      playEndingVideoFlow();
      return;
    case 'replayStageEpilogue':
      closeDialogue(false);
      progress.flags.delete('stage_entry_prompt');
      progress.flags.delete('stage_epilogue_opened');
      enterScene('stage');
      return;
    case 'restartExperience':
      window.location.reload();
      return;
    case 'returnToArchive':
      window.location.href = '../main-site/index.html';
      return;
    case 'replayGong':
      showToast('第七声锣再次响起，节奏明显不同于正式封相礼。');
      closeDialogue();
      return;
    case 'completeGuide':
      progress.flags.add('guide_completed');
      progress.storyBeat = 'court_intro';
      syncSceneUnlocks(progress);
      closeDialogue(false);
      enterScene('court', STORY_TEXT.courtArrival, '封相朝堂');
      return;
    case 'courtHintWax':
      progress.flags.add('court_intro_seen');
      dom.dialogueText.textContent = '那封密函本不该出现在殿上。若你亲自查看，也许能比我更早看出是谁在借礼掩密。';
      return;
    case 'courtObserveGongsunyan':
      dom.dialogueText.textContent = '他答得极稳，眼神却始终掠向东侧案台，像是在确认那封密函是否还留在原处。';
      return;
    case 'collectZhaoTestimony':
      collectClue('zhaoTestimony', '封相朝堂');
      closeDialogue();
      return;
    case 'collectYanTestimony':
      collectClue('yanTestimony', '封相朝堂');
      closeDialogue();
      return;
    case 'collectGuardTestimony':
      collectClue('guardTestimony', '院子');
      progress.flags.add('guard_testimony_done');
      closeDialogue();
      return;
    case 'accuseWithSound':
      return resolveFinalAccusation('sound');
    case 'accuseWithDocument':
      return resolveFinalAccusation('document');
    case 'accuseWithAction':
      return resolveFinalAccusation('action');
    case 'returnToPrologue':
      progress.guideNpcDialogueState = 'ending';
      progress.flags.add('ending_returned');
      closeDialogue(false);
      enterScene('prologue', STORY_TEXT.endingReturn, '终局回返');
      return;
    case 'endExperience':
      closeDialogue();
      showStoryPrompt([ENDING_DATA[progress.endingId]?.text ?? '体验结束。'], '结局收束');
      return;
    default:
      closeDialogue();
  }
}

function openHiddenShelfInteraction() {
  if (!progress.collectedClues.has('key')) {
    openInspect({
      title: '书架暗格',
      category: '机关',
      relatedCharacter: '书房密室',
      sourceScene: '书房密室',
      description: '书架暗格被锁住了，似乎需要一把特殊钥匙。',
      suspicion: '也许该先在院子或回廊里找到能开启后台机关的钥匙。'
    });
    return;
  }

  dom.dialogueRole.textContent = '书房机关';
  dom.dialogueSpeaker.textContent = '书架暗格';
  dom.dialogueText.textContent = progress.puzzleState.shelfOpened ? '暗格已经打开，里面原本藏着木匣。' : '钥匙孔与舞台机关钥匙吻合，要现在打开暗格吗？';
  dom.dialogueResponses.innerHTML = '';

  const confirm = document.createElement('button');
  confirm.type = 'button';
  confirm.className = 'launch-button secondary';
  confirm.textContent = progress.puzzleState.shelfOpened ? '继续检查' : '使用舞台机关钥匙';
  confirm.addEventListener('click', () => {
    progress.puzzleState.shelfOpened = true;
    progress.flags.add('hidden_shelf_opened');
    showToast('书架暗格已开启，木匣暴露出来。');
    closeDialogue();
    updateStoryProgress();
  });

  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.className = 'launch-button secondary';
  cancel.textContent = '稍后再看';
  cancel.addEventListener('click', closeDialogue);

  dom.dialogueResponses.append(confirm, cancel);
  dom.dialoguePanel.classList.remove('hidden');
  setMode(GAME_MODES.DIALOGUE, { silent: true });
}

function openStudyVerification() {
  if (!progress.puzzleState.clueBoxPicked) {
    openInspect({
      title: '文书验证台',
      category: '机关',
      relatedCharacter: '苏秦',
      sourceScene: '书房密室',
      description: '验证台需要先取到小型线索木匣，才能继续进行身份与文书比对。',
      suspicion: '左侧书架底层或许还藏着尚未被取出的关键物件。'
    });
    return;
  }

  if (!progress.puzzleState.identityVerified) {
    return openVerificationStep(
      '身份验证',
      '木匣上有相印凹槽，或许需要与苏秦身份相关的物件。',
      [{ label: '放入丞相玉佩', action: () => { progress.puzzleState.identityVerified = true; showToast('身份验证通过。'); closeDialogue(); updateStoryProgress(); } }]
    );
  }

  if (!progress.puzzleState.soundVerified) {
    const enoughSound = progress.collectedClues.has('vocalShard') && progress.collectedClues.has('drumShard');
    if (!enoughSound) {
      openInspect({
        title: '声景验证',
        category: '机关',
        relatedCharacter: '锣鼓场',
        sourceScene: '书房密室',
        description: '需要唱腔记忆片与锣鼓记忆晶片同时到位，才能校验真实礼制节奏。',
        suspicion: '若序章中错过了声景线索，可以回想第七声锣与正式六声的差别。'
      });
      return;
    }
    return openVerificationStep(
      '声景验证',
      '将唱腔记忆片与锣鼓记忆晶片嵌入木匣，声纹正在比对。',
      [{ label: '开始比对', action: () => { progress.puzzleState.soundVerified = true; showToast('声景比对完成。'); closeDialogue(); updateStoryProgress(); } }]
    );
  }

  if (!progress.puzzleState.rhythmVerified) {
    return openVerificationStep(
      '礼制判断',
      '木匣要求你判断哪一段节奏才是真正的封相礼。',
      [
        { label: '选择“六声封相礼”', action: () => { progress.puzzleState.rhythmVerified = true; showToast('你确认第七声锣不属于正式礼制。'); closeDialogue(); updateStoryProgress(); } },
        { label: '选择“第七声封门令”', action: () => { dom.dialogueText.textContent = '这段锣鼓并不属于正式封相礼。它更像一条加写在仪式之后的暗令。'; } }
      ]
    );
  }

  if (!progress.puzzleState.documentVerified) {
    const ready = progress.collectedClues.has('waxLetter') && progress.collectedClues.has('seal') && progress.collectedClues.has('draftDecree');
    if (!ready) {
      openInspect({
        title: '文书比对',
        category: '机关',
        relatedCharacter: '公孙衍',
        sourceScene: '书房密室',
        description: '还需要封蜡密函、官印与退盟副诏三者同时到位，才能完成最终文书验证。',
        suspicion: '回朝堂再确认主案上的诏书与官印，也别忘了院中的封蜡密函。'
      });
      return;
    }
    return openVerificationStep(
      '文书比对',
      '现在可以将封蜡密函与官印压印结果对照，再核看退盟副诏中的加写条款。',
      [{ label: '完成比对', action: () => { progress.puzzleState.documentVerified = true; progress.flags.add('final_court_ready'); showToast('伪诏格式、倒置官印与封门条款全部成立。'); closeDialogue(); updateStoryProgress(); } }]
    );
  }

  openInspect({
    title: '文书验证台',
    category: '机关',
    relatedCharacter: '苏秦',
    sourceScene: '书房密室',
    description: '所有验证已经完成，可以带着结果回封相朝堂进行最终对质。',
    suspicion: '真正要被拆穿的，不只是诏书格式，还有第七声锣背后的封门暗令。'
  });
}

function openVerificationStep(title, text, actions) {
  dom.dialogueRole.textContent = '书房机关';
  dom.dialogueSpeaker.textContent = title;
  dom.dialogueText.textContent = text;
  dom.dialogueResponses.innerHTML = '';
  actions.forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'launch-button secondary';
    button.textContent = item.label;
    button.addEventListener('click', item.action);
    dom.dialogueResponses.appendChild(button);
  });
  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.className = 'launch-button secondary';
  cancel.textContent = '稍后再看';
  cancel.addEventListener('click', closeDialogue);
  dom.dialogueResponses.appendChild(cancel);
  dom.dialoguePanel.classList.remove('hidden');
  setMode(GAME_MODES.PUZZLE, { silent: true });
}

function resolveFinalAccusation(chainKey) {
  const chains = getEvidenceChainState(progress);
  const chain = chains[chainKey];
  if (!chain.complete) {
    dom.dialogueText.textContent = '你手里的这条证据链还不完整，暂时不足以在朝堂上压住公孙衍。';
    return;
  }

  progress.endingId = evaluateEnding(progress);
  progress.flags.add('ending_unlocked');
  progress.flags.add('final_confrontation_finished');
  progress.flags.add('stage_return_unlocked');
  progress.guideNpcDialogueState = 'ending';
  closeDialogue(false);
  showStoryPrompt([ENDING_DATA[progress.endingId].text], ENDING_DATA[progress.endingId].title, async () => {
    await enterScene('stage');
  });
}

function updateStoryProgress() {
  if (progress.flags.has('guide_completed')) progress.unlockedScenes.add('court');

  const courtCoreCount = ['token', 'seal', 'archiveFragment', 'draftDecree'].filter((id) => progress.collectedClues.has(id)).length;
  if (progress.flags.has('court_intro_seen') && courtCoreCount >= 2) {
    progress.flags.add('courtyard_unlocked');
  }

  if (progress.flags.has('courtyard_overheard') && progress.collectedClues.has('waxLetter') && progress.collectedClues.has('key') && progress.collectedClues.has('guardTestimony')) {
    progress.flags.add('study_unlocked');
  }

  if (progress.puzzleState.documentVerified) {
    progress.flags.add('final_court_ready');
  }

  syncSceneUnlocks(progress);
  updateAllUi();
}

function showEndingPanel() {
  progress.flags.add('ending_played');
  const clueStats = getCollectedClueStats(progress.collectedClues);
  const chains = getEvidenceChainState(progress);
  const ending = ENDING_DATA[progress.endingId] ?? {
    title: '体验完成',
    text: '你已从戏中归来。第七声锣停止于舞台，但关于信义、权力与人心的追问仍未结束。'
  };

  dom.endingTitle.textContent = `《六国大封相：第七声锣》\n${ending.title}`;
  dom.endingBody.textContent = `${ending.text} 你已从戏中归来。第七声锣停止于舞台，但关于信义、权力与人心的追问仍未结束。`;
  dom.endingStats.textContent = `已收集线索：${clueStats.collectedCount} / ${clueStats.total} ｜ 关键线索：${clueStats.collectedKeyCount} / ${clueStats.keyTotal}`;
  dom.endingChains.textContent = `声景链 ${chains.sound.owned}/${chains.sound.total} ｜ 文书链 ${chains.document.owned}/${chains.document.total} ｜ 行动链 ${chains.action.owned}/${chains.action.total}`;
  dom.endingPanel.classList.remove('hidden');
  setMode(GAME_MODES.ENDING, { silent: true });
}

function showToast(message) {
  dom.statusToast.textContent = message;
  dom.statusToast.classList.add('is-visible');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    dom.statusToast.classList.remove('is-visible');
  }, 2400);
}

function refreshDebugOverlay() {
  if (!gameState.debugEnabled) {
    dom.debugPanel.classList.add('hidden');
    return;
  }

  const playerState = playerController.getDebugState();
  const vrState = vrSystem.getDebugState();
  const metrics = engine.sceneMetrics;
  const focused = interactionSystem.getFocusedInteractable();
  const chains = getEvidenceChainState(progress);
  const collisionState = worldCollisionSystem.getDebugState();
  const placementList = sceneManager.getDebugPlacements().slice(0, 8);
  const anchors = sceneManager.getDebugAnchors();
  const loadedActors = npcSystem.spawnedNPCs?.map((item) => item.definition.displayName).join(' / ') || '无';
  const loadedProps = sceneManager.spawnedEntries?.filter((item) => item.type === 'prop').map((item) => item.definition.title).join(' / ') || '无';
  const sceneJumpButtons = FORMAL_SCENE_IDS.map((sceneId) => {
    const scene = ASSET_MANIFEST.scenes[sceneId];
    return `<button type="button" class="mini-button" data-debug-scene="${sceneId}">${scene?.title ?? sceneId}</button>`;
  }).join('');
  const anchorButtons = anchors.slice(0, 10).map((anchor) => `<button type="button" class="mini-button" data-debug-anchor="${anchor.name}">${anchor.name}</button>`).join('');
  const placementRows = placementList.map((item) => `${item.title}｜${item.status}｜底部 ${item.visualBottomY ?? '-'}｜锚点 ${item.anchor}`).join('<br />') || '无';

  dom.debugPanel.innerHTML = `
    <strong>开发调试</strong><br />
    当前场景：${progress.currentSceneId || '未进入'}<br />
    包围盒：${metrics ? `${metrics.width} × ${metrics.height} × ${metrics.depth}` : '未载入'}<br />
    场景缩放：${metrics?.rootScale ?? '-'}<br />
    玩家：${playerState.player.x.toFixed(2)}, ${playerState.player.y.toFixed(2)}, ${playerState.player.z.toFixed(2)}<br />
    相机：${playerState.camera.x.toFixed(2)}, ${playerState.camera.y.toFixed(2)}, ${playerState.camera.z.toFixed(2)}<br />
    朝向：${playerState.yaw.toFixed(2)} ｜ 俯仰：${playerState.pitch.toFixed(2)}<br />
    是否落地：${playerState.grounded ? '是' : '否'} ｜ 垂直速度：${playerState.verticalVelocity.toFixed(2)}<br />
    当前动画：${playerState.currentAnimationName}<br />
    当前视觉：${playerState.bodyMode || '未知'} ｜ 上帝模式：${playerState.godMode ? '开启' : '关闭'}<br />
    动画列表：${(playerState.animationNames || []).join(' / ') || '无'}<br />
    当前交互目标：${focused?.promptTitle ?? '无'}<br />
    已收集线索：${[...progress.collectedClues].join(' / ') || '无'}<br />
    声景链：${chains.sound.owned}/${chains.sound.total} ｜ 文书链：${chains.document.owned}/${chains.document.total} ｜ 行动链：${chains.action.owned}/${chains.action.total}<br />
    已加载 NPC：${loadedActors}<br />
    已加载物件：${loadedProps}<br />
    地面探针：${collisionState?.lastGroundReport?.reason ?? '无'} ｜ 稳定点 ${collisionState?.lastGroundReport?.stableCount ?? 0}<br />
    WebXR 安全上下文：${vrState?.diagnostics?.isSecureContext ? '是' : '否'} ｜ navigator.xr：${vrState?.diagnostics?.hasNavigatorXR ? '有' : '无'} ｜ immersive-vr：${vrState?.diagnostics?.immersiveVrSupported ? '支持' : '不支持'}<br />
    XR 会话：${vrState?.sessionState?.status ?? (vrState?.sessionActive ? '进行中' : '未开启')} ｜ 控制器：${vrState?.controllerCount ?? 0}<br />
    左摇杆：${(vrState?.leftAxes || []).map((value) => Number(value).toFixed(2)).join(', ') || '无'}<br />
    右摇杆：${(vrState?.rightAxes || []).map((value) => Number(value).toFixed(2)).join(', ') || '无'}<br />
    物件校验：<br />${placementRows}<br />
    <div class="debug-actions">
      <button type="button" class="mini-button" data-debug-god>${playerState.godMode ? '关闭上帝模式' : '开启上帝模式'}</button>
    </div>
    <div class="debug-actions">${sceneJumpButtons}</div>
    <div class="debug-actions">${anchorButtons || '<span>暂无锚点</span>'}</div>
    FPS：${gameState.lastFps}
  `;
  dom.debugPanel.classList.remove('hidden');
}

bindEvents();
vrSystem.init().catch((error) => {
  console.warn('[WebXR 初始化失败]', error);
});
updateAllUi();























