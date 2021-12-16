import { Vector2 } from "three";
import Gaussian from "./gaussian";
import { Points } from "./point";
import { Spline2D } from "./spline";

export default class Plot {
  private _draggingId: number;

  constructor(
    private canvas: HTMLElement,
    private size: Vector2,
    private origin: Vector2,
    public scale: Vector2,

    private _ps?: Points,
    private _spline?: Spline2D,
    private _gaussian?: Gaussian
  ) {
    this.origin = new Vector2(50, canvas.clientHeight - 50);
  }
  addSpline(ps: Points) {
    this._ps = ps;
    this._spline = Spline2D.createFromPoints(ps);
  }
  addGausssian(g: Gaussian) {
    this._gaussian = g;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const h = this.canvas.clientHeight;
    ctx.clearRect(0, 0, this.canvas.clientWidth, h);
    ctx.beginPath();
    if (this._spline != undefined) {
      this._spline.draw(ctx, this.origin, this.scale);
    }
    if (this._gaussian != undefined) {
      this._gaussian.draw(ctx, this.origin, this.size, this.scale);
    }
    this.drawTick(ctx);
    ctx.stroke();
    if (this._ps != undefined) {
      this._ps.draw(ctx, this.origin, this.scale);
    }
  }
  private drawTick(ctx: CanvasRenderingContext2D) {
    const top = this.origin.y - this.size.y;
    const right = this.size.x + this.origin.x;
    ctx.moveTo(this.origin.x, top);
    ctx.lineTo(this.origin.x, this.origin.y);
    ctx.lineTo(right, this.origin.y);

    const unitX = 1;
    const unitY = 0.1;
    const canvasUnitX = unitX * this.scale.x;
    const canvasUnitY = unitY * this.scale.y;

    const countX = this.size.x / canvasUnitX;
    ctx.textAlign = "start";
    for (let x = 0; x <= countX; x += 1) {
      const fx = this.origin.x + Math.floor(x * canvasUnitX);
      ctx.moveTo(fx, top);
      ctx.lineTo(fx, this.origin.y);
      ctx.fillText((x * unitX).toFixed(1), fx, this.origin.y + 10);
    }
    const countY = this.size.y / canvasUnitY;
    ctx.textAlign = "end";
    for (let y = 0; y <= countY; y += 1) {
      const fy = this.origin.y - Math.floor(y * canvasUnitY);
      ctx.moveTo(this.origin.x, fy);
      ctx.lineTo(right, fy);
      ctx.fillText((y * unitY).toFixed(1), this.origin.x - 5, fy);
    }
  }

  private mouseHit(mouse: Vector2): number {
    if (this._ps == undefined) return -1;
    const m = new Vector2(mouse.x - this.origin.x, this.origin.y - mouse.y);

    const len = this._ps.length;
    for (let i = 0; i < len; i++) {
      const p = this._ps.indexOf(i);
      const r = p.size;
      const coord = new Vector2().copy(p.coord).multiply(this.scale);
      if (
        m.x - r < coord.x &&
        m.x + r > coord.x &&
        m.y - r < coord.y &&
        m.y + r > coord.y
      ) {
        return i;
      }
    }
    return -1;
  }

  onDown(e: MouseEvent) {
    if (this._ps == undefined) return;
    const offsetX = this.canvas.getBoundingClientRect().left;
    const offsetY = this.canvas.getBoundingClientRect().top;
    const m = new Vector2(e.clientX - offsetX, e.clientY - offsetY);

    this._ps.unselectAll();

    const selecteId: number = this.mouseHit(m);
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
      const p = this._ps.indexOf(this._draggingId);
      if (x) p.coord.setX((m.x - this.origin.x) / this.scale.x);
      if (y) p.coord.setY((this.origin.y - m.y) / this.scale.y);
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

  contain(v: Vector2): boolean[] {
    const edge = new Vector2(
      this.origin.x + this.size.x,
      this.size.y - this.origin.y
    );

    return [
      (this.origin.x < v.x && v.x < edge.x) ||
        (edge.x < v.x && v.x < this.origin.x),
      (this.origin.y < v.y && v.y < edge.y) ||
        (edge.y < v.y && v.y < this.origin.y),
    ];
  }
}
