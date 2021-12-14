"use strict";
import Plot from "./plot.js";
import Point from "./point.js";
import SplineAxis from "./spline.js";

window.onload = () => {
  const canvas = <HTMLCanvasElement>document.getElementById("graph");
  const ctx = <CanvasRenderingContext2D>canvas.getContext("2d");

  const xs: number[] = [0, 100, 200, 300, 400, 500];
  const ys: number[] = xs.map((e) => gaussian(1, 0, e * 0.01) * 100); //[10, 20, 30, 50, 70, 40, 30, 20, 50];
  const ps = xs.map((e, i) => new Point(e, ys[i]));

  const plot = new Plot(
    ps,
    canvas,
    ctx,
    new SplineAxis(xs),
    new SplineAxis(ys)
  );
  draw(0);
  function draw(t: number) {
    plot.draw();
    drawGaussian(1, 0);
    requestAnimationFrame((time) => draw(time));
  }
  canvas.addEventListener("mousedown", (e) => plot.onDown(e, canvas));
  canvas.addEventListener("mouseup", () => plot.onUp());
  canvas.addEventListener("mousemove", (e) => plot.onMove(e, canvas));
  canvas.addEventListener("mouseleave", () => plot.mouseLeave());

  function drawGaussian(sigma: number, mu: number) {
    ctx.beginPath();
    ctx.moveTo(0, canvas.clientHeight - gaussian(sigma, mu, 0) * 100);
    for (let t = 0.02; t <= 100; t += 0.02) {
      ctx.lineTo(t * 100, canvas.clientHeight - gaussian(sigma, mu, t) * 100);
    }
    ctx.stroke();
  }
};

function gaussian(sigma: number, mu: number, x: number): number {
  return (
    (1 / (sigma * Math.sqrt(2 * Math.PI))) *
    Math.exp(-((x - mu) ** 2) / (2 * sigma ** 2))
  );
}

function inverseGaussian(y: number, mu: number, x: number): number {
  return (
    Math.exp(-((x - mu) ** 2) / (2 * y ** 2)) / (y * Math.sqrt(2 * Math.PI))
  );
}
