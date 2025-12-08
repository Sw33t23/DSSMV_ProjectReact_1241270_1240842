import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, TouchableOpacity, Button } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

// Replace with your actual TMDB API Key
const TMDB_API_KEY = "918ad26dfa6acc69159fa52570caaf8c";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export default function MovieDetailsScreen() {
  // Extract the movie ID from the URL parameter
  const { id } = useLocalSearchParams(); 
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // State for user actions (to be integrated with Firebase later)
  const [isWatched, setIsWatched] = useState(false);
  const [userRating, setUserRating] = useState(0);

  useEffect(() => {
    // Check if ID is a string before fetching
    if (typeof id !== 'string') return;
    
    const fetchDetails = async () => {
      setLoading(true);
      try {
        // Fetch details (includes synopsis, runtime, director) and credits (for cast)
        const detailsResponse = await fetch(
          `${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits`
        );
        const data = await detailsResponse.json();
        setMovie(data);
      } catch (error) {
        console.error("Error fetching details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  // Helper function to render star rating buttons
  const renderStarRating = () => {
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity 
            key={star} 
            onPress={() => setUserRating(star)}
            style={{ paddingHorizontal: 5 }}
          >
            <FontAwesome5 
              name={star <= userRating ? "star" : "star-border"} 
              solid={star <= userRating} // FontAwesome5 prop for filled/outline star
              size={30} 
              color={star <= userRating ? "#FFD700" : "#666"} 
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };


  if (loading || !movie) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF0000" />
      </View>
    );
  }

  // Find the Director
  const director = movie.credits.crew.find((crew: any) => crew.job === 'Director')?.name || 'N/A';
  
  return (
    <ScrollView style={styles.container}>
        {/* Poster and Title Section */}
        <View style={styles.posterSection}>
            <Image
                source={{ uri: `${IMAGE_BASE_URL}${movie.poster_path}` }}
                style={styles.poster}
                resizeMode="cover"
            />
            <View style={styles.titleSection}>
                <Text style={styles.title}>{movie.title}</Text>
                <Text style={styles.tagline}>{movie.tagline}</Text>
            </View>
        </View>

        {/* Watchlist Button */}
        <TouchableOpacity style={styles.watchlistButton} onPress={() => setIsWatched(!isWatched)}>
            <Text style={styles.watchlistButtonText}>
                <FontAwesome5 name={isWatched ? "check" : "plus"} size={16} /> 
                {isWatched ? " Added to Watchlist" : " Add to Watchlist"}
            </Text>
        </TouchableOpacity>

        {/* Synopsis */}
        <Text style={styles.header}>Synopsis</Text>
        <Text style={styles.bodyText}>{movie.overview}</Text>
        
        {/* Director and Duration */}
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Director:</Text>
            <Text style={styles.infoValue}>{director}</Text>
        </View>
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Duration:</Text>
            <Text style={styles.infoValue}>{movie.runtime} minutes</Text>
        </View>
        
        {/* Rating Section */}
        <Text style={styles.header}>Rate This</Text>
        {renderStarRating()}
        
        {/* Cast */}
        <Text style={styles.header}>Cast</Text>
        <View>
            {movie.credits.cast.slice(0, 5).map((castMember: any) => (
            <Text key={castMember.id} style={styles.castText}>- {castMember.name}</Text>
            ))}
        </View>
        
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  posterSection: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#1f1f1f',
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: 8,
  },
  titleSection: {
    flex: 1,
    paddingLeft: 15,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  tagline: {
    fontSize: 16,
    color: '#aaa',
  },
  watchlistButton: {
    backgroundColor: '#FF0000',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  watchlistButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  bodyText: {
    fontSize: 16,
    color: '#E0E0E0',
    lineHeight: 24,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 5,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E0E0E0',
    width: 90,
  },
  infoValue: {
    fontSize: 16,
    color: '#E0E0E0',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  castText: {
    fontSize: 16,
    color: '#E0E0E0',
    marginLeft: 20,
    marginBottom: 3,
  },
});