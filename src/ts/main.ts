"use strict";
import "../sass/style.sass";
import { CurveType } from "./graphEditor/curve";
import { rgbWeight } from "./graphEditor/curveRGB";
import Gaussian from "./graphEditor/gaussian";
import { Plot } from "./graphEditor/plot";
import { Point } from "./graphEditor/point";
import Previewer from "./preview/preview";

window.onload = () => {
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
  const dv = <HTMLDivElement>document.getElementById("distance-value");
  distance.value = "0.3";
  dv.innerText = distance.value;
  distance.addEventListener("input", () => {
    dv.innerText = distance.value;
    resetGaussian();
  });
  const color = <HTMLInputElement>document.getElementById("color");
  const cv = <HTMLDivElement>document.getElementById("color-value");
  color.value = "#D82602";
  const rgb = colorcode2rgb(color.value).map((e) => Math.floor(e));
  cv.innerText = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
  color.addEventListener("input", () => {
    const rgb = colorcode2rgb(color.value).map((e) => Math.floor(e));
    cv.innerText = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
    resetGaussian();
  });
  const rawTex = <HTMLInputElement>document.getElementById("rawTex");
  rawTex.addEventListener(
    "change",
    (e) => {
      // ファイル情報を取得
      if (e.target instanceof EventTarget) {
        const fileData = (<FileList>(<HTMLInputElement>e.target).files)[0];
        const reader = new FileReader();
        reader.onload = function () {
          display.setRawTex(reader.result as string);
        };
        reader.readAsDataURL(fileData);
      }
    },
    false
  );

  const maskTex = <HTMLInputElement>document.getElementById("maskTex");
  maskTex.addEventListener(
    "change",
    (e) => {
      // ファイル情報を取得
      if (e.target instanceof EventTarget) {
        const fileData = (<FileList>(<HTMLInputElement>e.target).files)[0];
        const reader = new FileReader();
        reader.onload = function () {
          display.setMaskTex(reader.result as string);
        };
        reader.readAsDataURL(fileData);
      }
    },
    false
  );
  const display = new Previewer(1024, 1024);
  const preview = new Previewer(500, 100);
  document.getElementById("preview")?.appendChild(preview.domElement);
  document.getElementById("display")?.appendChild(display.domElement);
  const plot = new Plot(graph, kernelSize, curveType.value as CurveType);
  resetGaussian();
  let then = 0;
  draw(0);
  function draw(now: number) {
    now *= 0.001;
    const deltaTime = now - then; // compute time since last frame
    then = now;
    plot.draw();
    const kernelWeight = <rgbWeight>plot.getWeight(kernelSize);
    display.draw(kernelWeight, kernelSize);
    preview.draw(kernelWeight, kernelSize);

    requestAnimationFrame((time) => draw(time));
  }
  function resetGaussian() {
    const x = Number(distance.value);
    const ys = colorcode2rgb(color.value).map((e) => e / 255);
    plot.setGausssian(
      new Gaussian(new Point(x, ys[0])),
      new Gaussian(new Point(x, ys[1])),
      new Gaussian(new Point(x, ys[2]))
    );
  }
  function colorcode2rgb(code: string): number[] {
    return [
      parseInt(code.substring(1, 3), 16),
      parseInt(code.substring(3, 5), 16),
      parseInt(code.substring(5, 7), 16),
    ];
  }
  // function setMaskTex(e: HTMLInputElement) {
  //   const files = <FileList>e.files;
  //   if (files.length > 0) {
  //     const reader = new FileReader();
  //     reader.onload = function () {
  //       display.setMaskTex(reader.result as string);
  //     };
  //     reader.readAsDataURL(files[0]);
  //   }
  // }
};
