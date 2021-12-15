import { Vector2 } from "three";
import { Points } from "./point";
import { Spline2D } from "./spline";

export default class Plot {
  private _draggingId: number;
  private size: Vector2;
  public origin: Vector2;

  constructor(
    private canvas: HTMLElement,
    private _ps?: Points,
    private _spline?: Spline2D
  ) {
    this.origin = new Vector2(50, canvas.clientHeight - 50);
    this.size = new Vector2(500, 300);
  }
  addSpline(ps: Points) {
    this._ps = ps;
    this._spline = Spline2D.createFromPoints(ps);
  }

  draw(ctx: CanvasRenderingContext2D) {
    const h = this.canvas.clientHeight;
    ctx.clearRect(0, 0, this.canvas.clientWidth, h);
    if (this._spline != undefined) this._spline.draw(ctx, this.origin);
    if (this._ps != undefined) this._ps.draw(ctx, this.origin);
    this.drawTick(ctx);
  }
  private drawTick(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.moveTo(this.origin.x, this.size.y - this.origin.y);
    ctx.lineTo(this.origin.x, this.origin.y);
    ctx.lineTo(this.size.x + this.origin.x, this.origin.y);
    ctx.stroke();
  }

  private mouseHit(x: number, y: number): number {
    if (this._ps == undefined) return -1;
    const m = new Vector2(x - this.origin.x, this.origin.y - y);

    const len = this._ps.length;
    for (let i = 0; i < len; i++) {
      const p = this._ps.index(i);
      const r = p.size / 2;
      if (m.x - r < p.x && m.x + r > p.x && m.y - r < p.y && m.y + r > p.y) {
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
    const y = e.clientY - offsetY;

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
    const m = new Vector2(e.clientX - offsetX, e.clientY - offsetY);
    if (this._draggingId >= 0) {
      const [x, y] = this.contain(m);
      const p = this._ps.index(this._draggingId);
      if (x) p.coord.setX(m.x - this.origin.x);
      if (y) p.coord.setY(this.origin.y - m.y);
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

  contain(p: Vector2): boolean[] {
    const edge = new Vector2(
      this.origin.x + this.size.x,
      this.size.y - this.origin.y
    );

    return [
      (this.origin.x < p.x && p.x < edge.x) ||
        (edge.x < p.x && p.x < this.origin.x),
      (this.origin.y < p.y && p.y < edge.y) ||
        (edge.y < p.y && p.y < this.origin.y),
    ];
  }
}
