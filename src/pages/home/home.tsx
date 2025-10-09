import { useNavigate } from "react-router-dom";

const Home = () => {
    const navigate = useNavigate();

    const modes: Array<{ key: string; title: string; desc: string; soon?: boolean }> = [
        { key: "adventure", title: "情侣大冒险", desc: "抽卡真心话/大冒险，轻松热场" },
        { key: "theater", title: "情侣剧场", desc: "剧情互动式体验，沉浸式恋爱" , soon: true},
        { key: "flight-local", title: "情侣飞行棋", desc: "同屏对战，欢乐互怼" , soon: true},
        { key: "flight-remote", title: "异地飞行棋", desc: "在线对战，跨城也能玩" , soon: true},
    ];

    const goSettings = (mode: string, disabled?: boolean) => {
        if (disabled) return;
        if (mode === 'adventure') {
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
                        className="px-4 py-2 bg-gray-800 rounded-xl text-sm hover:bg-gray-700 transition-colors"
                    >
                        设置
                    </button>
                </div>
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-light mb-2">选择玩法</h1>
                    <p className="text-gray-400">挑一个你们现在最想玩的～</p>
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
                                        <p className="text-gray-400 text-sm">{m.desc}</p>
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
                    更多玩法正在打磨中，敬请期待...
                </div>
            </div>
        </div>
    );
};

export default Home;
