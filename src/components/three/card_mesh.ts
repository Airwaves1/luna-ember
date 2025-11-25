import { Mesh, PlaneGeometry, ShaderMaterial, DoubleSide, Texture, Vector2 } from "three";
import { card_vertex_shader, card_fragment_shader } from "./shader/card_shader";

export type CardTextContent = {
  title: string;
  content: string;
};

export type CardTextureContent = {
  front: Texture;
  back: Texture;
};

type CardMeshOptions = {
  size?: { width: number; height: number };
  pixelRatio?: number;
};

export class CardMesh extends Mesh<PlaneGeometry, ShaderMaterial> {
  public frontTexture: Texture;
  public backTexture: Texture;

  constructor(textures: CardTextureContent, options?: CardMeshOptions) {
    const width = options?.size?.width ?? 3.2;
    const height = options?.size?.height ?? 4.8;
    const geometry = new PlaneGeometry(width, height, 1, 1);

    const material = new ShaderMaterial({
      uniforms: {
        frontTex: { value: textures.front },
        backTex: { value: textures.back },
        uUvMirror: { value: new Vector2(1.0, 1.0) },
      },
      vertexShader: card_vertex_shader,
      fragmentShader: card_fragment_shader,
      side: DoubleSide,
      transparent: true,
    });

    super(geometry, material);

    this.frontTexture = textures.front;
    this.backTexture = textures.back;
  }

  public updateTextures(textures: CardTextureContent) {
    this.frontTexture = textures.front;
    this.backTexture = textures.back;
    this.material.uniforms.frontTex.value = this.frontTexture;
    this.material.uniforms.backTex.value = this.backTexture;
    this.material.needsUpdate = true;
  }

  public dispose() {
    // Dispose textures
    if (this.frontTexture) {
      this.frontTexture.dispose();
    }
    if (this.backTexture) {
      this.backTexture.dispose();
    }
    // Dispose material and geometry
    if (this.material) {
      this.material.dispose();
    }
    if (this.geometry) {
      this.geometry.dispose();
    }
  }

}


