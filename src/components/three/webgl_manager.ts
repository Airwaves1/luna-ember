import { Scene, PerspectiveCamera, WebGLRenderer, Color, Texture, SRGBColorSpace, RepeatWrapping, MirroredRepeatWrapping, TextureLoader } from "three";
interface CardTextures {
  cardTexture: Texture | null;
  cardBgTexture: Texture | null;
  colorTexture: Texture | null;
  highlightTexture: Texture | null;
  noiseTexture: Texture | null;
  patternTexture: Texture | null;
  patternEeveeTexture: Texture | null;
  dissolveTexture: Texture | null;
  floorTexture: Texture | null;
}

export class WebGLManager {
  private static instance: WebGLManager | null = null;
  private renderer: WebGLRenderer | null = null;
  private scene: Scene | null = null;
  private camera: PerspectiveCamera | null = null;
  private isInitialized = false;
  private animationId: number | null = null;
  private isAnimating = false;
  private currentContainer: HTMLElement | null = null;

  private loader: TextureLoader = new TextureLoader();
  private cardTextures: CardTextures = {
    cardTexture: null,
    cardBgTexture: null,
    colorTexture: null,
    highlightTexture: null,
    noiseTexture: null,
    patternTexture: null,
    patternEeveeTexture: null,
    dissolveTexture: null,
    floorTexture: null,
  };

  private constructor() {
  }

  public static getInstance(): WebGLManager {
    if (!WebGLManager.instance) {
      WebGLManager.instance = new WebGLManager();
    }
    return WebGLManager.instance;
  }

  private async loadTexture(): Promise<void> {
    this.cardTextures.cardTexture = await this.loader.loadAsync("/img/img_vs.webp");
    this.cardTextures.cardTexture.colorSpace = SRGBColorSpace;
    this.cardTextures.cardTexture.wrapS = this.cardTextures.cardTexture.wrapT = RepeatWrapping;
    
    this.cardTextures.cardBgTexture = await this.loader.loadAsync("/img/img_cardBg.webp");
    this.cardTextures.cardBgTexture.colorSpace = SRGBColorSpace;
    this.cardTextures.cardBgTexture.wrapS = this.cardTextures.cardBgTexture.wrapT = RepeatWrapping;
    
    this.cardTextures.colorTexture = await this.loader.loadAsync("/img/texture/color.webp");
    this.cardTextures.colorTexture.wrapS = this.cardTextures.colorTexture.wrapT = MirroredRepeatWrapping;
    
    this.cardTextures.highlightTexture = await this.loader.loadAsync("/img/texture/highlight.webp");
    
    this.cardTextures.noiseTexture = await this.loader.loadAsync("/img/texture/noise.webp");
    this.cardTextures.noiseTexture.wrapS = this.cardTextures.noiseTexture.wrapT = RepeatWrapping;
    
    this.cardTextures.patternTexture = await this.loader.loadAsync("/img/texture/pattern.webp");
    this.cardTextures.patternTexture.wrapS = this.cardTextures.patternTexture.wrapT = RepeatWrapping;
    
    this.cardTextures.patternEeveeTexture = await this.loader.loadAsync("/img/texture/patternEevee.webp");
    this.cardTextures.patternEeveeTexture.wrapS = this.cardTextures.patternEeveeTexture.wrapT = RepeatWrapping;
    
    this.cardTextures.dissolveTexture = await this.loader.loadAsync("/img/texture/dissolve.webp");
    this.cardTextures.dissolveTexture.wrapS = this.cardTextures.dissolveTexture.wrapT = RepeatWrapping;
    
    this.cardTextures.floorTexture = await this.loader.loadAsync("/img/texture/floor.webp");
    this.cardTextures.floorTexture.wrapS = this.cardTextures.floorTexture.wrapT = RepeatWrapping;
  }

  public async initialize(container: HTMLElement): Promise<boolean> {
    if (this.isInitialized) {
      // If already initialized, clear the scene for new content
      if (this.scene) {
        this.scene.clear();
      }
      
      // Move renderer to new container if different
      if (this.currentContainer !== container && this.renderer) {
        if (this.currentContainer && this.renderer.domElement.parentNode) {
          this.currentContainer.removeChild(this.renderer.domElement);
        }
        container.appendChild(this.renderer.domElement);
        this.currentContainer = container;
      }
      
      return true;
    }

    try {
      // Create renderer with optimized settings for mobile performance
      this.renderer = new WebGLRenderer({
        antialias: false,
        alpha: true,
        powerPreference: "high-performance", // Use high performance for better mobile experience
        preserveDrawingBuffer: false,
        failIfMajorPerformanceCaveat: false,
        stencil: false,
        depth: false, // Disable depth buffer for 2D cards
        precision: "highp" // Use high precision for better quality
      });

      const gl = this.renderer.getContext();
      if (!gl) {
        throw new Error('Failed to create WebGL context');
      }

      // Use current device pixel ratio directly
      this.renderer.setPixelRatio(window.devicePixelRatio || 1);
      
      // Create scene and camera
      this.scene = new Scene();
      this.scene.background = null as unknown as Color;
      
      this.camera = new PerspectiveCamera(60, 1, 0.1, 100);
      this.camera.position.set(0, 0, 12);

      // Load card textures once renderer/scene/camera exist
      await this.loadTexture();

      // Add to container
      container.appendChild(this.renderer.domElement);
      this.currentContainer = container;

      // Handle context events
      gl.canvas.addEventListener('webglcontextlost', (event) => {
        console.warn('WebGL context lost');
        event.preventDefault();
        this.stopAnimation();
      });

      // Start animation loop
      this.startAnimation();

      this.isInitialized = true;
      return true;

    } catch (error) {
      console.error('Failed to initialize WebGL Manager:', error);
      this.cleanup();
      return false;
    }
  }

  private startAnimation(): void {
    if (this.isAnimating || !this.renderer || !this.scene || !this.camera) return;
    
    this.isAnimating = true;
    
    const animate = () => {
      if (!this.isAnimating || !this.renderer || !this.scene || !this.camera) return;
      
      try {
        this.renderer.render(this.scene, this.camera);
      } catch (error) {
        console.error('Animation loop error:', error);
        this.stopAnimation();
        return;
      }
      
      this.animationId = requestAnimationFrame(animate);
    };
    this.animationId = requestAnimationFrame(animate);
  }

  private stopAnimation(): void {
    this.isAnimating = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public getRenderer(): WebGLRenderer | null {
    return this.renderer;
  }

  public getScene(): Scene | null {
    return this.scene;
  }

  public getCamera(): PerspectiveCamera | null {
    return this.camera;
  }

  public isReady(): boolean {
    return this.isInitialized && this.renderer !== null && this.scene !== null && this.camera !== null;
  }

  public resize(width: number, height: number): void {
    if (!this.renderer || !this.camera) return;
    
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  public cleanup(): void {
    this.stopAnimation();
    
    if (this.renderer) {
      try {
        const gl = this.renderer.getContext();
        if (gl && gl.getExtension('WEBGL_lose_context')) {
          const loseContext = gl.getExtension('WEBGL_lose_context');
          if (loseContext) {
            loseContext.loseContext();
          }
        }
        this.renderer.dispose();
      } catch (error) {
        console.warn('Error disposing renderer:', error);
      }
      this.renderer = null;
    }

    if (this.scene) {
      this.scene.clear();
      this.scene = null;
    }

    this.camera = null;
    this.currentContainer = null;
    this.isInitialized = false;
  }

  public static destroy(): void {
    if (WebGLManager.instance) {
      WebGLManager.instance.cleanup();
      WebGLManager.instance = null;
    }
  }

  public getTextures(): CardTextures {
    return this.cardTextures;
  }
}
