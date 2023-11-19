import {
    ActivityIndicator,
    Dimensions,
    Image,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    useColorScheme,
    View,
    StyleSheet,
    Text,
    Share
} from 'react-native';
import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { formatDesciption, shortenText } from '../../utils/Utils';
import { TapGestureHandler } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLanguage } from '../../utils/Settings';

function ExploreDetailsItem({name, value, pressable = false, link}: {name: string, value: string | null, pressable: boolean, link: any}) {
    const {width} = Dimensions.get('window');
    const colorScheme = useColorScheme();

    return (value ? (
            <View style={styles.itemContainer}>
                <Text style={{width: 140, color: colorScheme == 'dark' ? 'white' : 'black'}}>{name}</Text>
                {pressable ? (
                    <Link href={link}>
                        <Text style={{maxWidth: width - 20 - 140, ...styles.itemLink, color: colorScheme == 'dark' ? 'white' : 'black'}}>{value}</Text>
                    </Link>
                ) : (
                    <Text style={{maxWidth: width - 20 - 140, ...styles.itemText, color: colorScheme == 'dark' ? 'white' : 'black'}}>{value}</Text>
                )}
            </View>
        ) : ''
    );
}

const disabledIds = ['image_id', 'title', 'subject_titles', 'artist_title', 'date_display', 'main_reference_number', 'copyright_notice', 'artist_id'];

export default function ExploreDetailsPage() {
    const [image, setImage] = useState<string>('');
    const [height, setHeight] = useState<string>('');
    const router = useRouter();
    const params = useLocalSearchParams();
    const id = params.id as string;
    const colorScheme = useColorScheme();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [liked, setLiked] = useState<boolean>(false);
    const [favourited, setFavourited] = useState<boolean>(false);
    const [language, setLanguage] = useState<string | null>(null);

    const loadLocalData = async (lang: string | null = null) => {
        lang = lang ?? language ?? 'English';

        try {
            const response: {data: any} = await (await fetch(`https://api.artic.edu/api/v1/artworks/${id}?fields=image_id,title,description,subject_titles,artist_title,place_of_origin,date_display,medium_display,dimensions,credit_line,main_reference_number,copyright_notice,artist_id`)).json();

            if (!image || !height) {
                const additionalResponse = await (await fetch(`https://www.artic.edu/iiif/2/${response.data.image_id}`)).json();

                const imageWidth = Dimensions.get('window').width - 20;
                const imageHeight = Math.floor(additionalResponse.height / additionalResponse.width * imageWidth);

                setImage(`https://www.artic.edu/iiif/2/${response.data.image_id}/full/${imageWidth},${imageHeight}/0/default.jpg`);
                setHeight(String(imageHeight));
            }

            if (lang == 'Polish') {
                await Promise.all(Object.keys(response.data).map(async (key) => {
                    if (disabledIds.includes(key)) return;

                    const {status, message}: {status: string, message: string} = await (await fetch("https://script.google.com/macros/s/AKfycbxFO-bcrgAssi32N0EqtetVA-GnvWNk4ky6SO0pkpl_VF3osPr_8x54FqeDveQv3KrB/exec", {
                        method: "POST",
                        body: JSON.stringify({
                            source_lang: "auto",
                            target_lang: "pl",
                            text: String(response.data[key] ?? '')
                        }),
                        headers: {"Content-Type": "application/json"}
                    })).json();

                    if (status == 'success')
                        response.data[key] = message;
                }));
            }

            setData(response.data);
            setError(null);
        } catch {
            setError('Unable to see details of this art...');
        }

        setLoading(false);
        setRefreshing(false);
    }

    useEffect(() => {
        if (!language) {
            getLanguage().then(lang => {
                if (params.image)
                    setImage(String(params.image))

                if (params.height)
                    setHeight(String(params.height))

                if (loading || refreshing)
                    loadLocalData(lang);

                setLanguage(lang);
            });
            return;
        }

        if (params.image)
            setImage(String(params.image))

        if (params.height)
            setHeight(String(params.height))

        if (loading || refreshing)
            loadLocalData();
    }, [refreshing]);

    useEffect(() => {
        const loadLiked = async () => {
            const likedData = await AsyncStorage.getItem('liked');

            if (!likedData) return;
            const likedArray: string[] = await JSON.parse(likedData);

            setLiked(likedArray.includes(String(id)));
        }

        const loadFavourited = async () => {
            const favouritedData = await AsyncStorage.getItem('favourited');

            if (!favouritedData) return;
            const favouritedArray: string[] = await JSON.parse(favouritedData);

            setFavourited(favouritedArray.includes(String(id)));
        }

        loadLiked();
        loadFavourited();
    }, []);

    const requireExploreCardReload = async (id: string) => {
        const reloadExploreCardIds: string[] = JSON.parse(await AsyncStorage.getItem('reload-explore-card') ?? '[]');
        await AsyncStorage.setItem('reload-explore-card', JSON.stringify(reloadExploreCardIds.concat([id])));
    }

    const requireSearchCardReload = async (id: string) => {
        const reloadExploreCardIds: string[] = JSON.parse(await AsyncStorage.getItem('reload-search-card') ?? '[]');
        await AsyncStorage.setItem('reload-search-card', JSON.stringify(reloadExploreCardIds.concat([id])));
    }

    const saveLiked = async () => {
        const likedArray: string[] = JSON.parse(await AsyncStorage.getItem('liked') ?? '[]');

        if (liked) {
            if (likedArray.includes(String(id)))
                await AsyncStorage.setItem('liked', JSON.stringify(likedArray.filter(f => f != String(id))));
        } else {
            if (!likedArray.includes(String(id))) {
                likedArray.push(String(id));
                await AsyncStorage.setItem('liked', JSON.stringify(likedArray));
            }
        }

        requireExploreCardReload(String(id))
        requireSearchCardReload(String(id))

        AsyncStorage.getItem('reload-favourite-card')
            .then((ids: string | null): string[] => JSON.parse(ids ?? '[]'))
            .then((ids: string[]) => {
                if (!ids.includes(String(id)))
                    AsyncStorage.setItem('reload-favourite-card', JSON.stringify(ids.concat([String(id)])));
            })
    }

    const saveFavourited = async () => {
        const favouritedArray: string[] = JSON.parse(await AsyncStorage.getItem('favourited') ?? '[]');

        if (favourited) {
            if (favouritedArray.includes(String(id)))
                await AsyncStorage.setItem('favourited', JSON.stringify(favouritedArray.filter(f => f != String(id))));
        } else {
            if (!favouritedArray.includes(String(id))) {
                favouritedArray.push(String(id));
                await AsyncStorage.setItem('favourited', JSON.stringify(favouritedArray));
            }
        }

        requireExploreCardReload(String(id))
        requireSearchCardReload(String(id))

        AsyncStorage.getItem('reload-favourite-card')
            .then((ids: string | null): string[] => JSON.parse(ids ?? '[]'))
            .then((ids: string[]) => {
                if (!ids.includes(String(id)))
                    AsyncStorage.setItem('reload-favourite-card', JSON.stringify(ids.concat([String(id)])));
            })
    }

    const handleDoubleTapGesture = () => {
        setLiked(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        saveLiked()
    }

    const onLikedBtnPress = () => {
        if (!liked)
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

        setLiked(prev => !prev)
        saveLiked()
    }

    const onShare = () => {
        Share.share({
            message: data.title ?? 'Untitled',
            url: `https://www.artic.edu/iiif/2/${data.image_id}/full/1920,/0/default.jpg`
        })
    }

    const onFavouritedBtnPress = () => {
        if (!favourited)
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        setFavourited(prev => !prev)
        saveFavourited()
    }

    if (loading || error)
        return (
            <View style={styles.errorWrapper}>
                <Stack.Screen
                    options={{
                        headerShown: true,
                        headerTitle: '',
                        headerStyle: {backgroundColor: colorScheme == 'dark' ? 'black' : 'white'},
                        headerLeft: () => (
                            <TouchableOpacity onPress={() => router.back()}>
                                <Ionicons name='chevron-back' size={26} color={colorScheme === 'dark' ? 'white' : 'black'}/>
                            </TouchableOpacity>
                        )
                    }}
                />
                {error ? (
                    <Text style={styles.errorText}>{error}</Text>
                ) : (
                    <ActivityIndicator color='white' size='large'/>
                )}
            </View>
        );

    return (
        <SafeAreaView>
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerStyle: {backgroundColor: colorScheme === 'dark' ? 'black' : 'white'},
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name='chevron-back' size={26} color={colorScheme === 'dark' ? 'white' : 'black'}/>
                        </TouchableOpacity>
                    ),
                    headerTitle: shortenText(data.title, 10)
                }}
            />
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.dataWrapper}>
                    <TapGestureHandler
                        maxDelayMs={200}
                        numberOfTaps={2}
                        onEnded={handleDoubleTapGesture}
                    >
                        <Image
                            source={{uri: image == 'undefined' ? '' : image}}
                            style={{...styles.image, height: Number(height ?? '0')}}
                        />
                    </TapGestureHandler>
                    <View style={styles.interactWrapper}>
                        <View style={{flex: 1, flexDirection: 'row', gap: 10}}>
                            <TouchableOpacity onPress={onLikedBtnPress}>
                                <Ionicons
                                    name={liked ? 'heart' : 'heart-outline'}
                                    size={30}
                                    color={liked ? 'red' : colorScheme === 'dark' ? 'white' : 'black'}
                                />
                            </TouchableOpacity>
                            {/*<TouchableOpacity>*/}
                            {/*    <Ionicons name='chatbubble-outline' size={30} color={colorScheme === 'dark' ? 'white' : 'black'}/>*/}
                            {/*</TouchableOpacity>*/}
                            <TouchableOpacity onPress={onShare}>
                                <Ionicons name='share-outline' size={30} color={colorScheme === 'dark' ? 'white' : 'black'}/>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity onPress={onFavouritedBtnPress}>
                            <Ionicons
                                name={favourited ? 'bookmark' : 'bookmark-outline'}
                                size={30}
                                color={favourited ? '#EFAD29' : colorScheme === 'dark' ? 'white' : 'black'}
                            />
                        </TouchableOpacity>
                    </View>

                    <Text style={{
                        ...styles.title,
                        color: colorScheme == 'dark' ? 'white' : 'black'
                    }}>
                        {data.title ?? 'Untitled'}
                    </Text>

                    {data.description ? (
                        <Text style={{...styles.description, color: colorScheme == 'dark' ? 'white' : 'black'}}>
                            {
                                formatDesciption(data.description ?? '')
                                    .replaceAll('\n', '\n\n')
                                    .replaceAll('. . .', '...')
                            }
                        </Text>
                    ) : null}

                    {/*<Text>Likes: 6376</Text>*/}

                    {(data.subject_titles ?? []).length > 0 ? (
                        <View style={styles.subjectTitlesContainer}>
                            {(data.subject_titles ?? []).map((hashtag: string, index: number) => (
                                <TouchableOpacity
                                    onPress={() => {
                                        // @ts-ignore
                                        router.push(`search-artworks?${new URLSearchParams({
                                            filter: 'default', text: hashtag
                                        })}`);
                                    }}
                                    style={{
                                        backgroundColor: colorScheme === 'dark' ? '#333' : '#ccc',
                                        ...styles.subjectTitleBtn
                                    }}
                                    key={index}>
                                    <Text style={{color: colorScheme === 'dark' ? 'white' : 'black'}}>
                                        #{shortenText(hashtag, 2)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : null}

                    <ExploreDetailsItem name={language == 'Polish' ? 'Artysta' : 'Artist'} value={data.artist_title} pressable={true} link={`/artists/${data.artist_id}`}/>
                    <ExploreDetailsItem name={language == 'Polish' ? 'Tytuł' : 'Title'} value={data.title} pressable={false} link=''/>
                    <ExploreDetailsItem name={language == 'Polish' ? 'Miejsce' : 'Place'} value={data.place_of_origin} pressable={true} link={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.place_of_origin)}`}/>
                    <ExploreDetailsItem name={language == 'Polish' ? 'Data' : 'Date'} value={data.date_display} pressable={true} link={`/search-artworks?${new URLSearchParams({filter: 'date_display', text: data.date_display})}`}/>
                    <ExploreDetailsItem name={language == 'Polish' ? 'Medium' : 'Medium'} value={data.medium_display} pressable={false} link=''/>
                    <ExploreDetailsItem name={language == 'Polish' ? 'Wymiary' : 'Dimensions'} value={data.dimensions} pressable={false} link=''/>
                    <ExploreDetailsItem name={language == 'Polish' ? 'Linia kredytowa' : 'Credit Line'} value={data.credit_line} pressable={false} link=''/>
                    <ExploreDetailsItem name={language == 'Polish' ? 'Numer referencyjny' : 'Reference Number'} value={data.main_reference_number} pressable={false} link=''/>
                    <ExploreDetailsItem name={language == 'Polish' ? 'Prawo autorskie' : 'Copyright'} value={data.copyright_notice} pressable={false} link=''/>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    itemContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 10,
        paddingBottom: 1,
        borderTopColor: '#252525',
        borderTopWidth: 1
    },
    itemLink: {
        textAlign: 'right',
        textDecorationLine: 'underline'
    },
    itemText: {
        textAlign: 'right'
    },
    errorWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    errorText: {
        fontSize: 20,
        color: 'white'
    },
    scrollView: {
        paddingHorizontal: 10,
        height: '100%'
    },
    dataWrapper: {
        flex: 1,
        gap: 10,
        paddingTop: 10,
        paddingBottom: 50
    },
    image: {
        width: '100%',
        borderRadius: 10
    },
    interactWrapper: {
        flex: 1,
        flexDirection: 'row'
    },
    title: {
        fontWeight: '600',
        fontSize: 18
    },
    description: {
        fontSize: 14
    },
    subjectTitlesContainer: {
        flex: 1,
        gap: 5,
        alignItems: 'flex-start',
        flexDirection: 'row',
        maxWidth: '100%',
        flexWrap: 'wrap'
    },
    subjectTitleBtn: {
        paddingVertical: 2,
        paddingHorizontal: 4,
        borderRadius: 3
    }
});