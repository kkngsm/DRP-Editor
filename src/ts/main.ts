"use strict";
import { Vector2 } from "three";
import Gaussian from "./gaussian";
import Plot from "./plot";
import { Points } from "./point";

window.onload = () => {
  const canvas = <HTMLCanvasElement>document.getElementById("graph");
  const ctx = <CanvasRenderingContext2D>canvas.getContext("2d");

  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 5;
  ctx.shadowColor = "rgb(200, 200, 200)";
  ctx.shadowBlur = 5;

  const g = new Gaussian(1, 0);
  // const xs: number[] = [0, 0.6, 1.69, 3, 5];
  const xs: number[] = [0];
  const ys: number[] = [0]; // xs.map((e) => g.calc(e));

  const plot = new Plot(
    canvas,
    new Vector2(500, 300),
    new Vector2(20, 20),
    new Vector2(100, 300),
    Points.create(xs, ys)
  );
  const x = 1;
  console.log(g.inverseCalcOnSd(x, g.calc(x)));
  plot.addGausssian(g);
  draw(0);
  function draw(t: number) {
    plot.draw(ctx);
    requestAnimationFrame((time) => draw(time));
  }
  canvas.addEventListener("mousedown", (e) => plot.onDown(e));
  canvas.addEventListener("mouseup", () => plot.draggOff());
  canvas.addEventListener("mousemove", (e) => plot.onMove(e));
  canvas.addEventListener("mouseleave", () => plot.draggOff());
};
