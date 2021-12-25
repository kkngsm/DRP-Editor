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
  private size: Vector2;
  private ctx: CanvasRenderingContext2D;
  private _spline?: CurveRGB;
  private _gaussian?: CurveRGB;
  constructor(
    private canvas: HTMLCanvasElement,
    private _kernelSize: number,
    private _curve: CurveType
  ) {
    this.ctx = <CanvasRenderingContext2D>this.canvas.getContext("2d");

    this.size = new Vector2(500, 300);

    this.ctx.lineWidth = 2;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    this.canvas.width = this.size.x;
    this.canvas.height = this.size.y;

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
   */
  draw() {
    this.ctx.clearRect(0, 0, this.size.x, this.size.y);
    this.drawTick();
    switch (this._curve) {
      case "gaussian":
        this._gaussian?.draw(this.ctx, this.size);
        break;
      case "spline":
        this._spline?.draw(this.ctx, this.size);
        break;
    }
  }

  /**
   * メモリを描画する
   * @param ctx 描画するキャンバスの2Dコンテキスト
   */
  private drawTick() {
    const top = this.size.y - this.size.y;
    const right = this.size.x;
    this.ctx.beginPath();
    this.ctx.strokeStyle = "black";
    this.ctx.moveTo(0, top);
    this.ctx.lineTo(0, this.size.y);
    this.ctx.lineTo(right, this.size.y);

    const unit = new Vector2().copy(this.size).divideScalar(this._kernelSize);
    const countX = this.size.x / unit.x;
    for (let x = 0; x <= countX; x += 1) {
      const fx = Math.floor(x * unit.x);
      this.ctx.moveTo(fx, top);
      this.ctx.lineTo(fx, this.size.y);
    }
    const countY = this.size.y / unit.y;
    for (let y = 0; y <= countY; y += 1) {
      const fy = this.size.y - Math.floor(y * unit.y);
      this.ctx.moveTo(0, fy);
      this.ctx.lineTo(right, fy);
    }
    this.ctx.stroke();
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
      this._selectedId = c.mouseHit(m, this.size);
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
  setKernelSize(x: number) {
    this._kernelSize = x;
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
          c.setX(this._draggingId, this._mousePos.x / this.size.x);
        }
        if (y) {
          c.setY(
            this._draggingId,
            (this.size.y - this._mousePos.y) / this.size.y
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

  get domElement(): HTMLCanvasElement {
    return this.canvas;
  }
}
