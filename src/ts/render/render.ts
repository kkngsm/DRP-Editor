import {
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

    // マテリアルを作成
    const plane = new PlaneGeometry(1.0, 1.0);

    this._uniforms = {
      screenWidth: <IUniform>{ type: "f", value: canvas.clientWidth },
      screenHeight: <IUniform>{ type: "f", value: canvas.clientHeight },
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
}
