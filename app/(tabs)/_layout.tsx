import { Link, Tabs } from 'expo-router';
import { Pressable, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Colors from '../../constants/Colors';

export default function Layout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false
      }}>
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({color, focused}) => <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color}/>
          // headerRight: () => (
          //   <Link href="/modal" asChild>
          //     <Pressable>
          //       {({pressed}) => (
          //         <FontAwesome
          //           name="info-circle"
          //           size={25}
          //           color={Colors[colorScheme ?? 'light'].text}
          //           style={{marginRight: 15, opacity: pressed ? 0.5 : 1}}
          //         />
          //       )}
          //     </Pressable>
          //   </Link>
          // )
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({color, focused}) => <Ionicons name={focused ? 'search' : 'search-outline'} size={24} color={color}/>
        }}
      />
      <Tabs.Screen
        name="favourite"
        options={{
          title: 'Favourite',
          tabBarIcon: ({color, focused}) => <Ionicons name={focused ? 'bookmark' : 'bookmark-outline'} size={24} color={color}/>
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({color, focused}) => <Ionicons name={focused ? 'settings' : 'settings-sharp'} size={24} color={color}/>
        }}
      />
    </Tabs>
  );
}
