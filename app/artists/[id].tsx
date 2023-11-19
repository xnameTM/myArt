import {
    ActivityIndicator,
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View
} from 'react-native';
import {Link, Stack, useLocalSearchParams, useRouter} from 'expo-router';
import React, {useEffect, useState} from 'react';
import {Ionicons} from '@expo/vector-icons';
import {formatDesciption, shortenText} from '../../utils/Utils';
import {getLanguage} from '../../utils/Settings';
import {ArtworkModel} from '../../models/ArtworkModel';
import ExploreCard, { CardPlacementType } from '../../components/ExploreCard';

interface ArtistModel {
    id: number;
    title: string;
    alt_titles: string[];
    birth_date: number;
    death_date: number;
    description: string | null;
}

const disabledIds = ['id', 'title', 'alt_titles', 'birth_date', 'death_date'];

export default function ExploreDetailsPage() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const id = params.id as string;
    const colorScheme = useColorScheme();
    const [artist, setArtist] = useState<Partial<ArtistModel> | null>(null);
    const [artworks, setArtworks] = useState<(Partial<ArtworkModel> | null)[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [language, setLanguage] = useState<string | null>(null);

    const loadLocalData = async (lang: string | null = null) => {
        lang = lang ?? language ?? 'English';

        try {
            const {data}: {data: Partial<ArtistModel>} = await (await fetch(`https://api.artic.edu/api/v1/artists/${id}?fields=id,title,alt_titles,birth_date,death_date,description`)).json();

            if (lang == 'Polish') {
                await Promise.all(Object.keys(data).map(async (key) => {
                    if (disabledIds.includes(key)) return;

                    const {status, message}: {status: string, message: string} = await (await fetch("https://script.google.com/macros/s/AKfycbxFO-bcrgAssi32N0EqtetVA-GnvWNk4ky6SO0pkpl_VF3osPr_8x54FqeDveQv3KrB/exec", {
                        method: "POST",
                        body: JSON.stringify({
                            source_lang: "auto",
                            target_lang: "pl",
                            // @ts-ignore
                            text: String(response.data[key] ?? '')
                        }),
                        headers: {"Content-Type": "application/json"}
                    })).json();

                    if (status == 'success')
                        // @ts-ignore
                        response.data[key] = message;
                }));
            }

            setArtist(data);
            setError(null);
        } catch {
            setError('Unable to see details of this artist...');
        }

        setLoading(false);

        try {
            const {data}: {data: Partial<ArtworkModel>[]} = await (await fetch(`https://api.artic.edu/api/v1/artworks/search?fields=id,title,artist_title,description,subject_titles,image_id&page=1&limit=20&query[bool][must][match][artist_id]=${id}`)).json();

            const formattedData = (await Promise.all(data.map(async (item: Partial<ArtworkModel>) => {
                try {
                    const {width, height} = await (await fetch(`https://www.artic.edu/iiif/2/${item.image_id}`)).json();

                    const imageWidth = Dimensions.get('window').width - 20;
                    const imageHeight = Math.floor(height / width * imageWidth);

                    if (language == 'Polish') {
                        await Promise.all(Object.keys(item).map(async (key: string) => {
                            if (disabledIds.includes(key)) return;

                            const {status, message}: {status: string, message: string} = await (await fetch("https://script.google.com/macros/s/AKfycbxFO-bcrgAssi32N0EqtetVA-GnvWNk4ky6SO0pkpl_VF3osPr_8x54FqeDveQv3KrB/exec", {
                                method: "POST",
                                body: JSON.stringify({
                                    source_lang: "auto",
                                    target_lang: "pl",
                                    // @ts-ignore
                                    text: String(item[key] ?? '')
                                }),
                                headers: {"Content-Type": "application/json"}
                            })).json();

                            if (status == 'success')
                                // @ts-ignore
                                item[key] = message;
                        }));
                    }

                    item.image = `https://www.artic.edu/iiif/2/${item.image_id}/full/${imageWidth},${imageHeight}/0/default.jpg`;
                    item.height = imageHeight;

                    return item;
                } catch {
                    return null;
                }
            }))).filter((item) => item != null);

            setArtworks(formattedData);
        } catch {
            setError('Unable to see artworks of this artist...');
        }
    }

    useEffect(() => {
        getLanguage().then(lang => {
            loadLocalData(lang);
            setLanguage(lang);
        });
        return;
    }, []);

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
                    headerTitle: shortenText(artist?.title ?? '', 10)
                }}
            />
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.dataWrapper}>
                    <Text style={{
                        ...styles.title,
                        color: colorScheme == 'dark' ? 'white' : 'black'
                    }}>
                        {artist?.title ?? ''}
                    </Text>

                    <Text style={{
                        ...styles.date,
                        color: colorScheme == 'dark' ? 'white' : 'black'
                    }}>
                        {artist?.birth_date}-{artist?.death_date}
                    </Text>

                    {artist?.description ? (
                        <Text style={{...styles.description, color: colorScheme == 'dark' ? 'white' : 'black'}}>
                            {
                                formatDesciption(artist?.description ?? '')
                                    .replaceAll('\n', '\n\n')
                                    .replaceAll('. . .', '...')
                            }
                        </Text>
                    ) : null}

                    {/*/!*<Text>Likes: 6376</Text>*!/*/}

                    {(artist?.alt_titles ?? []).length > 0 ? (
                        <View style={styles.altTitlesContainer}>
                            {(artist?.alt_titles ?? []).map((hashtag: string, index: number) => (
                                <View
                                    style={{
                                        backgroundColor: colorScheme === 'dark' ? '#333' : '#ccc',
                                        ...styles.altTitleBtn
                                    }}
                                    key={index}>
                                    <Text style={{color: colorScheme === 'dark' ? 'white' : 'black'}}>
                                        #{shortenText(hashtag, 2)}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    ) : null}

                    <View style={{gap: 20}}>
                        {(artworks?? []).filter(artwork => artwork != null).map((artwork, index) => {
                            if (!artwork) return null;

                            return (
                                <ExploreCard key={`artist-explore-card-${artwork.id}-${index}`} item={artwork} handleCardPress={() => router.push(`/details/${artwork.id}?${new URLSearchParams({height: String(artwork.height ?? 400), image: artwork.image ?? ''})}`)} placementType={CardPlacementType.Search}/>
                            );
                        })}
                    </View>
                    {/*@ts-ignore*/}
                    <TouchableOpacity onPress={() => router.push(`/search-artworks?${new URLSearchParams({filter: 'artist_title', text: artist?.title ?? ''})}`)}>
                        <Text style={{color: '#999', textAlign: 'center', paddingTop: 16}}>{language === 'Polish' ? 'Zobacz wszystkie' : 'See all'}</Text>
                    </TouchableOpacity>
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
    title: {
        fontWeight: '600',
        fontSize: 18
    },
    date: {
      fontSize: 12,
    },
    description: {
        fontSize: 14
    },
    altTitlesContainer: {
        flex: 1,
        gap: 5,
        alignItems: 'flex-start',
        flexDirection: 'row',
        maxWidth: '100%',
        flexWrap: 'wrap',
        paddingBottom: 20
    },
    altTitleBtn: {
        paddingVertical: 2,
        paddingHorizontal: 4,
        borderRadius: 3
    }
});