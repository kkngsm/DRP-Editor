"use strict";
import { Vector2 } from "three";
import Gaussian from "./gaussian";
import Plot from "./plot";
import { Points } from "./point";
import { Spline2D } from "./spline";

window.onload = () => {
  const canvas = <HTMLCanvasElement>document.getElementById("graph");
  const ctx = <CanvasRenderingContext2D>canvas.getContext("2d");

  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 5;
  ctx.shadowColor = "rgb(50, 50, 50)";
  ctx.shadowBlur = 5;

  const g = new Gaussian(1, 0);
  const xs: number[] = [0, 1, 2, 3, 4, 5];
  const ys: number[] = xs.map((e) => g.calc(e)); //[10, 20, 30, 50, 70, 40, 30, 20, 50];

  const plot = new Plot(
    canvas,
    new Vector2(500, 300),
    new Vector2(20, 20),
    new Vector2(100, 300),
    Points.create(xs, ys),
    Spline2D.createFromArrays(xs, ys),
    g
  );

  draw(0);
  function draw(t: number) {
    plot.draw(ctx);
    requestAnimationFrame((time) => draw(time));
  }
  canvas.addEventListener("mousedown", (e) => plot.onDown(e));
  canvas.addEventListener("mouseup", () => plot.onUp());
  canvas.addEventListener("mousemove", (e) => plot.onMove(e));
  canvas.addEventListener("mouseleave", () => plot.mouseLeave());
};
