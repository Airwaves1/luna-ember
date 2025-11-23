import { Mesh, PlaneGeometry, ShaderMaterial, DoubleSide, CanvasTexture, Texture, Vector2 } from "three";
import { card_vertex_shader, card_fragment_shader } from "./card_shader";

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

  public static createCanvasTextureFromText(input: CardTextContent, canvasSize?: { width: number; height: number }): {
    front: CanvasTexture;
    back: CanvasTexture;
  } {
    // Auto-detect optimal texture size based on device performance
    const defaultSize = CardMesh.getOptimalTextureSize();
    const size = canvasSize || defaultSize;
    
    const makeCanvas = (drawer: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) => {
      const canvas = document.createElement('canvas');
      canvas.width = size.width;
      canvas.height = size.height;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      drawer(ctx, canvas.width, canvas.height);
      const tex = new CanvasTexture(canvas);
      tex.generateMipmaps = false;
      tex.needsUpdate = true;
      return tex;
    };

    const back = makeCanvas((ctx, w, h) => {
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = Math.max(8, Math.floor(w * 0.004));
      ctx.strokeRect(ctx.lineWidth, ctx.lineWidth, w - ctx.lineWidth * 2, h - ctx.lineWidth * 2);
    });

    const front = makeCanvas((ctx, w, h) => {
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#4b5563';
      ctx.lineWidth = Math.max(8, Math.floor(w * 0.004));
      ctx.strokeRect(ctx.lineWidth, ctx.lineWidth, w - ctx.lineWidth * 2, h - ctx.lineWidth * 2);

      // Title near top
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `bold ${Math.floor(w * 0.095)}px Arial`;
      ctx.fillText(input.title, w / 2, h * 0.25);

      // Content centered with wrapping
      ctx.fillStyle = '#d1d5db';
      ctx.font = `${Math.floor(w * 0.065)}px Arial`;
      const maxWidth = w * 0.8;
      const lineHeight = Math.floor(w * 0.085);

      const chars = input.content.split('');
      let tempLine = '';
      let total = 0;
      for (let i = 0; i < chars.length; i++) {
        const test = tempLine + chars[i];
        if (ctx.measureText(test).width > maxWidth && i > 0) {
          total += lineHeight;
          tempLine = chars[i];
        } else {
          tempLine = test;
        }
      }
      total += lineHeight;

      let y = h / 2 - total / 2;
      let line = '';
      for (let i = 0; i < chars.length; i++) {
        const test = line + chars[i];
        if (ctx.measureText(test).width > maxWidth && i > 0) {
          ctx.fillText(line, w / 2, y);
          line = chars[i];
          y += lineHeight;
        } else {
          line = test;
        }
      }
      ctx.fillText(line, w / 2, y);
    });

    return { front, back };
  }

  private static getOptimalTextureSize(): { width: number; height: number } {
    // Detect device performance level
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const memory = (navigator as { deviceMemory?: number }).deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 4;
    
    if (isMobile && (memory <= 2 || cores <= 2)) {
      // Low-end devices: smaller textures
      return { width: 512, height: 768 };
    } else if (isMobile || memory <= 4) {
      // Medium devices: medium textures
      return { width: 1024, height: 1536 };
    } else {
      // High-end devices: larger textures
      return { width: 1536, height: 2304 };
    }
  }
}


