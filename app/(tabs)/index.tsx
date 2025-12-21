import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, Platform, Image, ActivityIndicator } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppStore } from '../../store/useAppStore'; 

const TMDB_API_KEY = "918ad26dfa6acc69159fa52570caaf8c"; 
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w200';

export default function DiscoverScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { viewed } = useAppStore();

  const searchMovies = async (query: string) => {
    if (query.trim() === '') { 
      setSearchResults([]); 
      return; 
    }
    setLoading(true);
    try {
      const response = await fetch(`${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSearchResults(data.results.filter((item: any) => (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path));
    } catch (error) { 
      console.error(error); 
    } finally { 
      setLoading(false); 
    }
  };

  React.useEffect(() => {
    const handler = setTimeout(() => searchMovies(searchQuery), 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const renderItem = ({ item }: { item: any }) => {
    const isViewed = viewed.includes(item.id);

    return (
      <TouchableOpacity style={styles.movieItem} onPress={() => router.push(`/(tabs)/movie/${item.id}`)}>
        <View>
            <Image source={{ uri: `${IMAGE_BASE_URL}${item.poster_path}` }} style={styles.poster} resizeMode="cover" />
            {isViewed && (
                <View style={styles.viewedBadge}>
                    <FontAwesome5 name="eye" size={10} color="#FFF" solid />
                </View>
            )}
        </View>
        <Text style={styles.movieTitle} numberOfLines={2}>{item.title || item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Navbar */}
      <View style={styles.navbar}>
        <Text style={styles.appName}>🎬 MovieWatchlist</Text>
      </View>

      {/* Search Bar with Hint Text */}
      <View style={styles.searchBarContainer}>
        <FontAwesome5 name="search" size={18} color="#888" style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput} 
          placeholder="Search for movies or TV shows..." // 👈 Hint Text
          placeholderTextColor="#888"
          value={searchQuery} 
          onChangeText={setSearchQuery} 
        />
      </View>

      {/* Conditional Rendering for Loading, Results, or Guidance Text */}
      {loading ? (
        <View style={styles.centerStatus}>
          <ActivityIndicator size="large" color="#FF0000" />
        </View>
      ) : searchResults.length > 0 ? (
        <FlatList 
          data={searchResults} 
          keyExtractor={(item) => item.id.toString()} 
          renderItem={renderItem} 
          numColumns={3} 
          contentContainerStyle={styles.listContainer} 
        />
      ) : (
        <View style={styles.centerStatus}>
          <FontAwesome5 name="film" size={50} color="#eee" style={{ marginBottom: 15 }} />
          <Text style={styles.guidanceText}>Search for your movies here!</Text>
          <Text style={styles.subGuidanceText}>Start typing above to discover something new.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff', 
    paddingTop: Platform.OS === 'android' ? 35 : 0 
  },
  navbar: { 
    backgroundColor: '#222', 
    padding: 15, 
    alignItems: 'center' 
  },
  appName: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#FFF' 
  },
  searchBarContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    margin: 15, 
    paddingHorizontal: 15, 
    backgroundColor: '#eee', 
    borderRadius: 25 
  },
  searchIcon: { 
    marginRight: 10 
  },
  searchInput: { 
    flex: 1, 
    height: 45, 
    fontSize: 16,
    color: '#333'
  },
  listContainer: { 
    paddingHorizontal: 5 
  },
  movieItem: { 
    width: '33.33%', 
    padding: 5, 
    alignItems: 'center' 
  },
  poster: { 
    width: '100%', 
    aspectRatio: 2 / 3, 
    borderRadius: 8 
  },
  viewedBadge: { 
    position: 'absolute', 
    top: 5, 
    right: 5, 
    backgroundColor: 'rgba(0, 184, 148, 0.9)', 
    padding: 4, 
    borderRadius: 10 
  },
  movieTitle: { 
    textAlign: 'center', 
    fontSize: 12, 
    marginTop: 5, 
    height: 30,
    color: '#333'
  },
  centerStatus: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingHorizontal: 40
  },
  guidanceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#444',
    textAlign: 'center'
  },
  subGuidanceText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 5
  }
});