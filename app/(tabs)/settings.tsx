import {
    Alert,
    Animated,
    Dimensions, NativeScrollEvent,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme, View
} from 'react-native';
import SettingsCard from '../../components/SettingsCard';
import DynamicHeader from '../../components/DynamicHeader';
import {useEffect, useState} from 'react';
import { Ionicons } from '@expo/vector-icons';
import DropdownSelect from '../../components/DropdownSelect';
import { getLanguage, setLanguage as setLang } from '../../utils/Settings';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const headerHeight = 60;

export default function SettingsTab() {
    const [language, setLanguage] = useState<string>('English');
    const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);

    const colorScheme = useColorScheme();
    const router = useRouter();

    const scrollY = new Animated.Value(0);
    const {height} = Dimensions.get('window');

    useEffect(() => {
        getLanguage().then((lang: string) => {
            setLanguage(lang)
        });
    }, []);

    useEffect(() => {
        setLang(language);
    }, [language]);

    const handleScroll = ({nativeEvent}: {nativeEvent: NativeScrollEvent}) => {
        scrollY.setValue(Math.max(nativeEvent.contentOffset.y, 0));
        if (dropdownVisible)
            setDropdownVisible(false);
    }

    const handleDropdown = () => {
        setDropdownVisible(prev => !prev)
    }

    const removeTemporaryData = () => {
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
    }

    return (
        <SafeAreaView>
            <DynamicHeader scrollY={scrollY} headerHeight={headerHeight} style={styles.dynamicHeader}>
                <TouchableOpacity>
                    <Text style={{
                        ...styles.dynamicHeaderText,
                        color: colorScheme === 'dark' ? 'white' : 'black'
                    }}>
                        {language === 'Polish' ? 'Ustawienia' : 'Settings'}
                    </Text>
                </TouchableOpacity>
            </DynamicHeader>
            <ScrollView
                onScroll={handleScroll}
                scrollEventThrottle={16}
                style={{height: height - 120, ...styles.scrollView}}
            >
                <SettingsCard label={language === 'Polish' ? 'Język' : 'Language'}>
                    <TouchableOpacity
                        onPress={handleDropdown}
                        style={{...styles.dropdownBtn, backgroundColor: colorScheme === 'dark' ? '#212121' : '#e5e5e5'}}
                    >
                        <Text style={{
                            color: colorScheme === 'dark' ? 'white' : 'black',
                            ...styles.dropdownBtnText
                        }}>
                            {language}
                        </Text>
                        <View style={{
                            ...styles.dropdownBtnSeparator,
                            backgroundColor: colorScheme === 'dark' ? '#373737' : '#cccccc'
                        }}>

                        </View>
                        <Ionicons
                            name='chevron-down-outline'
                            size={20}
                            color={colorScheme === 'dark' ? 'white' : 'black'}
                            style={styles.dropdownBtnIcon}
                        />
                    </TouchableOpacity>
                    <DropdownSelect
                        language={language}
                        filters={[{name: 'English', key: 'English'}, {name: 'Polish', key: 'Polish'}]}
                        currentFilter={language}
                        setCurrentFilter={setLanguage}
                        isVisible={dropdownVisible}
                        setVisible={setDropdownVisible}
                        label={language === 'Polish' ? 'Język' : 'Language'}
                    />
                </SettingsCard>
                <View style={{alignItems: 'center', paddingTop: 20, zIndex: -1}}>
                    <TouchableOpacity onPress={removeTemporaryData} style={styles.rmvTempDataBtn}>
                        <Text style={styles.rmvTempDataBtnText}>
                            {language === 'Polish' ? 'Usuń tymczasowe dane' : 'Remove temporary data'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    dynamicHeader: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10
    },
    dynamicHeaderText: {
        fontSize: 20,
        fontWeight: '600'
    },
    scrollView: {
        top: -headerHeight, paddingTop: headerHeight, position: 'relative'
    },
    dropdownBtn: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        borderRadius: 8,
        overflow: 'hidden'
    },
    dropdownBtnText: {
        fontSize: 16,
        paddingVertical: 10,
        paddingLeft: 14
    },
    dropdownBtnSeparator: {
        height: '100%',
        width: 1
    },
    dropdownBtnIcon: {
        paddingRight: 10
    },
    rmvTempDataBtn: {
        backgroundColor: 'red',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8
    },
    rmvTempDataBtnText: {
        color: 'white'
    }
});
