import { Vector2 } from "three";
import { Color } from "./curve";

/**グラフにおける一つのデータ */
export class Point {
  coord: Vector2;
  private _size: number;
  private _isSelected: boolean;
  constructor(x: number, y: number) {
    this.coord = new Vector2(x, y);
    this._size = 10;
    this._isSelected = false;
  }
  /**
   * ポイントを描画する
   * @param ctx キャンバスの2dコンテキスト
   * @param scale 拡大率
   */
  draw(ctx: CanvasRenderingContext2D, size: Vector2, color: Color) {
    if (this._isSelected) {
      ctx.fillStyle = color;
    } else {
      ctx.fillStyle = "black";
    }
    ctx.fillRect(
      this.coord.x * size.x - this._size / 2,
      size.y - this.coord.y * size.y - this._size / 2,
      this._size,
      this._size
    );
  }
  /**
   * 選択する
   */
  select() {
    this._isSelected = true;
  }
  /**
   * 非選択する
   */
  unselect() {
    this._isSelected = false;
  }
  /**
   * 座標を設定する
   * @param x
   * @param y
   */
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
  get size(): number {
    return this._size;
  }
}
/**
 * Pointをまとめたもの
 */
export class Points {
  private _length: number;
  private _maxY: number;
  constructor(private ps: Point[]) {
    this._length = ps.length;
    if (this.length > 1) {
      this._maxY = this.ps.reduce((a: Point, b: Point): Point => {
        return a.y > b.y ? a : b;
      }).y;
    } else {
      this._maxY = this.ps[0].y;
    }
  }
  /**
   * x座標, y座標の配列をもとにPointsを生成する
   * @param xs x座標の配列
   * @param ys y座標の配列
   * @returns Points
   */
  static create(xs: number[], ys: number[]): Points {
    if (xs.length != ys.length) {
      throw new Error("The length of the two arguments is different");
    }
    return new Points(xs.map((e, i) => new Point(e, ys[i])));
  }
  /**
   * 描画する
   * @param ctx 描画先の2dコンテキスト
   * @param scale 拡大率
   */
  draw(ctx: CanvasRenderingContext2D, size: Vector2, color: Color) {
    this.ps.forEach((e) => {
      e.draw(ctx, size, color);
    });
  }
  /**
   * 配列
   * @param i index
   * @returns
   */
  indexOf(index: number) {
    return this.ps[index];
  }
  /**
   * index番目のPointを選択
   * @param index
   */
  select(index: number) {
    this.ps[index].select();
  }
  /**
   * index番目のPointを非選択
   * @param index
   */
  unselect(index: number) {
    this.ps[index].unselect();
  }
  /**
   * すべてを非選択にする
   */
  unselectAll() {
    this.ps.forEach((e) => e.unselect());
  }
  /**
   * index番目の座標を設定する
   * @param index
   * @param coord
   */
  set(index: number, coord: Vector2) {
    this.ps[index].coord = coord;
    if (this._maxY < coord.y) {
      this._maxY = coord.y;
    }
  }
  setX(index: number, x: number) {
    this.ps[index].x = x;
  }
  setY(index: number, y: number) {
    this.ps[index].y = y;
    if (this._maxY < y) {
      this._maxY = y;
    }
  }
  /**
   * Pointが動かされた際に左から順になっている配列に直す
   * @param draggingId 動かされたPointのid
   * @returns 動かされたPointのidを更新して変えす
   */
  sort(draggingId: number) {
    if (draggingId > 0 && this.ps[draggingId - 1].x > this.ps[draggingId].x) {
      [this.ps[draggingId - 1], this.ps[draggingId]] = [
        this.ps[draggingId],
        this.ps[draggingId - 1],
      ];
      draggingId--;
    } else if (
      draggingId < this._length - 1 &&
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
  mouseHit(mousePos: Vector2, scale: Vector2) {
    for (let i = 0; i < this._length; i++) {
      const p = this.ps[i];
      const r = p.size;
      const coord = new Vector2().copy(p.coord).multiply(scale);
      if (
        mousePos.x - r < coord.x &&
        mousePos.x + r > coord.x &&
        mousePos.y - r < coord.y &&
        mousePos.y + r > coord.y
      ) {
        return i;
      }
    }
    return -1;
  }

  set xs(xs: number[]) {
    if (this._length == xs.length) {
      this.ps.forEach((e, i) => {
        e.x = xs[i];
      });
    } else {
      throw new Error("The length of the argument and Points are different.");
    }
  }
  get xs(): number[] {
    return this.ps.map((e) => e.x);
  }
  set ys(ys: number[]) {
    if (this._length == ys.length) {
      this.ps.forEach((e, i) => {
        e.y = ys[i];
      });
      this._maxY = ys.reduce((a, b) => {
        return Math.max(a, b);
      });
    } else {
      throw new Error("The length of the argument and Points are different.");
    }
  }
  get ys(): number[] {
    return this.ps.map((e) => e.y);
  }
  get length(): number {
    return this._length;
  }
  get maxY(): number {
    return this._maxY;
  }
}
