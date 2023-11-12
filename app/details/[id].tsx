import {
    ActivityIndicator,
    Dimensions,
    Image,
    Pressable,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    View
} from "react-native";
import {Text} from "../../components/templates/Themed";
import {Href, Link, Stack, useLocalSearchParams, useRouter} from "expo-router";
import {useEffect, useState} from "react";
import {Ionicons} from '@expo/vector-icons';
import * as Haptics from "expo-haptics";
import {formatDesciption, shortenText} from "../../utils/Utils";
import {TapGestureHandler} from "react-native-gesture-handler";

function ExploreDetailsItem({name, value, pressable = false, link}: {name: string, value: string | null, pressable: boolean, link: any}) {
    const screenWidth = Dimensions.get('window').width;

    return (value ? (
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, paddingBottom: 1, borderTopColor: '#252525', borderTopWidth: 1}}>
                <Text style={{width: 140}}>{name}</Text>
                {pressable ? (
                    <Link href={link}>
                        <Text style={{maxWidth: screenWidth - 20 - 140, textAlign: 'right', textDecorationLine: 'underline'}}>{value}</Text>
                    </Link>
                ) : (
                    <Text style={{maxWidth: screenWidth - 20 - 140, textAlign: 'right'}}>{value}</Text>
                )}
            </View>
        ) : ''
    );
}

export default function ExploreDetailsPage() {
    const [image, setImage] = useState<string>('');
    const [height, setHeight] = useState<string>('');
    const router = useRouter();
    const params = useLocalSearchParams();
    const id = params.id;

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [liked, setLiked] = useState<boolean>(false);
    const [favourited, setFavourited] = useState<boolean>(false);

    const loadLocalData = async () => {
        try {
            const response: {data: any} = await (await fetch(`https://api.artic.edu/api/v1/artworks/${id}`)).json();

            if (!image || !height) {
                const additionalResponse = await (await fetch(`https://www.artic.edu/iiif/2/${response.data.image_id}`)).json();

                const imageWidth = Dimensions.get('window').width - 20;
                const imageHeight = Math.floor(additionalResponse.height / additionalResponse.width * imageWidth);

                setImage(`https://www.artic.edu/iiif/2/${response.data.image_id}/full/${imageWidth},${imageHeight}/0/default.jpg`);
                setHeight(String(imageHeight));
            }

            setData(response.data)
            setError(null);
        } catch {
            setError('Unable to see details of this art...');
        }

        setLoading(false);
        setRefreshing(false);
    }

    useEffect(() => {
        if (params.image)
            setImage(String(params.image))

        if (params.height)
            setHeight(String(params.height))

        if (loading || refreshing)
            loadLocalData();
    }, [refreshing]);

    if (loading || error)
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <Stack.Screen
                    options={{
                        headerShown: true,
                        headerTitle: '',
                        headerStyle: {backgroundColor: 'black'},
                        headerLeft: () => (
                            <TouchableOpacity>
                                <Ionicons name='chevron-back' size={26} color='white' onPress={() => router.back()}/>
                            </TouchableOpacity>
                        )
                    }}
                />
                {error ? (
                    <Text style={{fontSize: 20, color: 'white'}}>{error}</Text>
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
                    headerStyle: {backgroundColor: 'black'},
                    headerLeft: () => (
                        <TouchableOpacity>
                            <Ionicons name='chevron-back' size={26} color='white' onPress={() => router.back()}/>
                        </TouchableOpacity>
                    ),
                    headerTitle: shortenText(data.title, 10)
                }}
            />
            <ScrollView style={{paddingHorizontal: 10, height: '100%'}} showsVerticalScrollIndicator={false}>
                <View style={{flex: 1, gap: 10, paddingTop: 10, paddingBottom: 50}}>
                    <TapGestureHandler
                        maxDelayMs={200}
                        numberOfTaps={2}
                        onEnded={() => {
                            setLiked(true);
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                        }}
                    >
                        <Image source={{uri: image == 'undefined' ? '' : image}} style={{width: '100%', height: Number(height == 'undefined' ? '0' : height), borderRadius: 10}}/>
                    </TapGestureHandler>
                    <View style={{flex: 1, flexDirection: 'row'}}>
                        <View style={{flex: 1, flexDirection: 'row', gap: 10}}>
                            <TouchableOpacity>
                                <Ionicons name={liked ? 'heart' : 'heart-outline'} onPress={() => {
                                    if (!liked)
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                    setLiked(prev => !prev)
                                }} size={30} color={liked ? 'red' : 'white'}/>
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
                                setFavourited(prev => !prev)
                            }} size={30} color={favourited ? '#EFAD29' : 'white'}/>
                        </TouchableOpacity>
                    </View>

                    <Text style={{fontWeight: '600', fontSize: 18}}>{data.title ?? 'Untitled'}</Text>
                    <Text>Likes: 6376</Text>
                    {(data.subject_titles ?? []).length > 0 ? (
                        <View style={{flex: 1, gap: 5, alignItems: 'flex-start', flexDirection: 'row', maxWidth: '100%', flexWrap: 'wrap'}}>
                            {(data.subject_titles ?? []).map((hashtag: string, index: number) => (
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
                    <ExploreDetailsItem name='Artist' value={data.artist_title} pressable={true} link={`/artists/${data.artist_id}`}/>
                    <ExploreDetailsItem name='Title' value={data.title} pressable={false} link=''/>
                    <ExploreDetailsItem name='Place' value={data.place_of_origin} pressable={false} link=''/>
                    <ExploreDetailsItem name='Date' value={data.date_display} pressable={true} link={`/search-artworks?${new URLSearchParams({filter: 'date_display', text: data.date_display})}`}/>
                    <ExploreDetailsItem name='Medium' value={data.medium_display} pressable={false} link=''/>
                    <ExploreDetailsItem name='Dimensions' value={data.dimensions} pressable={false} link=''/>
                    <ExploreDetailsItem name='Credit Line' value={data.credit_line} pressable={false} link=''/>
                    <ExploreDetailsItem name='Reference Number' value={data.main_reference_number} pressable={false} link=''/>
                    <ExploreDetailsItem name='Copyright' value={data.copyright_notice} pressable={false} link=''/>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}