export class InventorySystem {
  constructor({ archivePanel, archiveList, archiveStats, archiveObjective, closeButton, toast }) {
    this.archivePanel = archivePanel;
    this.archiveList = archiveList;
    this.archiveStats = archiveStats;
    this.archiveObjective = archiveObjective;
    this.closeButton = closeButton;
    this.toast = toast;

    this.items = [];
    this.categories = ["令牌印信", "密函文书", "声景碎片", "服饰纹样", "档案残片"];
    this.isOpen = false;

    this.closeButton?.addEventListener("click", () => this.close());
  }

  addItem(item) {
    if (this.items.some((existing) => existing.id === item.id)) return false;
    this.items.push(item);
    this.render();
    this.showToast(`已收录线索：${item.title}`);
    return true;
  }

  getCollectedIds() {
    return new Set(this.items.map((item) => item.id));
  }

  countKeyClues() {
    return this.items.filter((item) => item.isKey).length;
  }

  render({ objectiveText = "在封相朝堂中收集第一批线索，并与关键人物交谈。", total = 12, keyTotal = 4 } = {}) {
    if (!this.archiveList) return;
    this.archiveObjective.textContent = objectiveText;
    this.archiveStats.textContent = `已收录 ${this.items.length} / ${total} ｜ 关键线索 ${this.countKeyClues()} / ${keyTotal}`;

    const groups = new Map(this.categories.map((category) => [category, []]));
    this.items.forEach((item) => {
      const bucket = groups.get(item.category) ?? groups.get("令牌印信");
      bucket.push(item);
    });

    this.archiveList.innerHTML = [...groups.entries()]
      .map(
        ([category, items]) => `
          <section class="archive-group">
            <h4>${category}</h4>
            ${
              items.length
                ? items
                    .map(
                      (item) => `
                        <article class="archive-record">
                          <strong>${item.title}</strong>
                          <span>${item.sourceScene} ｜ 关联人物：${item.relatedCharacter || "未标注"}</span>
                          <p>${item.description}</p>
                          <em>${item.suspicion}</em>
                        </article>
                      `
                    )
                    .join("")
                : '<p class="archive-empty">当前分类下还没有收录内容。</p>'
            }
          </section>
        `
      )
      .join("");
  }

  open() {
    this.isOpen = true;
    this.archivePanel.classList.remove("hidden");
  }

  close() {
    this.isOpen = false;
    this.archivePanel.classList.add("hidden");
  }

  toggle() {
    if (this.isOpen) {
      this.close();
      return;
    }
    this.open();
  }

  showToast(message) {
    if (!this.toast) return;
    this.toast.textContent = message;
    this.toast.classList.add("is-visible");
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => {
      this.toast.classList.remove("is-visible");
    }, 2600);
  }
}
