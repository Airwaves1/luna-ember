import { useState, useEffect } from "react";
import { usePlayerStore } from "../../../store/store";
import { useNavigate } from "react-router-dom";
import TurnPicker from "../../../components/turn_picker";
import CardStageSimple from "../../../components/card_stage_simple";
import { WebGLManager } from "../../../components/three/WebGLManager";
import type { CardData } from "../../../components/card";
import cardsData from "../../../data/cards.json";

const CrazyAdventure = () => {
    const { player1, player2 } = usePlayerStore();
    const navigate = useNavigate();
    const [phase, setPhase] = useState<'pick' | 'show'>('pick');
    const [pickedPlayer, setPickedPlayer] = useState<'player1' | 'player2' | null>(null);
    const [selectedCards, setSelectedCards] = useState<CardData[]>([]);

    // Get cards from JSON data
    const adventureCards: CardData[] = cardsData.cards;

    // Select 5 random cards for the current round
    const selectRandomCards = () => {
        const shuffled = [...adventureCards].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 5);
    };

    // Reset function for next round
    const resetForNext = () => {
        setSelectedCards([]);
        setPickedPlayer(null);
        setPhase('pick');
    };

    // Cleanup WebGL resources on component unmount
    useEffect(() => {
        return () => {
            WebGLManager.destroy();
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* CardStage with visibility control */}
            <CardStageSimple 
                cards={selectedCards.map(card => ({
                    title: card.title,
                    content: card.content
                }))}
                strategy="fan"
                enableClickSelect={true}
                fullscreen={true}
                showNextButton={true}
                visible={phase === 'show'}
                onNext={resetForNext}
                onCardSelected={(index) => {
                    // Card selected
                }}
            />
            
            {/* Pick phase layout */}
            <div style={{ display: phase === 'pick' ? 'block' : 'none' }} className="p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="relative mb-6">
                        <button 
                            onClick={() => navigate('/home')} 
                            className="absolute left-0 top-0 px-3 py-1.5 bg-gray-800 rounded-lg text-sm hover:bg-gray-700 transition-colors"
                        >
                            ←
                        </button>
                        <h1 className="text-2xl font-light text-center">真心话大冒险</h1>
                    </div>
                    <div className="text-center mb-12">
                        <div className="flex justify-center space-x-8">
                            {player1 && (
                                <div className={`flex items-center space-x-2 ${pickedPlayer === 'player1' ? 'bg-white/10 rounded-lg px-3 py-2' : ''}`}>
                                    <div className={`w-8 h-8 rounded-full shadow-inner flex items-center justify-center ${pickedPlayer === 'player1' ? 'bg-white/20' : 'bg-gray-800'}`}>
                                        <span className="text-purple-400">♀</span>
                                    </div>
                                    <span className="text-gray-300">{player1.name}</span>
                                </div>
                            )}
                            {player2 && (
                                <div className={`flex items-center space-x-2 ${pickedPlayer === 'player2' ? 'bg-white/10 rounded-lg px-3 py-2' : ''}`}>
                                    <div className={`w-8 h-8 rounded-full shadow-inner flex items-center justify-center ${pickedPlayer === 'player2' ? 'bg-white/20' : 'bg-gray-800'}`}>
                                        <span className="text-purple-400">♂</span>
                                    </div>
                                    <span className="text-gray-300">{player2.name}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="space-y-10">
                            <TurnPicker 
                                onPicked={(p) => { 
                                    setPickedPlayer(p); 
                                    // 选择5张随机卡牌
                                    const cards = selectRandomCards();
                                    setSelectedCards(cards);
                                    setPhase('show'); 
                                }} 
                                className="mt-6"
                            />
                            {pickedPlayer && (
                                <div className="text-gray-300">已选中：<span className="text-white font-semibold">{pickedPlayer === 'player1' ? (player1?.name || '1') : (player2?.name || '2')}</span></div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrazyAdventure;


