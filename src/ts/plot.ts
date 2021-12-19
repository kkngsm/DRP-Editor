import { Vector2 } from "three";
import Gaussian from "./gaussian";
import { Points } from "./point";
import { Spline2D } from "./spline";

export type CurveType = "gaussian" | "spline";

export class Plot {
  private _mousePos?: Vector2;
  constructor(
    private canvas: HTMLElement,
    private size: Vector2,
    private origin: Vector2,
    public scale: Vector2,
    private _curve: CurveType,
    private _spline?: Spline2D,
    private _gaussian?: Gaussian
  ) {
    this.origin = new Vector2(50, canvas.clientHeight - 50);
  }
  /**
   * 3次スプライン曲線を追加する
   * @param ps 3次スプライン曲線のもとになるポイント
   */
  addSpline(ps: Points) {
    this._spline = new Spline2D(ps);
  }
  /**
   * ガウシアン曲線を追加する
   * @param g ガウシアン曲線のもとにクラス
   */
  addGausssian(g: Gaussian) {
    this._gaussian = g;
  }

  /**
   * キャンバスにグラフを描画する
   * @param ctx 描画するキャンバスの2Dコンテキスト
   */
  draw(ctx: CanvasRenderingContext2D) {
    const h = this.canvas.clientHeight;
    ctx.clearRect(0, 0, this.canvas.clientWidth, h);
    ctx.beginPath();
    switch (this._curve) {
      case "gaussian":
        if (this._gaussian != undefined) {
          this._gaussian.draw(ctx, this.origin, this.size, this.scale);
        }
        break;
      case "spline":
        if (this._spline != undefined) {
          this._spline.draw(ctx, this.origin, this.size, this.scale);
        }
        break;
    }
    this.drawTick(ctx);
    ctx.stroke();
  }

  /**
   * メモリを描画する
   * @param ctx 描画するキャンバスの2Dコンテキスト
   */
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
    for (let x = 0; x <= countX; x += 1) {
      const fx = this.origin.x + Math.floor(x * canvasUnitX);
      ctx.moveTo(fx, top);
      ctx.lineTo(fx, this.origin.y);
    }
    const countY = this.size.y / canvasUnitY;
    for (let y = 0; y <= countY; y += 1) {
      const fy = this.origin.y - Math.floor(y * canvasUnitY);
      ctx.moveTo(this.origin.x, fy);
      ctx.lineTo(right, fy);
    }
  }

  /**
   * マウスクリックしたかどうか、クリックされたPointがどれかを返す
   * @param ctx 描画するキャンバスの2Dコンテキスト
   * @return Pointsのindexを返す。存在しない場合は-1
   */
  private mouseHit() {
    if (!this._mousePos) return;
    const m = new Vector2(
      this._mousePos.x - this.origin.x,
      this.origin.y - this._mousePos.y
    );
    switch (this._curve) {
      case "gaussian":
        return;
      case "spline": {
        if (this._spline != undefined) {
          this._spline.mouseHit(m, this.scale);
        }
      }
    }
  }
  /**
   * マウスをクリックした際に呼び出される関数
   * @param e MouseEvent
   */
  onDown() {
    if (this._spline == undefined) return;
    this._spline.unselectAll();

    this.mouseHit();
  }

  /**
   * マウスをクリックした際に呼び出される関数
   *
   * @param e MouseEvent
   */
  onMove(e: MouseEvent) {
    const offsetX = this.canvas.getBoundingClientRect().left;
    const offsetY = this.canvas.getBoundingClientRect().top;
    this._mousePos = new Vector2(e.clientX - offsetX, e.clientY - offsetY);
    if (this._spline != undefined) {
      this._spline.move(
        this._mousePos,
        this.contain(this._mousePos), // 移動先がグラフ上にあるかどうか
        this.origin,
        this.scale
      );
      this._spline.init();
    }
    if (this._gaussian != undefined) {
      this._gaussian.move(
        this._mousePos,
        this.contain(this._mousePos), // 移動先がグラフ上にあるかどうか
        this.origin,
        this.scale
      );
    }
  }

  mouseLeave() {
    this.draggOff();
    this._mousePos = undefined;
  }

  /**
   * ドラッグを解除するための関数
   */
  draggOff() {
    if (this._spline != undefined) {
      this._spline.dragReset();
    }
    if (this._gaussian != undefined) {
      this._gaussian.dragReset();
    }
  }

  /**
   * vがこのプロットの範囲内にあるかどうかを返す
   * @param v: ベクトル
   * @return [x軸で範囲内にあるかどうか, y軸で範囲内にあるかどうか]
   */
  contain(v: Vector2): boolean[] {
    const edge = new Vector2(
      this.origin.x + this.size.x,
      this.origin.y - this.size.y
    );

    return [
      this.origin.x < v.x && v.x < edge.x,
      edge.y < v.y && v.y < this.origin.y,
    ];
  }
  setScaleX(x: number) {
    this.scale.x = x;
  }
  changeGaussian() {
    this._curve = "gaussian";
  }
  changeSpline() {
    this._curve = "spline";
  }
}
