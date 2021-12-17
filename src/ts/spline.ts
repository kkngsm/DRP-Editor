import { Vector2 } from "three";
import type { Points } from "./point";
/**
 * ある軸における3次スプラインの計算
 */
export class SplineAxis {
  length: number;
  num: number;
  a: number[];
  b: number[];
  c: number[];
  d: number[];
  constructor(sp: number[]) {
    this.init(sp);
  }
  /**
   * 係数a, b, c, dを設定する
   * @param sp ある軸における数値の配列
   */
  init(sp: number[]) {
    this.length = sp.length;
    this.num = sp.length - 1;

    // ３次多項式の0次係数(a)を設定
    this.a = sp.concat();

    // ３次多項式の2次係数(c)を計算
    // 連立方程式を解く。
    // 但し、一般解法でなくスプライン計算にチューニングした方法
    this.c = new Array(this.num);
    this.c[0] = 0.0;
    this.c[this.num] = 0.0;
    for (let i = 1; i < this.num; i++) {
      this.c[i] = 3.0 * (this.a[i - 1] - 2.0 * this.a[i] + this.a[i + 1]);
    }

    const w: number[] = new Array(sp.length);
    // 左下を消す
    w[0] = 0.0;
    for (let i = 1; i < this.num; i++) {
      const tmp = 4.0 - w[i - 1];
      this.c[i] = (this.c[i] - this.c[i - 1]) / tmp;
      w[i] = 1.0 / tmp;
    }
    // 右上を消す
    for (let i = this.num - 1; i > 0; i--) {
      this.c[i] = this.c[i] - this.c[i + 1] * w[i];
    }

    this.b = new Array(sp.length);
    this.d = new Array(sp.length);
    // ３次多項式の1次係数(b)と3次係数(d)を計算
    this.b[this.num] = 0.0;
    this.d[this.num] = 0.0;
    for (let i = 0; i < this.num; i++) {
      this.d[i] = (this.c[i + 1] - this.c[i]) / 3.0;
      this.b[i] = this.a[i + 1] - this.a[i] - this.c[i] - this.d[i];
    }
  }
  /**
   * 係数を元に補完値を返す
   * @param t
   * @returns 補完値
   */
  calc(t: number) {
    let j: number = Math.floor(t); // 小数点以下切捨て
    if (j < 0) j = 0;
    else if (j >= this.num) j = this.num - 1; // 丸め誤差を考慮

    const dt: number = t - j;
    return this.a[j] + (this.b[j] + (this.c[j] + this.d[j] * dt) * dt) * dt;
  }
}

/**
 * 2Dの3次スプライン曲線
 */
export class Spline2D {
  x: SplineAxis;
  y: SplineAxis;
  constructor(x: SplineAxis, y: SplineAxis) {
    if (x.length == y.length) {
      this.x = x;
      this.y = y;
    } else {
      throw new Error("The length of the two arguments is different");
    }
  }
  /**
   * 二つの配列から生成する
   * @param xs
   * @param ys
   * @returns Spline2D
   */
  static createFromArrays(xs: number[], ys: number[]): Spline2D {
    if (xs.length == ys.length) {
      throw new Error("The length of the two arguments is different");
    }
    return new Spline2D(new SplineAxis(xs), new SplineAxis(ys));
  }
  /**
   * Pointsから生成する
   * @param ps Points
   * @returns Spline2D
   */
  static createFromPoints(ps: Points): Spline2D {
    return new Spline2D(new SplineAxis(ps.xs), new SplineAxis(ps.ys));
  }
  /**
   * 3次スプライン曲線を描画する
   * @param ctx 描画先の2Dコンテキスト
   * @param origin 原点
   * @param scale 拡大率
   */
  draw(ctx: CanvasRenderingContext2D, origin: Vector2, scale: Vector2) {
    ctx.moveTo(
      origin.x + this.x.calc(0) * scale.x,
      origin.y - this.y.calc(0) * scale.y
    );
    const num = this.x.num;
    for (let t = 0.1; t <= num; t += 0.1) {
      ctx.lineTo(
        origin.x + this.x.calc(t) * scale.x,
        origin.y - this.y.calc(t) * scale.y
      );
    }
  }
}
