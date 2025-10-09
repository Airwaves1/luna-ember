import { useEffect, useState } from "react";
import { usePlayerStore } from "../../store/store";
import { useNavigate } from "react-router-dom";

const Settings = () => {
    const { player1, player2, setPlayer1, setPlayer2 } = usePlayerStore();
    const navigate = useNavigate();
    const [femalePlayerName, setFemalePlayerName] = useState("");
    const [malePlayerName, setMalePlayerName] = useState("");

    // 回到主页时，自动把已保存的玩家名同步到输入框，保持可编辑
    useEffect(() => {
        if (player1?.name) setFemalePlayerName(player1.name);
        if (player2?.name) setMalePlayerName(player2.name);
    }, [player1?.name, player2?.name]);

    const handleConfirm = () => {
        if (femalePlayerName.trim()) {
            setPlayer1({ name: femalePlayerName.trim(), gender: 'female' });
        }
        if (malePlayerName.trim()) {
            setPlayer2({ name: malePlayerName.trim(), gender: 'male' });
        }
        setFemalePlayerName("");
        setMalePlayerName("");
        navigate('/home');
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
            <div className="w-full max-w-md">
                {/* 标题 */}
                <div className="text-center mb-20">
                    <h1 className="text-4xl font-light text-white mb-2">设置界面</h1>
                </div>

                {/* 玩家输入区域（始终可编辑） */}
                <div className="space-y-12">
                    {/* 女性玩家 */}
                    <div className="text-center">
                        <div className="mb-6">
                            <div className="w-16 h-16 bg-gray-800 rounded-full shadow-inner flex items-center justify-center mx-auto">
                                <span className="text-2xl text-purple-400">♀</span>
                            </div>
                        </div>
                        <input
                            type="text"
                            value={femalePlayerName}
                            onChange={(e) => setFemalePlayerName(e.target.value)}
                            placeholder="输入姓名"
                            className="w-full px-6 py-4 bg-gray-800 rounded-2xl shadow-inner text-white placeholder-gray-400 text-center text-lg focus:outline-none focus:shadow-lg transition-all duration-200"
                            maxLength={20}
                        />
                        {/* 保持输入简洁，无其他提示 */}
                    </div>

                    {/* 男性玩家 */}
                    <div className="text-center">
                        <div className="mb-6">
                            <div className="w-16 h-16 bg-gray-800 rounded-full shadow-inner flex items-center justify-center mx-auto">
                                <span className="text-2xl text-purple-400">♂</span>
                            </div>
                        </div>
                        <input
                            type="text"
                            value={malePlayerName}
                            onChange={(e) => setMalePlayerName(e.target.value)}
                            placeholder="输入姓名"
                            className="w-full px-6 py-4 bg-gray-800 rounded-2xl shadow-inner text-white placeholder-gray-400 text-center text-lg focus:outline-none focus:shadow-lg transition-all duration-200"
                            maxLength={20}
                        />
                        {/* 保持输入简洁，无其他提示 */}
                    </div>
                </div>

                {/* 确认按钮：始终可用，空输入时禁用 */}
                <div className="mt-16 text-center">
                    <button 
                        onClick={handleConfirm}
                        disabled={!(femalePlayerName.trim() && malePlayerName.trim())}
                        className="px-12 py-4 bg-gray-800 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-gray-700 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        确认
                    </button>
                </div>

                {/* 仅保留一个确认按钮，无开始游戏按钮 */}
            </div>
        </div>
    );
};

export default Settings;