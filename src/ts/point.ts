import SplineAxis from "./spline";

export class Point {
  x: number;
  y: number;
  size: number;
  isSelected: boolean;
  constructor(_x: number, _y: number) {
    this.x = _x;
    this.y = _y;
    this.size = 10;
    this.isSelected = false;
  }
  draw(ctx: CanvasRenderingContext2D, height: number) {
    const y = height - this.y;
    if (this.isSelected) {
      ctx.fillStyle = "red";
    } else {
      ctx.fillStyle = "black";
    }
    ctx.fillRect(
      this.x - this.size / 2,
      y - this.size / 2,
      this.size,
      this.size
    );
  }
  select() {
    this.isSelected = true;
  }
  unselect() {
    this.isSelected = false;
  }
  move(_x: number, _y: number) {
    this.x = _x;
    this.y = _y;
  }
}

export class Plot {
  ps: Point[];
  canvas: HTMLElement;
  ctx: CanvasRenderingContext2D;
  draggingId: number;
  xs: SplineAxis;
  ys: SplineAxis;
  constructor(
    _ps: Point[],
    _canvas: HTMLElement,
    _ctx: CanvasRenderingContext2D,
    _xs: SplineAxis,
    _ys: SplineAxis
  ) {
    this.ps = _ps;
    this.canvas = _canvas;
    this.ctx = _ctx;
    this.xs = _xs;
    this.ys = _ys;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
    this.drawLines(this.ps.length, this.xs, this.ys);
    this.drawPoints();
  }

  drawPoints() {
    this.ps.forEach((e) => {
      e.draw(this.ctx, this.canvas.clientHeight);
    });
  }
  drawLines(num: number, xs: SplineAxis, ys: SplineAxis) {
    const h = this.canvas.clientHeight;
    this.ctx.beginPath();
    this.ctx.moveTo(xs.culc(0), h - ys.culc(0));
    for (let t = 0.02; t <= num - 1; t += 0.02) {
      this.ctx.lineTo(xs.culc(t), h - ys.culc(t));
    }
    this.ctx.stroke();
  }
  mouseHit(_x: number, _y: number): number {
    const len = this.ps.length;
    for (let i = 0; i < len; i++) {
      const p = this.ps[i];
      const r = p.size / 2;
      if (p.x - r < _x && p.x + r > _x && p.y - r < _y && p.y + r > _y) {
        return i;
      }
    }
    return -1;
  }

  onDown(e: MouseEvent, canvas: HTMLElement) {
    const offsetX = canvas.getBoundingClientRect().left;
    const offsetY = canvas.getBoundingClientRect().top;
    const x = e.clientX - offsetX;
    const y = canvas.clientHeight - e.clientY + offsetY;

    this.ps.forEach((e) => e.unselect());

    const selecteId: number = this.mouseHit(x, y);
    if (selecteId >= 0) {
      const p = this.ps[selecteId];
      p.select();
      this.draggingId = selecteId;
    }
  }

  onMove(e: MouseEvent, canvas: HTMLElement) {
    const offsetX = canvas.getBoundingClientRect().left;
    const offsetY = canvas.getBoundingClientRect().top;
    const x = e.clientX - offsetX;
    const y = canvas.clientHeight - e.clientY + offsetY;

    if (this.draggingId >= 0) {
      this.ps[this.draggingId].move(x, y);
      // swap
      if (
        this.draggingId > 0 &&
        this.ps[this.draggingId - 1].x > this.ps[this.draggingId].x
      ) {
        [this.ps[this.draggingId - 1], this.ps[this.draggingId]] = [
          this.ps[this.draggingId],
          this.ps[this.draggingId - 1],
        ];
        this.draggingId--;
      } else if (
        this.draggingId < this.ps.length - 1 &&
        this.ps[this.draggingId].x > this.ps[this.draggingId + 1].x
      ) {
        [this.ps[this.draggingId + 1], this.ps[this.draggingId]] = [
          this.ps[this.draggingId],
          this.ps[this.draggingId + 1],
        ];
        this.draggingId++;
      }
      this.xs.init(this.ps.map((e) => e.x));
      this.ys.init(this.ps.map((e) => e.y));
    }
  }

  onUp() {
    this.draggingId = -1;
  }

  mouseLeave() {
    this.draggingId = -1;
  }
}
