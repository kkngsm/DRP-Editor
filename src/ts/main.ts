"use strict";

import { Plot, Point } from "./point.js";
import SplineAxis from "./spline.js";

window.onload = () => {
  const canvas = <HTMLCanvasElement>document.getElementById("graph");
  const ctx = <CanvasRenderingContext2D>canvas.getContext("2d");

  const xs: number[] = [20, 60, 100, 140, 180, 220, 260, 300, 340];
  const ys: number[] = [10, 20, 30, 50, 70, 40, 30, 20, 50];

  const ps = xs.map((e, i) => new Point(e, ys[i]));

  const plot = new Plot(
    ps,
    canvas,
    ctx,
    new SplineAxis(xs),
    new SplineAxis(ys)
  );
  plot.draw(0);
  canvas.addEventListener("mousedown", (e) => plot.onDown(e, canvas));
  canvas.addEventListener("mouseup", () => plot.onUp());
  canvas.addEventListener("mousemove", (e) => plot.onMove(e, canvas));
  canvas.addEventListener("mouseleave", () => plot.mouseLeave());
};
