import {
    ActivityIndicator, Dimensions,
    FlatList,
    Image,
    RefreshControl,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import {Stack, useLocalSearchParams, useRouter} from "expo-router";
import {ExternalLink} from "../../components/templates/ExternalLink";
import React, {useCallback, useEffect, useState} from "react";
import ExploreCard from "../../components/ExploreCard";
import {Ionicons} from "@expo/vector-icons";
import {shortenText} from "../../utils/Utils";

const fields = 'id,title,artist_title,date_display,image_id';

export default function SearchScreen() {
    const router = useRouter();
    const {filter, text} = useLocalSearchParams();
    const [page, setPage] = useState<number>(1);
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [loadingNextPage, setLoadingNextPage] = useState<boolean>(false);
    const [total, setTotal] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadData = async () => {
        try {
            const obj = {};
            // @ts-ignore
            obj[`query[bool][must][match][${filter}]`] = String(text);

            const newData : {data: any[], pagination: {total: number}} = await (await fetch(`https://api.artic.edu/api/v1/artworks/search?${new URLSearchParams({
                fields,
                page: String(page),
                limit: '20',
                ...(filter == 'default' ? {q: String(text)} : obj)
            })}`)).json();


            setTotal(newData.pagination.total)

            const formattedNewData = (await Promise.all(newData.data.map(async (item) => {
                try {
                    const {width, height} = await (await fetch(`https://www.artic.edu/iiif/2/${item.image_id}`)).json();

                    const imageWidth = Dimensions.get('window').width - 20;
                    const imageHeight = Math.floor(height / width * imageWidth);

                    return {image: `https://www.artic.edu/iiif/2/${item.image_id}/full/${imageWidth},${imageHeight}/0/default.jpg`, height: imageHeight, ...item};
                } catch {
                    return null;
                }
            }))).filter((el) => el != null);

            setData(data.concat(formattedNewData));
            setError(null);
        } catch {
            setError('Unable to load search...')
        }

        setRefreshing(false);
        setLoadingNextPage(false);
        setLoading(false);
    };

    useEffect(() => {
        if (total) {
            if (data.length >= total) {
                setRefreshing(false);
                setLoadingNextPage(false);
                setLoading(false);
                return;
            }
        }

        if (loading || refreshing || loadingNextPage)
            loadData()
    }, [loading, refreshing, loadingNextPage]);

    const onRefresh = useCallback(() => {
        setPage(1);
        setData([]);
        setRefreshing(true);
    }, []);

    const handleLoadMore = () => {
        if (loadingNextPage) return;

        setPage(prevPage => prevPage + 1);
        setLoadingNextPage(true);
    };

    if (loading)
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <Stack.Screen options={{
                    headerShown: true,
                    headerTitle: shortenText(String(text), 10),
                    headerStyle: {backgroundColor: 'black'},
                    headerLeft: () => (
                        <TouchableOpacity>
                            <Ionicons name='chevron-back' size={26} color='white' onPress={() => router.back()}/>
                        </TouchableOpacity>
                    )
                }}/>
                <ActivityIndicator color='white' size='large'/>
            </View>
        );

    // endpoint: `https://api.artic.edu/api/v1/artworks/search?query[bool][must][match][artist_display]=Pablo+Picasso`

    return (
        <SafeAreaView>
            <Stack.Screen options={{
                headerShown: true,
                headerTitle: shortenText(String(text), 10),
                headerStyle: {backgroundColor: 'black'},
                headerLeft: () => (
                    <TouchableOpacity>
                        <Ionicons name='chevron-back' size={26} color='white' onPress={() => router.back()}/>
                    </TouchableOpacity>
                )
            }}/>
            {data.length <= 0 ? (
                <View style={{minHeight: Dimensions.get('window').height - 150, flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{color: 'white', textAlign: 'center', paddingVertical: 20, fontSize: 15}}>No results for: {text}</Text>
                </View>
            ) : (
                <FlatList
                    data={data}
                    contentContainerStyle={{gap: 20}}
                    renderItem={({item, index}) => (
                        <ExploreCard item={item} key={index} handleCardPress={() => router.push(`/details/${item.id}?${new URLSearchParams({height: String(item.height), image: item.image})}`)}/>
                    )}
                    keyExtractor={({id}) => id}
                    style={{position: 'relative', gap: 20}}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    }
                    indicatorStyle='white'
                    onScroll={({nativeEvent}) => {
                        if (total)
                            if (nativeEvent.contentOffset.y >= nativeEvent.contentSize.height - nativeEvent.layoutMeasurement.height && data.length > 0 && data.length < total)
                                handleLoadMore();
                    }}
                    scrollEventThrottle={16}
                    stickyHeaderHiddenOnScroll={true}
                    ListFooterComponent={(
                        <View>
                            {total ? (data.length >= total ? <Text style={{color: 'white', textAlign: 'center', paddingVertical: 20, letterSpacing: .5}}>No more results</Text> : !refreshing && !loading ? <ActivityIndicator color='white' size='small' style={{paddingVertical: 20}}/> : '') : (!refreshing && !loading ? <ActivityIndicator color='white' size='small' style={{paddingVertical: 20}}/> : '')}
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    );
}