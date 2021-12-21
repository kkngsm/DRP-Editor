import { Vector2 } from "three";
import { Color, CurveType } from "./curve";
import Gaussian from "./gaussian";
import { Points } from "./point";
import { Spline2D } from "./spline";

export type PointId = {
  color: "None" | keyof CurveRGB;
  id: number;
};
export const NonePointId: PointId = {
  color: "None",
  id: -1,
};

const RGB: (keyof CurveRGB)[] = [
  "_red" as keyof CurveRGB,
  "_green" as keyof CurveRGB,
  "_blue" as keyof CurveRGB,
];

export class CurveRGB {
  private _type: CurveType;
  constructor(
    private _red: Spline2D | Gaussian,
    private _green: Spline2D | Gaussian,
    private _blue: Spline2D | Gaussian
  ) {
    this._red.color = "red";
    this._green.color = "green";
    this._blue.color = "blue";
    if (
      this._red instanceof Spline2D &&
      this._green instanceof Spline2D &&
      this._green instanceof Spline2D
    ) {
      this._type = "spline";
    } else if (
      this._red instanceof Gaussian &&
      this._green instanceof Gaussian &&
      this._blue instanceof Gaussian
    ) {
      this._type = "gaussian";
    }
  }
  reCalc() {
    RGB.forEach((e) => {
      const curve = this[e];
      if (curve instanceof Spline2D || curve instanceof Gaussian) {
        curve.reCalc();
      }
    });
  }
  draw(
    ctx: CanvasRenderingContext2D,
    origin: Vector2,
    size: Vector2,
    scale: Vector2
  ) {
    RGB.forEach((e) => {
      const curve = this[e];
      if (curve instanceof Spline2D || curve instanceof Gaussian) {
        curve.draw(ctx, origin, size, scale);
      }
    });
  }
  setX(id: PointId, y: number): void {
    if (id.color != "None") {
      const curve = this[id.color as keyof CurveRGB];
      if (curve instanceof Spline2D || curve instanceof Gaussian) {
        curve.setX(id.id, y);
      }
    } else {
      throw new Error("setX : A non-existent ID was specified.");
    }
  }
  setY(id: PointId, y: number): void {
    if (id.color != "None") {
      const curve = this[id.color as keyof CurveRGB];
      if (curve instanceof Spline2D || curve instanceof Gaussian) {
        curve.setY(id.id, y);
      }
    } else {
      throw new Error("setY : A non-existent ID was specified.");
    }
  }

  sort(id: PointId): PointId | void {
    if (id.color != "None") {
      const curve = this[id.color as keyof CurveRGB];
      if (curve instanceof Spline2D || curve instanceof Gaussian) {
        id.id = curve.sort(id.id);
        return id;
      }
    } else {
      throw new Error("sort : A non-existent ID was specified.");
    }
  }
  unselectAll() {
    RGB.forEach((e) => {
      const curve = this[e];
      if (curve instanceof Spline2D || curve instanceof Gaussian) {
        curve.unselectAll();
      }
    });
  }
  static convertToSplineFromGaussian(gaussianRGB: CurveRGB) {
    if (gaussianRGB.type == "gaussian") {
      const resultRgb: Spline2D[] = [];
      RGB.map((e) => {
        const g = gaussianRGB[e];
        if (g instanceof Gaussian) {
          const xs = [0, 0.6, 1.66, 3, 5].map((e) => e * g.sigma);
          const ys = xs.map((e) => g.calc(e));
          const ps = Points.create(xs, ys);
          const col = e.slice(1) as Color;
          resultRgb.push(new Spline2D(ps, col));
        }
      });
      return new CurveRGB(resultRgb[0], resultRgb[1], resultRgb[2]);
    } else {
      throw new Error("The argument could not be converted");
    }
  }
  get r(): Spline2D | Gaussian {
    return this._red;
  }
  get g(): Spline2D | Gaussian {
    return this._green;
  }
  get b(): Spline2D | Gaussian {
    return this._blue;
  }
  get type(): CurveType {
    return this._type;
  }
  mouseHit(m: Vector2, scale: Vector2): PointId {
    for (let i = 0; i < RGB.length; i++) {
      const curve = this[RGB[i]];
      if (curve instanceof Spline2D || curve instanceof Gaussian) {
        const selectedId = curve.ps.mouseHit(m, scale);
        if (selectedId >= 0) {
          curve.select(selectedId);
          return { color: RGB[i], id: selectedId };
        }
      }
    }
    return NonePointId;
  }
  getWeight(size: number): number[] | undefined {
    if (
      this._red instanceof Gaussian &&
      this._green instanceof Gaussian &&
      this._blue instanceof Gaussian
    ) {
      const r = this._red.getWeight(size);
      const g = this._green.getWeight(size);
      const b = this._blue.getWeight(size);
      const result = new Array(size * 3);
      for (let i = 0; i < size; i++) {
        result[i * 3] = r[i];
        result[i * 3 + 1] = g[i];
        result[i * 3 + 2] = b[i];
      }
      return result;
    }
  }
}
