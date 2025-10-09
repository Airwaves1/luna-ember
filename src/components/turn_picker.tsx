import { useEffect, useMemo, useState, useRef } from "react";
import { usePlayerStore } from "../store/store";

type TurnPickerProps = {
    onPicked?: (picked: 'player1' | 'player2') => void;
    className?: string;
    pickedKey?: 'player1' | 'player2' | null;
    interactive?: boolean;
};

const TurnPicker = ({ onPicked, className, pickedKey = null, interactive = true }: TurnPickerProps) => {
    const { player1, player2 } = usePlayerStore();
    const [isPicking, setIsPicking] = useState(false);
    const [picked, setPicked] = useState<'player1' | 'player2' | null>(pickedKey);
    const [animationPhase, setAnimationPhase] = useState<'idle' | 'switching' | 'result'>('idle');
    
    const leftPlayerRef = useRef<HTMLDivElement>(null);
    const rightPlayerRef = useRef<HTMLDivElement>(null);
    const centerButtonRef = useRef<HTMLButtonElement>(null);

    const players = useMemo(() => {
        return [
            { key: 'player1' as const, name: player1?.name || '1' },
            { key: 'player2' as const, name: player2?.name || '2' }
        ];
    }, [player1?.name, player2?.name]);

    useEffect(() => {
        if (!interactive) {
            setPicked(pickedKey ?? null);
        }
    }, [pickedKey, interactive]);

    const displayName = (key: 'player1' | 'player2') => {
        return key === 'player1' ? (player1?.name || '1') : (player2?.name || '2');
    };

    const startPick = () => {
        if (!interactive || isPicking) return;
        
        setIsPicking(true);
        setPicked(null);
        setAnimationPhase('switching');
        
        // Start name switching directly
        startNameSwitching();
    };

    const startNameSwitching = () => {
        let switchCount = 0;
        const maxSwitches = 20; // Reduced for 2s duration
        let currentInterval = 50; // Start faster
        const minInterval = 150; // End slower
        
        const switchNames = () => {
            if (switchCount >= maxSwitches) {
                // Final result
                const idx = Math.floor(Math.random() * players.length);
                const res = players[idx].key;
                setPicked(res);
                setAnimationPhase('result');
                
                // Show final result - the button text will update automatically via React state
                
                // After 0.8 second display, continue with normal flow
                setTimeout(() => {
                    onPicked?.(res);
                    setIsPicking(false);
                    setAnimationPhase('idle');
                }, 800);
                return;
            }
            
            // Switch between player names
            const currentPlayer = switchCount % 2 === 0 ? 'player1' : 'player2';
            if (centerButtonRef.current) {
                centerButtonRef.current.textContent = displayName(currentPlayer);
            }
            
            switchCount++;
            
            // Gradually slow down
            currentInterval = currentInterval + (minInterval - currentInterval) * 0.15;
            
            setTimeout(switchNames, currentInterval);
        };
        
        switchNames();
    };

    return (
        <div className={className}>
            <div className="relative min-h-[60vh] flex items-center justify-center">
                {/* concentric circles */}
                <div className="absolute w-80 h-80 rounded-full bg-purple-500/10"></div>
                <div className="absolute w-64 h-64 rounded-full bg-purple-400/15"></div>
                <div className="absolute w-48 h-48 rounded-full bg-purple-300/20"></div>
                <div className="absolute w-32 h-32 rounded-full bg-purple-200/25"></div>

                {/* left player */}
                <div className="absolute -left-2 sm:-left-6">
                    <div 
                        ref={leftPlayerRef}
                        className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-white text-xl font-semibold shadow-lg transition-all duration-300 ${picked === 'player1' ? 'bg-purple-400 ring-2 ring-purple-100 scale-105' : 'bg-purple-800 hover:bg-purple-800'}`}
                    >
                        {displayName('player1')}
                    </div>
                </div>

                {/* right player */}
                <div className="absolute -right-2 sm:-right-6">
                    <div 
                        ref={rightPlayerRef}
                        className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-white text-xl font-semibold shadow-lg transition-all duration-300 ${picked === 'player2' ? 'bg-purple-400 ring-2 ring-purple-100 scale-105' : 'bg-purple-800 hover:bg-purple-800'}`}
                    >
                        {displayName('player2')}
                    </div>
                </div>

                {/* center button */}
                {interactive ? (
                    <button
                        ref={centerButtonRef}
                        onClick={startPick}
                        disabled={isPicking}
                        className={`relative w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-purple-500 text-white text-2xl font-extrabold shadow-xl border-2 border-purple-200 ${isPicking ? 'opacity-70 cursor-wait' : 'hover:bg-purple-600'}`}
                    >
                        {animationPhase === 'switching' ? '...' : animationPhase === 'result' ? (picked ? displayName(picked) : 'GO') : 'GO'}
                    </button>
                ) : (
                    <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-purple-500 text-white text-xl font-semibold shadow-xl border-2 border-purple-200 flex items-center justify-center">
                        {picked ? `${displayName(picked)}` : '待抽取'}
                    </div>
                )}
            </div>
            {picked && (
                <div className="text-center mt-6 text-gray-300">
                    本轮由 <span className="text-white font-semibold">{displayName(picked)}</span> 完成大冒险
                </div>
            )}
        </div>
    );
};

export default TurnPicker;


