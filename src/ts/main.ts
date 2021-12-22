"use strict";
import { Vector2 } from "three";
import { CurveType } from "./graphEditor/curve";
import Gaussian from "./graphEditor/gaussian";
import { Plot } from "./graphEditor/plot";
import Render from "./render/render";

window.onload = () => {
  const preview = <HTMLCanvasElement>document.getElementById("preview");
  const graph = <HTMLCanvasElement>document.getElementById("graph");
  graph.addEventListener("mousedown", () => plot.onDown());
  graph.addEventListener("mouseup", () => plot.draggOff());
  graph.addEventListener("mousemove", (e) => plot.onMove(e));
  graph.addEventListener("mouseleave", () => plot.mouseLeave());

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

  const kernelSizeSelect = <HTMLSelectElement>(
    document.getElementById("kernelSize")
  );
  let kernelSize = Number(kernelSizeSelect.value);

  kernelSizeSelect.addEventListener("change", () => {
    kernelSize = Number(kernelSizeSelect.value);
  });

  const render = new Render(preview);
  const graphCtx = <CanvasRenderingContext2D>graph.getContext("2d");

  graphCtx.lineWidth = 2;
  graphCtx.lineCap = "round";
  graphCtx.lineJoin = "round";
  graphCtx.shadowOffsetX = 5;
  graphCtx.shadowOffsetY = 5;
  graphCtx.shadowColor = "rgb(200, 200, 200)";
  graphCtx.shadowBlur = 5;

  const plot = new Plot(
    graph,
    new Vector2(500, 300),
    new Vector2(20, 20),
    new Vector2(100, 300),
    curveType.value as CurveType
  );

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
    plot.draw(graphCtx);
    render.draw(
      <number[]>plot.getWeight(kernelSize),
      Number(kernelSizeSelect.value)
    );
    requestAnimationFrame((time) => draw(time));
  }
};
