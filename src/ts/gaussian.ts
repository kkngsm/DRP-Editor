import { Vector2 } from "three";
import { Curve } from "./curve";
import { Point, Points } from "./point";

export default class Gaussian extends Curve {
  private _sigma: number;
  private _mu: number;
  constructor(p: Point) {
    super(new Points([p]));
    this._mu = 0;
    this.inverseCalcOnSd();
  }

  static createFromSdAndMean(sigma: number, mu: number): Gaussian {
    const x = 1;
    const y = Math.exp(-((x - mu) ** 2) / (2 * sigma ** 2));
    return new Gaussian(new Point(x, y));
  }
  /**
   * 正規分布の関数
   * @param x
   */
  calc(x: number): number {
    return Math.exp(-((x - this._mu) ** 2) / (2 * this._sigma ** 2));
  }
  /**
   * 正規分布の関数を_sigmaについて解き、_sigmaを設定する
   * @param x
   * @param y
   */
  inverseCalcOnSd(): number | void {
    const p = this._ps.indexOf(0);
    const s2 = -((p.x - this._mu) ** 2) / (2 * Math.log(p.y));
    if (s2 >= 0) {
      this._sigma = Math.sqrt(s2);
      return this._sigma;
    } else {
      console.log("this answer is imaginary number");
    }
  }
  /**
   * 正規分布を描画する
   */
  draw(
    ctx: CanvasRenderingContext2D,
    origin: Vector2,
    size: Vector2,
    scale: Vector2
  ) {
    ctx.moveTo(origin.x, origin.y - this.calc(0) * scale.y);
    const maxX = size.x / scale.x;
    for (let t = 0.1; t <= maxX; t += 0.1) {
      ctx.lineTo(origin.x + t * scale.x, origin.y - this.calc(t) * scale.y);
    }
    this._ps.draw(ctx, origin, scale);
  }
  get sigma() {
    return this._sigma;
  }
}
