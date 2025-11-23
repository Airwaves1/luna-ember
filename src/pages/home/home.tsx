import { useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";

const Home = () => {
    const navigate = useNavigate();

    const modes: Array<{ key: string; title: string; soon?: boolean }> = [
        { key: "crazy_adventure", title: "大冒险" },
        { key: "crazy_adventure_remote", title: "大冒险(异地版)" , soon: true},
        { key: "theater", title: "情侣剧场",  soon: true},
        { key: "flight", title: "飞行棋", soon: true},
        { key: "flight_remote", title: "飞行棋(异地版)" , soon: true},
    ];

    const goSettings = (mode: string, disabled?: boolean) => {
        if (disabled) return;
        if (mode === 'crazy_adventure') {
            navigate('/playground/crazy_adventure');
        } else {
            navigate(`/settings?mode=${mode}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div />
                    <button
                        onClick={() => navigate('/settings')}
                        className="px-4 py-2 bg-gray-800 rounded-xl text-sm hover:bg-gray-700 transition-colors flex items-center space-x-2"
                    >
                        <Settings className="w-4 h-4" />
                    </button>
                </div>
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-light mb-2">选择玩法</h1>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {modes.map((m) => {
                        const disabled = !!m.soon;
                        return (
                            <button
                                key={m.key}
                                onClick={() => goSettings(m.key, disabled)}
                                disabled={disabled}
                                className={`text-left bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-gray-750 focus:outline-none ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">{m.title}</h3>
                                    </div>
                                    {m.soon && (
                                        <span className="px-2 py-1 text-xs rounded-full bg-gray-700 text-gray-300">敬请期待</span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="mt-10 text-center text-sm text-gray-500">
                    更多玩法开发中...
                </div>
            </div>
        </div>
    );
};

export default Home;
