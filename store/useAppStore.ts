import { create } from 'zustand';
import { User, signOut } from 'firebase/auth'; 
import { db, auth } from '../firebase/firebase';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';

interface CommunityMovie {
  id: number;
  avgRating: number;
  title: string;
  poster_path: string;
}

interface AppState {
  user: User | null;
  isLoadingAuth: boolean;
  watchlist: number[];
  viewed: number[];
  ratings: Record<number, number>;
  communityTopMovies: CommunityMovie[];
}

interface AppActions {
  setFirebaseUser: (user: User | null) => void;
  loadUserData: (userId: string) => Promise<void>;
  toggleWatchlistItem: (id: number) => Promise<void>;
  toggleViewedStatus: (id: number) => Promise<void>;
  setRating: (id: number, rating: number) => Promise<void>;
  fetchCommunityTopTen: () => Promise<void>;
  logout: () => Promise<void>;
}

const TMDB_API_KEY = "918ad26dfa6acc69159fa52570caaf8c";

export const useAppStore = create<AppState & AppActions>((set, get) => ({
  user: null,
  isLoadingAuth: true,
  watchlist: [],
  viewed: [],
  ratings: {},
  communityTopMovies: [],

  setFirebaseUser: (user) => set({ user, isLoadingAuth: false }),

  // 📥 LOAD: Get permanent data from Firestore on Login
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
      console.error("Load User Data Error:", error);
    }
  },

  // 🚀 COMMUNITY LOGIC: Calculate averages from all users
  fetchCommunityTopTen: async () => {
    const { user } = get();
    if (!user) return; // Guard: Don't fetch if logged out

    try {
      const usersCol = collection(db, "users");
      const userDocs = await getDocs(usersCol);
      const movieTotals: Record<number, { sum: number; count: number }> = {};

      userDocs.forEach(doc => {
        const data = doc.data();
        if (data.ratings) {
          Object.entries(data.ratings).forEach(([id, rating]) => {
            const movieId = Number(id);
            if (!movieTotals[movieId]) movieTotals[movieId] = { sum: 0, count: 0 };
            movieTotals[movieId].sum += Number(rating);
            movieTotals[movieId].count += 1;
          });
        }
      });

      const rankedIds = Object.entries(movieTotals)
        .map(([id, stats]) => ({ id: Number(id), avgRating: stats.sum / stats.count }))
        .sort((a, b) => b.avgRating - a.avgRating)
        .slice(0, 10);

      const detailedMovies = await Promise.all(rankedIds.map(async (item) => {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${item.id}?api_key=${TMDB_API_KEY}`);
        const details = await res.json();
        return { ...item, title: details.title, poster_path: details.poster_path };
      }));

      set({ communityTopMovies: detailedMovies });
    } catch (error: any) {
      if (!error.message.includes("permission")) {
        console.error("Community Fetch Error:", error);
      }
    }
  },

  // 💾 PERSISTENT TOGGLES
  toggleWatchlistItem: async (id) => {
    const { user, watchlist } = get();
    const newWatchlist = watchlist.includes(id) ? watchlist.filter(i => i !== id) : [...watchlist, id];
    set({ watchlist: newWatchlist });
    if (user) await setDoc(doc(db, "users", user.uid), { watchlist: newWatchlist }, { merge: true });
  },

  toggleViewedStatus: async (id) => {
    const { user, viewed } = get();
    const newViewed = viewed.includes(id) ? viewed.filter(i => i !== id) : [...viewed, id];
    set({ viewed: newViewed });
    if (user) await setDoc(doc(db, "users", user.uid), { viewed: newViewed }, { merge: true });
  },

  setRating: async (id, rating) => {
    const { user, ratings } = get();
    const newRatings = { ...ratings, [id]: rating };
    set({ ratings: newRatings });
    if (user) {
      await setDoc(doc(db, "users", user.uid), { ratings: newRatings }, { merge: true });
      get().fetchCommunityTopTen(); // Refresh global rankings
    }
  },

  // 🚪 LOGOUT: Clear everything
  logout: async () => {
    try {
      set({ user: null }); // Trigger UI switch immediately
      await signOut(auth);
      set({ 
        watchlist: [], 
        viewed: [], 
        ratings: {}, 
        communityTopMovies: [], 
        isLoadingAuth: false 
      });
    } catch (error) {
      console.error("Logout Error:", error);
    }
  },
}));