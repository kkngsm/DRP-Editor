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

  // const xs: number[] = [0, 0.6, 1.69, 3, 5];
  const xs: number[] = [0.5];
  const ys: number[] = [0.5]; // xs.map((e) => g.calc(e));

  const g = new Gaussian(1, 0);
  g.inverseCalcOnSd(xs[0], ys[0]);
  const ps = Points.create(xs, ys);
  const plot = new Plot(
    canvas,
    new Vector2(500, 300),
    new Vector2(20, 20),
    new Vector2(100, 300),
    ps
  );

  plot.addGausssian(g);
  let then = 0;
  draw(0);
  function draw(now: number) {
    now *= 0.001;
    const deltaTime = now - then; // compute time since last frame
    then = now;
    // console.log(1 / deltaTime);
    plot.draw(ctx);
    requestAnimationFrame((time) => draw(time));
  }
  canvas.addEventListener("mousedown", () => plot.onDown());
  canvas.addEventListener("mouseup", () => plot.draggOff());
  canvas.addEventListener("mousemove", (e) => plot.onMove(e));
  canvas.addEventListener("mouseleave", () => plot.mouseLeave());

  const scale = <HTMLInputElement>document.getElementById("scale");
  scale.addEventListener("input", () => {
    plot.setScaleX(Number(scale.value));
  });
};
