import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, Platform, Image, ActivityIndicator, ScrollView } from 'react-native';
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
      // 1. Trending always loads
      const res = await fetch(`${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`);
      const data = await res.json();
      setTrendingMovies(data.results.slice(0, 10));
      
      // 2. 🛡️ Only fetch Community if user exists
      if (user) {
        await fetchCommunityTopTen();
      }
    };
    loadInitialData();
  }, [user]); // Re-run when user logs in/out

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
      <View style={styles.navbar}><Text style={styles.appName}>🎬 MovieWatchlist</Text></View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.searchBarContainer}>
          <FontAwesome5 name="search" size={18} color="#888" style={styles.searchIcon} />
          <TextInput style={styles.searchInput} placeholder="Search movies..." placeholderTextColor="#888" value={searchQuery} onChangeText={setSearchQuery} />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#FF0000" style={{ marginTop: 50 }} />
        ) : searchQuery.length > 0 ? (
          <FlatList data={searchResults} keyExtractor={(item) => item.id.toString()} renderItem={({item}) => (
            <TouchableOpacity style={styles.movieItem} onPress={() => router.push(`/(tabs)/movie/${item.id}`)}>
              <Image source={{ uri: `https://image.tmdb.org/t/p/w200${item.poster_path}` }} style={styles.poster} />
              <Text style={styles.movieTitle} numberOfLines={2}>{item.title || item.name}</Text>
            </TouchableOpacity>
          )} numColumns={3} scrollEnabled={false} contentContainerStyle={styles.listContainer} />
        ) : (
          <View>
            <View style={styles.rowSection}>
              <Text style={styles.sectionHeader}>🔥 Trending This Week</Text>
              <FlatList horizontal showsHorizontalScrollIndicator={false} data={trendingMovies} keyExtractor={(item) => item.id.toString()} renderItem={({ item, index }) => (
                <TouchableOpacity style={styles.cardItem} onPress={() => router.push(`/(tabs)/movie/${item.id}`)}>
                  <View style={styles.rankBadge}><Text style={styles.rankText}>{index + 1}</Text></View>
                  <Image source={{ uri: `${IMAGE_BASE_URL}${item.poster_path}` }} style={styles.cardImage} />
                </TouchableOpacity>
              )} />
            </View>

            {user && communityTopMovies.length > 0 && (
              <View style={styles.rowSection}>
                <Text style={styles.sectionHeader}>⭐ Community Favorites</Text>
                <FlatList horizontal showsHorizontalScrollIndicator={false} data={communityTopMovies} keyExtractor={(item) => item.id.toString()} renderItem={({ item }) => (
                  <TouchableOpacity style={styles.cardItem} onPress={() => router.push(`/(tabs)/movie/${item.id}`)}>
                    <View style={styles.ratingBadge}>
                      <FontAwesome5 name="star" size={10} color="#000" solid />
                      <Text style={styles.ratingText}>{item.avgRating.toFixed(1)}</Text>
                    </View>
                    <Image source={{ uri: `${IMAGE_BASE_URL}${item.poster_path}` }} style={styles.cardImage} />
                  </TouchableOpacity>
                )} />
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
  container: { flex: 1, backgroundColor: '#fff', paddingTop: Platform.OS === 'android' ? 35 : 0 },
  navbar: { backgroundColor: '#222', padding: 15, alignItems: 'center' },
  appName: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  searchBarContainer: { flexDirection: 'row', alignItems: 'center', margin: 15, paddingHorizontal: 15, backgroundColor: '#eee', borderRadius: 25 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 45, fontSize: 16, color: '#333' },
  rowSection: { marginVertical: 10, paddingLeft: 15 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#222', marginBottom: 15 },
  cardItem: { marginRight: 20, position: 'relative', paddingVertical: 10 },
  cardImage: { width: 140, height: 210, borderRadius: 12 },
  rankBadge: { position: 'absolute', top: 0, left: -10, backgroundColor: '#FFD700', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', zIndex: 1, elevation: 5 },
  rankText: { fontWeight: 'bold', fontSize: 18, color: '#222' },
  ratingBadge: { position: 'absolute', top: 0, left: -10, backgroundColor: '#FFD700', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, flexDirection: 'row', alignItems: 'center', zIndex: 1, elevation: 5 },
  ratingText: { fontWeight: 'bold', fontSize: 13, color: '#222', marginLeft: 4 },
  listContainer: { paddingHorizontal: 5 },
  movieItem: { width: '33.33%', padding: 5, alignItems: 'center' },
  poster: { width: '100%', aspectRatio: 2 / 3, borderRadius: 8 },
  movieTitle: { textAlign: 'center', fontSize: 12, marginTop: 5, color: '#333' },
});