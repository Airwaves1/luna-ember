import { CanvasTexture, Vector2 } from "three";
import type { CardTextContent, CardTextureContent } from "./card_mesh";

const DEFAULT_TEXTURE_SIZE = new Vector2(1024, 1536);

type CardTextureOptions = {
  size?: Vector2;
  backVariant?: "default";
};

const DEFAULT_BACK_VARIANT = "default";

class CardTextureManager {
  private static instance: CardTextureManager | null = null;
  private frontCache = new Map<string, CanvasTexture>();
  private backCache = new Map<string, CanvasTexture>();

  static getInstance(): CardTextureManager {
    if (!CardTextureManager.instance) {
      CardTextureManager.instance = new CardTextureManager();
    }
    return CardTextureManager.instance;
  }

  getTextures(input: CardTextContent, options?: CardTextureOptions): CardTextureContent {
    const size = options?.size ?? DEFAULT_TEXTURE_SIZE;
    const backVariant = options?.backVariant ?? DEFAULT_BACK_VARIANT;

    const backKey = this.getBackKey(backVariant, size);
    let back = this.backCache.get(backKey);
    if (!back) {
      back = this.createBackTexture(size);
      this.backCache.set(backKey, back);
    }

    const frontKey = this.getFrontKey(input, size);
    let front = this.frontCache.get(frontKey);
    if (!front) {
      front = this.createFrontTexture(input, size);
      this.frontCache.set(frontKey, front);
    }

    return { front, back };
  }

  clear(): void {
    this.frontCache.forEach(tex => tex.dispose());
    this.backCache.forEach(tex => tex.dispose());
    this.frontCache.clear();
    this.backCache.clear();
  }

  private getFrontKey(input: CardTextContent, size: Vector2): string {
    return `${size.x}x${size.y}:${input.title}|${input.content}`;
  }

  private getBackKey(variant: string, size: Vector2): string {
    return `${variant}:${size.x}x${size.y}`;
  }

  private createFrontTexture(input: CardTextContent, size: Vector2): CanvasTexture {
    return this.drawOnCanvas(size, (ctx, w, h) => {
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#4b5563';
      ctx.lineWidth = Math.max(8, Math.floor(w * 0.004));
      ctx.strokeRect(ctx.lineWidth, ctx.lineWidth, w - ctx.lineWidth * 2, h - ctx.lineWidth * 2);

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `bold ${Math.floor(w * 0.095)}px Arial`;
      ctx.fillText(input.title, w / 2, h * 0.25);

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
  }

  private createBackTexture(size: Vector2): CanvasTexture {
    return this.drawOnCanvas(size, (ctx, w, h) => {
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = Math.max(8, Math.floor(w * 0.004));
      ctx.strokeRect(ctx.lineWidth, ctx.lineWidth, w - ctx.lineWidth * 2, h - ctx.lineWidth * 2);
    });
  }

  private drawOnCanvas(
    size: Vector2,
    drawer: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
  ): CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = size.x;
    canvas.height = size.y;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    drawer(ctx, canvas.width, canvas.height);
    const tex = new CanvasTexture(canvas);
    tex.generateMipmaps = false;
    tex.needsUpdate = true;
    return tex;
  }

}

export const cardTextureManager = CardTextureManager.getInstance();

