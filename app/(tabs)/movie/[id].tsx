import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAppStore } from '../../../store/useAppStore'; 

const TMDB_API_KEY = "918ad26dfa6acc69159fa52570caaf8c";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export default function MovieDetailsScreen() {
  const { id } = useLocalSearchParams(); 
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const { 
      watchlist, 
      viewed, // New state
      ratings, 
      toggleWatchlistItem, 
      toggleViewedStatus, // New action
      setRating 
  } = useAppStore();

  const idNum = Number(id);
  const isWatched = watchlist.includes(idNum);
  const isViewed = viewed.includes(idNum); // Check viewed status
  const userRating = ratings[idNum] || 0;

  useEffect(() => {
    if (typeof id !== 'string') return;
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const detailsResponse = await fetch(
          `${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits`
        );
        const data = await detailsResponse.json();
        setMovie(data);
      } catch (error) { console.error("Error fetching details:", error); } 
      finally { setLoading(false); }
    };
    fetchDetails();
  }, [id]); 

  const handleSetRating = (rating: number) => { setRating(idNum, rating); };
  
  const renderStarRating = () => {
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => handleSetRating(star)} style={{ paddingHorizontal: 5 }}>
            <FontAwesome5 name="star" solid={star <= userRating} size={30} color={star <= userRating ? "#FFD700" : "#666"} />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (loading || !movie) return (
    <View style={styles.centerContainer}><ActivityIndicator size="large" color="#FF0000" /></View>
  );

  const director = movie.credits?.crew?.find((crew: any) => crew.job === 'Director')?.name || 'N/A';
  const releaseYear = movie.release_date ? movie.release_date.substring(0, 4) : 'N/A';
  
  return (
    <ScrollView style={styles.container}>
        <View style={styles.posterSection}>
            <Image source={{ uri: `${IMAGE_BASE_URL}${movie.poster_path}` }} style={styles.poster} resizeMode="cover" />
            <View style={styles.titleSection}>
                <View style={styles.titleRow}>
                    <Text style={styles.title}>{movie.title}</Text>
                    {/* 👁️ VIEWED TOGGLE BUTTON */}
                    <TouchableOpacity onPress={() => toggleViewedStatus(idNum)}>
                        <FontAwesome5 name="eye" size={24} color={isViewed ? "#00B894" : "#666"} solid={isViewed} />
                    </TouchableOpacity>
                </View>
                <Text style={styles.releaseYear}>({releaseYear})</Text>
                <Text style={styles.tagline}>{movie.tagline}</Text>
            </View>
        </View>

        <TouchableOpacity 
            style={[styles.watchlistButton, isWatched ? styles.watchlistActive : styles.watchlistInactive]} 
            onPress={() => toggleWatchlistItem(idNum)} 
        >
            <Text style={styles.watchlistButtonText}>
                <FontAwesome5 name={isWatched ? "check" : "plus"} size={16} /> 
                {isWatched ? " Added to Watchlist" : " Add to Watchlist"}
            </Text>
        </TouchableOpacity>

        <Text style={styles.header}>Synopsis</Text>
        <Text style={styles.bodyText}>{movie.overview || 'Synopsis not available.'}</Text>
        
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Director:</Text>
            <Text style={styles.infoValue}>{director}</Text>
        </View>
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Duration:</Text>
            <Text style={styles.infoValue}>{movie.runtime} minutes</Text>
        </View>
        
        <Text style={styles.header}>Rate This</Text>
        {renderStarRating()}
        
        <Text style={styles.header}>Cast</Text>
        <View>
            {movie.credits?.cast?.slice(0, 5).map((castMember: any) => (
                <Text key={castMember.id} style={styles.castText}>- {castMember.name || 'N/A'}</Text>
            ))}
        </View>
        <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  posterSection: { flexDirection: 'row', padding: 20, backgroundColor: '#1f1f1f' },
  poster: { width: 120, height: 180, borderRadius: 8 },
  titleSection: { flex: 1, paddingLeft: 15, justifyContent: 'center' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF', flex: 1, marginRight: 10 },
  releaseYear: { fontSize: 18, color: '#ccc', marginBottom: 10 },
  tagline: { fontSize: 16, color: '#aaa' },
  watchlistButton: { padding: 15, borderRadius: 8, marginHorizontal: 20, marginBottom: 20 },
  watchlistInactive: { backgroundColor: '#FF0000' },
  watchlistActive: { backgroundColor: '#00B894' },
  watchlistButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  header: { fontSize: 20, fontWeight: 'bold', color: '#FFF', marginHorizontal: 20, marginTop: 20, marginBottom: 10 },
  bodyText: { fontSize: 16, color: '#E0E0E0', lineHeight: 24, marginHorizontal: 20, marginBottom: 10 },
  infoRow: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 5 },
  infoLabel: { fontSize: 16, fontWeight: 'bold', color: '#E0E0E0', width: 90 },
  infoValue: { fontSize: 16, color: '#E0E0E0', flex: 1 },
  ratingContainer: { flexDirection: 'row', justifyContent: 'center', paddingBottom: 20 },
  castText: { fontSize: 16, color: '#E0E0E0', marginLeft: 20, marginBottom: 3 },
});