import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';

export default function ProfileScreen() {
  const { user, watchlist, viewed, ratings, logout } = useAppStore();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: async () => await logout() }
    ]);
  };

  const getRankData = () => {
    const count = viewed.length;
    if (count >= 16) return { name: "Movie Legend", color: "#FFD700", icon: "crown", next: null };
    if (count >= 6) return { name: "Cinephile", color: "#C0C0C0", icon: "medal", next: 16, nextName: "Movie Legend" };
    return { name: "Newbie", color: "#CD7F32", icon: "award", next: 6, nextName: "Cinephile" };
  };

  const rank = getRankData();
  const totalRated = Object.keys(ratings).length;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <FontAwesome5 name="user-alt" size={40} color="#fff" />
          <View style={[styles.badgeContainer, { backgroundColor: rank.color }]}>
            <FontAwesome5 name={rank.icon} size={12} color="#000" />
          </View>
        </View>
        <Text style={styles.emailText}>{user?.email}</Text>
        <View style={[styles.rankTag, { borderColor: rank.color }]}>
          <Text style={[styles.rankText, { color: rank.color }]}>{rank.name}</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        {[{l: 'Watchlist', v: watchlist.length}, {l: 'Watched', v: viewed.length}, {l: 'Rated', v: totalRated}].map((s, i) => (
          <View key={i} style={styles.statBox}>
            <Text style={styles.statNumber}>{s.v}</Text>
            <Text style={styles.statLabel}>{s.l}</Text>
          </View>
        ))}
      </View>

      <View style={styles.progressSection}>
        <Text style={styles.sectionTitle}>Level Progress</Text>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${Math.min((viewed.length / (rank.next || 20)) * 100, 100)}%`, backgroundColor: rank.color }]} />
        </View>
        
        {/* 🎮 Dynamic Goal Text */}
        <Text style={styles.progressSubtext}>
          {rank.next 
            ? `${viewed.length} / ${rank.next} movies to become ${rank.nextName}`
            : `Max Rank Reached! You are a Legend.`}
        </Text>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <FontAwesome5 name="sign-out-alt" size={18} color="#FF4757" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { backgroundColor: '#1a1a1a', paddingVertical: 50, alignItems: 'center' },
  avatarCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center', marginBottom: 15, position: 'relative' },
  badgeContainer: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#1a1a1a' },
  emailText: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 10 },
  rankTag: { paddingHorizontal: 15, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  rankText: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  statsContainer: { flexDirection: 'row', backgroundColor: '#1f1f1f', margin: 20, borderRadius: 15, padding: 20, borderWidth: 1, borderColor: '#333' },
  statBox: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 4 },
  progressSection: { paddingHorizontal: 25, marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#888', marginBottom: 10 },
  progressBarBackground: { height: 8, backgroundColor: '#333', borderRadius: 4, marginTop: 10 },
  progressBarFill: { height: 8, borderRadius: 4 },
  
  // 🟢 New style for the goal text
  progressSubtext: { fontSize: 12, color: '#aaa', marginTop: 8, textAlign: 'right', fontStyle: 'italic' },
  
  menuContainer: { paddingHorizontal: 20 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1f1f1f', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#333' },
  logoutText: { marginLeft: 15, fontSize: 16, color: '#FF4757', fontWeight: 'bold' },
});