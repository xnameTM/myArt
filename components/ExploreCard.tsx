import {Text, View} from './templates/Themed';
import {Image, Pressable, TouchableOpacity} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Ionicons} from '@expo/vector-icons';
import {useEffect, useState} from 'react';
import {TapGestureHandler} from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import {formatDesciption, shortenText} from "../utils/Utils";
import {useFocusEffect, useRouter} from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ExploreCard({item, handleCardPress}: {item: any, handleCardPress: () => void}) {
    const router = useRouter();
    const [liked, setLiked] = useState<boolean>(false);
    const [favourited, setFavourited] = useState<boolean>(false);

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
        AsyncStorage.getItem('reload-explore-card').then((item) => {
            if (!item) return;

            if (item == 'true') {
                loadLiked();
                loadFavourited();
                AsyncStorage.setItem('reload-explore-card', 'false');
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
    }

    return (
        <View style={{paddingHorizontal: 10, flex: 1, gap: 8}}>
            <View style={{position: 'relative'}}>
                <TapGestureHandler
                    maxDelayMs={200}
                    numberOfTaps={2}
                    onEnded={() => {
                        setLiked(true);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                        saveLiked()
                    }}
                >
                    <Image source={{uri: item.image}} style={{width: '100%', height: item.height, borderRadius: 10}}/>
                </TapGestureHandler>
                <LinearGradient
                    colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0)']}
                    style={{position: 'absolute', top: 0, left: 0, width: '100%', paddingTop: 10, paddingBottom: 12, paddingHorizontal: 16, borderTopLeftRadius: 10, borderTopRightRadius: 10}}>
                    <Pressable onPress={handleCardPress}>
                        <Text style={{fontWeight: '600'}}>{shortenText(item.title, 35)}</Text>
                    </Pressable>
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
                        <Ionicons name={liked ? 'heart' : 'heart-outline'} size={30} color={liked ? 'red' : 'white'}/>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Ionicons name='chatbubble-outline' size={30} color='white'/>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Ionicons name='share-outline' size={30} color='white'/>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity>
                    <Ionicons name={favourited ? 'bookmark' : 'bookmark-outline'} onPress={() => {
                        if (!favourited)
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

                        setFavourited(prev => !prev);
                        saveFavourited();
                    }} size={30} color={favourited ? '#EFAD29' : 'white'}/>
                </TouchableOpacity>
            </View>
            {/*<Text>Likes: 6376</Text>*/}
            {!item.artist_title && !item.description ? '' : (
                <Text style={{color: 'white'}}>
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
                        }} style={{backgroundColor: '#333', paddingVertical: 2, paddingHorizontal: 4, borderRadius: 3}} key={index}>
                            <Text>
                                #{shortenText(hashtag, 2)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            ) : null}
        </View>
    );
}