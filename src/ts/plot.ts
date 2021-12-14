import { Points } from "./point.js";
import { Spline2D } from "./spline.js";
import Vec2 from "./vec2.js";

export default class Plot {
  private _draggingId: number;
  constructor(
    private canvas: HTMLElement,
    private ctx: CanvasRenderingContext2D,
    public origin: Vec2,
    public size: Vec2,
    private _ps?: Points,
    private _spline?: Spline2D
  ) {}
  addSpline(ps: Points) {
    this._ps = ps;
    this._spline = Spline2D.createFromPoints(ps);
  }

  draw() {
    const h = this.canvas.clientHeight;
    this.ctx.clearRect(0, 0, this.canvas.clientWidth, h);
    if (this._spline != undefined) this._spline.draw(this.ctx, h);
    if (this._ps != undefined) this._ps.draw(this.ctx, h);
  }

  mouseHit(x: number, y: number): number {
    if (this._ps == undefined) return -1;
    const len = this._ps.length;
    for (let i = 0; i < len; i++) {
      const p = this._ps.index(i);
      const r = p.size / 2;
      if (p.x - r < x && p.x + r > x && p.y - r < y && p.y + r > y) {
        return i;
      }
    }
    return -1;
  }

  onDown(e: MouseEvent) {
    if (this._ps == undefined) return;
    const offsetX = this.canvas.getBoundingClientRect().left;
    const offsetY = this.canvas.getBoundingClientRect().top;
    const x = e.clientX - offsetX;
    const y = this.canvas.clientHeight - e.clientY + offsetY;

    this._ps.unselectAll();

    const selecteId: number = this.mouseHit(x, y);
    if (selecteId >= 0) {
      this._ps.select(selecteId);
      this._draggingId = selecteId;
    }
  }

  onMove(e: MouseEvent) {
    if (this._ps == undefined || this._spline == undefined) return;
    const offsetX = this.canvas.getBoundingClientRect().left;
    const offsetY = this.canvas.getBoundingClientRect().top;
    const m = new Vec2(
      e.clientX - offsetX,
      this.canvas.clientHeight - e.clientY + offsetY
    );

    if (this._draggingId >= 0) {
      this._ps.set(this._draggingId, m);
      this._draggingId = this._ps.moveAndSort(this._draggingId);

      this._spline.x.init(this._ps.xs);
      this._spline.y.init(this._ps.ys);
    }
  }

  onUp() {
    this._draggingId = -1;
  }

  mouseLeave() {
    this._draggingId = -1;
  }
}
