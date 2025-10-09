import { useState, useEffect, useRef, useCallback } from "react";
import { Scene, PerspectiveCamera, WebGLRenderer, PlaneGeometry, Mesh, DoubleSide, ShaderMaterial, CanvasTexture, LinearFilter } from "three";

interface CardData {
    id: string;
    level: number;
    title: string;
    content: string;
}

interface CardProps {
    cardData: CardData;
    onFlipComplete?: () => void;
    className?: string;
}

const Card = ({ cardData, onFlipComplete, className = "" }: CardProps) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<Mesh | null>(null);
    const animationIdRef = useRef<number | null>(null);
    const rendererRef = useRef<WebGLRenderer | null>(null);
    const [isFlipped, setIsFlipped] = useState(false);

    // Create card back texture
    const createCardBackTexture = useCallback(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 3072;
        const ctx = canvas.getContext('2d')!;

        // Enable high-quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Simple dark background
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Simple border
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 16;
        ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

        const texture = new CanvasTexture(canvas);
        texture.minFilter = texture.magFilter = LinearFilter;
        texture.generateMipmaps = false;
        return texture;
    }, []);

    // Create card front texture with content
    const createCardFrontTexture = useCallback(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 3072;
        const ctx = canvas.getContext('2d')!;

        // Enable high-quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Background
        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Border
        ctx.strokeStyle = '#4b5563';
        ctx.lineWidth = 16;
        ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

        // Title - extremely large font, positioned near top
        ctx.fillStyle = 'white';
        ctx.font = 'bold 200px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(cardData.title, canvas.width / 2, canvas.height * 0.25);

        // Content with word wrap - extremely large font, centered
        ctx.font = '140px Arial';
        ctx.fillStyle = '#d1d5db';
        
        const words = cardData.content.split('');
        const lineHeight = 180;
        const maxWidth = canvas.width - 400;
        
        // Calculate total content height for centering
        let totalContentHeight = 0;
        let tempLine = '';
        for (let i = 0; i < words.length; i++) {
            const testLine = tempLine + words[i];
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && i > 0) {
                totalContentHeight += lineHeight;
                tempLine = words[i];
            } else {
                tempLine = testLine;
            }
        }
        totalContentHeight += lineHeight; // Add last line
        
        // Start content from center minus half of total height
        let y = canvas.height / 2 - totalContentHeight / 2;
        
        let line = '';
        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i];
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && i > 0) {
                ctx.fillText(line, canvas.width / 2, y);
                line = words[i];
                y += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, canvas.width / 2, y);

        const texture = new CanvasTexture(canvas);
        texture.minFilter = texture.magFilter = LinearFilter;
        texture.generateMipmaps = false;
        return texture;
    }, [cardData]);

    useEffect(() => {
        if (!mountRef.current) return;

        // Create textures
        const frontTexture = createCardFrontTexture();
        const backTexture = createCardBackTexture();

        // Scene setup
        const scene = new Scene();
        const camera = new PerspectiveCamera(75, 400 / 600, 0.1, 1000);
        const renderer = new WebGLRenderer({ antialias: true, alpha: true });
        
        renderer.setSize(400, 600);
        renderer.setClearColor(0x000000, 0);
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Shader material for double-sided textures
        const material = new ShaderMaterial({
            uniforms: {
                frontTex: { value: frontTexture },
                backTex: { value: backTexture },
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec2 vUv;
                void main() {
                    vNormal = normalMatrix * normal;
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D frontTex;
                uniform sampler2D backTex;
                varying vec3 vNormal;
                varying vec2 vUv;
                void main() {
                    vec3 n = normalize(vNormal);
                    // 判断法线朝向摄像机
                    if (gl_FrontFacing) {
                        // 正面显示背面纹理（初始状态）
                        gl_FragColor = texture2D(backTex, vUv);
                    } else {
                        // 背面显示正面纹理（翻转后）
                        gl_FragColor = texture2D(frontTex, vec2(1.0 - vUv.x, vUv.y));
                    }
                }
            `,
            side: DoubleSide,
        });

        // Card geometry - much larger card
        const geometry = new PlaneGeometry(3.2, 4.8);
        
        // Create card
        const card = new Mesh(geometry, material);
        scene.add(card);
        cardRef.current = card;

        // Camera position
        camera.position.z = 6;

        // Animation loop
        const animate = () => {
            animationIdRef.current = requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();

        // Cleanup
        const mountElement = mountRef.current;
        return () => {
            if (animationIdRef.current) {
                cancelAnimationFrame(animationIdRef.current);
            }
            if (mountElement && renderer.domElement) {
                mountElement.removeChild(renderer.domElement);
            }
            renderer.dispose();
            material.dispose();
            frontTexture.dispose();
            backTexture.dispose();
            geometry.dispose();
        };
    }, [createCardFrontTexture, createCardBackTexture]);

    const handleCardClick = () => {
        if (isFlipped || !cardRef.current) return;
        
        setIsFlipped(true);
        
        const startTime = Date.now();
        const duration = 1000;
        
        const animateFlip = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            cardRef.current!.rotation.y = easeProgress * Math.PI;
            
            if (progress < 1) {
                requestAnimationFrame(animateFlip);
            } else {
                onFlipComplete?.();
            }
        };
        
        animateFlip();
    };

    return (
        <div className={`w-96 h-144 cursor-pointer ${className}`} onClick={handleCardClick}>
            <div ref={mountRef} className="w-full h-full" />
        </div>
    );
};

export { Card, type CardProps, type CardData };