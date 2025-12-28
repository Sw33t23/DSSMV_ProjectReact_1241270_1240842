import { create } from 'zustand';
import { User } from 'firebase/auth'; 
import { db } from '../firebase/firebase'; 
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AppState {
  user: User | null;
  isLoadingAuth: boolean;
  watchlist: number[];
  viewed: number[];
  ratings: Record<number, number>;
}

interface AppActions {
  setFirebaseUser: (user: User | null) => void;
  loadUserData: (userId: string) => Promise<void>; // New: Load from DB
  toggleWatchlistItem: (id: number) => Promise<void>;
  toggleViewedStatus: (id: number) => Promise<void>;
  setRating: (id: number, rating: number) => Promise<void>;
}

export const useAppStore = create<AppState & AppActions>((set, get) => ({
  user: null,
  isLoadingAuth: true,
  watchlist: [],
  viewed: [],
  ratings: {},

  setFirebaseUser: (user) => set({ user, isLoadingAuth: false }),

  // 📥 LOAD DATA FROM FIRESTORE
  loadUserData: async (userId) => {
    try {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        set({
          watchlist: data.watchlist || [],
          viewed: data.viewed || [],
          ratings: data.ratings || {},
        });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  },

  // 💾 SAVE WATCHLIST
  toggleWatchlistItem: async (id) => {
    const { user, watchlist } = get();
    const newWatchlist = watchlist.includes(id)
      ? watchlist.filter(item => item !== id)
      : [...watchlist, id];
    
    set({ watchlist: newWatchlist }); // UI updates instantly

    if (user) {
      await setDoc(doc(db, "users", user.uid), { watchlist: newWatchlist }, { merge: true });
    }
  },

  // 💾 SAVE VIEWED STATUS
  toggleViewedStatus: async (id) => {
    const { user, viewed } = get();
    const newViewed = viewed.includes(id)
      ? viewed.filter(item => item !== id)
      : [...viewed, id];

    set({ viewed: newViewed });

    if (user) {
      await setDoc(doc(db, "users", user.uid), { viewed: newViewed }, { merge: true });
    }
  },

  // 💾 SAVE RATINGS
  setRating: async (id, rating) => {
    const { user, ratings } = get();
    const newRatings = { ...ratings, [id]: rating };

    set({ ratings: newRatings });

    if (user) {
      await setDoc(doc(db, "users", user.uid), { ratings: newRatings }, { merge: true });
    }
  },
}));