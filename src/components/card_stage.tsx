import { useEffect, useRef, useState } from "react";
import { Scene, PerspectiveCamera, WebGLRenderer, Color, Mesh, Raycaster, Vector2 } from "three";
import { CardMesh } from "./three/CardMesh";
import { CardController } from "./three/CardController";

// Global WebGL context manager to prevent too many contexts
let activeWebGLContexts = 0;
const MAX_WEBGL_CONTEXTS = 8;

type CardStageProps = {
  cards: Array<{ title: string; content: string }>; // minimal text inputs
  strategy?: 'fan' | 'focus' | 'grid';
  className?: string;
  enableClickSelect?: boolean; // when true, click a card to focus and flip
  fullscreen?: boolean; // when true, canvas fills entire viewport
  onCardSelected?: (cardIndex: number) => void; // callback when a card is selected
  showNextButton?: boolean; // show next challenge button after card flip
  onNext?: () => void; // callback for next button
  visible?: boolean; // when false, don't initialize WebGL
};

const CardStage = ({ cards, strategy = 'fan', className, enableClickSelect = true, fullscreen = false, onCardSelected, showNextButton = false, onNext, visible = true }: CardStageProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [cardFlipped, setCardFlipped] = useState(false);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    if (!mountRef.current || !visible) return;

    // Prevent body scroll when fullscreen
    if (fullscreen) {
      document.body.style.overflow = 'hidden';
    }

    const scene = new Scene();
    scene.background = null as unknown as Color;

    const camera = new PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.set(0, 0, 10);

    // Check WebGL context limit
    if (activeWebGLContexts >= MAX_WEBGL_CONTEXTS) {
      console.warn('Too many WebGL contexts active, skipping creation');
      return;
    }

    // Create renderer with better WebGL context management
    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ 
        antialias: false, // Disable antialiasing to reduce GPU load
        alpha: true,
        powerPreference: "default", // Use default instead of high-performance
        preserveDrawingBuffer: false,
        failIfMajorPerformanceCaveat: false,
        stencil: false, // Disable stencil buffer
        depth: true
      });
      
      // Check if WebGL context is valid
      const gl = renderer.getContext();
      if (!gl) {
        throw new Error('Failed to create WebGL context');
      }
      
      // Add context lost/restored event listeners
      gl.canvas.addEventListener('webglcontextlost', (event) => {
        console.warn('WebGL context lost');
        event.preventDefault();
        isAnimating = false;
      });
      
      gl.canvas.addEventListener('webglcontextrestored', () => {
        console.log('WebGL context restored');
        // Don't restart animation automatically to prevent issues
      });
      
      // Increment active context counter
      activeWebGLContexts++;
      
      // Set pixel ratio with conservative limit to prevent performance issues
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      
      console.log(`WebGL Renderer created successfully (${activeWebGLContexts}/${MAX_WEBGL_CONTEXTS})`);
    } catch (error) {
      console.error('Failed to create WebGL renderer:', error);
      return; // Exit early if renderer creation fails
    }
    
    // Calculate size based on fullscreen mode
    const getSize = () => {
      if (fullscreen) {
        return {
          width: window.innerWidth,
          height: window.innerHeight
        };
      } else {
        return {
          width: mountRef.current!.clientWidth,
          height: mountRef.current!.clientHeight
        };
      }
    };
    
    const size = getSize();
    renderer.setSize(size.width, size.height);
    mountRef.current.appendChild(renderer.domElement);

    const controller = new CardController(scene, camera);
    const raycaster = new Raycaster();
    const mouse = new Vector2();

    // build card meshes
    const meshes = cards.map((c, index) => {
      // Create unique textures for each card to avoid immutable texture issues
      const textures = CardMesh.createCanvasTextureFromText({ title: c.title, content: c.content });
      const mesh = new CardMesh(textures);
      mesh.position.set(0, 0, 0);
      // Ensure each mesh has a unique name for debugging
      mesh.name = `card-${index}`;
      return mesh;
    });
    controller.addMany(meshes);

    let animationId: number;
    let isAnimating = true;
    
    const animate = () => {
      if (!isAnimating) return; // Stop if animation is disabled
      
      try {
        renderer.render(scene, camera);
        animationId = requestAnimationFrame(animate);
      } catch (error) {
        console.error('Animation loop error:', error);
        isAnimating = false;
      }
    };
    animate();

    const run = async () => {
      isAnimatingRef.current = true;
      const strategyCards = controller.children as Mesh[];
      // 1) start overlapped
      await controller.overlap(strategyCards);
      // 2) fan out backs in true arc shape
      await controller.fanOut(strategyCards, scene, camera, 3.5, Math.PI / 3);
      isAnimatingRef.current = false;
    };
    run();

    // click to select -> hide others, center, flip
    const handleClick = async (ev: MouseEvent) => {
      if (!enableClickSelect || isAnimatingRef.current) return;
      
      // Get mouse position relative to canvas
      const rect = renderer.domElement.getBoundingClientRect();
      const mouseX = ev.clientX - rect.left;
      const mouseY = ev.clientY - rect.top;
      
      // Convert to normalized device coordinates (-1 to 1)
      mouse.x = (mouseX / rect.width) * 2 - 1;
      mouse.y = -(mouseY / rect.height) * 2 + 1;
      
      // Update raycaster with camera and mouse position
      raycaster.setFromCamera(mouse, camera);
      
      const strategyCards = controller.children as Mesh[];
      
      // Get intersections with all cards
      const intersects = raycaster.intersectObjects(strategyCards);
      
      if (intersects.length > 0) {
        // Find the card that was clicked (closest intersection)
        const clickedCard = intersects[0].object as Mesh;
        const cardIndex = strategyCards.findIndex(card => card === clickedCard);
        
        if (cardIndex !== -1) {
          isAnimatingRef.current = true;
          await controller.focusSelected(strategyCards, cardIndex);
          setCardFlipped(true);
          onCardSelected?.(cardIndex);
          renderer.domElement.removeEventListener('click', handleClick);
          isAnimatingRef.current = false;
        }
      }
    };
    renderer.domElement.addEventListener('click', handleClick);

    const onResize = () => {
      if (!mountRef.current) return;
      const size = getSize();
      renderer.setSize(size.width, size.height);
      camera.aspect = size.width / size.height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);
    onResize();

    const mountElement = mountRef.current;
    return () => {
      // Restore body scroll
      if (fullscreen) {
        document.body.style.overflow = '';
      }
      window.removeEventListener('resize', onResize);
      if (mountElement) {
        mountElement.removeChild(renderer.domElement);
      }
      renderer.domElement.removeEventListener('click', handleClick);
      
      // Clean up meshes and textures
      meshes.forEach(mesh => {
        try {
          mesh.dispose();
        } catch (error) {
          console.warn('Error disposing mesh:', error);
        }
      });
      
      // Stop animation loop first
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      
      // Clean up renderer and WebGL context
      try {
        // Force context loss to free resources
        const gl = renderer.getContext();
        if (gl && gl.getExtension('WEBGL_lose_context')) {
          const loseContext = gl.getExtension('WEBGL_lose_context');
          if (loseContext) {
            loseContext.loseContext();
          }
        }
        renderer.dispose();
        
        // Decrement active context counter
        activeWebGLContexts = Math.max(0, activeWebGLContexts - 1);
        
        console.log(`WebGL context disposed successfully (${activeWebGLContexts}/${MAX_WEBGL_CONTEXTS})`);
      } catch (error) {
        console.warn('Error disposing renderer:', error);
        // Still decrement counter even if disposal fails
        activeWebGLContexts = Math.max(0, activeWebGLContexts - 1);
      }
    };
  }, [cards, strategy, enableClickSelect, fullscreen, onCardSelected, visible]);

  return (
    <div 
      ref={mountRef} 
      className={className} 
      style={{ 
        width: fullscreen ? '100vw' : '100%', 
        height: fullscreen ? '100vh' : '100%', 
        position: fullscreen ? 'fixed' : 'relative',
        top: fullscreen ? 0 : 'auto',
        left: fullscreen ? 0 : 'auto',
        zIndex: fullscreen ? 50 : 'auto'
      }} 
    >
       {cardFlipped && showNextButton && onNext && (
         <button
           onClick={onNext}
           className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10 px-8 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-lg font-medium"
         >
           下一个挑战
         </button>
       )}
    </div>
  );
};

export default CardStage;


