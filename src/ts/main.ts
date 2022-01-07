"use strict";
import { CurveType } from "./graphEditor/curve";
import { rgbWeight } from "./graphEditor/curveRGB";
import Gaussian from "./graphEditor/gaussian";
import { Plot } from "./graphEditor/plot";
import { Point } from "./graphEditor/point";
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

  const distance = <HTMLInputElement>document.getElementById("distance");
  distance.addEventListener("input", resetGaussian);
  const color = <HTMLInputElement>document.getElementById("color");
  color.addEventListener("input", resetGaussian);

  const img = <HTMLInputElement>document.getElementById("img");
  img.addEventListener(
    "change",
    (e) => {
      // ファイル情報を取得
      if (e.target instanceof EventTarget) {
        const fileData = (<FileList>(<HTMLInputElement>e.target).files)[0];
        const reader = new FileReader();
        reader.onload = function () {
          previewer.setTexture(reader.result as string);
        };
        reader.readAsDataURL(fileData);
      }
    },
    false
  );

  const previewer = new Previewer(216, 317);
  const colorramp = new ColorRamp(500, 100);

  const plot = new Plot(graph, kernelSize, curveType.value as CurveType);
  resetGaussian();
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
    // displayCtx.drawImage(
    //   previewer.domElement,
    //   250,
    //   0,
    //   kernelSize,
    //   250,
    //   0,
    //   200,
    //   500,
    //   250
    // );
    requestAnimationFrame((time) => draw(time));
  }
  function resetGaussian() {
    const x = Number(distance.value);
    const ys: number[] = [
      parseInt(color.value.substring(1, 3), 16) / 255,
      parseInt(color.value.substring(3, 5), 16) / 255,
      parseInt(color.value.substring(5, 7), 16) / 255,
    ];
    plot.setGausssian(
      new Gaussian(new Point(x, ys[0])),
      new Gaussian(new Point(x, ys[1])),
      new Gaussian(new Point(x, ys[2]))
    );
  }
};
