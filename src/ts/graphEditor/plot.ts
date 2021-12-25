import { Vector2 } from "three";
import { CurveType } from "./curve";
import { CurveRGB, NonePointId, PointId, rgbWeight } from "./curveRGB";
import Gaussian from "./gaussian";
import { Points } from "./point";
import { Spline2D } from "./spline";

export class Plot {
  private _mousePos?: Vector2;
  private _draggingId: PointId;
  private _selectedId: PointId;

  constructor(
    private canvas: HTMLElement,
    private size: Vector2,
    public scale: Vector2,
    private _curve: CurveType,
    private _spline?: CurveRGB,
    private _gaussian?: CurveRGB
  ) {
    this._draggingId = NonePointId;
    this._selectedId = NonePointId;
  }
  /**
   * 3次スプライン曲線を追加する
   * @param ps 3次スプライン曲線のもとになるポイント
   */
  setSpline(r: Points, g: Points, b: Points) {
    this._spline = new CurveRGB(
      new Spline2D(r),
      new Spline2D(g),
      new Spline2D(b)
    );
  }
  /**
   * ガウシアン曲線を追加する
   * @param g ガウシアン曲線のもとにクラス
   */
  setGausssian(r: Gaussian, g: Gaussian, b: Gaussian) {
    this._gaussian = new CurveRGB(r, g, b);
  }

  /**
   * キャンバスにグラフを描画する
   * @param ctx 描画するキャンバスの2Dコンテキスト
   */
  draw(ctx: CanvasRenderingContext2D) {
    const h = this.canvas.clientHeight;
    ctx.clearRect(0, 0, this.canvas.clientWidth, h);
    this.drawTick(ctx);

    switch (this._curve) {
      case "gaussian":
        this._gaussian?.draw(ctx, this.size, this.scale);
        break;
      case "spline":
        this._spline?.draw(ctx, this.size, this.scale);
        break;
    }
  }

  /**
   * メモリを描画する
   * @param ctx 描画するキャンバスの2Dコンテキスト
   */
  private drawTick(ctx: CanvasRenderingContext2D) {
    const top = this.size.y - this.size.y;
    const right = this.size.x;
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.moveTo(0, top);
    ctx.lineTo(0, this.size.y);
    ctx.lineTo(right, this.size.y);

    const unitX = 1;
    const unitY = 0.1;
    const canvasUnitX = unitX * this.scale.x;
    const canvasUnitY = unitY * this.scale.y;

    const countX = this.size.x / canvasUnitX;
    for (let x = 0; x <= countX; x += 1) {
      const fx = Math.floor(x * canvasUnitX);
      ctx.moveTo(fx, top);
      ctx.lineTo(fx, this.size.y);
    }
    const countY = this.size.y / canvasUnitY;
    for (let y = 0; y <= countY; y += 1) {
      const fy = this.size.y - Math.floor(y * canvasUnitY);
      ctx.moveTo(0, fy);
      ctx.lineTo(right, fy);
    }
    ctx.stroke();
  }

  /**
   * マウスクリックしたかどうか、クリックされたPointがどれかを返す
   * @param ctx 描画するキャンバスの2Dコンテキスト
   * @return Pointsのindexを返す。存在しない場合は-1
   */
  private mouseHit() {
    if (!this._mousePos) return;
    const m = new Vector2(this._mousePos.x, this.size.y - this._mousePos.y);
    const c = this[this.modeJudge()];
    if (c instanceof CurveRGB) {
      this._selectedId = c.mouseHit(m, this.scale);
      this._draggingId = this._selectedId;
    }
  }
  /**
   * マウスをクリックした際に呼び出される関数
   * @param e MouseEvent
   */
  onDown() {
    this._spline?.unselectAll();
    this._gaussian?.unselectAll();
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
    this.move();
    this.reCalc();
  }

  mouseLeave() {
    this.draggOff();
    this._mousePos = undefined;
  }

  /**
   * ドラッグを解除するための関数
   */
  draggOff() {
    this._draggingId = {
      color: "None",
      id: -1,
    };
  }

  /**
   * vがこのプロットの範囲内にあるかどうかを返す
   * @param v: ベクトル
   * @return [x軸で範囲内にあるかどうか, y軸で範囲内にあるかどうか]
   */
  contain(v: Vector2): { x: boolean; y: boolean } {
    const edge = new Vector2(this.size.x, this.size.y - this.size.y);

    return {
      x: 0 < v.x && v.x < edge.x,
      y: edge.y < v.y && v.y < this.size.y,
    };
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
  convertToSpline() {
    this._curve = "spline";
    if (this._gaussian) {
      this._spline = CurveRGB.convertToSplineFromGaussian(this._gaussian);
    }
  }
  private move() {
    if (this._draggingId.color == "None") return;
    if (this._mousePos) {
      const { x, y }: { x: boolean; y: boolean } = this.contain(this._mousePos);
      const c = this[this.modeJudge()];
      if (c instanceof CurveRGB) {
        if (x) {
          c.setX(this._draggingId, this._mousePos.x / this.scale.x);
        }
        if (y) {
          c.setY(
            this._draggingId,
            (this.size.y - this._mousePos.y) / this.scale.y
          );
        }
        this._draggingId = <PointId>c.sort(this._draggingId);
      }
    }
  }
  private reCalc() {
    const c = this[this.modeJudge()];
    if (c instanceof CurveRGB) {
      c.reCalc();
    }
  }
  private modeJudge(): keyof Plot {
    return this._curve == "spline"
      ? ("_spline" as keyof Plot)
      : ("_gaussian" as keyof Plot);
  }

  getWeight(size: number): rgbWeight | undefined {
    return this._gaussian?.getWeight(size);
  }
}
