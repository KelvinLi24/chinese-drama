import * as THREE from 'three';

export class XRLoadingRoom {
  constructor({ engine }) {
    this.engine = engine;
    this.group = new THREE.Group();
    this.group.name = 'xr-loading-room';
    this.group.visible = false;

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(2.8, 48),
      new THREE.MeshStandardMaterial({
        color: '#2b120f',
        roughness: 0.96,
        metalness: 0.04,
        emissive: new THREE.Color('#7b3b18').multiplyScalar(0.08),
        side: THREE.DoubleSide
      })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.02;

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.48, 0.04, 16, 64),
      new THREE.MeshStandardMaterial({
        color: '#d4a965',
        roughness: 0.28,
        metalness: 0.52,
        emissive: new THREE.Color('#d4a965').multiplyScalar(0.16)
      })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 1.36;

    const columns = [];
    [[-1.6, 1.1, -1.6], [1.6, 1.1, -1.6], [-1.6, 1.1, 1.6], [1.6, 1.1, 1.6]].forEach((position) => {
      const column = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.08, 2.2, 18),
        new THREE.MeshStandardMaterial({
          color: '#6a1f1b',
          roughness: 0.78,
          metalness: 0.08,
          emissive: new THREE.Color('#6a1f1b').multiplyScalar(0.12)
        })
      );
      column.position.set(...position);
      columns.push(column);
    });

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    this.context = canvas.getContext('2d');
    this.texture = new THREE.CanvasTexture(canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;

    const panel = new THREE.Mesh(
      new THREE.PlaneGeometry(1.9, 0.95),
      new THREE.MeshBasicMaterial({ map: this.texture, transparent: true, depthWrite: false })
    );
    panel.position.set(0, 1.55, -1.8);

    const light = new THREE.PointLight('#f0cb8d', 1.6, 9, 2);
    light.position.set(0, 2.2, -0.6);

    this.group.add(floor, ring, panel, light, ...columns);
    this.engine.xrLocomotionRig.add(this.group);
    this.setMessage('正在准备 XR 场景……');
  }

  setMessage(message) {
    if (!this.context) return;
    this.context.clearRect(0, 0, 1024, 512);
    this.context.fillStyle = 'rgba(24, 8, 8, 0.92)';
    this.context.strokeStyle = 'rgba(212, 169, 101, 0.72)';
    this.context.lineWidth = 5;
    this.context.beginPath();
    this.context.roundRect(20, 20, 984, 472, 30);
    this.context.fill();
    this.context.stroke();

    this.context.fillStyle = '#f3d8ab';
    this.context.font = 'bold 44px Microsoft YaHei, PingFang SC, Noto Sans SC, sans-serif';
    this.context.fillText('XR Loading Room', 56, 92);

    this.context.fillStyle = '#e9d6b5';
    this.context.font = '32px Microsoft YaHei, PingFang SC, Noto Sans SC, sans-serif';
    this.#drawWrappedText(message || '正在准备 XR 场景……', 56, 168, 912, 46);

    this.context.fillStyle = '#d4a965';
    this.context.font = '26px Microsoft YaHei, PingFang SC, Noto Sans SC, sans-serif';
    this.context.fillText('如果 Quest 3 还没看到主场景，请先停留在这里等待校准完成。', 56, 414);
    this.texture.needsUpdate = true;
  }

  #drawWrappedText(text, x, startY, maxWidth, lineHeight) {
    const chars = Array.from(text || '');
    let line = '';
    let y = startY;
    chars.forEach((char) => {
      const testLine = line + char;
      if (this.context.measureText(testLine).width > maxWidth && line) {
        this.context.fillText(line, x, y);
        line = char;
        y += lineHeight;
      } else {
        line = testLine;
      }
    });
    if (line) this.context.fillText(line, x, y);
  }

  show(message = '') {
    if (message) this.setMessage(message);
    this.group.visible = true;
  }

  hide() {
    this.group.visible = false;
  }

  isVisible() {
    return this.group.visible;
  }
}
