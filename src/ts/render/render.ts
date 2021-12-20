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
  constructor(canvas: HTMLCanvasElement) {
    this._renderer = new WebGLRenderer({ canvas: canvas });

    const camera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -10000, 10000);
    camera.position.z = 100;
    const scene = new Scene();
    scene.add(camera);

    // マテリアルを作成
    const plane = new PlaneGeometry(1.0, 1.0);

    const mat = new ShaderMaterial({
      uniforms: this._uniforms,
      vertexShader: vs,
      fragmentShader: fs,
      glslVersion: GLSL3,
    });

    // ジオメトリとマテリアルからメッシュを作成
    const mesh = new Mesh(plane, mat);

    // メッシュをシーンに追加
    scene.add(mesh);

    // 画面に表示
    this._renderer.render(scene, camera);
  }
}
