export class AudioSystem {
  constructor({ toastTarget }) {
    this.toastTarget = toastTarget;
    this.audioUnlocked = false;
    this.currentAmbience = null;
    this.ambienceName = "";
    this.masterVolume = 0.8;
    this.muted = true;
  }

  unlock() {
    this.audioUnlocked = true;
    this.muted = false;
  }

  setSceneAmbience(name) {
    this.ambienceName = name;
    if (!this.audioUnlocked) return;
    this.notify(`当前切换到“${name}”的静音声景占位。`);
  }

  playUiConfirm() {
    if (!this.audioUnlocked) return;
  }

  playUiCollect() {
    if (!this.audioUnlocked) return;
  }

  playStoryCue(text) {
    if (!this.audioUnlocked) return;
    this.notify(text);
  }

  setVolume(value) {
    this.masterVolume = value;
  }

  notify(message) {
    if (!this.toastTarget) return;
    this.toastTarget.textContent = message;
    this.toastTarget.classList.add("is-visible");
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => {
      this.toastTarget.classList.remove("is-visible");
    }, 2200);
  }
}
