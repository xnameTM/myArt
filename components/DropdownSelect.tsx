import { Alert, Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useEffect } from 'react';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface Props {
    filters: {name: string, key: string}[];
    currentFilter: string;
    setCurrentFilter: React.Dispatch<React.SetStateAction<string>>;
    isVisible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
    label: string;
    language: string | null;
}

export default function DropdownSelect({filters, currentFilter, setCurrentFilter, isVisible, setVisible, label, language}: Props) {
    const anim = useSharedValue(isVisible ? 1 : 0);
    const colorSheme = useColorScheme();

    useEffect(() => {
        anim.value = withTiming(isVisible ? 1 : 0, {
            duration: 400,
            easing: Easing.bezier(0.31, -0.02, 0, 1.03)
        })
    }, [isVisible]);

    const containerStyle = useAnimatedStyle(() => ({
        transform: [
            {scale: anim.value},
            {translateX: anim.value * -90},
            {translateY: anim.value * 40}
        ],
        opacity: anim.value / 2 + .5
    }))

    return (
        <Animated.View style={[{position: 'absolute', top: 0, right: -95, height: '100%', zIndex: 1}, containerStyle]}>
            <View>
                <View style={{overflow: 'hidden', borderTopLeftRadius: 10, borderTopRightRadius: 10}}>
                    <BlurView intensity={20} style={{...styles.desc, backgroundColor: colorSheme === 'dark' ? '#222222cc' : 'rgba(239,239,239,0.8)'}}>
                        <Text style={{...styles.descText, color: colorSheme === 'dark' ? 'rgba(192,192,192,0.8)' : '#666'}}>{label}</Text>
                    </BlurView>
                </View>
                <View style={{width: 220}}>
                    {filters.map((f, index) => (
                        <Pressable key={index} onPress={() => {
                            Alert.alert(
                                f.key === 'Polish' ? 'Zmiana języka' : 'The language change',
                                f.key === 'Polish' ? 'całkowicie będzie widoczna po restarcie aplikacji.' : 'will be fully visible after restarting the application.', [{
                                text: 'Ok',
                                onPress: () => {
                                    setCurrentFilter(f.key);
                                    setVisible(false);
                                },
                                style: 'default'
                            }]);
                        }}>
                            <View style={index + 1 == filters.length ? styles.btnLastWrapper : {}}>
                                <BlurView intensity={20} style={{...(index + 1 == filters.length ? styles.btnLast : styles.btn), backgroundColor: colorSheme === 'dark' ? '#222222cc' : 'rgba(239,239,239,0.8)'}}>
                                    {currentFilter == f.key ? <Ionicons name='checkmark' size={24} style={styles.checkmark} color={colorSheme === 'dark' ? '#fff' : '#000'}/> : ''}
                                    <Text style={{...styles.btnText, color: colorSheme === 'dark' ? '#fff' : '#000'}}>{f.name}</Text>
                                </BlurView>
                            </View>
                        </Pressable>
                    ))}
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    btn: {
        backgroundColor: '#222222cc',
        borderBottomColor: '#777',
        borderBottomWidth: 1
    },
    btnLast: {
        backgroundColor: '#222222cc'
    },
    btnLastWrapper: {
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        overflow: 'hidden'
    },
    btnText: {
        fontSize: 16,
        left: 40,
        paddingVertical: 12,
        color: 'white',
        fontWeight: '500'
    },
    btnIcon: {
        position: 'absolute',
        right: 20,
        top: 9
    },
    desc: {
        borderBottomColor: '#777',
        borderBottomWidth: 1,
        backgroundColor: '#222222cc'
    },
    descText: {
        fontSize: 16,
        paddingVertical: 10,
        left: 40,
        color: 'gray'
    },
    checkmark: {
        position: 'absolute',
        left: 9,
        top: 9
    }
});
