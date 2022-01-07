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
  private _maskImage: CanvasTexture;
  private _tempImage: WebGLRenderTarget;
  constructor(width: number, height: number) {
    super(
      width,
      height,
      {
        screenWidth: <IUniform>{ type: "f", value: width },
        screenHeight: <IUniform>{ type: "f", value: height },
        rawTex: <IUniform>{ type: "t", value: undefined },
        maskTex: <IUniform>{ type: "t", value: undefined },
        horizontal: <IUniform>{ type: "b", value: true },
        weightR: <IUniform>{ type: "fv1", value: undefined },
        weightG: <IUniform>{ type: "fv1", value: undefined },
        weightB: <IUniform>{ type: "fv1", value: undefined },
        kernelSize: <IUniform>{ type: "i", value: undefined },
      },
      vs,
      fs
    );

    this._rawImage = this.initRawTex(width, height);
    this._maskImage = this.initMaskTex(width, height);
    this._tempImage = new WebGLRenderTarget(width, height, {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      format: RGBAFormat,
      type: UnsignedByteType,
    });
  }
  draw({ r, g, b }: rgbWeight, kernelSize: number) {
    this._uniforms.horizontal.value = true;
    this._uniforms.rawTex.value = this._rawImage;
    this._uniforms.maskTex.value = this._maskImage;

    this._uniforms.weightR.value = this.kernelNormalized(r);
    this._uniforms.weightG.value = this.kernelNormalized(g);
    this._uniforms.weightB.value = this.kernelNormalized(b);
    this._uniforms.kernelSize.value = kernelSize;
    this._renderer.setRenderTarget(this._tempImage);
    this._renderer.clear();
    this._renderer.render(this._scene, this._camera);

    this._uniforms.horizontal.value = false;
    this._uniforms.rawTex.value = this._tempImage.texture;
    this._renderer.setRenderTarget(null);
    this._renderer.clear();
    this._renderer.render(this._scene, this._camera);
  }
  setRawTex(url: string) {
    const img = new Image();
    img.src = url;
    const THIS = this;
    img.onload = () => {
      THIS._rawImage = new CanvasTexture(img);
    };
  }
  setMaskTex(url: string) {
    const img = new Image();
    img.src = url;
    const THIS = this;
    img.onload = () => {
      THIS._maskImage = new CanvasTexture(img);
    };
  }
  private kernelNormalized(v: number[]): number[] {
    const sum = v.reduce((sum, e) => sum + e) * 2 - v[0];
    return v.map((e) => e / sum);
  }
  private initRawTex(width: number, height: number): CanvasTexture {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.fillRect(width * 0.5, 0, width, height);

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width * 0.5, height);
    return new CanvasTexture(canvas);
  }

  private initMaskTex(width: number, height: number): CanvasTexture {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);
    return new CanvasTexture(canvas);
  }
}
