import { Vector2 } from "three";
import { Points } from "./point";

export type Color = "red" | "green" | "blue";

export abstract class Curve {
  public color: Color;
  constructor(protected _ps: Points, col?: Color) {
    if (col) {
      this.color = col;
    }
  }
  abstract draw(ctx: CanvasRenderingContext2D, size: Vector2): void;
  abstract reCalc(): void;

  /**
   * index番目の座標を設定する
   * @param index
   * @param coord
   */
  set(index: number, coord: Vector2) {
    this._ps.set(index, coord);
  }
  setX(index: number, x: number) {
    this._ps.setX(index, x);
  }
  setY(index: number, y: number) {
    this._ps.setY(index, y);
  }
  /**
   * Pointが動かされた際に左から順になっている配列に直す
   * @param draggingId 動かされたPointのid
   * @returns 動かされたPointのidを更新して変えす
   */
  sort(draggingId: number): number {
    return this._ps.sort(draggingId);
  }

  /**
   * index番目のPointを選択
   * @param index
   */
  select(index: number) {
    this._ps.select(index);
  }
  /**
   * すべてを非選択にする
   */
  unselectAll() {
    this._ps.unselectAll();
  }

  get ps(): Points {
    return this._ps;
  }
  mouseHit(m: Vector2, scale: Vector2): number {
    const selectedId = this._ps.mouseHit(m, scale);
    if (selectedId >= 0) {
      this.select(selectedId);
    }
    return selectedId;
  }
}

export type CurveType = "gaussian" | "spline";
