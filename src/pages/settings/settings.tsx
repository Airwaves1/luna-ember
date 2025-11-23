import { useEffect, useState } from "react";
import { usePlayerStore } from "../../store/store";
import { useNavigate } from "react-router-dom";
import { UserCheck, Volume2, VolumeX, ChevronDown, ChevronUp, Heart } from "lucide-react";

const Settings = () => {
    const { player1, player2, setPlayer1, setPlayer2, vibrationEnabled, setVibrationEnabled } = usePlayerStore();
    const navigate = useNavigate();
    const [femalePlayerName, setFemalePlayerName] = useState("");
    const [malePlayerName, setMalePlayerName] = useState("");
    const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);

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
                                <Heart className="w-8 h-8 text-pink-400" />
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
                                <UserCheck className="w-8 h-8 text-purple-400" />
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

                {/* 高级设置 - 可展开区域 */}
                <div className="mt-8">
                    <button
                        onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition-all duration-200"
                    >
                        <span className="text-gray-300 text-sm font-medium">更多设置</span>
                        {isSettingsExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                    </button>
                    
                    {/* 展开的设置内容 */}
                    {isSettingsExpanded && (
                        <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                            {/* 振动设置 */}
                            <div className="bg-gray-800 rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        {vibrationEnabled ? (
                                            <Volume2 className="w-5 h-5 text-purple-400" />
                                        ) : (
                                            <VolumeX className="w-5 h-5 text-gray-500" />
                                        )}
                                        <div>
                                            <span className="text-white text-sm font-medium">振动反馈</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setVibrationEnabled(!vibrationEnabled)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                            vibrationEnabled ? 'bg-purple-600' : 'bg-gray-600'
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                vibrationEnabled ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                        />
                                    </button>
                                </div>
                            </div>
                            
                            {/* 预留其他设置的位置 */}
                            <div className="bg-gray-800 rounded-xl p-4 opacity-50">
                                <div className="flex items-center space-x-3">
                                    <div className="w-5 h-5 bg-gray-600 rounded"></div>
                                    <div>
                                        <span className="text-gray-400 text-sm font-medium">更多设置</span>
                                        <p className="text-gray-500 text-xs">敬请期待</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;