import { Vector2 } from "three";

export class Point {
  coord: Vector2;
  size: number;
  isSelected: boolean;
  constructor(x: number, y: number) {
    this.coord = new Vector2(x, y);
    this.size = 10;
    this.isSelected = false;
  }
  draw(ctx: CanvasRenderingContext2D, origin: Vector2) {
    if (this.isSelected) {
      ctx.fillStyle = "red";
    } else {
      ctx.fillStyle = "black";
    }
    ctx.fillRect(
      origin.x + this.x - this.size / 2,
      origin.y - this.y - this.size / 2,
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
  set(x: number, y: number) {
    this.coord.set(x, y);
  }

  get x(): number {
    return this.coord.x;
  }
  set x(x: number) {
    this.coord.x = x;
  }
  get y(): number {
    return this.coord.y;
  }
  set y(y: number) {
    this.coord.y = y;
  }
}

export class Points {
  length: number;
  constructor(private ps: Point[]) {
    this.length = ps.length;
  }
  static create(xs: number[], ys: number[]): Points {
    return new Points(xs.map((e, i) => new Point(e, ys[i])));
  }
  draw(ctx: CanvasRenderingContext2D, origin: Vector2) {
    this.ps.forEach((e) => {
      e.draw(ctx, origin);
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
  set(i: number, coord: Vector2) {
    this.ps[i].coord = coord;
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

  set xs(xs: number[]) {
    if (this.length == xs.length) {
      this.ps.forEach((e, i) => {
        e.x = xs[i];
      });
    } else {
      throw "The length of the argument and Points are different.";
    }
  }
  get xs(): number[] {
    return this.ps.map((e) => e.x);
  }
  set ys(ys: number[]) {
    if (this.length == ys.length) {
      this.ps.forEach((e, i) => {
        e.y = ys[i];
      });
    } else {
      throw "The length of the argument and Points are different.";
    }
  }
  get ys(): number[] {
    return this.ps.map((e) => e.y);
  }
}
