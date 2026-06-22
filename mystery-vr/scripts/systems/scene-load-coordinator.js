function clampPercent(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export class SceneLoadCoordinator {
  constructor({ ui }) {
    this.ui = ui;
    this.sceneId = '';
    this.sceneTitle = '';
    this.tasks = new Map();
    this.failedTask = null;
    this.lastPercent = 0;
  }

  beginSceneLoad(sceneId, sceneTitle, introCopy) {
    this.sceneId = sceneId;
    this.sceneTitle = sceneTitle;
    this.tasks.clear();
    this.failedTask = null;
    this.lastPercent = 0;
    this.ui.showLoading({
      title: introCopy || `正在调入${sceneTitle}……`,
      detail: `正在准备 ${sceneTitle} 的场景主体、人物、线索与交互……`,
      percent: 0,
      ready: 0,
      total: 0
    });
  }

  registerTask({ id, label, weight = 1, required = true, progressMode = 'binary' }) {
    this.tasks.set(id, {
      id,
      label,
      weight,
      required,
      progressMode,
      loaded: 0,
      total: progressMode === 'bytes' ? null : 1,
      complete: false,
      failed: false
    });
    this.refresh();
  }

  updateTaskProgress(taskId, loaded, total = null) {
    const task = this.tasks.get(taskId);
    if (!task) return;
    task.loaded = Math.max(0, loaded ?? 0);
    task.total = total && total > 0 ? total : task.total;
    if (task.total && task.loaded >= task.total) {
      task.complete = true;
      task.loaded = task.total;
    }
    this.refresh();
  }

  completeTask(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) return;
    task.complete = true;
    task.loaded = task.total && task.total > 0 ? task.total : 1;
    if (task.progressMode === 'bytes' && !task.total) task.total = 1;
    this.refresh();
  }

  failTask(taskId, error) {
    const task = this.tasks.get(taskId);
    if (!task) return;
    task.failed = true;
    task.error = error;
    if (task.required) this.failedTask = task;
    this.refresh();
  }

  hasFailure() {
    return Boolean(this.failedTask);
  }

  getFailure() {
    return this.failedTask;
  }

  getSnapshot() {
    const tasks = [...this.tasks.values()];
    const totalWeight = tasks.reduce((sum, task) => sum + task.weight, 0) || 1;
    const readyWeight = tasks.reduce((sum, task) => sum + this.#getTaskRatio(task) * task.weight, 0);
    const requiredTasks = tasks.filter((task) => task.required);
    const readyCount = requiredTasks.filter((task) => task.complete).length;
    const percent = this.#calculatePercent(readyWeight / totalWeight);
    const activeTask = tasks.find((task) => !task.complete && !task.failed) ?? tasks.at(-1) ?? null;

    return {
      sceneId: this.sceneId,
      sceneTitle: this.sceneTitle,
      percent,
      readyCount,
      totalCount: requiredTasks.length,
      activeTaskLabel: activeTask?.label ?? `${this.sceneTitle} 已全部就绪。`,
      isReady: requiredTasks.every((task) => task.complete),
      failedTask: this.failedTask,
      tasks
    };
  }

  refresh(extraDetail = '') {
    const snapshot = this.getSnapshot();
    this.lastPercent = snapshot.percent;
    this.ui.showLoading({
      title: `正在重构 ${this.sceneTitle}`,
      detail: extraDetail || snapshot.activeTaskLabel || `正在准备 ${this.sceneTitle} 的场景资源……`,
      percent: snapshot.percent,
      ready: snapshot.readyCount,
      total: snapshot.totalCount
    });
  }

  #getTaskRatio(task) {
    if (task.failed) return 0;
    if (task.complete) return 1;
    if (task.progressMode === 'bytes') {
      if (!task.total || task.total <= 0) return 0;
      return Math.max(0, Math.min(1, task.loaded / task.total));
    }
    return task.loaded > 0 ? Math.max(0, Math.min(0.9, task.loaded)) : 0;
  }

  #calculatePercent(ratio) {
    if (ratio >= 1 && !this.failedTask) return 100;
    return clampPercent(Math.min(ratio * 100, 98));
  }
}
