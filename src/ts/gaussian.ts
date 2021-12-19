import { Vector2 } from "three";
import { Curve } from "./curve";
import { Points } from "./point";

export default class Gaussian extends Curve {
  constructor(private sigma: number, private mu: number, ps: Points) {
    super(ps);
  }
  /**
   * 正規分布の関数
   * @param x
   */
  calc(x: number): number {
    return Math.exp(-((x - this.mu) ** 2) / (2 * this.sigma ** 2));
    // (this.sigma * Math.sqrt(2 * Math.PI))
  }
  /**
   * 正規分布の関数をsigmaについて解き、sigmaを設定する
   * @param x
   * @param y
   */
  inverseCalcOnSd(): number | void {
    const p = this._ps.indexOf(0);
    const s2 = -((p.x - this.mu) ** 2) / (2 * Math.log(p.y));
    if (s2 >= 0) {
      this.sigma = Math.sqrt(s2);
      return this.sigma;
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
}
