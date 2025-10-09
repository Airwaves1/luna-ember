import { useEffect, useRef, useState } from "react";
import { Mesh, Raycaster, Vector2 } from "three";
import { CardMesh } from "./three/CardMesh";
import { CardController } from "./three/CardController";
import { WebGLManager } from "./three/WebGLManager";

type CardStageSimpleProps = {
  cards: Array<{ title: string; content: string }>;
  strategy?: 'fan' | 'focus' | 'grid';
  className?: string;
  enableClickSelect?: boolean;
  fullscreen?: boolean;
  onCardSelected?: (cardIndex: number) => void;
  showNextButton?: boolean;
  onNext?: () => void;
  visible?: boolean;
};

const CardStageSimple = ({ 
  cards, 
  strategy = 'fan', 
  className, 
  enableClickSelect = true, 
  fullscreen = false, 
  onCardSelected, 
  showNextButton = false, 
  onNext, 
  visible = true 
}: CardStageSimpleProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const controllerRef = useRef<CardController | null>(null);
  const meshesRef = useRef<CardMesh[]>([]);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    if (!mountRef.current || !visible) {
      setIsReady(false);
      return;
    }

    const webGLManager = WebGLManager.getInstance();
    
    const initialize = async () => {
      try {
        // Initialize WebGL Manager (will clear scene if already initialized)
        const success = await webGLManager.initialize(mountRef.current!);
        if (!success) {
          console.error('Failed to initialize WebGL Manager');
          return;
        }


        const scene = webGLManager.getScene()!;
        const camera = webGLManager.getCamera()!;
        const renderer = webGLManager.getRenderer()!;

        // Handle resize
        const handleResize = () => {
          if (!mountRef.current) return;
          const size = fullscreen 
            ? { width: window.innerWidth, height: window.innerHeight }
            : { width: mountRef.current.clientWidth, height: mountRef.current.clientHeight };
          webGLManager.resize(size.width, size.height);
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        // Clean up previous meshes if any
        if (meshesRef.current.length > 0) {
          meshesRef.current.forEach(mesh => {
            try {
              mesh.dispose();
            } catch (error) {
              console.warn('Error disposing previous mesh:', error);
            }
          });
          meshesRef.current = [];
        }

        // Create card controller
        const controller = new CardController(scene, camera);
        controllerRef.current = controller;

        // Create card meshes
        const meshes = cards.map((card, index) => {
          const textures = CardMesh.createCanvasTextureFromText({ 
            title: card.title, 
            content: card.content 
          });
          const mesh = new CardMesh(textures);
          mesh.position.set(0, 0, 0);
          mesh.name = `card-${index}`;
          return mesh;
        });

        meshesRef.current = meshes;
        controller.addMany(meshes);
        

        // Setup click handler
        const raycaster = new Raycaster();
        const mouse = new Vector2();

        const handleClick = async (ev: MouseEvent) => {
          if (!enableClickSelect || isAnimatingRef.current) return;

          const rect = renderer.domElement.getBoundingClientRect();
          const mouseX = ev.clientX - rect.left;
          const mouseY = ev.clientY - rect.top;

          mouse.x = (mouseX / rect.width) * 2 - 1;
          mouse.y = -(mouseY / rect.height) * 2 + 1;

          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObjects(meshes);

          if (intersects.length > 0) {
            const clickedCard = intersects[0].object as Mesh;
            const cardIndex = meshes.findIndex(card => card === clickedCard);

            if (cardIndex !== -1) {
              isAnimatingRef.current = true;
              await controller.focusSelected(meshes, cardIndex);
              setCardFlipped(true);
              onCardSelected?.(cardIndex);
              renderer.domElement.removeEventListener('click', handleClick);
              isAnimatingRef.current = false;
            }
          }
        };

        renderer.domElement.addEventListener('click', handleClick);

        // Reset card state
        setCardFlipped(false);
        isAnimatingRef.current = false;

        // Start animation
        const runAnimation = async () => {
          isAnimatingRef.current = true;
          await controller.overlap(meshes);
          await controller.fanOut(meshes, scene, camera, 3.5, Math.PI / 3);
          isAnimatingRef.current = false;
        };

        runAnimation();

        setIsReady(true);

        // Cleanup function
        return () => {
          window.removeEventListener('resize', handleResize);
          renderer.domElement.removeEventListener('click', handleClick);
          
          // Clean up meshes
          meshes.forEach(mesh => {
            try {
              mesh.dispose();
            } catch (error) {
              console.warn('Error disposing mesh:', error);
            }
          });

          meshesRef.current = [];
          controllerRef.current = null;
        };

      } catch (error) {
        console.error('Error initializing CardStage:', error);
      }
    };

    const cleanup = initialize();
    
    return () => {
      cleanup.then(cleanupFn => {
        if (cleanupFn) cleanupFn();
      });
    };
  }, [cards, strategy, enableClickSelect, fullscreen, onCardSelected, visible]);

  // Handle fullscreen body scroll
  useEffect(() => {
    if (fullscreen && visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [fullscreen, visible]);

  if (!visible) {
    return null;
  }

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

export default CardStageSimple;
