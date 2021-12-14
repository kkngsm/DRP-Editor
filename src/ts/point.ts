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

export class Points {
  ps: Point[];
  length: number;
  constructor(_ps: Point[]) {
    this.ps = _ps;
    this.length = _ps.length;
  }
  static create(xs: number[], ys: number[]): Points {
    return new Points(xs.map((e, i) => new Point(e, ys[i])));
  }
  draw(ctx: CanvasRenderingContext2D, height: number) {
    this.ps.forEach((e) => {
      e.draw(ctx, height);
    });
  }
  index(i: number) {
    return this.ps[i];
  }
  select(i: number) {
    this.ps[i].select();
  }
  unselect(i: number) {
    this.ps[i].unselect();
  }
  unselectAll() {
    this.ps.forEach((e) => e.unselect());
  }
  move(i: number, x: number, y: number) {
    this.ps[i].move(x, y);
  }
  moveAndSort(draggingId: number) {
    if (draggingId > 0 && this.ps[draggingId - 1].x > this.ps[draggingId].x) {
      [this.ps[draggingId - 1], this.ps[draggingId]] = [
        this.ps[draggingId],
        this.ps[draggingId - 1],
      ];
      draggingId--;
    } else if (
      draggingId < this.length - 1 &&
      this.ps[draggingId].x > this.ps[draggingId + 1].x
    ) {
      [this.ps[draggingId + 1], this.ps[draggingId]] = [
        this.ps[draggingId],
        this.ps[draggingId + 1],
      ];
      draggingId++;
    }
    return draggingId;
  }

  set xs(_xs: number[]) {
    if (this.length == _xs.length) {
      this.ps.forEach((e, i) => {
        e.x = _xs[i];
      });
    } else {
      throw "The length of the argument and Points are different.";
    }
  }
  get xs(): number[] {
    return this.ps.map((e) => e.x);
  }
  set ys(_ys: number[]) {
    if (this.length == _ys.length) {
      this.ps.forEach((e, i) => {
        e.y = _ys[i];
      });
    } else {
      throw "The length of the argument and Points are different.";
    }
  }
  get ys(): number[] {
    return this.ps.map((e) => e.y);
  }
}
