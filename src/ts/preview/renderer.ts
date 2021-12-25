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
import { rgbWeight } from "../graphEditor/curveRGB";

export default abstract class Renderer {
  protected _renderer: WebGLRenderer;
  protected _camera: OrthographicCamera;
  protected _scene: Scene;
  constructor(
    width: number,
    height: number,
    protected _uniforms: { [uniform: string]: IUniform },
    vs: string,
    fs: string
  ) {
    this._renderer = new WebGLRenderer();
    this._renderer.setSize(width, height);
    this._scene = new Scene();
    this._camera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -10000, 10000);
    this._camera.position.z = 100;
    this._scene.add(this._camera);

    const plane = new PlaneGeometry(1.0, 1.0);

    const material = new ShaderMaterial({
      uniforms: this._uniforms,
      vertexShader: vs,
      fragmentShader: fs,
      glslVersion: GLSL3,
    });

    const mesh = new Mesh(plane, material);
    this._scene.add(mesh);
  }
  abstract draw({ r, g, b }: rgbWeight, kernelSize: number): void;
  get domElement(): HTMLCanvasElement {
    return this._renderer.domElement;
  }
}
