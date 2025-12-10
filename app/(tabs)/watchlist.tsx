import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    ActivityIndicator, 
    Image, 
    TouchableOpacity, 
    Platform 
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { router } from 'expo-router';


const TMDB_API_KEY = "918ad26dfa6acc69159fa52570caaf8c"; 
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w200';

// Define the type for the displayed movie items
type WatchlistItem = {
    id: number;
    title: string;
    poster_path: string;
};

export default function WatchlistScreen() {
    // 1. Get the watchlist IDs from the global store
    const watchlistIds = useAppStore(state => state.watchlist);
    
    const [movies, setMovies] = useState<WatchlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (watchlistIds.length === 0) {
            setMovies([]);
            setLoading(false);
            return;
        }

        const fetchWatchlistDetails = async () => {
            setLoading(true);
            setError(null);
            
            // Map IDs to fetch promises, including error checking
            const fetchPromises = watchlistIds.map(id => 
                fetch(`${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}`)
                    .then(res => {
                         if (!res.ok) {
                             // Throw an error for bad HTTP status (e.g., 404)
                             throw new Error(`HTTP error! Status: ${res.status} for movie ID: ${id}`);
                         }
                         return res.json();
                    })
            );

            try {
                // 2. Use Promise.allSettled to ensure stability even if one fetch fails
                const results = await Promise.allSettled(fetchPromises);
                
                // 3. Process the results, only taking 'fulfilled' promises
                const validMovies: WatchlistItem[] = [];

                results.forEach(result => {
                    if (result.status === 'fulfilled') {
                        const data = result.value;
                        
                        // Ensure it's a valid movie object and has a poster
                        if (data && !data.success && data.poster_path) {
                            validMovies.push({
                                id: data.id,
                                title: data.title || data.name || "Unknown Title",
                                poster_path: data.poster_path,
                            });
                        }
                    } else {
                        // Log the failure, but the app remains stable
                        console.error("Failed to fetch one movie:", result.reason);
                    }
                });
                    
                setMovies(validMovies);
            } catch (e) {
                // This catches errors only if the overall Promise.allSettled failed
                setError("An unexpected error occurred while processing the watchlist.");
            } finally {
                setLoading(false);
            }
        };

        fetchWatchlistDetails();
    }, [watchlistIds]); // Re-run whenever the watchlist changes in the store

    const renderItem = ({ item }: { item: WatchlistItem }) => (
        <TouchableOpacity 
            style={styles.movieItem} 
            onPress={() => router.push(`/(tabs)/movie/${item.id.toString()}`)}
        >
            <Image
                source={{ uri: `${IMAGE_BASE_URL}${item.poster_path}` }}
                style={styles.poster} 
                resizeMode="cover"
            />
            <Text style={styles.movieTitle} numberOfLines={2}>{item.title}</Text>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#FF0000" />
            </View>
        );
    }
    
    if (error) {
        return <View style={styles.centerContainer}><Text style={styles.errorText}>{error}</Text></View>;
    }

    if (movies.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.emptyText}>Your watchlist is empty! 🍿</Text>
                <Text style={styles.emptySubText}>Search for movies and click "Add to Watchlist" to get started.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.navbar}>
                <Text style={styles.appName}>🎬 Your Watchlist</Text>
            </View>
            <FlatList
                data={movies}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                numColumns={3}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: Platform.OS === 'android' ? 35 : 0,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    errorText: {
        color: 'red',
        fontSize: 16,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    // Navbar Styles
    navbar: {
        backgroundColor: '#222',
        paddingHorizontal: 20,
        paddingVertical: 15,
        alignItems: 'center',
    },
    appName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
    },
    // List Item Styles
    listContainer: {
        paddingHorizontal: 5,
        paddingVertical: 10,
    },
    movieItem: {
        width: '33.33%',
        padding: 5,
        alignItems: 'center',
    },
    poster: {
        width: '100%',
        aspectRatio: 2 / 3,
        borderRadius: 8,
        marginBottom: 5,
    },
    movieTitle: {
        textAlign: 'center',
        fontSize: 12,
        color: '#333',
        height: 30,
    },
});