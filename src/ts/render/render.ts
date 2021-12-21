import {
  CanvasTexture,
  GLSL3,
  IUniform,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from "three";
import fs from "./glsl/sss.frag";
import vs from "./glsl/vertexShader.vert";

export default class Render {
  private _renderer: WebGLRenderer;
  private _uniforms: { [uniform: string]: IUniform };
  private _scene: Scene;
  private _camera: OrthographicCamera;
  constructor(canvas: HTMLCanvasElement) {
    this._renderer = new WebGLRenderer({ canvas: canvas });

    this._scene = new Scene();
    this._camera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -10000, 10000);
    this._camera.position.z = 100;
    this._scene.add(this._camera);

    const plane = new PlaneGeometry(1.0, 1.0);

    this._uniforms = {
      screenWidth: <IUniform>{ type: "f", value: canvas.clientWidth },
      screenHeight: <IUniform>{ type: "f", value: canvas.clientHeight },
      tex: <IUniform>{ type: "t", value: this.texture() },
      col: <IUniform>{ type: "f", value: 0.5 },
    };

    const mat = new ShaderMaterial({
      uniforms: this._uniforms,
      vertexShader: vs,
      fragmentShader: fs,
      glslVersion: GLSL3,
    });

    const mesh = new Mesh(plane, mat);
    this._scene.add(mesh);
  }
  draw() {
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
