import {
    ActivityIndicator,
    Animated,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
    useColorScheme,
    Text,
    View,
    NativeScrollEvent
} from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import DynamicHeader from '../../components/DynamicHeader';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FavouriteCard from '../../components/FavouriteCard';
import { getLanguage } from '../../utils/Settings';

const headerHeight = 60;
const itemsPerPage = 15;
const disabledIds = ['id', 'image_id', 'title'];

export default function FavouriteTab() {
    const scrollY = new Animated.Value(0);
    const {height} = Dimensions.get('window');
    const router = useRouter();
    const [page, setPage] = useState<number>(1);
    const [data, setData] = useState<any[]>([]);
    const colorScheme = useColorScheme();
    const [language, setLanguage] = useState<string | null>(null);
    const [dataStates, setDataStates] = useState<{
        error: string | null,
        loading: boolean,
        refreshing: boolean,
        loadingNextPage: boolean
    }>({
        error: null,
        loading: true,
        refreshing: false,
        loadingNextPage: false
    });

    const loadData = async (lang: string | null = null) => {
        lang = lang ?? language ?? 'English';

        try {
            const ids: string[] = JSON.parse(await AsyncStorage.getItem('favourited') ?? '[]').filter((_ : any, index: number) => {
                return index >= (page - 1) * itemsPerPage && index < page * itemsPerPage
            });

            if (data.length < (page - 1) * itemsPerPage) {
                setDataStates({
                    error: null,
                    loading: false,
                    refreshing: false,
                    loadingNextPage: false
                });
                return;
            }

            const newData: any[] = (await Promise.all(ids.map(async (id) => {
                const {data}: {data: {id: number, image_id: string, title: string, description: string}} = await (await fetch(`https://api.artic.edu/api/v1/artworks/${id}?field=id,image_id,title,description`)).json();

                if (lang == 'Polish') {
                    await Promise.all(Object.keys(data).map(async (key) => {
                        if (disabledIds.includes(key)) return;

                        const {status, message}: {status: string, message: string} = await (await fetch("https://script.google.com/macros/s/AKfycbxFO-bcrgAssi32N0EqtetVA-GnvWNk4ky6SO0pkpl_VF3osPr_8x54FqeDveQv3KrB/exec", {
                            method: "POST",
                            body: JSON.stringify({
                                source_lang: "auto",
                                target_lang: "pl",
                                // @ts-ignore
                                text: String(data[key] ?? '')
                            }),
                            headers: {"Content-Type": "application/json"}
                        })).json();

                        if (status == 'success')
                            // @ts-ignore
                            data[key] = message;
                    }))
                }

                return data;
            }))).filter(item => item != null);

            setData(prev => prev.concat(newData));
            setDataStates({
                error: null,
                loading: false,
                refreshing: false,
                loadingNextPage: false
            })
        } catch (err) {
            setDataStates({
                error: 'Unable to load gallery photos...',
                loading: false,
                refreshing: false,
                loadingNextPage: false
            })
        }
    };

    useEffect(() => {
        if (!language) {
            getLanguage().then(lang => {
                if (dataStates.loading || dataStates.refreshing || dataStates.loadingNextPage)
                    loadData(lang);
                setLanguage(lang);
            });
            return;
        }

        if (dataStates.loading || dataStates.refreshing || dataStates.loadingNextPage)
            loadData();
    }, [dataStates.refreshing, dataStates.loadingNextPage]);

    const onRefresh = useCallback(() => {
        setPage(1);
        setData([]);
        setDataStates(prev => {
            prev.refreshing = true;
            prev.loadingNextPage = false;

            return prev;
        });
    }, []);

    useFocusEffect(() => {
        AsyncStorage.getItem('reload-favourite-card')
            .then((ids: string | null): (string | null)[] => JSON.parse(ids ?? '[]'))
            .then((ids) => {
                if (ids.includes(null)) {
                    AsyncStorage.setItem('reload-favourite-card', JSON.stringify(ids.filter(id => id != null)));
                    setPage(1);
                    setData([]);
                    loadData();
                } else if (ids.length > 0) {
                    AsyncStorage.setItem('reload-favourite-card', '[]');
                    if (!dataStates.loading && !dataStates.refreshing && !dataStates.loadingNextPage) {
                        setPage(1);
                        setData([]);
                        loadData();
                    }
                }
            })
    })

    const handleLoadMore = () => {
        if (dataStates.loadingNextPage) return;
        if (page * itemsPerPage > data.length) return;

        setPage(prevPage => prevPage + 1);
        setDataStates(prev => {
            prev.loadingNextPage = true;

            return prev;
        })
    };

    const removeFavourite = useCallback(async (id: string) => {
        const ids: string[] = JSON.parse(await AsyncStorage.getItem('favourited') ?? '[]').filter((savedId: string) => savedId != id);
        await AsyncStorage.setItem('favourited', JSON.stringify(ids));
        const reloadExploreCardIds: string[] = JSON.parse(await AsyncStorage.getItem('reload-explore-card') ?? '[]');
        await AsyncStorage.setItem('reload-explore-card', JSON.stringify(reloadExploreCardIds.concat([id])));
        setData(prev => prev.filter(item => item.id != id));
    }, []);

    const handleScroll = ({nativeEvent}: {nativeEvent: NativeScrollEvent}) => {
        scrollY.setValue(Math.max(nativeEvent.contentOffset.y, 0));

        if (nativeEvent.contentOffset.y >= nativeEvent.contentSize.height - nativeEvent.layoutMeasurement.height * 2 && data.length > 0)
            handleLoadMore();
    }

    if (dataStates.loading)
        return (
            <View style={styles.loadingWrapper}>
                <Stack.Screen options={{headerStyle: {backgroundColor: colorScheme == 'dark' ? 'black' : 'white'}}}/>
                <ActivityIndicator color='white' size='large'/>
            </View>
        );

    return (
        <SafeAreaView style={styles.container}>
            <DynamicHeader scrollY={scrollY} headerHeight={headerHeight} style={styles.dynamicHeader}>
                <TouchableOpacity onPress={onRefresh}>
                    <Text style={{...styles.dynamicHeaderText, color: colorScheme === 'dark' ? 'white' : 'black'}}>{language === 'Polish' ? 'Ulubione' : 'Favourite'}</Text>
                </TouchableOpacity>
            </DynamicHeader>
            {dataStates.refreshing ? (
                <View style={{...styles.refreshWrapper, height: height - 175}}>
                    <ActivityIndicator color={colorScheme === 'dark' ? 'white' : 'black'} size='large'/>
                </View>
            ) : dataStates.error ? (
                <View style={styles.errorWrapper}>
                    <Text style={{...styles.errorText, color: colorScheme === 'dark' ? 'white' : 'black'}}>{dataStates.error}</Text>
                </View>
            ) : (
                data.length <= 0 ? (
                    <View style={{height: height - 185, ...styles.noFavouritesContainer}}>
                        <View style={styles.noFavouritesWrapper}>
                            <Text style={{color: colorScheme === 'dark' ? 'white' : 'black'}}>No favourites</Text>
                            <TouchableOpacity onPress={onRefresh}>
                                <Text style={{
                                    ...styles.noFavouritesRefreshBtnText,
                                    color: colorScheme === 'dark' ? 'white' : 'black'
                                }}>
                                    Reload?
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <FlatList
                        contentContainerStyle={{gap: 20}}
                        style={{height: height - 120, ...styles.flatList}}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={dataStates.refreshing}
                                onRefresh={onRefresh}
                            />
                        }
                        indicatorStyle={colorScheme == 'dark' ? 'white' : 'black'}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        stickyHeaderHiddenOnScroll={true}
                        data={data}
                        renderItem={({item, index}) => (
                            <FavouriteCard
                                language={language ?? 'English'}
                                item={item}
                                removeFavourite={() => removeFavourite(String(item.id))}
                                handlePress={() => router.push(`/details/${item.id}`)}
                            />
                        )}
                        keyExtractor={({id}) => id}
                        ListFooterComponent={(
                            <View style={styles.indicatorWrapper}>
                                {!dataStates.refreshing && !dataStates.loading ? null : <ActivityIndicator color={colorScheme === 'dark' ? 'white' : 'black'} size='small'/>}
                            </View>
                        )}
                    />
                )
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative'
    },
    loadingWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    dynamicHeader: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10
    },
    dynamicHeaderText: {
        fontSize: 20,
        fontWeight: '600'
    },
    refreshWrapper: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    errorWrapper: {
        paddingTop: 50,
        flex: 1,
        alignItems: 'center'
    },
    errorText: {
        fontSize: 20
    },
    noFavouritesContainer: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    noFavouritesWrapper: {
        flexDirection: 'row',
        gap: 4
    },
    noFavouritesRefreshBtnText: {
        textDecorationLine: 'underline'
    },
    flatList: {
        top: -headerHeight,
        paddingTop: headerHeight,
        position: 'relative',
        paddingHorizontal: 10
    },
    indicatorWrapper: {
        paddingVertical: 30
    }
});
