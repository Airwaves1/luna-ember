import { create } from 'zustand';
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
    setPlayer1: (player: Player) => void
    setPlayer2: (player: Player) => void
    setConfirm: (confirm: boolean) => void
    setDifficulty: (d: Difficulty) => void
}

export const useUserStore = create<UserState>((set) => ({
    user: null,
    login: (name) => set({ user: { name } }),
    logout: () => set({ user: null })
}))

export const usePlayerStore = create<PlayerState>((set) => ({
    confirm: false,
    difficulty: 'normal',
    player1: null,
    player2: null,
    setPlayer1: (player) => set({ player1: player }),
    setConfirm: (confirm) => set({ confirm: confirm }),
    setPlayer2: (player) => set({ player2: player }),
    setDifficulty: (d) => set({ difficulty: d })
}))
