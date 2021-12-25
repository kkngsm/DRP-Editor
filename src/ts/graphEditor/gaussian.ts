import { Vector2 } from "three";
import { Color, Curve } from "./curve";
import { Point, Points } from "./point";

export default class Gaussian extends Curve {
  private _sigma: number;
  private _mu: number;
  constructor(p: Point, _color?: Color) {
    super(new Points([p]), _color);
    this._mu = 0;
    this.reCalc();
  }

  static createFromSdAndMean(sigma: number, mu: number): Gaussian {
    const x = 0.3;
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
  reCalc(): number | never {
    const p = this._ps.indexOf(0);
    const s2 = -((p.x - this._mu) ** 2) / (2 * Math.log(p.y));
    if (s2 >= 0) {
      this._sigma = Math.sqrt(s2);
      return this._sigma;
    } else {
      throw new Error("this answer is imaginary number");
    }
  }

  /**
   * 正規分布を描画する
   */
  draw(ctx: CanvasRenderingContext2D, size: Vector2) {
    ctx.strokeStyle = this.color ? this.color : "black";
    ctx.beginPath();
    ctx.moveTo(0, size.y - this.calc(0) * size.y);
    for (let t = 0.02; t <= 1.02; t += 0.02) {
      ctx.lineTo(0 + t * size.x, size.y - this.calc(t) * size.y);
    }
    ctx.stroke();
    this._ps.draw(ctx, size, this.color);
  }
  get sigma() {
    return this._sigma;
  }
  getWeight(size: number) {
    return new Array(size).fill(0).map((e, i) => this.calc(i / size));
  }
}
