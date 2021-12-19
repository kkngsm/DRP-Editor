import { Vector2 } from "three";
import Gaussian from "./gaussian";
import { Points } from "./point";
import { Spline2D } from "./spline";

export type CurveType = "gaussian" | "spline";

export class Plot {
  private _draggingId: number;
  private _mousePos?: Vector2;
  constructor(
    private canvas: HTMLElement,
    private size: Vector2,
    private origin: Vector2,
    public scale: Vector2,
    private _curve: CurveType,
    private _ps?: Points,
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
    this._ps = ps;
    this._spline = Spline2D.createFromPoints(ps);
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
          this._spline.draw(ctx, this.origin, this.scale);
        }
        break;
    }
    this.drawTick(ctx);
    ctx.stroke();
    if (this._ps != undefined) {
      this._ps.draw(ctx, this.origin, this.scale);
    }
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
  private mouseHit(): number {
    if (!this._ps || !this._mousePos) return -1;
    const m = new Vector2(
      this._mousePos.x - this.origin.x,
      this.origin.y - this._mousePos.y
    );
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
  /**
   * マウスをクリックした際に呼び出される関数
   * @param e MouseEvent
   */
  onDown() {
    if (this._ps == undefined) return;
    this._ps.unselectAll();

    const selecteId: number = this.mouseHit();
    if (selecteId >= 0) {
      this._ps.select(selecteId);
      this._draggingId = selecteId;
    }
  }

  /**
   * マウスをクリックした際に呼び出される関数
   *
   * @param e MouseEvent
   */
  onMove(e: MouseEvent) {
    if (this._ps == undefined) return;
    const offsetX = this.canvas.getBoundingClientRect().left;
    const offsetY = this.canvas.getBoundingClientRect().top;
    this._mousePos = new Vector2(e.clientX - offsetX, e.clientY - offsetY);
    if (this._draggingId >= 0) {
      // 移動先がグラフ上にあるかどうか
      const [x, y] = this.contain(this._mousePos);
      // グラフの範囲内で移動させる
      if (x) {
        this._ps.setX(
          this._draggingId,
          (this._mousePos.x - this.origin.x) / this.scale.x
        );
      }
      if (y) {
        this._ps.setY(
          this._draggingId,
          (this.origin.y - this._mousePos.y) / this.scale.y
        );
        //最大Yをセットする
      }
      this._draggingId = this._ps.sort(this._draggingId);
      // スプライン曲線の再計算
      if (this._spline != undefined) {
        this._spline.x.init(this._ps.xs);
        this._spline.y.init(this._ps.ys);
      }
      // 正規分布曲線を再計算
      if (this._gaussian != undefined) {
        const p = this._ps.indexOf(0);
        this._gaussian.inverseCalcOnSd(p.x, p.y);
      }
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
    this._draggingId = -1;
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
