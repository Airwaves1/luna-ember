import { useState } from "react";
import { usePlayerStore } from "../../store/store";
import { useNavigate } from "react-router-dom";

const Playground = () => {
    const { player1, player2, setConfirm } = usePlayerStore();
    const navigate = useNavigate();
    const [drawnCard, setDrawnCard] = useState<{
        id: string;
        title: string;
        description: string;
        content: string;
        type: string;
    } | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    // 真心话大冒险卡牌库
    const adventureCards = [
        {
            id: "truth_001",
            title: "真心话",
            description: "分享一个你从未告诉过任何人的秘密",
            content: "说出你内心深处最真实的想法，让彼此更了解对方",
            type: "真心话"
        },
        {
            id: "dare_001", 
            title: "大冒险",
            description: "给对方一个拥抱，持续30秒",
            content: "用行动表达你的爱意，让感情更加亲密",
            type: "大冒险"
        },
        {
            id: "truth_002",
            title: "真心话",
            description: "说出你最喜欢对方的三个地方",
            content: "真诚地表达你的欣赏和爱慕之情",
            type: "真心话"
        },
        {
            id: "dare_002",
            title: "大冒险",
            description: "模仿对方的一个习惯动作",
            content: "通过模仿来展现你对对方的关注和了解",
            type: "大冒险"
        },
        {
            id: "truth_003",
            title: "真心话",
            description: "说出你们第一次见面时的感受",
            content: "回忆美好的初遇，重温那份心动",
            type: "真心话"
        },
        {
            id: "dare_003",
            title: "大冒险",
            description: "一起唱一首情歌",
            content: "用歌声传递爱意，创造浪漫回忆",
            type: "大冒险"
        },
        {
            id: "truth_004",
            title: "真心话",
            description: "说出你希望对方为你做的一件事",
            content: "坦诚地表达你的需求和期待",
            type: "真心话"
        },
        {
            id: "dare_004",
            title: "大冒险",
            description: "给对方按摩5分钟",
            content: "用温柔的触摸表达你的关爱",
            type: "大冒险"
        },
        {
            id: "truth_005",
            title: "真心话",
            description: "说出你最喜欢和对方一起做的事情",
            content: "分享你们共同的快乐时光",
            type: "真心话"
        },
        {
            id: "dare_005",
            title: "大冒险",
            description: "一起拍一张搞怪的自拍照",
            content: "释放内心的童真，创造欢乐回忆",
            type: "大冒险"
        },
        {
            id: "truth_006",
            title: "真心话",
            description: "说出你为对方做过的最浪漫的事",
            content: "分享那些美好的回忆和感动瞬间",
            type: "真心话"
        },
        {
            id: "dare_006",
            title: "大冒险",
            description: "给对方写一首小诗",
            content: "用文字表达你的深情，创造专属回忆",
            type: "大冒险"
        }
    ];

    const drawCard = () => {
        setIsDrawing(true);
        
        // 模拟抽卡动画
        setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * adventureCards.length);
            const card = adventureCards[randomIndex];
            setDrawnCard(card);
            setIsDrawing(false);
        }, 1500);
    };

    const resetCard = () => {
        setDrawnCard(null);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
                {/* 标题和玩家信息 */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-light mb-4">真心话大冒险</h1>
                    <div className="flex justify-center space-x-8">
                        {player1 && (
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gray-800 rounded-full shadow-inner flex items-center justify-center">
                                    <span className="text-purple-400">♀</span>
                                </div>
                                <span className="text-gray-300">{player1.name}</span>
                            </div>
                        )}
                        {player2 && (
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gray-800 rounded-full shadow-inner flex items-center justify-center">
                                    <span className="text-purple-400">♂</span>
                                </div>
                                <span className="text-gray-300">{player2.name}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 抽卡区域 */}
                <div className="text-center">
                    {!drawnCard && !isDrawing && (
                        <div className="space-y-8">
                            <div className="bg-gray-800 rounded-2xl p-8 shadow-lg max-w-md mx-auto">
                                <h3 className="text-xl font-medium mb-4">准备开始游戏</h3>
                                <p className="text-gray-300 mb-6">点击下方按钮抽取你的真心话大冒险卡牌</p>
                                <button 
                                    onClick={drawCard}
                                    className="px-8 py-4 bg-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-purple-700 text-lg font-medium"
                                >
                                    抽取卡牌
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 抽卡动画 */}
                    {isDrawing && (
                        <div className="space-y-8">
                            <div className="bg-gray-800 rounded-2xl p-8 shadow-lg max-w-md mx-auto">
                                <div className="flex items-center justify-center mb-4">
                                    <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                                <h3 className="text-xl font-medium mb-4">正在抽取卡牌...</h3>
                                <p className="text-gray-300">命运正在为你选择挑战</p>
                            </div>
                        </div>
                    )}

                    {/* 显示抽取的卡牌 */}
                    {drawnCard && (
                        <div className="space-y-8">
                            <div className="bg-gray-800 rounded-2xl p-8 shadow-lg max-w-lg mx-auto">
                                <div className="mb-4">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        drawnCard.type === '真心话' 
                                            ? 'bg-pink-600 text-white' 
                                            : 'bg-blue-600 text-white'
                                    }`}>
                                        {drawnCard.type}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-medium mb-4">{drawnCard.title}</h3>
                                <p className="text-gray-400 mb-4">{drawnCard.description}</p>
                                <div className="bg-gray-700 rounded-xl p-4 mb-6">
                                    <p className="text-gray-200 leading-relaxed">{drawnCard.content}</p>
                                </div>
                                <div className="flex space-x-4 justify-center">
                                    <button 
                                        onClick={resetCard}
                                        className="px-6 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors"
                                    >
                                        重新抽取
                                    </button>
                                    <button 
                                        onClick={() => {setConfirm(false); navigate('/home')}}
                                        className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                                    >
                                        返回主页
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Playground;