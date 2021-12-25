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
import fs from "./glsl/colorramp.frag";
import vs from "./glsl/vertexShader.vert";

export default class ColorRamp {
  private _renderer: WebGLRenderer;
  private _uniforms: { [uniform: string]: IUniform };
  private _scene: Scene;
  private _camera: OrthographicCamera;
  private _mesh: Mesh;
  constructor(width: number, height: number) {
    this._renderer = new WebGLRenderer();
    this._renderer.setSize(width, height);
    this._scene = new Scene();
    this._camera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -10000, 10000);
    this._camera.position.z = 100;
    this._scene.add(this._camera);

    const plane = new PlaneGeometry(1.0, 1.0);

    this._uniforms = {
      screenWidth: <IUniform>{ type: "f", value: width },
      screenHeight: <IUniform>{ type: "f", value: height },
      weightR: <IUniform>{ type: "fv1", value: undefined },
      weightG: <IUniform>{ type: "fv1", value: undefined },
      weightB: <IUniform>{ type: "fv1", value: undefined },
      kernelSize: <IUniform>{ type: "i", value: undefined },
    };

    const material = new ShaderMaterial({
      uniforms: this._uniforms,
      vertexShader: vs,
      fragmentShader: fs,
      glslVersion: GLSL3,
    });

    this._mesh = new Mesh(plane, material);
    this._scene.add(this._mesh);
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
