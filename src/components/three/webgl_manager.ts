import { Scene, PerspectiveCamera, WebGLRenderer, Color } from "three";

export class WebGLManager {
  private static instance: WebGLManager | null = null;
  private renderer: WebGLRenderer | null = null;
  private scene: Scene | null = null;
  private camera: PerspectiveCamera | null = null;
  private isInitialized = false;
  private animationId: number | null = null;
  private isAnimating = false;
  private subscribers: Set<() => void> = new Set();
  private currentContainer: HTMLElement | null = null;
  private performanceLevel: 'low' | 'medium' | 'high' = 'medium';

  private constructor() {
    this.detectPerformanceLevel();
  }

  private detectPerformanceLevel(): void {
    // Detect device performance level based on various factors
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const memory = (navigator as { deviceMemory?: number }).deviceMemory || 4; // Default to 4GB if not available
    const cores = navigator.hardwareConcurrency || 4; // Default to 4 cores if not available
    
    if (isMobile && (memory <= 2 || cores <= 2)) {
      this.performanceLevel = 'low';
    } else if (isMobile || memory <= 4) {
      this.performanceLevel = 'medium';
    } else {
      this.performanceLevel = 'high';
    }
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

      // Set pixel ratio based on device performance level
      let pixelRatio = window.devicePixelRatio || 1;
      if (this.performanceLevel === 'low') {
        pixelRatio = Math.min(pixelRatio, 1); // Cap at 1 for low-end devices
      } else if (this.performanceLevel === 'medium') {
        pixelRatio = Math.min(pixelRatio, 1.5); // Cap at 1.5 for medium devices
      } else {
        pixelRatio = Math.min(pixelRatio, 2); // Cap at 2 for high-end devices
      }
      this.renderer.setPixelRatio(pixelRatio);
      
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
    let lastTime = 0;
    // Adjust FPS based on performance level
    let targetFPS = 60;
    if (this.performanceLevel === 'low') {
      targetFPS = 30; // Lower FPS for low-end devices
    } else if (this.performanceLevel === 'medium') {
      targetFPS = 45; // Medium FPS for medium devices
    }
    const frameInterval = 1000 / targetFPS;
    
    const animate = (currentTime: number) => {
      if (!this.isAnimating || !this.renderer || !this.scene || !this.camera) return;
      
      // Throttle frame rate to reduce CPU load
      if (currentTime - lastTime >= frameInterval) {
        try {
          this.renderer.render(this.scene, this.camera);
          lastTime = currentTime;
        } catch (error) {
          console.error('Animation loop error:', error);
          this.stopAnimation();
          return;
        }
      }
      
      this.animationId = requestAnimationFrame(animate);
    };
    animate(0);
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

  public subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Subscriber callback error:', error);
      }
    });
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
    this.subscribers.clear();
  }

  public static destroy(): void {
    if (WebGLManager.instance) {
      WebGLManager.instance.cleanup();
      WebGLManager.instance = null;
    }
  }
}
