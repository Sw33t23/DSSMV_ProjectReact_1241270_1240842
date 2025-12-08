// app/(tabs)/_layout.tsx

import { Tabs } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ 
      headerShown: false, // You'll handle the header (navbar) inside index.tsx
      tabBarActiveTintColor: '#FF0000', // Example color
    }}>
      <Tabs.Screen
        name="index" // This links to app/(tabs)/index.tsx (Your main page)
        options={{
          title: 'Discover',
          tabBarIcon: ({ color }) => <FontAwesome5 name="home" color={color} size={24} />,
        }}
      />
      
      <Tabs.Screen
        name="watchlist" // This will be your Watchlist screen
        options={{
          title: 'Watchlist',
          tabBarIcon: ({ color }) => <FontAwesome5 name="list" color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}
