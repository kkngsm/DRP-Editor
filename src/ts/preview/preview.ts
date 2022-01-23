import {
  CanvasTexture,
  GLSL3,
  IUniform,
  LinearFilter,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  UnsignedByteType,
  WebGLRenderer,
  WebGLRenderTarget,
} from "three";
import { rgbWeight } from "../graphEditor/curveRGB";
import fs from "./glsl/sss.frag";
import vs from "./glsl/vertexShader.vert";

export default class Previewer {
  private canvas: HTMLCanvasElement;
  private rawImage: CanvasTexture;
  private maskImage: CanvasTexture;
  private tempImage: WebGLRenderTarget;
  private renderer: WebGLRenderer;
  private camera: OrthographicCamera;
  private scene: Scene;
  private uniforms: { [uniform: string]: IUniform };

  constructor(id: string) {
    this.canvas = <HTMLCanvasElement>document.getElementById(id);
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      preserveDrawingBuffer: true,
    });
    this.scene = new Scene();
    this.camera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -10000, 10000);
    this.camera.position.z = 100;
    this.scene.add(this.camera);

    const { width, height } = this.canvas;
    this.uniforms = {
      screenWidth: <IUniform>{ type: "f", value: width },
      screenHeight: <IUniform>{ type: "f", value: height },
      rawTex: <IUniform>{ type: "t", value: undefined },
      maskTex: <IUniform>{ type: "t", value: undefined },
      horizontal: <IUniform>{ type: "b", value: true },
      weightR: <IUniform>{ type: "fv1", value: undefined },
      weightG: <IUniform>{ type: "fv1", value: undefined },
      weightB: <IUniform>{ type: "fv1", value: undefined },
      kernelSize: <IUniform>{ type: "i", value: undefined },
    };

    const material = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: vs,
      fragmentShader: fs,
      glslVersion: GLSL3,
    });

    const plane = new PlaneGeometry(1.0, 1.0);
    const mesh = new Mesh(plane, material);
    this.scene.add(mesh);

    this.rawImage = this.initRawTex(width, height);
    this.maskImage = this.initMaskTex(width, height);
    this.tempImage = new WebGLRenderTarget(width, height, {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      format: RGBAFormat,
      type: UnsignedByteType,
    });
  }
  draw({ r, g, b }: rgbWeight, kernelSize: number) {
    this.uniforms.horizontal.value = true;
    this.uniforms.rawTex.value = this.rawImage;
    this.uniforms.maskTex.value = this.maskImage;

    this.uniforms.weightR.value = this.kernelNormalized(r);
    this.uniforms.weightG.value = this.kernelNormalized(g);
    this.uniforms.weightB.value = this.kernelNormalized(b);
    this.uniforms.kernelSize.value = kernelSize;
    this.renderer.setRenderTarget(this.tempImage);
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);

    this.uniforms.horizontal.value = false;
    this.uniforms.rawTex.value = this.tempImage.texture;
    this.renderer.setRenderTarget(null);
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
  }
  setRawTex(url: string) {
    const img = new Image();
    img.src = url;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    img.onload = () => {
      that.rawImage = new CanvasTexture(img);
      const { width, height } = img;
      const { clientWidth, clientHeight } = this.canvas;
      this.resize(width, height);
      if (width <= height) {
        this.canvas.style.width =
          ((clientHeight * width) / height).toString() + "px";
        this.canvas.style.height = clientHeight.toString() + "px";
      } else {
        this.canvas.style.width = clientWidth.toString() + "px";
        this.canvas.style.height =
          ((clientWidth * height) / width).toString() + "px";
      }
    };
  }
  setMaskTex(url: string) {
    const img = new Image();
    img.src = url;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    img.onload = () => {
      that.maskImage = new CanvasTexture(img);
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
  private resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.renderer.setSize(width, height);
  }
}
