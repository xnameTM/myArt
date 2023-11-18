import {Image, TouchableOpacity, useColorScheme, Text, View, Share} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Ionicons} from '@expo/vector-icons';
import React, {useRef, useState, useEffect} from 'react';
import {
    GestureHandlerRootView, HandlerStateChangeEvent,
    State,
    TapGestureHandler,
    TapGestureHandlerEventPayload
} from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import {formatDesciption, shortenText} from "../utils/Utils";
import {useFocusEffect, useRouter} from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

export enum CardPlacementType {
    Explore,
    Search
}

export default function ExploreCard({item, handleCardPress, placementType}: {item: any, handleCardPress: () => void, placementType: CardPlacementType}) {
    const router = useRouter();
    const [liked, setLiked] = useState<boolean>(false);
    const [favourited, setFavourited] = useState<boolean>(false);
    const doubleTapRef = useRef();
    const colorScheme = useColorScheme();

    const handleSingleTap = (e: HandlerStateChangeEvent<TapGestureHandlerEventPayload>) => {
        if (e.nativeEvent.state === State.ACTIVE)
            handleCardPress();
    };

    const handleDoubleTap = (e: HandlerStateChangeEvent<TapGestureHandlerEventPayload>) => {
        if (e.nativeEvent.state === State.ACTIVE) {
            setLiked(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    };

    const loadLiked = async () => {
        const likedData = await AsyncStorage.getItem('liked');

        if (!likedData) return;
        const likedArray: string[] = await JSON.parse(likedData);

        setLiked(likedArray.includes(String(item.id)));
    }

    const loadFavourited = async () => {
        const favouritedData = await AsyncStorage.getItem('favourited');

        if (!favouritedData) return;
        const favouritedArray: string[] = await JSON.parse(favouritedData);

        setFavourited(favouritedArray.includes(String(item.id)));
    }

    useEffect(() => {
        loadLiked()
        loadFavourited()
    }, []);

    useFocusEffect(() => {
        if (placementType == CardPlacementType.Explore)
            AsyncStorage.getItem('reload-explore-card')
                .then((ids: string | null): string[] => JSON.parse(ids ?? '[]'))
                .then((ids: string[]) => {
                    if (ids.includes(String(item.id))) {
                        loadLiked();
                        loadFavourited();
                        AsyncStorage.setItem('reload-explore-card', JSON.stringify(ids.filter(id => id != item.id)));
                    }
                })
        else if (placementType == CardPlacementType.Search)
            AsyncStorage.getItem('reload-search-card')
                .then((ids: string | null): string[] => JSON.parse(ids ?? '[]'))
                .then((ids: string[]) => {
                    if (ids.includes(String(item.id))) {
                        loadLiked();
                        loadFavourited();
                        AsyncStorage.setItem('reload-search-card', JSON.stringify(ids.filter(id => id != item.id)));
                    }
                })
    });

    const saveLiked = async () => {
        const likedArray: string[] = JSON.parse(await AsyncStorage.getItem('liked') ?? '[]');

        if (liked) {
            if (likedArray.includes(String(item.id)))
                await AsyncStorage.setItem('liked', JSON.stringify(likedArray.filter(f => f != String(item.id))));
        } else {
            if (!likedArray.includes(String(item.id))) {
                likedArray.push(String(item.id));
                await AsyncStorage.setItem('liked', JSON.stringify(likedArray));
            }
        }

        if (placementType == CardPlacementType.Search)
            AsyncStorage.getItem('reload-explore-card')
                .then((ids: string | null): string[] => JSON.parse(ids ?? '[]'))
                .then((ids: string[]) => {

                    AsyncStorage.setItem('reload-explore-card', JSON.stringify(ids.concat([String(item.id)])));
                })

        AsyncStorage.getItem('reload-favourite-card')
            .then((ids: string | null): string[] => JSON.parse(ids ?? '[]'))
            .then((ids: string[]) => {

                AsyncStorage.setItem('reload-favourite-card', JSON.stringify(ids.concat([String(item.id)])));
            })
    }

    const saveFavourited = async () => {
        const favouritedArray: string[] = JSON.parse(await AsyncStorage.getItem('favourited') ?? '[]');

        if (favourited) {
            if (favouritedArray.includes(String(item.id)))
                await AsyncStorage.setItem('favourited', JSON.stringify(favouritedArray.filter(f => f != String(item.id))));
        } else {
            if (!favouritedArray.includes(String(item.id))) {
                favouritedArray.push(String(item.id));
                await AsyncStorage.setItem('favourited', JSON.stringify(favouritedArray));
            }
        }

        if (placementType == CardPlacementType.Search)
            AsyncStorage.getItem('reload-explore-card')
                .then((ids: string | null): string[] => JSON.parse(ids ?? '[]'))
                .then((ids: string[]) => {
                    if (!ids.includes(String(item.id)))
                        AsyncStorage.setItem('reload-explore-card', JSON.stringify(ids.concat([String(item.id)])));
                })

        AsyncStorage.getItem('reload-favourite-card')
            .then((ids: string | null): string[] => JSON.parse(ids ?? '[]'))
            .then((ids: string[]) => {
                if (!ids.includes(String(item.id)))
                    AsyncStorage.setItem('reload-favourite-card', JSON.stringify(ids.concat([String(item.id)])));
            })
    }

    return (
        <View style={{paddingHorizontal: 10, flex: 1, gap: 8}}>
            <View style={{position: 'relative'}}>
                <GestureHandlerRootView>
                    <TapGestureHandler
                        onHandlerStateChange={handleSingleTap}
                        waitFor={doubleTapRef}
                    >
                        <TapGestureHandler
                            onHandlerStateChange={handleDoubleTap}
                            numberOfTaps={2}
                            maxDelayMs={300}
                            ref={doubleTapRef}
                        >
                            <Image source={{uri: item.image}} style={{width: '100%', height: item.height, borderRadius: 10}}/>
                        </TapGestureHandler>
                    </TapGestureHandler>
                </GestureHandlerRootView>
                <LinearGradient
                    colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0)']}
                    style={{position: 'absolute', top: 0, left: 0, width: '100%', paddingTop: 10, paddingBottom: 12, paddingHorizontal: 16, borderTopLeftRadius: 10, borderTopRightRadius: 10}}>
                    <Text style={{fontWeight: '600', color: 'white'}}>{shortenText(item.title, 35)}</Text>
                </LinearGradient>
            </View>
            <View style={{flex: 1, flexDirection: 'row'}}>
                <View style={{flex: 1, flexDirection: 'row', gap: 10}}>
                    <TouchableOpacity onPress={() => {
                        if (!liked)
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                        setLiked(prev => !prev)
                        saveLiked()
                    }}>
                        <Ionicons name={liked ? 'heart' : 'heart-outline'} size={30} color={liked ? 'red' : colorScheme === 'dark' ? 'white' : 'black'}/>
                    </TouchableOpacity>
                    {/*<TouchableOpacity>*/}
                    {/*    <Ionicons name='chatbubble-outline' size={30} color={colorScheme === 'dark' ? 'white' : 'black'}/>*/}
                    {/*</TouchableOpacity>*/}
                    <TouchableOpacity onPress={() => {
                        Share.share({
                            message: item.title ?? 'Untitled',
                            url: `https://www.artic.edu/iiif/2/${item.image_id}/full/1920,/0/default.jpg`
                        })
                    }}>
                        <Ionicons name='share-outline' size={30} color={colorScheme === 'dark' ? 'white' : 'black'}/>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => {
                    if (!favourited)
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

                    setFavourited(prev => !prev);
                    saveFavourited();
                }}>
                    <Ionicons name={favourited ? 'bookmark' : 'bookmark-outline'} size={30} color={favourited ? '#EFAD29' : colorScheme === 'dark' ? 'white' : 'black'}/>
                </TouchableOpacity>
            </View>
            {/*<Text>Likes: 6376</Text>*/}
            {!item.artist_title && !item.description ? '' : (
                <Text style={{color: colorScheme === 'dark' ? 'white' : 'black'}}>
                    <Text style={{fontWeight: '600'}}>{item.artist_title ? item.artist_title + ' ' : ''}</Text>
                    <Text>{formatDesciption(item.description ?? '', 50)}</Text>
                </Text>
            )}
            {(item.subject_titles ?? []).length > 0 ? (
                <View style={{flex: 1, gap: 5, alignItems: 'flex-start', flexDirection: 'row', maxWidth: '100%', flexWrap: 'wrap'}}>
                    {(item.subject_titles ?? []).map((hashtag: string, index: number) => (
                        <TouchableOpacity onPress={() => {
                            // @ts-ignore
                            router.push(`search-artworks?${new URLSearchParams({filter: 'default', text: hashtag})}`)
                        }} style={{backgroundColor: colorScheme === 'dark' ? '#333' : '#ccc', paddingVertical: 2, paddingHorizontal: 4, borderRadius: 3}} key={index}>
                            <Text style={{color: colorScheme === 'dark' ? 'white' : 'black'}}>
                                #{shortenText(hashtag, 2)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            ) : null}
        </View>
    );
}