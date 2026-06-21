export class InventorySystem {
  constructor({ archivePanel, archiveList, archiveStats, archiveObjective, closeButton, toast }) {
    this.archivePanel = archivePanel;
    this.archiveList = archiveList;
    this.archiveStats = archiveStats;
    this.archiveObjective = archiveObjective;
    this.closeButton = closeButton;
    this.toast = toast;

    this.items = [];
    this.isOpen = false;

    this.closeButton?.addEventListener('click', () => this.close());
  }

  addItem(item) {
    if (this.items.some((existing) => existing.id === item.id)) return false;
    this.items.push(item);
    this.render();
    this.showToast(`已收录线索：${item.title}`);
    return true;
  }

  countKeyClues() {
    return this.items.filter((item) => item.isKey).length;
  }

  render({ objectiveText = '继续在戏中局里搜集关键证据。', total = 12, keyTotal = 4 } = {}) {
    if (!this.archiveList) return;
    this.archiveObjective.textContent = objectiveText;
    this.archiveStats.textContent = `已收录 ${this.items.length} / ${total} ｜ 关键线索 ${this.countKeyClues()} / ${keyTotal}`;

    const grouped = new Map();
    this.items.forEach((item) => {
      if (!grouped.has(item.category)) grouped.set(item.category, []);
      grouped.get(item.category).push(item);
    });

    this.archiveList.innerHTML = [...grouped.entries()]
      .map(([category, items]) => `
        <section class="archive-group">
          <h4>${category}</h4>
          ${items
            .map(
              (item) => `
                <article class="archive-record">
                  <strong>${item.title}</strong>
                  <span>${item.sourceScene} ｜ 关联人物：${item.relatedCharacter || '未标注'}</span>
                  <p>${item.description}</p>
                  <em>${item.suspicion}</em>
                </article>
              `
            )
            .join('')}
        </section>
      `)
      .join('');

    if (!this.items.length) {
      this.archiveList.innerHTML = '<section class="archive-group"><p class="archive-empty">当前还没有收录任何线索。</p></section>';
    }
  }

  open() {
    this.isOpen = true;
    this.archivePanel.classList.remove('hidden');
  }

  close() {
    this.isOpen = false;
    this.archivePanel.classList.add('hidden');
  }

  showToast(message) {
    if (!this.toast) return;
    this.toast.textContent = message;
    this.toast.classList.add('is-visible');
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => {
      this.toast.classList.remove('is-visible');
    }, 2400);
  }
}
