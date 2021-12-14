import { Points } from "./point.js";
import { Spline2D } from "./spline.js";

export default class Plot {
  canvas: HTMLElement;
  ctx: CanvasRenderingContext2D;
  ps: Points;
  spline: Spline2D;
  draggingId: number;
  constructor(
    _canvas: HTMLElement,
    _ctx: CanvasRenderingContext2D,
    _ps: Points,
    _spline: Spline2D
  ) {
    this.canvas = _canvas;
    this.ctx = _ctx;
    this.ps = _ps;
    this.spline = _spline;
  }

  draw() {
    const h = this.canvas.clientHeight;
    this.ctx.clearRect(0, 0, this.canvas.clientWidth, h);
    this.spline.draw(this.ctx, h);
    this.ps.draw(this.ctx, h);
  }

  mouseHit(_x: number, _y: number): number {
    const len = this.ps.length;
    for (let i = 0; i < len; i++) {
      const p = this.ps.index(i);
      const r = p.size / 2;
      if (p.x - r < _x && p.x + r > _x && p.y - r < _y && p.y + r > _y) {
        return i;
      }
    }
    return -1;
  }

  onDown(e: MouseEvent) {
    const offsetX = this.canvas.getBoundingClientRect().left;
    const offsetY = this.canvas.getBoundingClientRect().top;
    const x = e.clientX - offsetX;
    const y = this.canvas.clientHeight - e.clientY + offsetY;

    this.ps.unselectAll();

    const selecteId: number = this.mouseHit(x, y);
    if (selecteId >= 0) {
      this.ps.select(selecteId);
      this.draggingId = selecteId;
    }
  }

  onMove(e: MouseEvent) {
    const offsetX = this.canvas.getBoundingClientRect().left;
    const offsetY = this.canvas.getBoundingClientRect().top;
    const x = e.clientX - offsetX;
    const y = this.canvas.clientHeight - e.clientY + offsetY;

    if (this.draggingId >= 0) {
      this.ps.move(this.draggingId, x, y);
      this.draggingId = this.ps.moveAndSort(this.draggingId);

      this.spline.x.init(this.ps.xs);
      this.spline.y.init(this.ps.ys);
    }
  }

  onUp() {
    this.draggingId = -1;
  }

  mouseLeave() {
    this.draggingId = -1;
  }
}
