import { Tabs } from 'expo-router';
import { Appearance, Pressable, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import getColorScheme = Appearance.getColorScheme;
import {useEffect, useState} from "react";
import {getLanguage} from "../../utils/Settings";

export default function Layout() {
  const [language, setLanguage] = useState<string | null>(null);
  const colorScheme = useColorScheme();

  useEffect(() => {
    getLanguage().then(lang => setLanguage(lang));
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colorScheme === 'dark' ? '#2f95dc' : '#fff',
        headerShown: false,
        tabBarStyle: {
            backgroundColor: getColorScheme() === 'dark' ? '#000' : '#fff'
        }
      }}>
      <Tabs.Screen
        name="explore"
        options={{
          title: language === 'Polish' ? 'Odkrywaj' : 'Explore',
          tabBarIcon: ({focused}) => <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={getColorScheme() === 'dark' ? '#fff' : '#444'}/>,
          tabBarActiveTintColor: getColorScheme() === 'dark' ? '#fff' : '#444'
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: language === 'Polish' ? 'Szukaj' : 'Search',
          tabBarIcon: ({focused}) => <Ionicons name={focused ? 'search' : 'search-outline'} size={24} color={getColorScheme() === 'dark' ? '#fff' : '#444'}/>,
            tabBarActiveTintColor: getColorScheme() === 'dark' ? '#fff' : '#444'
        }}
      />
      <Tabs.Screen
        name="favourite"
        options={{
          title: language === 'Polish' ? 'Ulubione' : 'Favourite',
          tabBarIcon: ({focused}) => <Ionicons name={focused ? 'bookmark' : 'bookmark-outline'} size={24} color={getColorScheme() === 'dark' ? '#fff' : '#444'}/>,
            tabBarActiveTintColor: getColorScheme() === 'dark' ? '#fff' : '#444'
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: language === 'Polish' ? 'Ustawienia' : 'Settings',
          tabBarIcon: ({focused}) => <Ionicons name={focused ? 'settings-sharp' : 'settings-outline'} size={24} color={getColorScheme() === 'dark' ? '#fff' : '#444'}/>,
            tabBarActiveTintColor: getColorScheme() === 'dark' ? '#fff' : '#444'
        }}
      />
    </Tabs>
  );
}
