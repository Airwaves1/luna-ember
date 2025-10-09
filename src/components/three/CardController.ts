import { Group, PerspectiveCamera, Scene, Vector3, Mesh } from "three";
import gsap from "gsap";

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

  // Arrange all cards overlapped at origin (small z stacking)
  public async overlap(cards: Mesh[]): Promise<void> {
    const DURATION = 0.4;
    await Promise.all(cards.map((c, i) => new Promise<void>(resolve => {
      gsap.to(c.position, { duration: DURATION, x: 0, y: 0, z: -0.05 * i, onComplete: () => resolve() });
      gsap.to(c.rotation, { duration: DURATION, x: 0, y: 0, z: 0 });
      gsap.to((c.material as unknown as { opacity: number }), { duration: DURATION, opacity: 1, overwrite: true });
    })));
  }

    // Strategy: fan out in a true arc shape (like spreading cards from bottom center)
  public fanOut: MotionStrategy = async (cards, scene, camera, ...args) => {
        const DURATION = 1.2;
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

            gsap.to(c.position, { 
                duration: DURATION, 
                x, 
                y, 
                z, 
                ease: "power2.out",
                onComplete: () => resolve() 
            });
            gsap.to(c.rotation, { 
                duration: DURATION, 
                z: -angle, // NEGATIVE angle to match downward arc direction
                ease: "power2.out"
            });
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

  // Focus selected: lift up -> hide others -> center -> flip to front
  public async focusSelected(cards: Mesh[], selectedIndex: number): Promise<void> {
    const D1 = 0.3; // Lift up duration
    const D2 = 0.4; // Hide others and center duration
    const D3 = 0.6; // Flip duration
    
    const target = cards[selectedIndex];
    
    // Step 1: Lift the selected card up (like being picked up)
    await new Promise<void>(resolve => {
      gsap.to(target.position, { 
        duration: D1, 
        y: target.position.y + 0.5, // Lift up by 0.5 units
        ease: "power2.out",
        onComplete: () => resolve() 
      });
    });
    
    // Step 2: Hide other cards and center the selected card
    await Promise.all(cards.map((c, i) => new Promise<void>(resolve => {
      if (i === selectedIndex) {
        // Center the selected card
        gsap.to(c.position, { 
          duration: D2, 
          x: 0, 
          y: 0, 
          z: 0,
          ease: "power2.inOut"
        });
        gsap.to(c.rotation, { 
          duration: D2, 
          x: 0, 
          y: 0, 
          z: 0,
          ease: "power2.inOut",
          onComplete: () => resolve() 
        });
        gsap.to((c.material as unknown as { opacity: number }), { 
          duration: D2, 
          opacity: 1 
        });
      } else {
        // Hide other cards
        gsap.to((c.material as unknown as { opacity: number }), { 
          duration: D2, 
          opacity: 0, 
          ease: "power2.in",
          onComplete: () => {
            c.visible = false;
            resolve();
          }
        });
      }
    })));
    
    // Step 3: Flip the selected card to show front
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


