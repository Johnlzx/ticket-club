// Rigid paper with a small moving fold at the crack; bridges never stretch.
export const W = 280, BODY = 350, STUB = 92, HOLES = 25;
export const pitch = W / HOLES;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

export class PaperTicket {
  constructor(root, { onCopy, onActivity, sound }) {
    this.root = root;
    this.hit = root.querySelector('.tear-handle');
    this.canvas = root.querySelector('.paper-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.onCopy = onCopy;
    this.onActivity = onActivity;
    this.sound = sound;
    this.progress = 0;
    this.side = 1;
    this.dy = 0;
    this.dx = 0;
    this.detached = false;
    this.busy = false;
    this.generation = 0;
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.resize();
    this.hit.addEventListener('pointerdown', e => this.start(e));
    this.hit.addEventListener('pointermove', e => this.move(e));
    this.hit.addEventListener('pointerup', e => this.release(e));
    this.hit.addEventListener('pointercancel', e => this.cancel(e));
    this.hit.addEventListener('lostpointercapture', () => {
      if (this.active) this.release();
    });
    this.hit.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.demo();
      }
    });
  }

  resize() {
    this.dpr = Math.min(devicePixelRatio || 1, 2);
    this.canvas.width = 760 * this.dpr;
    this.canvas.height = 700 * this.dpr;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.draw();
  }

  async setTexture(svg) {
    const img = new Image();
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    img.src = url;
    await img.decode();
    URL.revokeObjectURL(url);
    const raster = document.createElement('canvas');
    raster.width = W * this.dpr;
    raster.height = STUB * this.dpr;
    raster.getContext('2d').drawImage(img, 0, 0, raster.width, raster.height);
    this.texture = raster;
    this.draw();
  }

  start(e) {
    if (this.detached || this.busy || e.button !== 0) return;
    e.preventDefault();
    const rect = this.root.querySelector('.ticket-face').getBoundingClientRect();
    const stageMatrix = new DOMMatrixReadOnly(getComputedStyle(this.root.parentElement).transform);
    const rotationMatrix = new DOMMatrixReadOnly(getComputedStyle(this.root).transform);
    this.scale = Math.hypot(stageMatrix.a, stageMatrix.b);
    this.rotation = Math.atan2(rotationMatrix.b, rotationMatrix.a);
    if (!this.progress) this.side = e.clientX < rect.left + rect.width / 2 ? -1 : 1;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.baseProgress = this.progress;
    this.baseDy = this.dy;
    this.active = true;
    this.hit.setPointerCapture(e.pointerId);
    this.root.classList.add('is-grabbed');
    this.sound('pick');
    this.onActivity('pull');
  }

  move(e) {
    if (!this.active || this.detached) return;
    const screenX = (e.clientX - this.startX) / this.scale;
    const screenY = (e.clientY - this.startY) / this.scale;
    this.dx = clamp(screenX * Math.cos(this.rotation) + screenY * Math.sin(this.rotation), -100, 100);
    const dragY = Math.max(0, -screenX * Math.sin(this.rotation) + screenY * Math.cos(this.rotation));
    this.dy = this.baseDy + dragY;
    const travel = Math.max(0, dragY + Math.abs(this.dx) * .42 - 12);
    const next = Math.min(HOLES, this.baseProgress + Math.floor(travel / 4.8));
    this.advance(next);
    this.root.style.setProperty('--pull-tilt', `${clamp(this.dx * .012 + this.side * this.dy * .006, -2, 2)}deg`);
    this.draw();
    if (this.progress === HOLES) this.detach();
  }

  advance(n) {
    if (n <= this.progress) return;
    const old = this.progress;
    this.progress = n;
    this.root.dataset.broken = n;
    this.root.querySelector('.rip-readout').textContent = `${Math.round(n / HOLES * 100)}%`;
    this.sound('rip', n - old);
    this.root.classList.add('is-started');
    this.root.querySelector('.tear-line').style.setProperty('--crack', `${n / HOLES * 100}%`);
    this.root.querySelector('.tear-line').dataset.side = this.side;
    // Tiny paper dust; it dies locally rather than tethering the torn edges.
    if (n % 3 === 0) {
      const fleck = document.createElement('i');
      fleck.className = 'paper-fleck';
      fleck.style.left = `${this.side === -1 ? n / HOLES * 100 : 100 - n / HOLES * 100}%`;
      fleck.style.setProperty('--fleck-x', `${this.side * (6 + n % 5)}px`);
      this.root.append(fleck);
      setTimeout(() => fleck.remove(), 240);
    }
  }

  release() {
    if (!this.active || this.detached) return;
    this.active = false;
    this.root.classList.remove('is-grabbed');
    this.root.style.setProperty('--pull-tilt', '0deg');
    // Existing broken bridges stay broken. A partial tear rests with a crisp fold.
    const from = this.dy;
    const start = performance.now();
    const generation = this.generation;
    const settle = now => {
      if (this.active || this.detached || generation !== this.generation) return;
      const t = Math.min(1, (now - start) / 220);
      this.dy = from + ((this.progress ? 15 : 0) - from) * (1 - (1 - t) ** 3);
      this.dx *= .78;
      this.draw();
      if (t < 1) requestAnimationFrame(settle);
    };
    requestAnimationFrame(settle);
    this.onActivity(this.progress ? 'continue' : 'ready');
  }

  cancel() { this.release(); }

  async demo() {
    if (this.detached || this.busy) return;
    this.busy = true;
    if (!this.progress) this.side = 1;
    this.root.classList.add('is-grabbed');
    this.onActivity('pull');
    this.sound('pick');
    const from = this.progress;
    const duration = this.reduced ? 100 : 560;
    const start = performance.now();
    const generation = this.generation;
    await new Promise(resolve => {
      const tick = now => {
        if (generation !== this.generation) { resolve(); return; }
        const t = Math.min(1, (now - start) / duration);
        this.dy = 12 + t * 124;
        this.dx = t * 23;
        this.advance(from + Math.floor(t * (HOLES - from)));
        this.draw();
        if (t < 1) requestAnimationFrame(tick); else resolve();
      };
      requestAnimationFrame(tick);
    });
    if (generation !== this.generation) return;
    this.busy = false;
    this.detach();
  }

  detach() {
    if (this.detached) return;
    this.detached = true;
    this.active = false;
    this.progress = HOLES;
    this.root.classList.remove('is-grabbed');
    this.root.classList.add('is-torn');
    this.root.style.setProperty('--pull-tilt', '0deg');
    this.hit.disabled = true;
    this.root.querySelector('.ticket-rest').inert = false;
    this.sound('snap');
    this.onCopy();
    const angle = this.side * Math.min(.20, this.dy * .0014);
    const pivot = this.side === -1 ? W : 0;
    const initialX = pivot + (W / 2 - pivot) * Math.cos(angle) - STUB / 2 * Math.sin(angle) + this.dx * .13 - W / 2;
    const initialY = (W / 2 - pivot) * Math.sin(angle) + STUB / 2 * Math.cos(angle) - STUB / 2;
    const start = performance.now();
    const generation = this.generation;
    const fall = now => {
      if (generation !== this.generation) return;
      const t = Math.min(1, (now - start) / (this.reduced ? 120 : 620));
      this.fall = { x: initialX + this.side * 65 * t, y: initialY + 35 * t + 470 * t * t, r: angle * 180 / Math.PI + this.side * 19 * t, a: 1 - Math.max(0, (t - .6) / .4) };
      this.draw();
      if (t < 1) requestAnimationFrame(fall); else this.ctx.clearRect(0, 0, 760, 700);
    };
    requestAnimationFrame(fall);
  }

  reset() {
    this.generation++;
    this.active = false;
    this.detached = false;
    this.busy = false;
    this.progress = 0;
    this.dy = this.dx = 0;
    this.fall = null;
    this.hit.disabled = false;
    this.root.classList.remove('is-torn', 'is-started', 'copy-failed', 'is-grabbed');
    this.root.querySelector('.ticket-rest').inert = true;
    this.root.style.setProperty('--pull-tilt', '0deg');
    this.root.dataset.broken = '0';
    this.root.querySelector('.rip-readout').textContent = '0%';
    this.root.querySelector('.tear-line').style.setProperty('--crack', '0%');
    this.draw();
  }

  point(u, v) {
    const freeWidth = this.progress * pitch;
    const fromEdge = this.side === -1 ? u : W - u;
    const free = fromEdge < freeWidth;
    // Local fold propagates hole by hole; the flat sheet never scales in Y.
    const d = Math.max(0, freeWidth - fromEdge);
    const fold = free ? Math.min(1, d / 9) : 0;
    const angle = this.side * Math.min(.20, this.dy * .0014) * fold;
    const pivot = this.side === -1 ? freeWidth : W - freeWidth;
    const x = pivot + (u - pivot) * Math.cos(angle) - v * Math.sin(angle) + this.dx * .13 * fold;
    const y = (u - pivot) * Math.sin(angle) + v * Math.cos(angle);
    return [x + 240, y + 90];
  }

  draw() {
    const c = this.ctx;
    if (!c) return;
    c.clearRect(0, 0, 760, 700);
    if (!this.texture) return;
    c.save();
    if (this.detached && this.fall) {
      c.globalAlpha = this.fall.a;
      c.translate(240 + W / 2 + this.fall.x, 90 + STUB / 2 + this.fall.y);
      c.rotate(this.fall.r * Math.PI / 180);
      c.shadowColor = '#24000066'; c.shadowBlur = 20; c.shadowOffsetY = 14;
      c.drawImage(this.texture, -W / 2, -STUB / 2, W, STUB);
      c.restore(); return;
    }
    if (this.progress === 0 && this.dy < 2) {
      c.drawImage(this.texture, 240, 90, W, STUB);
    } else {
      const cols = HOLES * 2, rows = 3;
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const x0 = i * W / cols, x1 = (i + 1) * W / cols;
        const y0 = j * STUB / rows, y1 = (j + 1) * STUB / rows;
        const a = this.point(x0, y0), b = this.point(x1, y0), d = this.point(x0, y1), e = this.point(x1, y1);
        this.triangle([[x0,y0],[x1,y0],[x0,y1]], [a,b,d]);
        this.triangle([[x1,y0],[x1,y1],[x0,y1]], [b,e,d]);
      }
    }
    c.restore();
  }

  triangle(s, d) {
    const c = this.ctx;
    const [p0,p1,p2] = s, [q0,q1,q2] = d;
    const den = p0[0]*(p1[1]-p2[1]) + p1[0]*(p2[1]-p0[1]) + p2[0]*(p0[1]-p1[1]);
    const solve = k => [
      (q0[k]*(p1[1]-p2[1])+q1[k]*(p2[1]-p0[1])+q2[k]*(p0[1]-p1[1]))/den,
      (q0[k]*(p2[0]-p1[0])+q1[k]*(p0[0]-p2[0])+q2[k]*(p1[0]-p0[0]))/den,
      (q0[k]*(p1[0]*p2[1]-p2[0]*p1[1])+q1[k]*(p2[0]*p0[1]-p0[0]*p2[1])+q2[k]*(p0[0]*p1[1]-p1[0]*p0[1]))/den
    ];
    const [a,b,e] = solve(0), [d0,d1,f] = solve(1);
    c.save();
    // Overlap clip edges slightly so Canvas antialiasing cannot expose the
    // wallpaper between adjacent triangles at fractional device pixels.
    const triangle = [q0,q1,q2];
    const expanded = triangle.map((q,i)=>{
      const prev=triangle[(i+2)%3], next=triangle[(i+1)%3];
      const e0=[q[0]-prev[0],q[1]-prev[1]], e1=[next[0]-q[0],next[1]-q[1]];
      const l0=Math.hypot(...e0), l1=Math.hypot(...e1);
      const n0=[e0[1]/l0,-e0[0]/l0], n1=[e1[1]/l1,-e1[0]/l1];
      const m=.55/Math.max(.01,1+n0[0]*n1[0]+n0[1]*n1[1]);
      return [q[0]+(n0[0]+n1[0])*m,q[1]+(n0[1]+n1[1])*m];
    });
    c.beginPath(); c.moveTo(...expanded[0]); c.lineTo(...expanded[1]); c.lineTo(...expanded[2]); c.closePath(); c.clip();
    c.transform(a,d0,b,d1,e,f);
    c.drawImage(this.texture,0,0,W,STUB);
    c.restore();
  }
}
