import { Vector2 } from "three";

/**グラフにおける一つのデータ */
export class Point {
  coord: Vector2;
  size: number;
  isSelected: boolean;
  constructor(x: number, y: number) {
    this.coord = new Vector2(x, y);
    this.size = 10;
    this.isSelected = false;
  }
  /**
   * ポイントを描画する
   * @param ctx キャンバスの2dコンテキスト
   * @param origin 原点の位置
   * @param scale 拡大率
   */
  draw(ctx: CanvasRenderingContext2D, origin: Vector2, scale: Vector2) {
    if (this.isSelected) {
      ctx.fillStyle = "red";
    } else {
      ctx.fillStyle = "black";
    }
    ctx.fillRect(
      origin.x + this.coord.x * scale.x - this.size / 2,
      origin.y - this.coord.y * scale.y - this.size / 2,
      this.size,
      this.size
    );
  }
  /**
   * 選択する
   */
  select() {
    this.isSelected = true;
  }
  /**
   * 非選択する
   */
  unselect() {
    this.isSelected = false;
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
}
/**
 * Pointをまとめたもの
 */
export class Points {
  length: number;
  constructor(private ps: Point[]) {
    this.length = ps.length;
  }
  /**
   * x座標, y座標の配列をもとにPointsを生成する
   * @param xs x座標の配列
   * @param ys y座標の配列
   * @returns Points
   */
  static create(xs: number[], ys: number[]): Points {
    if (xs.length == ys.length) {
      throw new Error("The length of the two arguments is different");
    }
    return new Points(xs.map((e, i) => new Point(e, ys[i])));
  }
  /**
   * 描画する
   * @param ctx 描画先の2dコンテキスト
   * @param origin 原点
   * @param scale 拡大率
   */
  draw(ctx: CanvasRenderingContext2D, origin: Vector2, scale: Vector2) {
    this.ps.forEach((e) => {
      e.draw(ctx, origin, scale);
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
      throw new Error("The length of the argument and Points are different.");
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
      throw new Error("The length of the argument and Points are different.");
    }
  }
  get ys(): number[] {
    return this.ps.map((e) => e.y);
  }
}
