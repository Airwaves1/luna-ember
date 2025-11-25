import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Player } from '../types/common';

interface UserState {
    user: { name: string } | null
    login: (name: string) => void
    logout: () => void
}

type Difficulty = 'easy' | 'normal' | 'hard';

interface PlayerState {
    confirm: boolean
    difficulty: Difficulty
    player1: Player | null
    player2: Player | null
    vibrationEnabled: boolean
    fullscreenEnabled: boolean
    setPlayer1: (player: Player) => void
    setPlayer2: (player: Player) => void
    setConfirm: (confirm: boolean) => void
    setDifficulty: (d: Difficulty) => void
    setVibrationEnabled: (enabled: boolean) => void
    setFullscreenEnabled: (enabled: boolean) => void
}

const storage = typeof window !== 'undefined'
    ? createJSONStorage(() => localStorage)
    : undefined;

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            user: null,
            login: (name) => set({ user: { name } }),
            logout: () => set({ user: null })
        }),
        {
            name: 'user-store',
            storage
        }
    )
)

export const usePlayerStore = create<PlayerState>()(
    persist(
        (set) => ({
            confirm: false,
            difficulty: 'normal',
            player1: null,
            player2: null,
            vibrationEnabled: true, // 默认开启振动
            fullscreenEnabled: true,
            setPlayer1: (player) => set({ player1: player }),
            setConfirm: (confirm) => set({ confirm: confirm }),
            setPlayer2: (player) => set({ player2: player }),
            setDifficulty: (d) => set({ difficulty: d }),
            setVibrationEnabled: (enabled) => set({ vibrationEnabled: enabled }),
            setFullscreenEnabled: (enabled) => set({ fullscreenEnabled: enabled })
        }),
        {
            name: 'player-store',
            storage
        }
    )
)
