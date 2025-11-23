import { Group, PerspectiveCamera, Scene, Vector3, Mesh } from "three";
import gsap from "gsap";
import { createDrawVibration } from "../../utils/vibration";

export type CardLike = {
    position: Vector3;
    rotation: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
};

export type MotionStrategy = (cards: CardLike[], scene: Scene, camera: PerspectiveCamera, ...args: unknown[]) => Promise<void>;

export class CardController {
    private group: Group;
    private scene: Scene;
    private camera: PerspectiveCamera;

    constructor(scene: Scene, camera: PerspectiveCamera) {
        this.scene = scene;
        this.camera = camera;
        this.group = new Group();
        this.scene.add(this.group);
    }

  public add(mesh: Mesh) {
        this.group.add(mesh);
    }

  public addMany(meshes: Mesh[]) {
    meshes.forEach((m: Mesh) => this.group.add(m));
  }

    public get children(): Mesh[] {
        return this.group.children as Mesh[];
    }

  // Arrange all cards overlapped at origin (small z stacking) - Optimized for mobile
  public async overlap(cards: Mesh[]): Promise<void> {
    const DURATION = 0.6; // Slower duration for smoother feel
    
    await Promise.all(cards.map((c, i) => new Promise<void>(resolve => {
      // Use GSAP timeline for better performance
      const tl = gsap.timeline({ onComplete: () => resolve() });
      tl.to(c.position, { duration: DURATION, x: 0, y: 0, z: -0.05 * i, ease: "power2.out" })
        .to(c.rotation, { duration: DURATION, x: 0, y: 0, z: 0, ease: "power2.out" }, 0)
        .to((c.material as unknown as { opacity: number }), { duration: DURATION, opacity: 1 }, 0);
    })));
  }

    // Strategy: fan out in a true arc shape (like spreading cards from bottom center) - Optimized for mobile
  public fanOut: MotionStrategy = async (cards, scene, camera, ...args) => {
        const DURATION = 1.2; // Slower duration for more elegant fan out
        const radius = (args[0] as number) ?? 3.5;
        const angleSpread = (args[1] as number) ?? Math.PI / 3;
        const midIndex = (cards.length - 1) / 2;

        await Promise.all(cards.map((c, i) => new Promise<void>(resolve => {
            // Calculate angle for each card relative to center
            const angle = ((i - midIndex) / midIndex) * (angleSpread / 2);
            
            // Position cards in arc formation - FIXED: Use negative Y to create downward arc
            const x = radius * Math.sin(angle);
            const y = -radius * (1 - Math.cos(angle)); // NEGATIVE Y for downward arc
            const z = -0.2 * i; // Depth stacking

            // Use GSAP timeline for better performance
            const tl = gsap.timeline({ onComplete: () => resolve() });
            tl.to(c.position, { 
                duration: DURATION, 
                x, 
                y, 
                z, 
                ease: "power2.out"
            })
            .to(c.rotation, { 
                duration: DURATION, 
                z: -angle, // NEGATIVE angle to match downward arc direction
                ease: "power2.out"
            }, 0); // Start rotation animation at the same time
        })));
    };

    // Parameterized fan out with custom radius and angle spread
    public fanOutCustom: MotionStrategy = async (cards, scene, camera, ...args) => {
        return this.fanOut(cards, scene, camera, ...args);
    };

    // Strategy: focus one card to center and flip (rotate Y)
    public focusAndFlip: MotionStrategy = async (cards) => {
        const D1 = 0.8;
        const D2 = 0.8;
        // center all
        await Promise.all(cards.map(c => new Promise<void>(resolve => {
            gsap.to(c.position, { duration: D1, x: 0, y: 0, z: 0 });
            gsap.to(c.rotation, { duration: D1, z: 0, onComplete: () => resolve() });
        })));
        // flip the last one
        const last = cards[cards.length - 1];
        await new Promise<void>(resolve => {
            gsap.to(last.rotation, { duration: D2, y: last.rotation.y + Math.PI, onComplete: () => resolve() });
        });
    };

    // Strategy: grid spread then settle
  public gridSpread: MotionStrategy = async (cards) => {
        const DURATION = 0.9;
        const cols = Math.ceil(Math.sqrt(cards.length));
        const rows = Math.ceil(cards.length / cols);
        const gap = 1.4;
        const startX = -((cols - 1) * gap) / 2;
        const startY = -((rows - 1) * gap) / 2;
        await Promise.all(cards.map((c, idx) => new Promise<void>(resolve => {
            const r = Math.floor(idx / cols);
            const col = idx % cols;
            gsap.to(c.position, { duration: DURATION, x: startX + col * gap, y: startY + r * gap, z: -0.1 * idx });
            gsap.to(c.rotation, { duration: DURATION, x: 0, y: 0, z: 0, onComplete: () => resolve() });
        })));
    };

  // Focus selected: lift up -> hide others (at half point) -> center -> flip to front - Optimized for mobile
  public async focusSelected(cards: Mesh[], selectedIndex: number): Promise<void> {
    const D1 = 0.4; // Slower lift up duration
    const D2 = 0.5; // Slower hide others and center duration
    const D3 = 0.6; // Slower flip duration
    
    const target = cards[selectedIndex];
    
    // 开始抽取振动效果
    createDrawVibration();
    
    // Step 1: Start lifting the selected card up
    const liftPromise = new Promise<void>(resolve => {
      gsap.to(target.position, { 
        duration: D1, 
        y: target.position.y + 0.5, // Lift up by 0.5 units
        ease: "power2.out",
        onComplete: () => resolve() 
      });
    });
    
    // Step 2: Start hiding other cards when lift animation is halfway through
    const hideOthersPromise = new Promise<void>(resolve => {
      // Wait for half of the lift animation duration
      setTimeout(() => {
        Promise.all(cards.map((c, i) => new Promise<void>(resolveCard => {
          if (i !== selectedIndex) {
            // Hide other cards
            gsap.to((c.material as unknown as { opacity: number }), { 
              duration: D2, 
              opacity: 0, 
              ease: "power2.in",
              onComplete: () => {
                c.visible = false;
                resolveCard();
              }
            });
          } else {
            resolveCard(); // Selected card doesn't need to hide
          }
        }))).then(() => resolve());
      }, D1 * 500); // Half of lift duration in milliseconds
    });
    
    // Step 3: Center the selected card after lift is complete
    const centerPromise = liftPromise.then(() => {
      return new Promise<void>(resolve => {
        const tl = gsap.timeline({ onComplete: () => resolve() });
        tl.to(target.position, { 
          duration: D2, 
          x: 0, 
          y: 0, 
          z: 0,
          ease: "power2.inOut"
        })
        .to(target.rotation, { 
          duration: D2, 
          x: 0, 
          y: 0, 
          z: 0,
          ease: "power2.inOut"
        }, 0)
        .to((target.material as unknown as { opacity: number }), { 
          duration: D2, 
          opacity: 1 
        }, 0);
      });
    });
    
    // Step 4: Wait for both hide others and center to complete, then flip
    await Promise.all([hideOthersPromise, centerPromise]);
    
    // Step 5: Flip the selected card to show front
    await new Promise<void>(resolve => {
      gsap.to(target.rotation, { 
        duration: D3, 
        y: Math.PI, 
        ease: "power2.inOut",
        onComplete: () => resolve() 
      });
    });
  }
}


