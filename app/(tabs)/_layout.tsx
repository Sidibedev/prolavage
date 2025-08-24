import { Tabs } from 'expo-router';
import React from 'react';
import {
  Chrome as Home,
  Plus,
  ChartBar as BarChart3,
  History,
  User,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TabLayout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#3498db',
          tabBarInactiveTintColor: '#95a5a6',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopColor: '#e1e8ed',
            height: 70,
            paddingBottom: 8,
            paddingTop: 8,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Accueil',
            tabBarIcon: ({ size, color }) => <Home size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="new-wash"
          options={{
            title: 'Nouveau',
            tabBarIcon: ({ size, color }) => <Plus size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'Historique',
            tabBarIcon: ({ size, color }) => (
              <History size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: 'Stats',
            tabBarIcon: ({ size, color }) => (
              <BarChart3 size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
