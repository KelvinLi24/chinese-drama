import {
  categoryMeta,
  characterExhibits,
  defaultFilters,
  filterConfigs,
  getExhibit,
  getExhibits,
  getFeaturedExhibit,
  getHomeStats,
  objectExhibits
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
    buildHomeStat("物件线索", stats.objectCount),
    buildHomeStat("可查看模型", stats.readyModels)
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

function renderFilters(category) {
  const rack = document.querySelector("#filterRack");
  rack.innerHTML = "";

  if (category === "character") {
    const primarySection = document.createElement("section");
    primarySection.className = "filter-group filter-group-primary";

    const primaryBar = document.createElement("div");
    primaryBar.className = "primary-filter-bar";

    const chips = document.createElement("div");
    chips.className = "filter-chips filter-chips-primary";
    chips.dataset.scrollKey = "character-primary";
    filterConfigs.character[0].options
      .map((option) =>
        createFilterButton("primary", option, pageState.filters.character.primary)
      )
      .forEach((button) => chips.appendChild(button));

    const actions = document.createElement("div");
    actions.className = "filter-actions";
    actions.innerHTML = `
      <button class="filter-action-button" type="button" data-toggle-advanced>
        ${pageState.filters.character.advancedOpen ? "收起进阶筛选" : "进阶筛选"}
      </button>
      <button class="filter-action-button" type="button" data-clear-character-filters>
        清除筛选
      </button>
    `;

    primaryBar.append(chips, actions);
    primarySection.appendChild(primaryBar);
    rack.appendChild(primarySection);

    if (pageState.filters.character.advancedOpen) {
      filterConfigs.character.slice(1).forEach((group) => {
        const section = document.createElement("section");
        section.className = "filter-group filter-group-advanced";

        const label = document.createElement("span");
        label.className = "filter-label";
        label.textContent = group.label;

        const advChips = document.createElement("div");
        advChips.className = "filter-chips";
        advChips.dataset.scrollKey = `character-${group.key}`;
        group.options
          .map((option) =>
            createFilterButton(group.key, option, pageState.filters.character[group.key])
          )
          .forEach((button) => advChips.appendChild(button));

        section.append(label, advChips);
        rack.appendChild(section);
      });
    }
    restoreFilterScrollPositions();
    return;
  }

  filterConfigs[category].forEach((group) => {
    const section = document.createElement("section");
    section.className = "filter-group";

    const label = document.createElement("span");
    label.className = "filter-label";
    label.textContent = group.label;

    const chips = document.createElement("div");
    chips.className = "filter-chips";
    group.options
      .map((option) =>
        createFilterButton(group.key, option, pageState.filters[category][group.key])
      )
      .forEach((button) => chips.appendChild(button));

    section.append(label, chips);
    rack.appendChild(section);
  });
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
  if (filters.operaRef !== "全部" && !exhibit.operaTags.includes(filters.operaRef)) return false;
  return true;
}

function matchObject(exhibit, filters) {
  if (filters.type === "全部") return true;
  return exhibit.objectType === filters.type;
}

function getFilteredExhibits(category) {
  const exhibits = getExhibits(category);
  const filters = pageState.filters[category];
  return exhibits.filter((exhibit) =>
    category === "character" ? matchCharacter(exhibit, filters) : matchObject(exhibit, filters)
  );
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
  if (exhibit.imagePath) {
    const image = document.createElement("img");
    image.src = exhibit.imagePath;
    image.alt = exhibit.name;
    image.loading = "lazy";
    image.onerror = () => {
      media.innerHTML = `<div class="asset-fallback">${exhibit.name}</div>`;
    };
    media.appendChild(image);
  } else {
    media.innerHTML = `<div class="asset-fallback">${exhibit.name}</div>`;
  }
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
  button.className = `asset-card archive-card object-card${
    exhibit.hasModel ? " is-ready" : " is-coming-soon"
  }`;
  button.type = "button";
  button.dataset.route = "viewer";
  button.dataset.category = "object";
  button.dataset.name = exhibit.name;

  const head = document.createElement("div");
  head.className = "card-head";
  head.append(buildStamp(exhibit.objectType, "camp-stamp"));
  head.append(buildStamp(exhibit.clueLevel.includes("关键") ? "关键线索" : exhibit.clueLevel));
  if (!exhibit.hasModel) {
    head.append(buildStamp("待入库", "stamp-waiting"));
  }

  const meta = document.createElement("div");
  meta.className = "asset-meta rich-meta";
  meta.innerHTML = `
    <p class="asset-category">物件</p>
    <h3>${exhibit.name}</h3>
    <div class="meta-grid">
      <span><b>类别</b>${exhibit.objectType}</span>
      <span><b>定位</b>${exhibit.role}</span>
      <span><b>阶段</b>${exhibit.storyStage}</span>
      <span><b>线索</b>${exhibit.clueLevel}</span>
    </div>
    <blockquote class="character-quote">${exhibit.quote}</blockquote>
    <p class="object-description">${exhibit.description}</p>
    <div class="sound-tags">
      ${exhibit.soundscape.map((tag) => `<span>${tag}</span>`).join("")}
    </div>
    <div class="card-footer">
      <span class="archive-state">${exhibit.archiveState}</span>
      <span class="cta-text">${exhibit.hasModel ? "查看展台" : "模型待入库"}</span>
    </div>
  `;

  button.append(head, buildCardMedia(exhibit), meta);
  return button;
}

function renderArchiveSummary(category, items) {
  const summary = document.querySelector("#archiveSummary");
  const readyCount = items.filter((item) => item.hasModel).length;
  const resultLabel =
    category === "character"
      ? `${items.length === characterExhibits.length ? "共" : "已筛选"} ${items.length} 件人物档案`
      : `${items.length === objectExhibits.length ? "共" : "已筛选"} ${items.length} 件物件档案`;
  summary.innerHTML = `
    <div class="summary-card">
      <p class="eyebrow">展陈概览</p>
      <strong>${categoryMeta[category].archiveLabel}</strong>
      <div class="summary-stats">
        <span>${resultLabel}</span>
        <span>模型可用：${readyCount}</span>
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
      <h3>暂无匹配档案</h3>
      <p>可以切换筛选条件，查看更多人物或物件线索。</p>
    `;
    grid.appendChild(empty);
    return;
  }

  items
    .map((item) => (category === "character" ? buildCharacterCard(item) : buildObjectCard(item)))
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

function buildInfoPanel(exhibit) {
  const soundTags = exhibit.soundscape.map((tag) => `<span>${tag}</span>`).join("");
  if (exhibit.category === "人物") {
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

        <blockquote class="info-quote">「${exhibit.quote}」</blockquote>

        <div class="info-block">
          <h3 class="info-block-title">观看提示</h3>
          <p>${
            exhibit.hasModel
              ? "拖动旋转、滚轮缩放，可切换视角与灯光。"
              : "当前仅提供档案信息与待入库提示。"
          }</p>
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
            ${createInfoRow("类别", exhibit.category)}
            ${createInfoRow("剧情阶段", exhibit.stage)}
            ${createInfoRow("角色立场", exhibit.stance)}
            ${createInfoRow("所属剧目", "粤剧《六国大封相》")}
          </div>
        </details>
      </article>
    `;
  }

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
        ${createMiniInfoCard("展示定位", exhibit.role)}
      </div>

      <blockquote class="info-quote">「${exhibit.quote}」</blockquote>

      <div class="info-block">
        <h3 class="info-block-title">观看提示</h3>
        <p>${
          exhibit.hasModel
            ? "物件悬浮于展示座上方，进入页面后缓慢旋转。"
            : "当前仅提供物件档案信息，模型仍在入库中。"
        }</p>
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
          ${createInfoRow("类别", exhibit.category)}
          ${createInfoRow("当前状态", exhibit.archiveState)}
          ${createInfoRow("模型路径", exhibit.modelPath || "未配置")}
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
    rotateButton.textContent = `慢速自转：${viewerInstance.getAutoRotate() ? "开启" : "关闭"}`;
  }
}

function applyViewerCopy(exhibit) {
  document.querySelector("#infoPanel").innerHTML = buildInfoPanel(exhibit);
  document.querySelector("#soundscapeScene").textContent = exhibit.soundscapeScene;
  document.querySelector("#soundscapeTags").textContent = exhibit.soundscape.join(" · ");
  document.querySelector("#soundscapeStatus").textContent = exhibit.hasModel
    ? "静音预留"
    : "档案模式";
}

function renderViewer(category, name) {
  cleanupViewer();
  const exhibit = getExhibit(category, name) ?? getFeaturedExhibit();
  pageState.currentCategory = category;
  pageState.currentExhibit = exhibit;

  app.replaceChildren(document.querySelector("#viewer-template").content.cloneNode(true));
  globalBackButton.classList.remove("hidden");
  applyViewerCopy(exhibit);

  const introScreen = document.querySelector("#introScreen");
  const viewerLayout = document.querySelector("#viewerLayout");
  const enterButton = document.querySelector("#enterViewerButton");
  const errorBackButton = document.querySelector("#errorBackButton");
  const canvas = document.querySelector("#viewerCanvas");
  let hasEntered = false;

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
        interactionHint: document.querySelector("#interactionHint")
      });
      syncViewerControlState();
    }, 420);
  };

  enterButton.addEventListener("click", enterViewer, { once: true });
  introTimeoutId = window.setTimeout(enterViewer, 1800);
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
