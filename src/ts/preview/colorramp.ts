import { IUniform } from "three";
import { rgbWeight } from "../graphEditor/curveRGB";
import fs from "./glsl/colorramp.frag";
import vs from "./glsl/vertexShader.vert";
import Renderer from "./renderer";

export default class ColorRamp extends Renderer {
  constructor(width: number, height: number) {
    super(
      width,
      height,
      {
        screenWidth: <IUniform>{ type: "f", value: width },
        screenHeight: <IUniform>{ type: "f", value: height },
        weightR: <IUniform>{ type: "fv1", value: undefined },
        weightG: <IUniform>{ type: "fv1", value: undefined },
        weightB: <IUniform>{ type: "fv1", value: undefined },
        kernelSize: <IUniform>{ type: "i", value: undefined },
      },
      vs,
      fs
    );
  }
  draw({ r, g, b }: rgbWeight, kernelSize: number) {
    this._uniforms.kernelSize.value = kernelSize;
    this._uniforms.weightR.value = r;
    this._uniforms.weightG.value = g;
    this._uniforms.weightB.value = b;

    this._renderer.setRenderTarget(null);
    this._renderer.clear();
    this._renderer.render(this._scene, this._camera);
  }
  get domElement(): HTMLCanvasElement {
    return this._renderer.domElement;
  }
}
