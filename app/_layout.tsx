import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme} from 'react-native';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function Root() {
    const [loaded, error] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
        ...FontAwesome.font
    });

    useEffect(() => {
        if (error) throw error;
    }, [error]);

    useEffect(() => {
        if (loaded)
            SplashScreen.hideAsync();
    }, [loaded]);

    if (!loaded)
        return null;

    return <RootNavigation/>;
}

function RootNavigation() {
    const colorScheme = useColorScheme();

    return (
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
                <Stack.Screen name="(tabs)" options={{headerShown: false, headerStyle: {backgroundColor: '#000'}}}/>
                <Stack.Screen name="modal" options={{presentation: 'modal', headerStyle: {backgroundColor: '#000'}}}/>
                <Stack.Screen name="details" options={{headerShown: false}}/>
            </Stack>
        </ThemeProvider>
    );
}