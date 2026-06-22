import {
  categoryMeta,
  defaultFilters,
  filterConfigs,
  getExhibit,
  getExhibits,
  getFeaturedExhibit,
  getHomeStats
} from "./catalog.js?v=20260622-01";
import { createPanoramaViewer } from "./panoramaViewer.js?v=20260622-01";
import { createHeroPreview } from "./previewStage.js?v=20260622-01";
import { createViewer } from "./viewer.js?v=20260622-01";

const app = document.querySelector("#app");
const globalBackButton = document.querySelector("#globalBackButton");

const pageState = {
  filters: structuredClone(defaultFilters),
  currentCategory: "character",
  currentExhibit: null,
  filterScroll: {}
};

let viewerInstance = null;
let heroPreviewInstance = null;
let introTimeoutId = null;

function makeRoute(hash = window.location.hash) {
  const trimmed = hash.replace(/^#/, "");
  if (!trimmed) return { page: "home" };

  const [page, category, rawName] = trimmed.split("/");
  if (page === "category" && categoryMeta[category]) {
    return { page, category };
  }
  if (page === "viewer" && categoryMeta[category] && rawName) {
    return { page, category, name: decodeURIComponent(rawName) };
  }
  return { page: "home" };
}

function navigateTo(hash) {
  window.location.hash = hash;
}

function cleanupViewer() {
  if (introTimeoutId) {
    window.clearTimeout(introTimeoutId);
    introTimeoutId = null;
  }
  document.body.classList.remove("panorama-mode");
  viewerInstance?.dispose();
  viewerInstance = null;
  heroPreviewInstance?.dispose();
  heroPreviewInstance = null;
}

function buildHomeStat(label, value) {
  const item = document.createElement("div");
  item.className = "stat-pill";
  item.innerHTML = `<strong>${value}</strong><span>${label}</span>`;
  return item;
}

function renderHome() {
  cleanupViewer();
  app.replaceChildren(document.querySelector("#home-template").content.cloneNode(true));
  globalBackButton.classList.add("hidden");

  const heroActions = document.querySelector(".hero-actions");
  if (heroActions) {
    const vrEntryLink = document.createElement("a");
    vrEntryLink.className = "token-button";
    vrEntryLink.href = "../mystery-vr/index.html";
    vrEntryLink.textContent = "进入剧本杀世界";
    heroActions.appendChild(vrEntryLink);
  }

  const stats = getHomeStats();
  const heroStats = document.querySelector("#heroStats");
  heroStats.append(
    buildHomeStat("人物", stats.characterCount),
    buildHomeStat("物件", stats.objectCount),
    buildHomeStat("场景", stats.sceneCount),
    buildHomeStat("已接入", stats.readyModels)
  );

  const heroPreviewCanvas = document.querySelector("#heroPreviewCanvas");
  const heroPreviewLoading = document.querySelector("#heroPreviewLoading");
  if (heroPreviewCanvas) {
    heroPreviewInstance = createHeroPreview({
      canvas: heroPreviewCanvas,
      loadingElement: heroPreviewLoading
    });
  }
}

function createFilterButton(groupKey, value, activeValue) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `filter-chip${value === activeValue ? " is-active" : ""}`;
  button.dataset.filterGroup = groupKey;
  button.dataset.filterValue = value;
  button.textContent = value;
  return button;
}

function renderPrimaryFilterSection(category, clearActionDataAttr) {
  const primarySection = document.createElement("section");
  primarySection.className = "filter-group filter-group-primary";

  const primaryBar = document.createElement("div");
  primaryBar.className = "primary-filter-bar";

  const chips = document.createElement("div");
  chips.className = "filter-chips filter-chips-primary";
  chips.dataset.scrollKey = `${category}-primary`;
  filterConfigs[category][0].options
    .map((option) => createFilterButton("primary", option, pageState.filters[category].primary))
    .forEach((button) => chips.appendChild(button));

  const actions = document.createElement("div");
  actions.className = "filter-actions";

  if (category === "character") {
    actions.innerHTML += `
      <button class="filter-action-button" type="button" data-toggle-advanced>
        ${pageState.filters.character.advancedOpen ? "收起筛选" : "进阶筛选"}
      </button>
    `;
  }

  actions.innerHTML += `
    <button class="filter-action-button" type="button" ${clearActionDataAttr}>
      清除筛选
    </button>
  `;

  primaryBar.append(chips, actions);
  primarySection.appendChild(primaryBar);
  return primarySection;
}

function renderFilters(category) {
  const rack = document.querySelector("#filterRack");
  rack.innerHTML = "";

  if (category === "character") {
    rack.appendChild(renderPrimaryFilterSection("character", "data-clear-character-filters"));

    if (pageState.filters.character.advancedOpen) {
      filterConfigs.character.slice(1).forEach((group) => {
        const section = document.createElement("section");
        section.className = "filter-group filter-group-advanced";

        const label = document.createElement("span");
        label.className = "filter-label";
        label.textContent = group.label;

        const chips = document.createElement("div");
        chips.className = "filter-chips";
        chips.dataset.scrollKey = `character-${group.key}`;
        group.options
          .map((option) => createFilterButton(group.key, option, pageState.filters.character[group.key]))
          .forEach((button) => chips.appendChild(button));

        section.append(label, chips);
        rack.appendChild(section);
      });
    }

    restoreFilterScrollPositions();
    return;
  }

  if (category === "object") {
    rack.appendChild(renderPrimaryFilterSection("object", "data-clear-object-filters"));
    restoreFilterScrollPositions();
    return;
  }

  rack.appendChild(renderPrimaryFilterSection("scene", "data-clear-scene-filters"));

  const modeGroup = filterConfigs.scene[1];
  const section = document.createElement("section");
  section.className = "filter-group filter-group-advanced";

  const label = document.createElement("span");
  label.className = "filter-label";
  label.textContent = modeGroup.label;

  const chips = document.createElement("div");
  chips.className = "filter-chips";
  chips.dataset.scrollKey = "scene-mode";
  modeGroup.options
    .map((option) => createFilterButton("mode", option, pageState.filters.scene.mode))
    .forEach((button) => chips.appendChild(button));

  section.append(label, chips);
  rack.appendChild(section);
  restoreFilterScrollPositions();
}

function saveFilterScrollPosition(sourceElement) {
  const scrollContainer = sourceElement?.closest("[data-scroll-key]");
  if (!scrollContainer) return;
  pageState.filterScroll[scrollContainer.dataset.scrollKey] = scrollContainer.scrollLeft;
}

function restoreFilterScrollPositions() {
  document.querySelectorAll("[data-scroll-key]").forEach((element) => {
    const saved = pageState.filterScroll[element.dataset.scrollKey];
    if (typeof saved === "number") {
      element.scrollLeft = saved;
    }
  });
}

function matchCharacter(exhibit, filters) {
  if (filters.primary !== "全部" && !exhibit.primaryTags.includes(filters.primary)) return false;
  if (filters.camp !== "全部" && exhibit.camp !== filters.camp) return false;
  if (filters.operaRef !== "全部") {
    if (!exhibit.operaTags.some((tag) => tag.includes(filters.operaRef))) return false;
  }
  return true;
}

function matchObject(exhibit, filters) {
  if (filters.primary === "全部") return true;
  if (filters.primary === "关键线索") return exhibit.clueLevel.includes("关键");
  if (filters.primary === "隐藏线索") return exhibit.clueLevel === "隐藏";
  if (filters.primary === "声境碎片") return exhibit.objectType === "声境碎片";
  if (filters.primary === "文书密信") return ["密函", "密信", "木匣", "数字碎片"].includes(exhibit.objectType);
  if (filters.primary === "权谋信物") return ["令牌", "官印", "玉佩"].includes(exhibit.objectType);
  if (filters.primary === "戏曲道具") return ["冠饰", "戏曲道具", "补子纹样"].includes(exhibit.objectType);
  return true;
}

function matchScene(exhibit, filters) {
  if (filters.primary !== "全部" && exhibit.sceneGroup !== filters.primary) return false;
  if (filters.mode === "3D 场景" && exhibit.viewMode !== "model") return false;
  if (filters.mode === "360 全景" && exhibit.viewMode !== "panorama") return false;
  return true;
}

function getFilteredExhibits(category) {
  const exhibits = getExhibits(category);
  const filters = pageState.filters[category];

  return exhibits.filter((exhibit) => {
    if (category === "character") return matchCharacter(exhibit, filters);
    if (category === "object") return matchObject(exhibit, filters);
    return matchScene(exhibit, filters);
  });
}

function buildStamp(text, className = "") {
  const stamp = document.createElement("span");
  stamp.className = `seal-badge${className ? ` ${className}` : ""}`;
  stamp.textContent = text;
  return stamp;
}

function buildCardMedia(exhibit) {
  const media = document.createElement("div");
  media.className = "asset-media";

  if (exhibit.videoPath) {
    const video = document.createElement("video");
    video.src = exhibit.videoPath;
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.setAttribute("aria-label", `${exhibit.name} 视频预览`);
    video.onerror = () => {
      media.innerHTML = `<div class="asset-fallback">${exhibit.name}</div>`;
    };
    media.appendChild(video);
    return media;
  }

  if (exhibit.imagePath) {
    const image = document.createElement("img");
    image.src = exhibit.imagePath;
    image.alt = exhibit.name;
    image.loading = "lazy";
    image.onerror = () => {
      media.innerHTML = `<div class="asset-fallback">${exhibit.name}</div>`;
    };
    media.appendChild(image);
    return media;
  }

  media.innerHTML = `<div class="asset-fallback">${exhibit.name}</div>`;
  return media;
}

function buildCharacterCard(exhibit) {
  const button = document.createElement("button");
  button.className = `asset-card archive-card${exhibit.isFeatured ? " is-featured" : ""}${exhibit.isSuspicious ? " is-suspicious" : ""}`;
  button.type = "button";
  button.dataset.route = "viewer";
  button.dataset.category = "character";
  button.dataset.name = exhibit.name;

  const head = document.createElement("div");
  head.className = "card-head";
  head.append(buildStamp(exhibit.camp, "camp-stamp"));
  head.append(buildStamp(exhibit.clueLevel, exhibit.clueLevel === "关键" ? "stamp-key" : ""));
  if (exhibit.isFeatured) head.append(buildStamp("主视角", "stamp-featured"));

  const meta = document.createElement("div");
  meta.className = "asset-meta rich-meta";
  meta.innerHTML = `
    <p class="asset-category">人物</p>
    <h3>${exhibit.name}</h3>
    <div class="meta-grid">
      <span><b>角色类型</b>${exhibit.roleType}</span>
      <span><b>行当参考</b>${exhibit.operaRoleRef}</span>
    </div>
    <blockquote class="character-quote">${exhibit.quote}</blockquote>
    <div class="sound-tags">${exhibit.soundscape.slice(0, 3).map((tag) => `<span>${tag}</span>`).join("")}</div>
    <div class="card-footer">
      <span class="archive-state">${exhibit.archiveState}</span>
      <span class="cta-text">入台细观</span>
    </div>
  `;

  button.append(head, buildCardMedia(exhibit), meta);
  return button;
}

function buildObjectCard(exhibit) {
  const button = document.createElement("button");
  button.className = "asset-card archive-card object-card is-ready";
  button.type = "button";
  button.dataset.route = "viewer";
  button.dataset.category = "object";
  button.dataset.name = exhibit.name;

  const head = document.createElement("div");
  head.className = "card-head";
  head.append(buildStamp(exhibit.objectType, "camp-stamp"));
  head.append(buildStamp(exhibit.clueLevel));

  const meta = document.createElement("div");
  meta.className = "asset-meta rich-meta";
  meta.innerHTML = `
    <p class="asset-category">物件</p>
    <h3>${exhibit.name}</h3>
    <div class="meta-grid">
      <span><b>展示定位</b>${exhibit.role}</span>
    </div>
    <blockquote class="character-quote">${exhibit.quote}</blockquote>
    <div class="sound-tags">${exhibit.soundscape.slice(0, 3).map((tag) => `<span>${tag}</span>`).join("")}</div>
    <div class="card-footer">
      <span class="archive-state">${exhibit.archiveState}</span>
      <span class="cta-text">入台细观</span>
    </div>
  `;

  button.append(head, buildCardMedia(exhibit), meta);
  return button;
}

function buildSceneCard(exhibit) {
  const button = document.createElement("button");
  button.className = "asset-card archive-card scene-card is-ready";
  button.type = "button";
  button.dataset.route = "viewer";
  button.dataset.category = "scene";
  button.dataset.name = exhibit.name;

  const head = document.createElement("div");
  head.className = "card-head";
  head.append(buildStamp(exhibit.sceneGroup, "camp-stamp"));
  head.append(buildStamp(exhibit.viewMode === "panorama" ? "360 全景" : "3D 场景", `scene-mode-badge ${exhibit.viewMode === "panorama" ? "panorama" : "model"}`));

  const meta = document.createElement("div");
  meta.className = "asset-meta rich-meta";
  meta.innerHTML = `
    <p class="asset-category">场景</p>
    <h3>${exhibit.name}</h3>
    <div class="meta-grid">
      <span><b>空间定位</b>${exhibit.role}</span>
    </div>
    <blockquote class="character-quote">${exhibit.description}</blockquote>
    <div class="sound-tags">${exhibit.soundscape.slice(0, 3).map((tag) => `<span>${tag}</span>`).join("")}</div>
    <div class="card-footer">
      <span class="archive-state">${exhibit.archiveState}</span>
      <span class="cta-text">${exhibit.viewMode === "panorama" ? "进入全景" : "进入 3D 场景"}</span>
    </div>
  `;

  button.append(head, buildCardMedia(exhibit), meta);
  return button;
}

function renderArchiveSummary(category, items) {
  const summary = document.querySelector("#archiveSummary");
  const totalCount = getExhibits(category).length;
  const readyCount = items.filter((item) => item.hasModel).length;
  const kindLabel = category === "character" ? "人物档案" : category === "object" ? "物件档案" : "场景档案";
  const resultLabel = items.length === totalCount ? `共 ${items.length} 件${kindLabel}` : `已筛选 ${items.length} 件`;

  summary.innerHTML = `
    <div class="summary-card">
      <p class="eyebrow">筛选结果</p>
      <strong>${categoryMeta[category].archiveLabel}</strong>
      <div class="summary-stats">
        <span>${resultLabel}</span>
        <span>已接入 ${readyCount}</span>
      </div>
      <p>${categoryMeta[category].introText}</p>
    </div>
  `;
}

function renderArchiveGrid(category) {
  const grid = document.querySelector("#assetGrid");
  grid.innerHTML = "";

  const items = getFilteredExhibits(category);
  renderArchiveSummary(category, items);

  if (!items.length) {
    const empty = document.createElement("article");
    empty.className = "empty-state";
    empty.innerHTML = `
      <h3>当前筛选下暂无可展示档案</h3>
      <p>你可以调整筛选条件，或返回上一层继续浏览其他展陈入口。</p>
    `;
    grid.appendChild(empty);
    return;
  }

  items
    .map((item) => {
      if (category === "character") return buildCharacterCard(item);
      if (category === "object") return buildObjectCard(item);
      return buildSceneCard(item);
    })
    .forEach((card) => grid.appendChild(card));
}

function renderCategory(category) {
  cleanupViewer();
  pageState.currentCategory = category;
  app.replaceChildren(document.querySelector("#category-template").content.cloneNode(true));
  globalBackButton.classList.remove("hidden");

  document.querySelector("#categoryEyebrow").textContent = categoryMeta[category].eyebrow;
  document.querySelector("#categoryTitle").textContent = categoryMeta[category].label;
  document.querySelector("#categoryDescription").textContent = categoryMeta[category].description;

  renderFilters(category);
  renderArchiveGrid(category);
}

function createInfoRow(label, value) {
  return `<div class="info-row"><span>${label}</span><strong>${value}</strong></div>`;
}

function createMiniInfoCard(label, value) {
  return `<div class="info-mini-card"><span>${label}</span><strong>${value}</strong></div>`;
}

function buildSceneHotspots(hotspots = []) {
  if (!hotspots.length) return "";
  return `
    <div class="info-block">
      <h3 class="info-block-title">观察节点</h3>
      <div class="scene-hotspot-list">
        ${hotspots.map((hotspot) => `
          <div class="scene-hotspot-item">
            <strong>${hotspot.label}</strong>
            <span>${hotspot.description}</span>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function buildInfoPanel(exhibit) {
  const soundTags = exhibit.soundscape.map((tag) => `<span>${tag}</span>`).join("");

  if (exhibit.assetCategory === "character") {
    return `
      <article class="info-card">
        <div class="info-head">
          <div>
            <p class="eyebrow">人物档案</p>
            <h2>${exhibit.name}</h2>
            <p class="info-subtitle">${exhibit.roleType}</p>
          </div>
          <span class="status-badge">${exhibit.camp}</span>
        </div>
        <div class="info-core-grid">
          ${createMiniInfoCard("阵营", exhibit.camp)}
          ${createMiniInfoCard("行当参考", exhibit.operaRoleRef)}
          ${createMiniInfoCard("剧情功能", exhibit.storyFunction)}
          ${createMiniInfoCard("线索层级", exhibit.clueLevel)}
        </div>
        <blockquote class="info-quote">“${exhibit.quote}”</blockquote>
        <div class="info-block"><h3 class="info-block-title">观看提示</h3><p>拖动旋转、滚轮缩放，可切换视角与灯光。</p></div>
        <div class="info-block"><h3 class="info-block-title">观察重点</h3><p>${exhibit.visualFocus}</p></div>
        <div class="info-block info-block-tags"><h3 class="info-block-title">声景</h3><div class="sound-tags sound-tags-panel">${soundTags}</div></div>
        <div class="info-block"><h3 class="info-block-title">线索提示</h3><p>${exhibit.clueHint}</p></div>
        <details class="info-section info-section-more"><summary>展开更多</summary><div class="info-group">${createInfoRow("剧情阶段", exhibit.stage)}${createInfoRow("角色立场", exhibit.stance)}${createInfoRow("所属剧目", "粤剧《六国大封相》")}</div></details>
      </article>
    `;
  }

  if (exhibit.assetCategory === "object") {
    return `
      <article class="info-card">
        <div class="info-head">
          <div>
            <p class="eyebrow">物件档案</p>
            <h2>${exhibit.name}</h2>
            <p class="info-subtitle">${exhibit.role}</p>
          </div>
          <span class="status-badge">${exhibit.objectType}</span>
        </div>
        <div class="info-core-grid">
          ${createMiniInfoCard("类型", exhibit.objectType)}
          ${createMiniInfoCard("线索层级", exhibit.clueLevel)}
          ${createMiniInfoCard("剧情阶段", exhibit.storyStage)}
          ${createMiniInfoCard("展示定位", exhibit.displayPosition)}
        </div>
        <blockquote class="info-quote">“${exhibit.quote}”</blockquote>
        <div class="info-block"><h3 class="info-block-title">观看提示</h3><p>物件悬浮于展示座上方，进入页面后缓慢旋转。</p></div>
        <div class="info-block"><h3 class="info-block-title">观察重点</h3><p>${exhibit.description}</p></div>
        <div class="info-block info-block-tags"><h3 class="info-block-title">声景</h3><div class="sound-tags sound-tags-panel">${soundTags}</div></div>
        <div class="info-block"><h3 class="info-block-title">剧情象征</h3><p>${exhibit.symbolism}</p></div>
        <details class="info-section info-section-more"><summary>展开更多</summary><div class="info-group">${createInfoRow("声景场域", exhibit.soundscapeScene)}${createInfoRow("所属剧目", "粤剧《六国大封相》")}</div></details>
      </article>
    `;
  }

  const controlSummary = [
    exhibit.controls.canOrbit ? "可旋转" : "",
    exhibit.controls.canPan ? "可平移" : "",
    exhibit.controls.canZoom ? "可缩放" : "",
    exhibit.controls.canEnterScene ? "可进入式观察" : ""
  ].filter(Boolean).join(" / ");

  return `
    <article class="info-card">
      <div class="info-head">
        <div>
          <p class="eyebrow">场景档案</p>
          <h2>${exhibit.name}</h2>
          <p class="info-subtitle">${exhibit.role}</p>
        </div>
        <span class="status-badge">${exhibit.sceneType}</span>
      </div>
      <div class="info-core-grid">
        ${createMiniInfoCard("空间分组", exhibit.sceneGroup)}
        ${createMiniInfoCard("浏览模式", exhibit.viewMode === "panorama" ? "360 全景" : exhibit.controls.mode)}
        ${createMiniInfoCard("观察节点", `${exhibit.hotspots.length} 处`)}
        ${createMiniInfoCard("镜头距离", exhibit.viewMode === "panorama" ? "环视观察" : `${exhibit.controls.minDistance} - ${exhibit.controls.maxDistance}`)}
      </div>
      <blockquote class="info-quote">${exhibit.description}</blockquote>
      <div class="info-block"><h3 class="info-block-title">观看提示</h3><p>${exhibit.viewMode === "panorama" ? "拖动画面环视空间，滚轮调整视野，双击可快速重置镜头。" : "拖动旋转、滚轮缩放，可切换视角与灯光。"}</p></div>
      <div class="info-block"><h3 class="info-block-title">交互能力</h3><p>${controlSummary || "以空间观察为主"}</p></div>
      <div class="info-block info-block-tags"><h3 class="info-block-title">声景</h3><div class="sound-tags sound-tags-panel">${soundTags}</div></div>
      ${buildSceneHotspots(exhibit.hotspots)}
      <details class="info-section info-section-more"><summary>展开更多</summary><div class="info-group">${exhibit.viewMode === "panorama" ? createInfoRow("默认视野", `${exhibit.defaultView.fov}°`) : createInfoRow("俯仰范围", `${exhibit.controls.minPolarAngle.toFixed(2)} - ${exhibit.controls.maxPolarAngle.toFixed(2)}`)}${exhibit.viewMode === "panorama" ? createInfoRow("场景类型", exhibit.sceneType) : createInfoRow("阻尼系数", `${exhibit.controls.dampingFactor}`)}${createInfoRow("所属剧目", "粤剧《六国大封相》")}</div></details>
    </article>
  `;
}

function buildPanoramaFloatingHotspots(hotspots = []) {
  return hotspots.map((hotspot) => `
    <div class="panorama-hotspot-item">
      <strong>${hotspot.label}</strong>
      <span>${hotspot.type}</span>
      <p>${hotspot.description}</p>
    </div>
  `).join("");
}

function syncViewerControlState() {
  if (!viewerInstance) return;
  document.querySelectorAll("[data-lighting]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lighting === viewerInstance.getLighting());
  });
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === viewerInstance.getView());
  });
  const rotateButton = document.querySelector("#autoRotateButton");
  if (rotateButton) rotateButton.textContent = `自动旋转：${viewerInstance.getAutoRotate() ? "开" : "关"}`;
}

function applyViewerCopy(exhibit) {
  document.querySelector("#infoPanel").innerHTML = buildInfoPanel(exhibit);
  document.querySelector("#soundscapeScene").textContent = exhibit.soundscapeScene;
  document.querySelector("#soundscapeTags").textContent = exhibit.soundscape.join(" / ");
  document.querySelector("#soundscapeStatus").textContent = exhibit.hasModel ? (exhibit.viewMode === "panorama" ? "已接入全景" : exhibit.assetCategory === "scene" ? "已接入场景" : "已接入展台") : "待补充模型";
}

function getIntroCopy(exhibit) {
  if (exhibit.viewMode === "panorama") return { eyebrow: "360 全景", title: `进入${exhibit.name}`, text: "请环视四周，沿着空间声景与观察节点逐步进入剧情。" };
  if (exhibit.assetCategory === "scene") return { eyebrow: "场景档案", title: `进入${exhibit.name}`, text: "空间、灯光与声景已经就位，请从这一处场域开始梳理封相疑云。" };
  if (exhibit.assetCategory === "object") return { eyebrow: "物件档案", title: `细看${exhibit.name}`, text: "物件将以独立展台呈现，请先观察轮廓、材质与可疑细节。" };
  return { eyebrow: "人物档案", title: `细看${exhibit.name}`, text: "人物展台已就位，请先观察行当气质、服饰结构与舞台站姿。" };
}

function renderPanorama(category, exhibit) {
  cleanupViewer();
  pageState.currentCategory = category;
  pageState.currentExhibit = exhibit;
  document.body.classList.add("panorama-mode");
  app.replaceChildren(document.querySelector("#panorama-template").content.cloneNode(true));
  globalBackButton.classList.add("hidden");

  document.querySelector("#panoramaTitle").textContent = exhibit.name;
  document.querySelector("#panoramaMeta").textContent = exhibit.sceneType;
  document.querySelector("#panoramaDescription").textContent = exhibit.description;
  document.querySelector("#panoramaTags").innerHTML = exhibit.soundscape.map((tag) => `<span class="panorama-tag">${tag}</span>`).join("");
  document.querySelector("#panoramaHotspotList").innerHTML = buildPanoramaFloatingHotspots(exhibit.hotspots);

  const backToSceneLibrary = () => navigateTo(`#category/${category}`);
  const backButton = document.querySelector("#panoramaBackButton");
  const errorBackButton = document.querySelector("#panoramaErrorBackButton");
  const canvas = document.querySelector("#panoramaCanvas");
  const escHandler = (event) => { if (event.key === "Escape") backToSceneLibrary(); };

  backButton.addEventListener("click", backToSceneLibrary);
  errorBackButton?.addEventListener("click", backToSceneLibrary);
  window.addEventListener("keydown", escHandler);

  viewerInstance = createPanoramaViewer({
    canvas,
    sceneData: exhibit,
    loadingOverlay: document.querySelector("#panoramaLoading"),
    errorOverlay: document.querySelector("#panoramaError"),
    errorTitle: document.querySelector("#panoramaErrorTitle"),
    errorMessage: document.querySelector("#panoramaErrorMessage")
  });

  const originalDispose = viewerInstance.dispose.bind(viewerInstance);
  viewerInstance.dispose = () => {
    window.removeEventListener("keydown", escHandler);
    originalDispose();
  };
}

function renderViewer(category, name) {
  cleanupViewer();
  const exhibit = getExhibit(category, name) ?? getFeaturedExhibit();
  if (exhibit.viewMode === "panorama") return renderPanorama(category, exhibit);

  pageState.currentCategory = category;
  pageState.currentExhibit = exhibit;
  app.replaceChildren(document.querySelector("#viewer-template").content.cloneNode(true));
  globalBackButton.classList.remove("hidden");
  applyViewerCopy(exhibit);

  const introCopy = getIntroCopy(exhibit);
  document.querySelector("#introEyebrow").textContent = introCopy.eyebrow;
  document.querySelector("#introTitle").textContent = introCopy.title;
  document.querySelector("#introText").textContent = introCopy.text;

  const interactionHint = document.querySelector("#interactionHint");
  interactionHint.textContent = "拖动旋转、滚轮缩放，可切换视角与灯光。";

  const introScreen = document.querySelector("#introScreen");
  const viewerLayout = document.querySelector("#viewerLayout");
  const enterButton = document.querySelector("#enterViewerButton");
  const errorBackButton = document.querySelector("#errorBackButton");
  const canvas = document.querySelector("#viewerCanvas");
  const loadingProgress = document.querySelector("#loadingProgress");
  const errorMessage = document.querySelector("#errorMessage");
  let hasEntered = false;

  if (exhibit.assetCategory === "scene") {
    loadingProgress.textContent = "正在载入 3D 场景，并校准机位、灯光与空间构图。";
    errorMessage.textContent = "当前场景暂时无法载入，请返回场景馆查看其他空间。";
  } else if (exhibit.assetCategory === "object") {
    loadingProgress.textContent = "正在为物件校准悬浮高度、灯光与展示构图。";
    errorMessage.textContent = "当前物件暂时无法载入，请返回物件馆继续浏览。";
  } else {
    loadingProgress.textContent = "正在为人物调整灯光、机位与展示姿态。";
    errorMessage.textContent = "当前人物暂时无法载入，请返回人物馆继续浏览。";
  }

  errorBackButton.addEventListener("click", () => navigateTo(`#category/${category}`));

  const enterViewer = () => {
    if (hasEntered) return;
    hasEntered = true;
    if (introTimeoutId) {
      window.clearTimeout(introTimeoutId);
      introTimeoutId = null;
    }
    introScreen.classList.add("leave");
    window.setTimeout(() => {
      introScreen.classList.add("hidden");
      viewerLayout.classList.remove("hidden");
      viewerInstance = createViewer({
        canvas,
        exhibit,
        loadingOverlay: document.querySelector("#loadingOverlay"),
        loadingProgress: document.querySelector("#loadingProgress"),
        errorOverlay: document.querySelector("#errorOverlay"),
        errorTitle: document.querySelector("#errorTitle"),
        errorMessage: document.querySelector("#errorMessage"),
        interactionHint
      });
      syncViewerControlState();
    }, 420);
  };

  enterButton.addEventListener("click", enterViewer, { once: true });
  introTimeoutId = window.setTimeout(enterViewer, 1500);
}

function renderRoute() {
  const route = makeRoute();
  if (route.page === "category") return renderCategory(route.category);
  if (route.page === "viewer") return renderViewer(route.category, route.name);
  renderHome();
}

document.body.addEventListener("click", (event) => {
  const routeTarget = event.target.closest("[data-route]");
  if (routeTarget) {
    if (routeTarget.dataset.route === "category") return navigateTo(`#category/${routeTarget.dataset.category}`);
    if (routeTarget.dataset.route === "viewer") return navigateTo(`#viewer/${routeTarget.dataset.category}/${encodeURIComponent(routeTarget.dataset.name)}`);
  }

  const filterTarget = event.target.closest("[data-filter-group]");
  if (filterTarget) {
    saveFilterScrollPosition(filterTarget);
    const { filterGroup, filterValue } = filterTarget.dataset;
    pageState.filters[pageState.currentCategory][filterGroup] = filterValue;
    renderFilters(pageState.currentCategory);
    renderArchiveGrid(pageState.currentCategory);
    return;
  }

  if (event.target.closest("[data-toggle-advanced]")) {
    saveFilterScrollPosition(event.target);
    pageState.filters.character.advancedOpen = !pageState.filters.character.advancedOpen;
    return renderFilters("character");
  }

  if (event.target.closest("[data-clear-character-filters]")) {
    saveFilterScrollPosition(event.target);
    pageState.filters.character = structuredClone(defaultFilters.character);
    renderFilters("character");
    return renderArchiveGrid("character");
  }

  if (event.target.closest("[data-clear-object-filters]")) {
    saveFilterScrollPosition(event.target);
    pageState.filters.object = structuredClone(defaultFilters.object);
    renderFilters("object");
    return renderArchiveGrid("object");
  }

  if (event.target.closest("[data-clear-scene-filters]")) {
    saveFilterScrollPosition(event.target);
    pageState.filters.scene = structuredClone(defaultFilters.scene);
    renderFilters("scene");
    return renderArchiveGrid("scene");
  }

  const viewTarget = event.target.closest("[data-view]");
  if (viewTarget && viewerInstance) {
    viewerInstance.setView(viewTarget.dataset.view);
    return syncViewerControlState();
  }

  const lightTarget = event.target.closest("[data-lighting]");
  if (lightTarget && viewerInstance) {
    viewerInstance.setLighting(lightTarget.dataset.lighting);
    return syncViewerControlState();
  }

  const rotateTarget = event.target.closest("[data-toggle-rotate]");
  if (rotateTarget && viewerInstance) {
    viewerInstance.toggleAutoRotate();
    syncViewerControlState();
  }
});

globalBackButton.addEventListener("click", () => {
  const route = makeRoute();
  if (route.page === "viewer") return navigateTo(`#category/${route.category}`);
  navigateTo("");
});

window.addEventListener("hashchange", renderRoute);
window.addEventListener("beforeunload", cleanupViewer);

renderRoute();

