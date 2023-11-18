import {
    Alert,
    Animated,
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme, View
} from 'react-native';
import SettingsCard from "../../components/SettingsCard";
import DynamicHeader from "../../components/DynamicHeader";
import {useEffect, useState} from "react";
import {Ionicons} from "@expo/vector-icons";
import DropdownSelect from "../../components/DropdownSelect";
import {getLanguage, setLanguage as setLang} from "../../utils/Settings";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useRouter} from "expo-router";

const headerHeight = 60;

export default function SettingsTab() {
    const scrollY = new Animated.Value(0);
    const {height} = Dimensions.get('window');
    const colorScheme = useColorScheme();
    const [language, setLanguage] = useState<string>('English');
    const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        getLanguage().then((lang: string) => {
            setLanguage(lang)
        });
    }, []);

    useEffect(() => {
        setLang(language);
    }, [language]);

    return (
        <SafeAreaView>
            <DynamicHeader scrollY={scrollY} headerHeight={headerHeight} style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10}}>
                <TouchableOpacity>
                    <Text style={{fontSize: 20, fontWeight: '600', color: colorScheme === 'dark' ? 'white' : 'black'}}>{language === 'Polish' ? 'Ustawienia' : 'Settings'}</Text>
                </TouchableOpacity>
            </DynamicHeader>
            <ScrollView
                onScroll={({nativeEvent}) => {
                    scrollY.setValue(Math.max(nativeEvent.contentOffset.y, 0));
                    if (dropdownVisible)
                        setDropdownVisible(false);
                }}
                scrollEventThrottle={16}
                style={{height: height - 120, top: -headerHeight, paddingTop: headerHeight, position: 'relative'}}
            >
                <SettingsCard label={language === 'Polish' ? 'Język' : 'Language'}>
                    <TouchableOpacity onPress={() => {
                            setDropdownVisible(prev => !prev)
                        }}
                        style={{
                            backgroundColor: colorScheme === 'dark' ? '#212121' : '#e5e5e5',
                            flexDirection: 'row',
                            gap: 10,
                            alignItems: 'center',
                            borderRadius: 8,
                            overflow: 'hidden'
                        }}
                    >
                        <Text style={{fontSize: 16, paddingVertical: 10, paddingLeft: 14, color: colorScheme === 'dark' ? 'white' : 'black'}}>{language}</Text>
                        <View style={{height: '100%', width: 1, backgroundColor: colorScheme === 'dark' ? '#373737' : '#cccccc'}}></View>
                        <Ionicons name='chevron-down-outline' size={20} color={colorScheme === 'dark' ? 'white' : 'black'} style={{paddingRight: 10}}/>
                    </TouchableOpacity>
                    <DropdownSelect language={language} filters={[{name: 'English', key: 'English'}, {name: 'Polish', key: 'Polish'}]} currentFilter={language} setCurrentFilter={setLanguage} isVisible={dropdownVisible} setVisible={setDropdownVisible} label={language === 'Polish' ? 'Język' : 'Language'}/>
                </SettingsCard>
                <View style={{alignItems: 'center', paddingTop: 20, zIndex: -1}}>
                    <TouchableOpacity
                        onPress={() => {
                            Alert.alert(
                                language === 'Polish' ? 'Jesteś pewien' : 'Are you sure?',
                                language === 'Polish' ? 'Stracisz wszystkie swoje ulubione dzieła sztuki.' : 'You\'ll lose all your liked and favorite artworks.', [
                                {
                                    text: language === 'Polish' ? 'Tak' : 'Yes',
                                    onPress: () => {
                                        const execute = async () => {
                                            await AsyncStorage.clear();
                                            await AsyncStorage.setItem('reload-explore-card', '[null]');
                                            await AsyncStorage.setItem('reload-favourite-card', '[null]');
                                            router.replace('/(tabs)/explore');
                                        }

                                        execute()
                                    },
                                    style: 'default'
                                },
                                {
                                    text: language === 'Polish' ? 'Anuluj' : 'Cancel',
                                    onPress: () => {},
                                    style: 'cancel'
                                }
                            ])
                        }}
                        style={{
                            backgroundColor: 'red',
                            paddingHorizontal: 20,
                            paddingVertical: 10,
                            borderRadius: 8
                        }}
                    >
                        <Text style={{color: 'white'}}>{language === 'Polish' ? 'Usuń tymczasowe dane' : 'Remove temporary data'}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold'
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: '80%'
    }
});
