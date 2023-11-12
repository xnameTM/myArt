import {Pressable, StyleSheet, Text, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import { BlurView } from 'expo-blur';
import React, {useEffect} from "react";
import Animated, {Easing, useAnimatedStyle, useSharedValue, withTiming} from "react-native-reanimated";

interface Props {
    filters: {name: string, icon: string}[];
    currentFilter: string;
    setCurrentFilter: React.Dispatch<React.SetStateAction<string>>;
    isVisible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export function SearchFilter({filters, currentFilter, setCurrentFilter, isVisible, setVisible}: Props) {
    const anim = useSharedValue(isVisible ? 1 : 0);

    useEffect(() => {
        console.log('test')
        anim.value = withTiming(isVisible ? 1 : 0, {
            duration: 400,
            easing: Easing.bezier(0.31, -0.02, 0, 1.03)
        })
    }, [isVisible]);

    const containerStyle = useAnimatedStyle(() => ({
        transform: [
            {scale: anim.value},
            {translateX: (1 - anim.value) * 220}
        ],
        opacity: anim.value
    }))

    return (
        <Animated.View style={[{position: 'absolute', top: '90%', right: '40%', height: '100%'}, containerStyle]}>
            <View>
                <View style={{overflow: 'hidden', borderTopLeftRadius: 10, borderTopRightRadius: 10}}>
                    <BlurView intensity={20} style={styles.desc}>
                        <Text style={styles.descText}>Filters</Text>
                    </BlurView>
                </View>
                <View style={{width: 220}}>
                    {filters.map((f, index) => (
                        <Pressable key={index} onPress={() => {
                            setCurrentFilter(f.name);
                            setVisible(false);
                        }}>
                            <View style={index + 1 == filters.length ? styles.btnLastWrapper : {}}>
                                <BlurView intensity={20} style={index + 1 == filters.length ? styles.btnLast : styles.btn}>
                                    {currentFilter == f.name ? <Ionicons name='checkmark' size={24} style={styles.checkmark} color='white'/> : ''}
                                    <Text style={styles.btnText}>{f.name}</Text>
                                    {/* @ts-ignore */}
                                    <Ionicons name={f.icon} style={styles.btnIcon} size={24} color='white'/>
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
