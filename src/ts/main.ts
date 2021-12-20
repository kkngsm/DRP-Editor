"use strict";
import { Vector2 } from "three";
import { CurveType } from "./curve";
import Gaussian from "./gaussian";
import { Plot } from "./plot";

window.onload = () => {
  const canvas = <HTMLCanvasElement>document.getElementById("graph");
  canvas.addEventListener("mousedown", () => plot.onDown());
  canvas.addEventListener("mouseup", () => plot.draggOff());
  canvas.addEventListener("mousemove", (e) => plot.onMove(e));
  canvas.addEventListener("mouseleave", () => plot.mouseLeave());

  const scale = <HTMLInputElement>document.getElementById("scale");
  scale.addEventListener("input", () => {
    plot.setScaleX(Number(scale.value));
  });
  const curveType = <HTMLSelectElement>document.getElementById("curveType");
  curveType.addEventListener("change", () => {
    switch (curveType.value) {
      case "spline":
        plot.changeSpline();
        break;
      case "gaussian":
        plot.changeGaussian();
        break;
    }
  });

  const convertToSpline = <HTMLInputElement>(
    document.getElementById("convertToSpline")
  );
  convertToSpline.addEventListener("click", () => {
    plot.convertToSpline();
    curveType.value = "spline";
  });
  const ctx = <CanvasRenderingContext2D>canvas.getContext("2d");

  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 5;
  ctx.shadowColor = "rgb(200, 200, 200)";
  ctx.shadowBlur = 5;

  const plot = new Plot(
    canvas,
    new Vector2(500, 300),
    new Vector2(20, 20),
    new Vector2(100, 300),
    curveType.value as CurveType
  );

  // const xs: number[] = [0, 0.6, 1.66, 3, 5];
  // const ys: number[] = xs.map((e) => g.calc(e));

  // plot.setSpline(
  //   Points.create(
  //     xs,
  //     xs.map((e) => g.calc(e))
  //   ),
  //   Points.create(
  //     xs,
  //     xs.map((e) => g.calc(e))
  //   ),
  //   Points.create(
  //     xs,
  //     xs.map((e) => g.calc(e))
  //   )
  // );
  plot.setGausssian(
    Gaussian.createFromSdAndMean(1, 0),
    Gaussian.createFromSdAndMean(0.7, 0),
    Gaussian.createFromSdAndMean(0.5, 0)
  );

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
};
