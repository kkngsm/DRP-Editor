import { Vector2 } from "three";

export default class Gaussian {
  constructor(private sigma: number, private mu: number) {}
  calc(x: number): number {
    return (
      (1 / (this.sigma * Math.sqrt(2 * Math.PI))) *
      Math.exp(-((x - this.mu) ** 2) / (2 * this.sigma ** 2))
    );
  }
  inverseCalcOnSd(x: number, y: number): number {
    return (
      Math.exp(-((x - this.mu) ** 2) / (2 * y ** 2)) /
      (y * Math.sqrt(2 * Math.PI))
    );
  }

  draw(
    ctx: CanvasRenderingContext2D,
    origin: Vector2,
    size: Vector2,
    scale: Vector2
  ) {
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y - this.calc(0) * scale.y);
    for (let t = 0.02; t <= size.x; t += 0.02) {
      ctx.lineTo(origin.x + t * scale.x, origin.y - this.calc(t) * scale.y);
    }
    ctx.stroke();
  }
}