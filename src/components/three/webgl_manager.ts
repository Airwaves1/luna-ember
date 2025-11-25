import { Scene, PerspectiveCamera, WebGLRenderer, Color } from "three";

export class WebGLManager {
  private static instance: WebGLManager | null = null;
  private renderer: WebGLRenderer | null = null;
  private scene: Scene | null = null;
  private camera: PerspectiveCamera | null = null;
  private isInitialized = false;
  private animationId: number | null = null;
  private isAnimating = false;
  private currentContainer: HTMLElement | null = null;

  private constructor() {
  }

  public static getInstance(): WebGLManager {
    if (!WebGLManager.instance) {
      WebGLManager.instance = new WebGLManager();
    }
    return WebGLManager.instance;
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
      this.camera.position.set(0, 0, 10);

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
}
