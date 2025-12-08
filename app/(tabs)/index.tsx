import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Platform, 
  Image, 
  ActivityIndicator
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';

// TMDB API Key (Keeping your key as provided)
const TMDB_API_KEY = "918ad26dfa6acc69159fa52570caaf8c"; 
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w200';

// Define a basic type for the TMDB search result item to help TypeScript
type TMDBItem = {
    id: number;
    title?: string;
    name?: string;
    poster_path: string | null;
    media_type: 'movie' | 'tv' | 'person';
};


export default function DiscoverScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TMDBItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Function to fetch movies/TV shows from TMDB
  const searchMovies = async (query: string) => {
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      
      // Filter results to only include movies or TV shows with posters
      setSearchResults(data.results.filter((item: TMDBItem) => 
        (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path
      ));
    } catch (error) {
      console.error("TMDB Search Error:", error);
      // Optional: Show an alert here if needed
    } finally {
      setLoading(false);
    }
  };

  // Debouncing the search to prevent too many API calls while typing
  React.useEffect(() => {
    const handler = setTimeout(() => {
      searchMovies(searchQuery);
    }, 500); // Wait 500ms after the user stops typing

    return () => clearTimeout(handler); // Cleanup previous timer
  }, [searchQuery]);


  const renderItem = ({ item }: { item: TMDBItem }) => (
    <TouchableOpacity 
      style={styles.movieItem} 
      onPress={() => {
        // ✅ FIX: Explicitly include the tabs group name in the path.
        // It must match the structure known by TypeScript: /(tabs)/movie/[id]
        router.push(`/(tabs)/movie/${item.id.toString()}`); 
      }}
    >
      <Image
        source={{ uri: `${IMAGE_BASE_URL}${item.poster_path}` }}
        style={styles.poster} 
        resizeMode="cover"
      />
      <Text style={styles.movieTitle} numberOfLines={2}>{item.title || item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* App Name / Navbar Section */}
      <View style={styles.navbar}>
        <Text style={styles.appName}>🎬 CineWatch</Text>
        <FontAwesome5 name="user-circle" size={24} color="#FFF" style={styles.profileIcon} />
      </View>

      {/* Search Bar Section */}
      <View style={styles.searchBarContainer}>
        <FontAwesome5 name="search" size={18} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search movies or TV shows..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Results Display */}
      {loading ? (
        <View style={styles.centerStatus}>
            <ActivityIndicator size="large" color="#FF0000" />
        </View>
      ) : searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          numColumns={3} // Display results in a grid
          contentContainerStyle={styles.listContainer}
        />
      ) : searchQuery.length > 0 && !loading ? (
         <Text style={styles.statusText}>No results found for "{searchQuery}"</Text>
      ) : (
         <Text style={styles.statusText}>Start typing to search for movies or TV shows!</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 35 : 0, 
  },
  // Navbar Styles
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#222',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  profileIcon: {
    // For future use: profile settings navigation
  }, 
  
  // Search Bar Styles
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 15,
    paddingHorizontal: 15,
    backgroundColor: '#eee',
    borderRadius: 25,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  // Results List Styles
  listContainer: {
    paddingHorizontal: 5,
  },
  centerStatus: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  },
  statusText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  movieItem: {
    width: '33.33%', // 3 items per row
    padding: 5,
    alignItems: 'center',
  },
  poster: {
    width: '100%',
    aspectRatio: 2 / 3, // Standard movie poster aspect ratio
    borderRadius: 8,
    marginBottom: 5,
  },
  movieTitle: {
    textAlign: 'center',
    fontSize: 12,
    color: '#333',
    height: 30, // Fixed height for two lines
  },
});