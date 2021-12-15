import type { Points } from "./point";
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
  culc(t: number) {
    let j: number = Math.floor(t); // 小数点以下切捨て
    if (j < 0) j = 0;
    else if (j >= this.num) j = this.num - 1; // 丸め誤差を考慮

    const dt: number = t - j;
    return this.a[j] + (this.b[j] + (this.c[j] + this.d[j] * dt) * dt) * dt;
  }
}

export class Spline2D {
  x: SplineAxis;
  y: SplineAxis;
  constructor(x: SplineAxis, y: SplineAxis) {
    if (x.length == y.length) {
      this.x = x;
      this.y = y;
    } else {
      throw "The length of 2 variables are different";
    }
  }

  static createFromArrays(xs: number[], ys: number[]): Spline2D {
    return new Spline2D(new SplineAxis(xs), new SplineAxis(ys));
  }
  static createFromPoints(ps: Points): Spline2D {
    return new Spline2D(new SplineAxis(ps.xs), new SplineAxis(ps.ys));
  }
  draw(ctx: CanvasRenderingContext2D, canvasHeight: number) {
    ctx.beginPath();
    ctx.moveTo(this.x.culc(0), canvasHeight - this.y.culc(0));
    const num = this.x.num;
    for (let t = 0.02; t <= num - 1; t += 0.02) {
      ctx.lineTo(this.x.culc(t), canvasHeight - this.y.culc(t));
    }
    ctx.stroke();
  }
}
