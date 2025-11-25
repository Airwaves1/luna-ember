import { useEffect } from "react";
import Home from "./pages/home/home";
import Settings from "./pages/settings/settings";
import CrazyAdventure from "./pages/playground/crazy_adventure";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { usePlayerStore } from "./store/store";

const App = () => {
  const { player1, player2, fullscreenEnabled } = usePlayerStore();
  const location = useLocation();
  const ready = !!(player1 && player2);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    const enableFullscreen = async () => {
      if (!root.requestFullscreen) return;
      try {
        if (!document.fullscreenElement) {
          await root.requestFullscreen();
        }
      } catch (error) {
        console.warn('Failed to enter fullscreen:', error);
      }
    };

    const disableFullscreen = async () => {
      if (!document.exitFullscreen) return;
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        }
      } catch (error) {
        console.warn('Failed to exit fullscreen:', error);
      }
    };

    if (fullscreenEnabled) {
      enableFullscreen();
    } else {
      disableFullscreen();
    }

    return () => {
      disableFullscreen();
    };
  }, [fullscreenEnabled]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (location.pathname !== '/' && location.pathname !== '/settings') return;

    const handlePopState = () => {
      const pathname = window.location.pathname;
      if (pathname === '/' || pathname === '/settings') {
        window.removeEventListener('popstate', handlePopState);

        if ((navigator as { app?: { exitApp?: () => void } }).app?.exitApp) {
          (navigator as { app?: { exitApp?: () => void } }).app?.exitApp?.();
          return;
        }

        if (window.history.length > 1) {
          window.history.go(-window.history.length);
        } else {
          window.close?.();
        }
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/" element={<Settings />} />
      <Route path="/home" element={<Home />} />
      <Route path="/playground/crazy_adventure" element={ready ? <CrazyAdventure /> : <Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;