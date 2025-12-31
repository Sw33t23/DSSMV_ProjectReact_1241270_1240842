import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  Image, 
  TouchableOpacity, 
  Dimensions, 
  FlatList 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import YoutubePlayer from "react-native-youtube-iframe"; 
import { useAppStore } from '../../../store/useAppStore'; 

const TMDB_API_KEY = "918ad26dfa6acc69159fa52570caaf8c";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const { width } = Dimensions.get('window');

export default function MovieDetailsScreen() {
  const { id } = useLocalSearchParams(); 
  const router = useRouter(); // Added for navigation to recommendations
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [trailerId, setTrailerId] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]); 
  
  const { 
      watchlist, 
      viewed, 
      ratings, 
      toggleWatchlistItem, 
      toggleViewedStatus, 
      setRating 
  } = useAppStore();

  const idNum = Number(id);
  const isWatched = watchlist.includes(idNum);
  const isViewed = viewed.includes(idNum); 
  const userRating = ratings[idNum] || 0;

  useEffect(() => {
    if (typeof id !== 'string') return;
    const fetchDetails = async () => {
      setLoading(true);
      try {
        // 1. Fetch Movie, Cast, and Trailers
        const detailsResponse = await fetch(
          `${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos`
        );
        const data = await detailsResponse.json();
        setMovie(data);

        const trailer = data.videos?.results?.find(
          (vid: any) => vid.site === 'YouTube' && vid.type === 'Trailer'
        );
        if (trailer) setTrailerId(trailer.key);

        // 2. Fetch Recommendations
        const recsResponse = await fetch(
          `${TMDB_BASE_URL}/movie/${id}/recommendations?api_key=${TMDB_API_KEY}`
        );
        const recsData = await recsResponse.json();
        setRecommendations(recsData.results.slice(0, 10));

      } catch (error) { 
        console.error("Error fetching details:", error); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchDetails();
  }, [id]); 

  if (loading || !movie) return (
    <View style={styles.centerContainer}><ActivityIndicator size="large" color="#FF0000" /></View>
  );

  const director = movie.credits?.crew?.find((crew: any) => crew.job === 'Director')?.name || 'N/A';
  const releaseYear = movie.release_date ? movie.release_date.substring(0, 4) : 'N/A';
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Poster & Header Section */}
        <View style={styles.posterSection}>
            <Image source={{ uri: `${IMAGE_BASE_URL}${movie.poster_path}` }} style={styles.poster} resizeMode="cover" />
            <View style={styles.titleSection}>
                <View style={styles.titleRow}>
                    <Text style={styles.title}>{movie.title}</Text>
                    <TouchableOpacity onPress={() => toggleViewedStatus(idNum)}>
                        <FontAwesome5 name="eye" size={24} color={isViewed ? "#00B894" : "#666"} solid={isViewed} />
                    </TouchableOpacity>
                </View>
                <Text style={styles.releaseYear}>({releaseYear})</Text>
                {/* 🌟 Slogan / Tagline */}
                {movie.tagline ? <Text style={styles.tagline}>"{movie.tagline}"</Text> : null}
            </View>
        </View>

        {/* 📺 Embedded YouTube Trailer Section */}
        {trailerId ? (
          <View style={styles.videoSection}>
            <Text style={styles.header}>Trailer</Text>
            <YoutubePlayer
              height={width * 0.56}
              play={false}
              videoId={trailerId}
            />
          </View>
        ) : (
          <View style={styles.noVideoContainer}>
            <Text style={styles.noVideoText}>No trailer available</Text>
          </View>
        )}

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
        
        {/* ⭐ Star Rating */}
        <Text style={styles.header}>Rate This</Text>
        <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(idNum, star)} style={{ paddingHorizontal: 5 }}>
                    <FontAwesome5 name="star" solid={star <= userRating} size={30} color={star <= userRating ? "#FFD700" : "#666"} />
                </TouchableOpacity>
            ))}
        </View>
        
        {/* 🎭 Cast Section */}
        <Text style={styles.header}>Cast</Text>
        <View style={styles.castContainer}>
            {movie.credits?.cast?.slice(0, 5).map((castMember: any) => (
                <Text key={castMember.id} style={styles.castText}>• {castMember.name || 'N/A'}</Text>
            ))}
        </View>

        {/* 🍿 NEW: People Also Liked Section */}
        {recommendations.length > 0 && (
          <View style={styles.recommendationSection}>
            <Text style={styles.header}>People Also Liked</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={recommendations}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.recItem} 
                  onPress={() => router.push(`/(tabs)/movie/${item.id}`)}
                >
                  <Image 
                    source={{ uri: `${IMAGE_BASE_URL}${item.poster_path}` }} 
                    style={styles.recPoster} 
                  />
                  <Text style={styles.recTitle} numberOfLines={1}>{item.title}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

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
  releaseYear: { fontSize: 18, color: '#ccc', marginBottom: 5 },
  tagline: { fontSize: 14, color: '#aaa', fontStyle: 'italic', marginTop: 5 },
  
  videoSection: { marginVertical: 10 },
  noVideoContainer: { padding: 20, alignItems: 'center' },
  noVideoText: { color: '#666', fontStyle: 'italic' },

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
  
  castContainer: { marginBottom: 10 },
  castText: { fontSize: 16, color: '#E0E0E0', marginLeft: 20, marginBottom: 4 },

  // Recommendation Styles
  recommendationSection: { marginTop: 10, paddingLeft: 20 },
  recItem: { marginRight: 15, width: 110 },
  recPoster: { width: 110, height: 165, borderRadius: 8 },
  recTitle: { color: '#aaa', fontSize: 12, marginTop: 5, textAlign: 'center' },
});