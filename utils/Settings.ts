import AsyncStorage from "@react-native-async-storage/async-storage";

export async function getLanguage() {
    const language = await AsyncStorage.getItem('language');

    if (!language) {
        await setLanguage('English');
        return 'English';
    }

    return language;
}

export async function setLanguage(language: string) {
    await AsyncStorage.setItem('language', language);
}