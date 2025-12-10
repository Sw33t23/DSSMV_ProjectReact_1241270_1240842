import { create } from 'zustand';
import { User } from 'firebase/auth'; 

// 1. Define the State Structure
interface AppState {
  // Auth State
  user: User | null;
  isLoadingAuth: boolean;
  
  // Movie/Watchlist State
  watchlist: number[]; // Array of movie IDs
  ratings: Record<number, number>; // { movieId: rating (1-5) }
}

// 2. Define the Actions/Mutators
interface AppActions {
  setFirebaseUser: (user: User | null) => void;
  toggleWatchlistItem: (id: number) => void;
  setRating: (id: number, rating: number) => void;
  // Add more actions here (e.g., setInitialData)
}

// 3. Combine State and Actions into the Store Hook
export const useAppStore = create<AppState & AppActions>((set, get) => ({
  // --- INITIAL STATE ---
  user: null,
  isLoadingAuth: true,
  watchlist: [],
  ratings: {},

  // --- ACTIONS ---

  // Action to update user status from Firebase listener
  setFirebaseUser: (user) => set({
    user,
    // When the listener fires, loading is done
    isLoadingAuth: false, 
  }),

  // Action to add/remove a movie from the Watchlist
  toggleWatchlistItem: (id) => set((state) => {
    const isPresent = state.watchlist.includes(id);
    return {
      watchlist: isPresent
        ? state.watchlist.filter(item => item !== id) // Remove
        : [...state.watchlist, id],                   // Add
    };
  }),

  // Action to set or update a rating for a movie
  setRating: (id, rating) => set((state) => ({
    ratings: {
      ...state.ratings,
      [id]: rating,
    },
  })),
}));