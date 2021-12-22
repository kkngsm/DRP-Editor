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
import fs from "./glsl/sss.frag";
import vs from "./glsl/vertexShader.vert";

export default class Render {
  private _renderer: WebGLRenderer;
  private _uniforms: { [uniform: string]: IUniform };
  private _scene: Scene;
  private _camera: OrthographicCamera;
  private _mesh: Mesh;
  private _rawImage: CanvasTexture;
  private _tempImage: WebGLRenderTarget;
  constructor(canvas: HTMLCanvasElement) {
    this._renderer = new WebGLRenderer({ canvas: canvas });

    this._scene = new Scene();
    this._camera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -10000, 10000);
    this._camera.position.z = 100;
    this._scene.add(this._camera);

    const plane = new PlaneGeometry(1.0, 1.0);

    const { clientWidth, clientHeight } = canvas;
    this._uniforms = {
      screenWidth: <IUniform>{ type: "f", value: clientWidth },
      screenHeight: <IUniform>{ type: "f", value: clientHeight },
      tex: <IUniform>{ type: "t", value: undefined },
      horizontal: <IUniform>{ type: "b", value: true },
      weight: <IUniform>{ type: "fv", value: undefined },
      kernelSize: <IUniform>{ type: "i", value: undefined },
    };

    this._rawImage = this.texture();
    this._tempImage = new WebGLRenderTarget(clientWidth, clientHeight, {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      format: RGBAFormat,
      type: UnsignedByteType,
    });
    const material = new ShaderMaterial({
      uniforms: this._uniforms,
      vertexShader: vs,
      fragmentShader: fs,
      glslVersion: GLSL3,
    });

    this._mesh = new Mesh(plane, material);
    this._scene.add(this._mesh);
  }
  draw(weight: number[], kernelSize: number) {
    this._uniforms.horizontal.value = true;
    this._uniforms.tex.value = this._rawImage;
    this._uniforms.weight.value = weight;
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
