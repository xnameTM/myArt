import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    RefreshControl,
    SafeAreaView, ScrollView,
    Text,
    TouchableOpacity, useColorScheme,
    View
} from 'react-native';
import {Stack, useLocalSearchParams, useRouter} from "expo-router";
import React, {useCallback, useEffect, useState} from "react";
import ExploreCard, {CardPlacementType} from "../../components/ExploreCard";
import {Ionicons} from "@expo/vector-icons";
import {shortenText} from "../../utils/Utils";
import {getLanguage} from "../../utils/Settings";

const disabledIds = ['id', 'title', 'artisi_title', 'subject_titles', 'image_id'];

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
    const [language, setLanguage] = useState<string | null>(null);
    const {height} = Dimensions.get('window');
    const colorScheme = useColorScheme();

    const loadData = async (lang: string | null = null) => {
        lang = lang ?? language ?? 'English';

        try {
            const obj = {};
            // @ts-ignore
            obj[`query[bool][must][match][${filter}]`] = String(text);

            const newData : {data: any[], pagination: {total: number}} = await (await fetch(`https://api.artic.edu/api/v1/artworks/search?${new URLSearchParams({
                fields: 'id,title,artist_title,description,subject_titles,image_id',
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

                    if (lang == 'Polish') {
                        await Promise.all(Object.keys(item).map(async (key) => {
                            if (disabledIds.includes(key)) return;

                            const {status, message}: {status: string, message: string} = await (await fetch("https://script.google.com/macros/s/AKfycbxFO-bcrgAssi32N0EqtetVA-GnvWNk4ky6SO0pkpl_VF3osPr_8x54FqeDveQv3KrB/exec", {
                                method: "POST",
                                body: JSON.stringify({
                                    source_lang: "auto",
                                    target_lang: "pl",
                                    text: String(item[key] ?? '')
                                }),
                                headers: {"Content-Type": "application/json"}
                            })).json();

                            if (status == 'success')
                                item[key] = message;
                        }));
                    }

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

        if (!language) {
            getLanguage().then(lang => {
                if (loading || refreshing || loadingNextPage)
                    loadData(lang);
                setLanguage(lang);
            })
            return;
        }

        if (loading || refreshing || loadingNextPage)
            loadData();
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
                    headerStyle: {backgroundColor: colorScheme === 'dark' ? 'black' : 'white'},
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name='chevron-back' size={26} color={colorScheme === 'dark' ? 'white' : 'black'}/>
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
                headerStyle: {backgroundColor: colorScheme === 'dark' ? 'black' : 'white'},
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name='chevron-back' size={26} color={colorScheme === 'dark' ? 'white' : 'black'}/>
                    </TouchableOpacity>
                )
            }}/>
            {refreshing ? (
                <View style={{height: height - 90, justifyContent: 'center'}}>
                    <ActivityIndicator color={colorScheme === 'dark' ? 'white' : 'black'} size='large'/>
                </View>
            ) : error ? (
                <ScrollView
                    style={{height: height - 90}}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    }
                    indicatorStyle={colorScheme == 'dark' ? 'white' : 'black'}
                >
                    <View style={{height: height - 90, justifyContent: 'center'}}>
                        <Text style={{fontSize: 20, color: colorScheme === 'dark' ? 'white' : 'black', textAlign: 'center'}}>{error}</Text>
                    </View>
                </ScrollView>
            ) : data.length <= 0 ? (
                <View style={{minHeight: Dimensions.get('window').height - 150, flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{color: 'white', textAlign: 'center', paddingVertical: 20, fontSize: 15}}>No results for: {text}</Text>
                </View>
            ) : (
                <FlatList
                    data={data}
                    contentContainerStyle={{gap: 20}}
                    renderItem={({item, index}) => (
                        <ExploreCard placementType={CardPlacementType.Search} item={item} key={index} handleCardPress={() => router.push(`/details/${item.id}?${new URLSearchParams({height: String(item.height), image: item.image})}`)}/>
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
                        <View style={{paddingVertical: 30}}>
                            {total ? (data.length >= total ? <Text style={{color: 'white', textAlign: 'center', letterSpacing: .5}}>No more results</Text> : !refreshing && !loading ? <ActivityIndicator color='white' size='small' style={{paddingVertical: 20}}/> : '') : (!refreshing && !loading ? <ActivityIndicator color='white' size='small'/> : null)}
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    );
}