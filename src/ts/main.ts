"use strict";
import { CurveType } from "./graphEditor/curve";
import { rgbWeight } from "./graphEditor/curveRGB";
import Gaussian from "./graphEditor/gaussian";
import { Plot } from "./graphEditor/plot";
import ColorRamp from "./preview/colorramp";
import Previewer from "./preview/preview";

window.onload = () => {
  const display = <HTMLCanvasElement>document.getElementById("display");
  const graph = <HTMLCanvasElement>document.getElementById("graph");
  graph.addEventListener("mousedown", () => plot.onDown());
  graph.addEventListener("mouseup", () => plot.draggOff());
  graph.addEventListener("mousemove", (e) => plot.onMove(e));
  graph.addEventListener("mouseleave", () => plot.mouseLeave());

  const curveType = <HTMLSelectElement>document.getElementById("curveType");
  curveType.value = "gaussian";
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
    plot.setKernelSize(kernelSize);
  });

  const previewer = new Previewer(500, 150);
  const colorramp = new ColorRamp(500, 100);

  const plot = new Plot(graph, kernelSize, curveType.value as CurveType);

  plot.setGausssian(
    Gaussian.createFromSdAndMean(0.5, 0),
    Gaussian.createFromSdAndMean(0.25, 0),
    Gaussian.createFromSdAndMean(0.1, 0)
  );

  let then = 0;
  const displayCtx = <CanvasRenderingContext2D>display.getContext("2d");

  draw(0);
  function draw(now: number) {
    now *= 0.001;
    const deltaTime = now - then; // compute time since last frame
    then = now;
    // console.log(1 / deltaTime);
    plot.draw();
    const kernelWeight = <rgbWeight>plot.getWeight(kernelSize);
    previewer.draw(kernelWeight, kernelSize);
    // colorramp.draw(kernelWeight, kernelSize);
    displayCtx.drawImage(previewer.domElement, 0, 0);
    displayCtx.drawImage(
      previewer.domElement,
      250,
      0,
      kernelSize,
      250,
      0,
      200,
      500,
      250
    );
    requestAnimationFrame((time) => draw(time));
  }
};
