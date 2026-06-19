import {
  categoryMeta,
  defaultFilters,
  filterConfigs,
  getExhibit,
  getExhibits,
  getFeaturedExhibit,
  getHomeStats
} from "./catalog.js";
import { createHeroPreview } from "./previewStage.js";
import { createViewer } from "./viewer.js";

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

  const stats = getHomeStats();
  const heroStats = document.querySelector("#heroStats");
  heroStats.append(
    buildHomeStat("人物档案", stats.characterCount),
    buildHomeStat("物件档案", stats.objectCount),
    buildHomeStat("场景档案", stats.sceneCount),
    buildHomeStat("已接入模型", stats.readyModels)
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
        ${pageState.filters.character.advancedOpen ? "收起进阶筛选" : "进阶筛选"}
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
          .map((option) =>
            createFilterButton(group.key, option, pageState.filters.character[group.key])
          )
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
  if (filters.primary === "文书密信") {
    return exhibit.objectType.includes("密信") || exhibit.objectType.includes("密函");
  }
  if (filters.primary === "权力信物") {
    return ["令牌", "印章", "佩饰"].includes(exhibit.objectType);
  }
  if (filters.primary === "戏曲道具") {
    return ["冠饰", "戏曲道具", "戏服纹样"].includes(exhibit.objectType);
  }
  return true;
}

function matchScene(exhibit, filters) {
  return filters.primary === "全部" || exhibit.sceneGroup === filters.primary;
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
    video.setAttribute("aria-label", `${exhibit.name} 预览视频`);
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
  button.className = `asset-card archive-card${exhibit.isFeatured ? " is-featured" : ""}${
    exhibit.isSuspicious ? " is-suspicious" : ""
  }`;
  button.type = "button";
  button.dataset.route = "viewer";
  button.dataset.category = "character";
  button.dataset.name = exhibit.name;

  const head = document.createElement("div");
  head.className = "card-head";
  head.append(buildStamp(exhibit.camp, "camp-stamp"));
  head.append(buildStamp(exhibit.clueLevel, exhibit.clueLevel === "关键" ? "stamp-key" : ""));
  if (exhibit.isFeatured) {
    head.append(buildStamp("主视角", "stamp-featured"));
  }

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
    <div class="sound-tags">
      ${exhibit.soundscape.slice(0, 3).map((tag) => `<span>${tag}</span>`).join("")}
    </div>
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
      <span><b>类型</b>${exhibit.objectType}</span>
    </div>
    <blockquote class="character-quote">${exhibit.quote}</blockquote>
    <div class="sound-tags">
      ${exhibit.soundscape.slice(0, 3).map((tag) => `<span>${tag}</span>`).join("")}
    </div>
    <div class="card-footer">
      <span class="archive-state">${exhibit.archiveState}</span>
      <span class="cta-text">查看展台</span>
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
  head.append(buildStamp(exhibit.sceneType, "stamp-key"));

  const meta = document.createElement("div");
  meta.className = "asset-meta rich-meta";
  meta.innerHTML = `
    <p class="asset-category">场景</p>
    <h3>${exhibit.name}</h3>
    <div class="meta-grid">
      <span><b>叙事定位</b>${exhibit.role}</span>
    </div>
    <blockquote class="character-quote">${exhibit.description}</blockquote>
    <div class="sound-tags">
      ${exhibit.soundscape.slice(0, 3).map((tag) => `<span>${tag}</span>`).join("")}
    </div>
    <div class="card-footer">
      <span class="archive-state">${exhibit.archiveState}</span>
      <span class="cta-text">进入场景</span>
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
  const resultLabel =
    items.length === totalCount ? `共 ${items.length} 件${kindLabel}` : `已筛选 ${items.length} 件`;

  summary.innerHTML = `
    <div class="summary-card">
      <p class="eyebrow">浏览统计</p>
      <strong>${categoryMeta[category].archiveLabel}</strong>
      <div class="summary-stats">
        <span>${resultLabel}</span>
        <span>模型就绪 ${readyCount}</span>
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
      <h3>当前筛选下暂无结果</h3>
      <p>你可以清除筛选，或切换到其他馆别继续浏览。</p>
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
      <h3 class="info-block-title">热点导览</h3>
      <div class="scene-hotspot-list">
        ${hotspots
          .map(
            (hotspot) => `
              <div class="scene-hotspot-item">
                <strong>${hotspot.label}</strong>
                <span>${hotspot.description}</span>
              </div>
            `
          )
          .join("")}
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

        <div class="info-block">
          <h3 class="info-block-title">观看提示</h3>
          <p>拖动旋转、滚轮缩放，可切换视角与灯光。</p>
        </div>

        <div class="info-block">
          <h3 class="info-block-title">观察重点</h3>
          <p>${exhibit.visualFocus}</p>
        </div>

        <div class="info-block info-block-tags">
          <h3 class="info-block-title">声景</h3>
          <div class="sound-tags sound-tags-panel">${soundTags}</div>
        </div>

        <div class="info-block">
          <h3 class="info-block-title">线索提示</h3>
          <p>${exhibit.clueHint}</p>
        </div>

        <details class="info-section info-section-more">
          <summary>展开更多</summary>
          <div class="info-group">
            ${createInfoRow("剧情阶段", exhibit.stage)}
            ${createInfoRow("角色立场", exhibit.stance)}
            ${createInfoRow("所属剧目", "粤剧《六国大封相》")}
          </div>
        </details>
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
          ${createMiniInfoCard("展示定位", exhibit.role.split(" / ")[0])}
        </div>

        <blockquote class="info-quote">“${exhibit.quote}”</blockquote>

        <div class="info-block">
          <h3 class="info-block-title">观看提示</h3>
          <p>物件悬浮于展示座上方，进入页面后缓慢旋转，可拖动继续观察。</p>
        </div>

        <div class="info-block">
          <h3 class="info-block-title">观察重点</h3>
          <p>${exhibit.description}</p>
        </div>

        <div class="info-block info-block-tags">
          <h3 class="info-block-title">声景</h3>
          <div class="sound-tags sound-tags-panel">${soundTags}</div>
        </div>

        <div class="info-block">
          <h3 class="info-block-title">剧情象征</h3>
          <p>${exhibit.symbolism}</p>
        </div>

        <details class="info-section info-section-more">
          <summary>展开更多</summary>
          <div class="info-group">
            ${createInfoRow("声景来源", exhibit.soundscapeScene)}
            ${createInfoRow("所属剧目", "粤剧《六国大封相》")}
          </div>
        </details>
      </article>
    `;
  }

  const controlSummary = [
    exhibit.controls.canOrbit ? "可旋转" : "",
    exhibit.controls.canPan ? "可平移" : "",
    exhibit.controls.canZoom ? "可缩放" : "",
    exhibit.controls.canEnterScene ? "可漫游" : ""
  ]
    .filter(Boolean)
    .join(" / ");

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
        ${createMiniInfoCard("场景分组", exhibit.sceneGroup)}
        ${createMiniInfoCard("交互模式", exhibit.controls.mode)}
        ${createMiniInfoCard("热点数量", `${exhibit.hotspots.length} 处`)}
        ${createMiniInfoCard("视距范围", `${exhibit.controls.minDistance} - ${exhibit.controls.maxDistance}`)}
      </div>

      <blockquote class="info-quote">${exhibit.description}</blockquote>

      <div class="info-block">
        <h3 class="info-block-title">观看提示</h3>
        <p>拖动旋转、平移与缩放，可在场景中自由浏览重点区域。</p>
      </div>

      <div class="info-block">
        <h3 class="info-block-title">浏览方式</h3>
        <p>${controlSummary}</p>
      </div>

      <div class="info-block info-block-tags">
        <h3 class="info-block-title">声景</h3>
        <div class="sound-tags sound-tags-panel">${soundTags}</div>
      </div>

      ${buildSceneHotspots(exhibit.hotspots)}

      <details class="info-section info-section-more">
        <summary>展开更多</summary>
        <div class="info-group">
          ${createInfoRow("俯仰限制", `${exhibit.controls.minPolarAngle.toFixed(2)} - ${exhibit.controls.maxPolarAngle.toFixed(2)}`)}
          ${createInfoRow("阻尼系数", `${exhibit.controls.dampingFactor}`)}
          ${createInfoRow("所属剧目", "粤剧《六国大封相》")}
        </div>
      </details>
    </article>
  `;
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
  if (rotateButton) {
    rotateButton.textContent = `自动旋转：${viewerInstance.getAutoRotate() ? "开" : "关"}`;
  }
}

function applyViewerCopy(exhibit) {
  document.querySelector("#infoPanel").innerHTML = buildInfoPanel(exhibit);
  document.querySelector("#soundscapeScene").textContent = exhibit.soundscapeScene;
  document.querySelector("#soundscapeTags").textContent = exhibit.soundscape.join(" ／ ");
  document.querySelector("#soundscapeStatus").textContent = exhibit.hasModel ? "可进入" : "未接入";
}

function getIntroCopy(exhibit) {
  if (exhibit.assetCategory === "scene") {
    return {
      eyebrow: "场景档案",
      title: `${exhibit.name} 已开启`,
      text: "三维空间已就绪，进入后可直接浏览戏台结构、朝堂动线与热点区域。"
    };
  }

  if (exhibit.assetCategory === "object") {
    return {
      eyebrow: "物件档案",
      title: `${exhibit.name} 展台已开启`,
      text: "展示灯光、机位与悬浮展台已准备完成，轻触进入物件细观模式。"
    };
  }

  return {
    eyebrow: "人物档案",
    title: `${exhibit.name} 展台已开启`,
    text: "角色灯光与机位已经就绪，进入后可旋转观看服饰、身段与冠服层次。"
  };
}

function renderViewer(category, name) {
  cleanupViewer();
  const exhibit = getExhibit(category, name) ?? getFeaturedExhibit();
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
  interactionHint.textContent =
    exhibit.assetCategory === "scene"
      ? "拖动旋转、平移与缩放，可漫游场景重点。"
      : "拖动旋转、滚轮缩放，松手后将继续缓慢旋转。";

  const introScreen = document.querySelector("#introScreen");
  const viewerLayout = document.querySelector("#viewerLayout");
  const enterButton = document.querySelector("#enterViewerButton");
  const errorBackButton = document.querySelector("#errorBackButton");
  const canvas = document.querySelector("#viewerCanvas");
  const loadingProgress = document.querySelector("#loadingProgress");
  const errorMessage = document.querySelector("#errorMessage");
  let hasEntered = false;

  if (exhibit.assetCategory === "scene") {
    loadingProgress.textContent = "正在载入 3D 场景，并校准机位、灯光与可漫游范围……";
    errorMessage.textContent = "场景模型暂未就绪，请返回场景馆查看其他档案。";
  } else if (exhibit.assetCategory === "object") {
    loadingProgress.textContent = "正在为物件调整灯光、机位与展示姿态……";
    errorMessage.textContent = "物件模型暂未就绪，请返回物件馆查看其他档案。";
  } else {
    loadingProgress.textContent = "正在为人物调整灯光、机位与展示姿态……";
    errorMessage.textContent = "人物模型暂未就绪，请返回人物馆查看其他档案。";
  }

  errorBackButton.addEventListener("click", () => {
    navigateTo(`#category/${category}`);
  });

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
  if (route.page === "category") {
    renderCategory(route.category);
    return;
  }
  if (route.page === "viewer") {
    renderViewer(route.category, route.name);
    return;
  }
  renderHome();
}

document.body.addEventListener("click", (event) => {
  const routeTarget = event.target.closest("[data-route]");
  if (routeTarget) {
    if (routeTarget.dataset.route === "category") {
      navigateTo(`#category/${routeTarget.dataset.category}`);
      return;
    }
    if (routeTarget.dataset.route === "viewer") {
      navigateTo(
        `#viewer/${routeTarget.dataset.category}/${encodeURIComponent(routeTarget.dataset.name)}`
      );
      return;
    }
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
    renderFilters("character");
    return;
  }

  if (event.target.closest("[data-clear-character-filters]")) {
    saveFilterScrollPosition(event.target);
    pageState.filters.character = structuredClone(defaultFilters.character);
    renderFilters("character");
    renderArchiveGrid("character");
    return;
  }

  if (event.target.closest("[data-clear-object-filters]")) {
    saveFilterScrollPosition(event.target);
    pageState.filters.object = structuredClone(defaultFilters.object);
    renderFilters("object");
    renderArchiveGrid("object");
    return;
  }

  if (event.target.closest("[data-clear-scene-filters]")) {
    saveFilterScrollPosition(event.target);
    pageState.filters.scene = structuredClone(defaultFilters.scene);
    renderFilters("scene");
    renderArchiveGrid("scene");
    return;
  }

  const viewTarget = event.target.closest("[data-view]");
  if (viewTarget && viewerInstance) {
    viewerInstance.setView(viewTarget.dataset.view);
    syncViewerControlState();
    return;
  }

  const lightTarget = event.target.closest("[data-lighting]");
  if (lightTarget && viewerInstance) {
    viewerInstance.setLighting(lightTarget.dataset.lighting);
    syncViewerControlState();
    return;
  }

  const rotateTarget = event.target.closest("[data-toggle-rotate]");
  if (rotateTarget && viewerInstance) {
    viewerInstance.toggleAutoRotate();
    syncViewerControlState();
  }
});

globalBackButton.addEventListener("click", () => {
  const route = makeRoute();
  if (route.page === "viewer") {
    navigateTo(`#category/${route.category}`);
    return;
  }
  navigateTo("");
});

window.addEventListener("hashchange", renderRoute);
window.addEventListener("beforeunload", cleanupViewer);

renderRoute();
