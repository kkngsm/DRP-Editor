import { Vector2 } from "three";
import { Points } from "./point";

export abstract class Curve {
  protected _draggingId: number;
  constructor(protected _ps: Points) {
    this._draggingId = -1;
  }
  abstract draw(
    ctx: CanvasRenderingContext2D,
    origin: Vector2,
    size: Vector2,
    scale: Vector2
  ): void;

  /**
   * index番目のPointを非選択
   * @param index
   */
  unselect(index: number) {
    this._ps.unselect(index);
  }

  /**
   * index番目の座標を設定する
   * @param index
   * @param coord
   */
  set(index: number, coord: Vector2) {
    this._ps.set(index, coord);
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
  setX(index: number, x: number) {
    this._ps.setX(index, x);
  }
  mouseHit(m: Vector2, scale: Vector2) {
    const selectedId = this._ps.mouseHit(m, scale);
    this._draggingId = selectedId;
    if (selectedId >= 0) {
      this.select(selectedId);
      console.log(this._ps.indexOf(selectedId));
    }
  }
  move(mousePos: Vector2, [x, y]: boolean[], origin: Vector2, scale: Vector2) {
    if (this._draggingId >= 0) {
      // グラフの範囲内で移動させる
      if (x) {
        this.setX(this._draggingId, (mousePos.x - origin.x) / scale.x);
      }
      if (y) {
        this.setY(this._draggingId, (origin.y - mousePos.y) / scale.y);
        //最大Yをセットする
      }
      this._draggingId = this.sort(this._draggingId);
    }
  }
  dragReset() {
    this._draggingId = -1;
  }
}
