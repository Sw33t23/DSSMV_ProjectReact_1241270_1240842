import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';

export default function ProfileScreen() {
  const { user, watchlist, viewed, ratings, logout } = useAppStore();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Logout", 
        style: "destructive", 
        onPress: async () => {
          await logout(); 
        } 
      }
    ]);
  };

  const totalRated = Object.keys(ratings).length;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <FontAwesome5 name="user-alt" size={50} color="#fff" />
        </View>
        <Text style={styles.emailText}>{user?.email || "User Email"}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{watchlist.length}</Text>
          <Text style={styles.statLabel}>Watchlist</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{viewed.length}</Text>
          <Text style={styles.statLabel}>Watched</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{totalRated}</Text>
          <Text style={styles.statLabel}>Rated</Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => Alert.alert("Settings", "Privacy & Security settings coming soon.")}
        >
          <FontAwesome5 name="lock" size={18} color="#555" />
          <Text style={styles.menuText}>Privacy & Security</Text>
          <FontAwesome5 name="chevron-right" size={14} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <FontAwesome5 name="sign-out-alt" size={18} color="#FF4757" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { backgroundColor: '#222', paddingVertical: 40, alignItems: 'center' },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#444', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  emailText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  statsContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    margin: 20, 
    borderRadius: 15, 
    padding: 20, 
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4 
  },
  statBox: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 22, fontWeight: 'bold', color: '#222' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 5 },
  menuContainer: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#888', marginBottom: 10, textTransform: 'uppercase' },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10 },
  menuText: { flex: 1, marginLeft: 15, fontSize: 16, color: '#333' },
  logoutButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 10, 
    marginTop: 10, 
    borderWidth: 1, 
    borderColor: '#ffebeb' 
  },
  logoutText: { flex: 1, marginLeft: 15, fontSize: 16, color: '#FF4757', fontWeight: 'bold' },
});