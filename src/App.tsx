import Home from "./pages/home/home";
import Settings from "./pages/settings/settings";
import CrazyAdventure from "./pages/playground/crazy_adventure";
import Playground from "./pages/playground/playground";
import { Routes, Route, Navigate } from "react-router-dom";
import { usePlayerStore } from "./store/store";

const App = () => {
  const { player1, player2 } = usePlayerStore();
  const ready = !!(player1 && player2);

  return (
    <Routes>
      <Route path="/" element={<Settings />} />
      <Route path="/home" element={<Home />} />
      <Route path="/playground/crazy_adventure" element={ready ? <CrazyAdventure /> : <Navigate to="/" replace />} />
      <Route path="/playground" element={ready ? <Playground /> : <Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;