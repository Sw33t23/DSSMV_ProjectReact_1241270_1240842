import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  Platform, 
  StatusBar,
  ActivityIndicator 
} from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { router } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

const TMDB_API_KEY = "918ad26dfa6acc69159fa52570caaf8c";
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export default function WatchlistScreen() {
  const { watchlist } = useAppStore();
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔄 This function turns IDs into full movie objects (with posters)
  useEffect(() => {
    const fetchWatchlistDetails = async () => {
      if (watchlist.length === 0) {
        setMovies([]);
        return;
      }

      setLoading(true);
      try {
        // We call the API for each ID in your watchlist at the same time
        const movieDetails = await Promise.all(
          watchlist.map(async (id) => {
            const res = await fetch(
              `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}`
            );
            return res.json();
          })
        );
        // Filter out any data that didn't load correctly
        setMovies(movieDetails.filter(m => m.poster_path));
      } catch (error) {
        console.error("Error fetching watchlist posters:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlistDetails();
  }, [watchlist]); 

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* 🛠️ Polished Header (Safe for Camera Notch) */}
      <View style={styles.navbar}>
        <Text style={styles.appName}>My Watchlist</Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#E50914" />
        </View>
      ) : movies.length === 0 ? (
        <View style={styles.centerContainer}>
          <FontAwesome5 name="film" size={50} color="#333" style={{ marginBottom: 15 }} />
          <Text style={styles.emptyText}>Your watchlist is empty.</Text>
          <Text style={styles.subEmptyText}>Add movies from the Discover tab!</Text>
        </View>
      ) : (
        <FlatList 
          data={movies}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.movieItem} 
              onPress={() => router.push(`/(tabs)/movie/${item.id}`)}
            >
              <Image 
                source={{ uri: `${IMAGE_BASE_URL}${item.poster_path}` }} 
                style={styles.poster} 
              />
              <Text style={styles.movieTitle} numberOfLines={1}>{item.title}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  // Header with extra top padding for Notch/Island
  navbar: { 
    backgroundColor: '#121212', 
    paddingTop: Platform.OS === 'ios' ? 60 : 45, 
    paddingBottom: 15, 
    alignItems: 'center', 
    borderBottomWidth: 1, 
    borderBottomColor: '#333' 
  },
  appName: { fontSize: 22, fontWeight: 'bold', color: '#FFF' },
  listContent: { padding: 5 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  subEmptyText: { color: '#666', fontSize: 14, textAlign: 'center', marginTop: 8 },
  movieItem: { width: '33.33%', padding: 5, alignItems: 'center' },
  poster: { width: '100%', aspectRatio: 2/3, borderRadius: 8, backgroundColor: '#1f1f1f' },
  movieTitle: { color: '#bbb', fontSize: 11, marginTop: 5, textAlign: 'center' }
});