import {
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
import {useState} from "react";
import {Ionicons} from "@expo/vector-icons";
import DropdownSelect from "../../components/DropdownSelect";

const headerHeight = 50;

export default function SettingsTab() {
    const scrollY = new Animated.Value(0);
    const {height} = Dimensions.get('window');
    const colorScheme = useColorScheme();
    const [language, setLanguage] = useState<string>('English');
    const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);

    return (
        <SafeAreaView>
            <DynamicHeader scrollY={scrollY} headerHeight={headerHeight} style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10}}>
                <TouchableOpacity>
                    <Text style={{fontSize: 20, fontWeight: '600', color: colorScheme === 'dark' ? 'white' : 'black'}}>Settings</Text>
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
                <SettingsCard label='Language'>
                    <TouchableOpacity onPress={() => {
                            setDropdownVisible(prev => !prev)
                        }}
                        style={{
                            backgroundColor: colorScheme === 'dark' ? '#212121' : '#e5e5e5',
                            paddingLeft: 20,
                            flexDirection: 'row',
                            gap: 10,
                            alignItems: 'center',
                            borderRadius: 8,
                            overflow: 'hidden'
                        }}
                    >
                        <Text style={{fontSize: 16, paddingVertical: 10, color: colorScheme === 'dark' ? 'white' : 'black'}}>{language}</Text>
                        <View style={{height: '100%', width: 1, backgroundColor: colorScheme === 'dark' ? '#616161' : '#cccccc'}}></View>
                        <Ionicons name='chevron-down-outline' size={20} color={colorScheme === 'dark' ? 'white' : 'black'} style={{paddingRight: 10}}/>
                    </TouchableOpacity>
                    <DropdownSelect filters={[{name: 'English', key: 'English'}, {name: 'Polish', key: 'Polish'}]} currentFilter={language} setCurrentFilter={setLanguage} isVisible={dropdownVisible} setVisible={setDropdownVisible} label='Language'/>
                </SettingsCard>
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
