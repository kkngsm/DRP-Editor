import {
  CanvasTexture,
  IUniform,
  LinearFilter,
  RGBAFormat,
  UnsignedByteType,
  WebGLRenderTarget,
} from "three";
import { rgbWeight } from "../graphEditor/curveRGB";
import fs from "./glsl/sss.frag";
import vs from "./glsl/vertexShader.vert";
import Renderer from "./renderer";

export default class Previewer extends Renderer {
  private _rawImage: CanvasTexture;
  private _tempImage: WebGLRenderTarget;
  constructor(width: number, height: number) {
    super(
      width,
      height,
      {
        screenWidth: <IUniform>{ type: "f", value: width },
        screenHeight: <IUniform>{ type: "f", value: height },
        tex: <IUniform>{ type: "t", value: undefined },
        horizontal: <IUniform>{ type: "b", value: true },
        weightR: <IUniform>{ type: "fv1", value: undefined },
        weightG: <IUniform>{ type: "fv1", value: undefined },
        weightB: <IUniform>{ type: "fv1", value: undefined },
        kernelSize: <IUniform>{ type: "i", value: undefined },
      },
      vs,
      fs
    );

    this._rawImage = this.texture();
    this._tempImage = new WebGLRenderTarget(width, height, {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      format: RGBAFormat,
      type: UnsignedByteType,
    });
  }
  draw({ r, g, b }: rgbWeight, kernelSize: number) {
    this._uniforms.horizontal.value = true;
    this._uniforms.tex.value = this._rawImage;
    const sumR = r.reduce((sum, e) => sum + e);
    this._uniforms.weightR.value = r.map((e) => e / sumR);
    const sumG = g.reduce((sum, e) => sum + e);
    this._uniforms.weightG.value = g.map((e) => e / sumG);
    const sumB = b.reduce((sum, e) => sum + e);
    this._uniforms.weightB.value = b.map((e) => e / sumB);
    this._uniforms.kernelSize.value = kernelSize;
    this._renderer.setRenderTarget(this._tempImage);
    this._renderer.clear();
    this._renderer.render(this._scene, this._camera);

    this._uniforms.horizontal.value = false;
    this._uniforms.tex.value = this._tempImage.texture;
    this._renderer.setRenderTarget(null);
    this._renderer.clear();
    this._renderer.render(this._scene, this._camera);
  }
  private texture(): CanvasTexture {
    const canvas = document.createElement("canvas");
    canvas.width = 500;
    canvas.height = 250;

    const ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.fillRect(canvas.width * 0.5, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width * 0.5, canvas.height);
    return new CanvasTexture(canvas);
  }
}
