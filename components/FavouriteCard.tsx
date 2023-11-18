import {Alert, Dimensions, Image, Pressable, ScrollView, Text, useColorScheme, View} from "react-native";
import {useCallback, useEffect, useRef, useState} from "react";
import {Ionicons} from "@expo/vector-icons";
import {formatDesciption, shortenText} from "../utils/Utils";
import {useFocusEffect} from "expo-router";
import {getLanguage, setLanguage} from "../utils/Settings";

const snapOffsets = [0, 100, 200];
export default function FavouriteCard({item, removeFavourite, handlePress, language}: {item: any, removeFavourite: () => void, handlePress: () => void, language: string}) {
    const {width} = Dimensions.get('window');
    const scrollViewRef = useRef<ScrollView>(null);
    const [outOfPage, setOutOfPage] = useState<boolean>(false);
    const colorScheme = useColorScheme();

    const recenter = useCallback(() => {
        scrollViewRef.current?.scrollTo({x: snapOffsets[1], y: 0, animated: false})
    }, []);

    return (
        <ScrollView
            ref={scrollViewRef}
            snapToOffsets={snapOffsets}
            snapToInterval={snapOffsets[1]}
            snapToAlignment={'start'}
            contentOffset={{x: 100, y: 0}}
            disableScrollViewPanResponder={true}
            disableIntervalMomentum={true}
            decelerationRate={0.001}
            style={{width: '100%', position: 'relative', borderRadius: 16, overflow: 'hidden'}}
            showsHorizontalScrollIndicator={false}
            horizontal={true}
            scrollEventThrottle={50}
            onScroll={({nativeEvent}) => {
                if (nativeEvent.contentOffset.x > snapOffsets[0] && nativeEvent.contentOffset.x < snapOffsets[2])
                    setOutOfPage(false);

                if (outOfPage) return;

                if (nativeEvent.contentOffset.x < snapOffsets[0] - 90) {
                    setOutOfPage(true);
                    recenter();
                    handlePress();
                } else if (nativeEvent.contentOffset.x > snapOffsets[2] + 90) {
                    setOutOfPage(true);
                    Alert.alert(language === 'Polish' ? 'Jesteś pewien?' : 'Are you sure?', undefined, [
                        {
                            text: language === 'Polish' ? 'Tak' : 'Yes',
                            onPress: () => {
                                removeFavourite();
                                setOutOfPage(false);
                            },
                            style: 'default'
                        },
                        {
                            text: language === 'Polish' ? 'Nie' : 'No',
                            onPress: () => {
                                recenter();
                                setOutOfPage(false);
                            },
                            style: 'cancel'
                        }
                    ])
                }
            }}
        >
            <View style={{width: width - 20 + 200, flex: 1, flexDirection: 'row', position: 'relative'}}>
                <Pressable onPress={() => {
                    recenter()
                    handlePress()
                }} style={{height: 100, width: 500, backgroundColor: '#1ed760', justifyContent: 'center', alignItems: 'center', paddingLeft: 400, left: -400, position: 'absolute'}}>
                    <Text style={{color: '#fff', fontSize: 16, fontWeight: '500'}}>{language === 'Polish' ? 'Zobacz' : 'See'}</Text>
                </Pressable>
                <Pressable onPress={handlePress} style={{backgroundColor: colorScheme === 'dark' ? '#111' : '#eee', padding: 10, marginLeft: 100, width: width - 20, flexDirection: 'row', gap: 10}}>
                    <Image source={{uri: `https://www.artic.edu/iiif/2/${item.image_id}/full/843,/0/default.jpg`}} style={{width: 80, height: 80, borderRadius: 6}}/>
                    <View style={{backgroundColor: 'transparent'}}>
                        <Text style={{fontSize: 18, color: colorScheme === 'dark' ? '#eee' : '#111'}}>{shortenText(item.title ?? 'Unknown', 20)}</Text>
                        <Text style={{color: colorScheme === 'dark' ? '#aaa' : '#555'}}>{formatDesciption(item.description ?? '', 25)}</Text>
                    </View>
                </Pressable>
                <Pressable onPress={() => {
                    Alert.alert(language === 'Polish' ? 'Jesteś pewien?' : 'Are you sure?', undefined, [
                        {
                            text: language === 'Polish' ? 'Tak' : 'Yes',
                            onPress: () => {
                                removeFavourite();
                                setOutOfPage(false);
                            },
                            style: 'default'
                        },
                        {
                            text: language === 'Polish' ? 'Nie' : 'No',
                            onPress: () => {
                                recenter();
                                setOutOfPage(false);
                            },
                            style: 'cancel'
                        }
                    ])
                }} style={{height: 100, width: 500, backgroundColor: '#E8383B', justifyContent: 'center', alignItems: 'center', paddingRight: 400}}>
                    <Ionicons name="trash-outline" size={32} color='white'></Ionicons>
                </Pressable>
            </View>
        </ScrollView>
    );
}