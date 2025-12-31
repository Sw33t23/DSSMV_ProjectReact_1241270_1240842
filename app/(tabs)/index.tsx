import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Platform, 
  Image, 
  ActivityIndicator, 
  ScrollView,
  StatusBar
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppStore } from '../../store/useAppStore'; 

const TMDB_API_KEY = "918ad26dfa6acc69159fa52570caaf8c"; 
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export default function DiscoverScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { user, viewed, communityTopMovies, fetchCommunityTopTen } = useAppStore();

  useEffect(() => {
    const loadInitialData = async () => {
      const res = await fetch(`${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`);
      const data = await res.json();
      setTrendingMovies(data.results.slice(0, 10));
      
      if (user) {
        await fetchCommunityTopTen();
      }
    };
    loadInitialData();
  }, [user]);

  const searchMovies = async (query: string) => {
    if (query.trim() === '') { setSearchResults([]); return; }
    setLoading(true);
    try {
      const response = await fetch(`${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSearchResults(data.results.filter((item: any) => (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path));
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => {
    const handler = setTimeout(() => searchMovies(searchQuery), 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* 🛠️ Polished Header with Safe Padding */}
      <View style={styles.navbar}>
        <Text style={styles.appName}>🎬 MovieWatchlist</Text>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Dark Search Bar */}
        <View style={styles.searchBarContainer}>
          <FontAwesome5 name="search" size={16} color="#aaa" style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search movies..." 
            placeholderTextColor="#777" 
            value={searchQuery} 
            onChangeText={setSearchQuery} 
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#E50914" style={{ marginTop: 50 }} />
        ) : searchQuery.length > 0 ? (
          <FlatList 
            data={searchResults} 
            keyExtractor={(item) => item.id.toString()} 
            renderItem={({item}) => (
              <TouchableOpacity style={styles.movieItem} onPress={() => router.push(`/(tabs)/movie/${item.id}`)}>
                <Image source={{ uri: `${IMAGE_BASE_URL}${item.poster_path}` }} style={styles.poster} />
                <Text style={styles.movieTitle} numberOfLines={2}>{item.title || item.name}</Text>
              </TouchableOpacity>
            )} 
            numColumns={3} 
            scrollEnabled={false} 
            contentContainerStyle={styles.listContainer} 
          />
        ) : (
          <View>
            {/* 🏆 TRENDING ROW */}
            <View style={styles.rowSection}>
              <Text style={styles.sectionHeader}>🔥 Trending This Week</Text>
              <FlatList 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                data={trendingMovies} 
                keyExtractor={(item) => item.id.toString()} 
                renderItem={({ item, index }) => (
                  <TouchableOpacity style={styles.cardItem} onPress={() => router.push(`/(tabs)/movie/${item.id}`)}>
                    <View style={styles.rankBadge}><Text style={styles.rankText}>{index + 1}</Text></View>
                    <Image source={{ uri: `${IMAGE_BASE_URL}${item.poster_path}` }} style={styles.cardImage} />
                  </TouchableOpacity>
                )} 
              />
            </View>

            {/* ⭐ COMMUNITY ROW */}
            {user && communityTopMovies.length > 0 && (
              <View style={styles.rowSection}>
                <Text style={styles.sectionHeader}>⭐ Community Favorites</Text>
                <FlatList 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  data={communityTopMovies} 
                  keyExtractor={(item) => item.id.toString()} 
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.cardItem} onPress={() => router.push(`/(tabs)/movie/${item.id}`)}>
                      <View style={styles.ratingBadge}>
                        <FontAwesome5 name="star" size={10} color="#000" solid />
                        <Text style={styles.ratingText}>{item.avgRating.toFixed(1)}</Text>
                      </View>
                      <Image source={{ uri: `${IMAGE_BASE_URL}${item.poster_path}` }} style={styles.cardImage} />
                    </TouchableOpacity>
                  )} 
                />
              </View>
            )}
            <View style={{ height: 100 }} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // 🟢 Dark Mode Background
  container: { flex: 1, backgroundColor: '#121212' },
  
  // 🟢 Navigation Bar Polish (Padding for camera notch)
  navbar: { 
    backgroundColor: '#121212', 
    paddingTop: Platform.OS === 'ios' ? 60 : 45, // Adjusts for notch/island
    paddingBottom: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  appName: { fontSize: 22, fontWeight: 'bold', color: '#E50914', letterSpacing: 1 },

  // 🟢 Search Bar Polish
  searchBarContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    margin: 15, 
    paddingHorizontal: 15, 
    backgroundColor: '#222', 
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#444'
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 45, fontSize: 16, color: '#FFF' },

  // 🟢 Content Rows
  rowSection: { marginVertical: 15, paddingLeft: 15 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#FFF', marginBottom: 15 },
  cardItem: { marginRight: 15, position: 'relative' },
  cardImage: { width: 130, height: 195, borderRadius: 8 },

  // 🟢 Badges
  rankBadge: { 
    position: 'absolute', top: -5, left: -5, backgroundColor: '#E50914', 
    width: 32, height: 32, borderRadius: 16, justifyContent: 'center', 
    alignItems: 'center', zIndex: 1, elevation: 5 
  },
  rankText: { fontWeight: 'bold', fontSize: 16, color: '#FFF' },
  
  ratingBadge: { 
    position: 'absolute', top: -5, left: -5, backgroundColor: '#FFD700', 
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, 
    flexDirection: 'row', alignItems: 'center', zIndex: 1, elevation: 5 
  },
  ratingText: { fontWeight: 'bold', fontSize: 12, color: '#000', marginLeft: 4 },

  // 🟢 Search Results Grid
  listContainer: { paddingHorizontal: 5 },
  movieItem: { width: '33.33%', padding: 5, alignItems: 'center' },
  poster: { width: '100%', aspectRatio: 2 / 3, borderRadius: 4 },
  movieTitle: { textAlign: 'center', fontSize: 11, marginTop: 5, color: '#BBB' },
});