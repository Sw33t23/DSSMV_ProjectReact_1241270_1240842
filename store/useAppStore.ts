import { create } from 'zustand';
import { User } from 'firebase/auth'; 

interface AppState {
  user: User | null;
  isLoadingAuth: boolean;
  watchlist: number[];
  viewed: number[]; // Store IDs of movies marked as watched
  ratings: Record<number, number>;
}

interface AppActions {
  setFirebaseUser: (user: User | null) => void;
  toggleWatchlistItem: (id: number) => void;
  toggleViewedStatus: (id: number) => void; // New Action
  setRating: (id: number, rating: number) => void;
}

export const useAppStore = create<AppState & AppActions>((set) => ({
  user: null,
  isLoadingAuth: true,
  watchlist: [],
  viewed: [], // Initial state
  ratings: {},

  setFirebaseUser: (user) => set({ user, isLoadingAuth: false }),

  toggleWatchlistItem: (id) => set((state) => ({
    watchlist: state.watchlist.includes(id)
      ? state.watchlist.filter(item => item !== id)
      : [...state.watchlist, id],
  })),

  toggleViewedStatus: (id) => set((state) => ({
    viewed: state.viewed.includes(id)
      ? state.viewed.filter(item => item !== id)
      : [...state.viewed, id],
  })),

  setRating: (id, rating) => set((state) => ({
    ratings: { ...state.ratings, [id]: rating },
  })),
}));