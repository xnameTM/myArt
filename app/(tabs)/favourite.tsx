import {
    ActivityIndicator, Animated, FlatList, Image,
    RefreshControl,
    SafeAreaView, ScrollView,
    StyleSheet, TouchableOpacity
} from 'react-native';
import { Text, View } from '../../components/templates/Themed';
import {useCallback, useEffect, useRef, useState} from 'react';
import { Dimensions } from 'react-native';
import ExploreCard from "../../components/ExploreCard";
import DynamicHeader from "../../components/DynamicHeader";
import {useFocusEffect, useRouter} from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {NativeSyntheticEvent} from "react-native/Libraries/Types/CoreEventTypes";
import {NativeScrollEvent} from "react-native/Libraries/Components/ScrollView/ScrollView";

const headerHeight = 60;
const itemsPerPage = 20;
const snapOffsets = [0, 100, 200];

export default function AllTab() {
    const {width, height} = Dimensions.get('window');
    const scrollY = new Animated.Value(0);
    const [page, setPage] = useState<number>(1);
    const [data, setData] = useState<any[]>([]);
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
    const router = useRouter();

    const loadData = async () => {
        try {
            const ids: string[] = JSON.parse(await AsyncStorage.getItem('favourited') ?? '[]')

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
                const {data}: {data: any[]} = await (await fetch(`https://api.artic.edu/api/v1/artworks/${id}`)).json();

                return data;
            }))).filter(item => item != null);

            console.log(ids, data, newData, dataStates)

            setDataStates({
                error: null,
                loading: false,
                refreshing: false,
                loadingNextPage: false
            })
            setData(data.concat(newData));
        } catch (err) {
            console.log(err)

            setDataStates({
                error: 'Unable to load gallery photos...',
                loading: false,
                refreshing: false,
                loadingNextPage: false
            })
        }
    };

    const scrollViewRef = useRef<ScrollView>(null);

    const onScroll = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            const { contentOffset } = event.nativeEvent;

            // Określ aktualny snapOffset na podstawie położenia contentOffset
            const currentSnapOffset = snapOffsets.reduce(
                (closest, offset) =>
                    Math.abs(offset - contentOffset.y) < Math.abs(closest - contentOffset.y)
                        ? offset
                        : closest,
                snapOffsets[0]
            );

            // Ustawia nowy contentOffset na aktualny snapOffset
            scrollViewRef.current?.scrollTo({ x: 0, y: currentSnapOffset, animated: true });
        },
        [scrollViewRef]
    );

    useEffect(() => {
        if (dataStates.loading || dataStates.refreshing || dataStates.loadingNextPage)
            loadData();
    }, [dataStates]);

    const onRefresh = useCallback(() => {
        setPage(1);
        setData([]);
        setDataStates(prev => {
            prev.refreshing = true;

            return prev;
        });
    }, []);

    const handleLoadMore = () => {
        if (dataStates.loadingNextPage) return;

        setPage(prevPage => prevPage + 1);
        setDataStates(prev => {
            prev.loadingNextPage = true;

            return prev;
        })
    };

    if (dataStates.loading)
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <ActivityIndicator color='white' size='large'/>
            </View>
        );

    return (
        <SafeAreaView style={{position: 'relative'}}>
            <DynamicHeader scrollY={scrollY} headerHeight={headerHeight} style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10}}>
                <TouchableOpacity onPress={() => {setDataStates({error: null, loading: true, loadingNextPage: false, refreshing: false})}}>
                    <Text style={{fontSize: 20, fontWeight: '600'}}>Explore</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                    <Image source={{uri: 'https://paczaizm.pl/content/wp-content/uploads/andrzej-duda-gruby-grubas-przerobka-faceapp-twarz.jpg'}} style={{width: 44, height: 44, borderRadius: 10}}/>
                </TouchableOpacity>
            </DynamicHeader>
            {dataStates.error ? (
                <View style={{paddingTop: 50, flex: 1, alignItems: 'center'}}>
                    <Text style={{fontSize: 20, color: 'white'}}>{dataStates.error}</Text>
                </View>
            ) : (
                data.length <= 0 ? (
                    <Text style={{color: 'white'}}>No favourites</Text>
                ) : (
                    <FlatList
                        contentContainerStyle={{gap: 20}}
                        style={{height: '100%', top: -headerHeight, paddingTop: headerHeight, position: 'relative', paddingHorizontal: 10}}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={dataStates.refreshing}
                                onRefresh={onRefresh}
                            />
                        }
                        indicatorStyle='white'
                        onScroll={({nativeEvent}) => {
                            scrollY.setValue(Math.max(nativeEvent.contentOffset.y, 0));

                            if (nativeEvent.contentOffset.y >= nativeEvent.contentSize.height - nativeEvent.layoutMeasurement.height * 4 && data.length > 0)
                                handleLoadMore();
                        }}
                        scrollEventThrottle={16}
                        stickyHeaderHiddenOnScroll={true}
                        data={data}
                        renderItem={({item, index}) => (
                            // <ExploreCard item={item} key={index} handleCardPress={() => router.push(`/details/${item.id}?${new URLSearchParams({height: String(item.height), image: item.image})}`)}/>
                            <ScrollView
                                snapToOffsets={snapOffsets}
                                snapToInterval={snapOffsets[1]}
                                snapToAlignment={'start'}
                                contentOffset={{x: 100, y: 0}}
                                disableScrollViewPanResponder={true}
                                disableIntervalMomentum={true}
                                decelerationRate={0.001}
                                bounces={false}
                                style={{width: '100%', backgroundColor: '#a00', position: 'relative'}}
                                showsHorizontalScrollIndicator={false}
                                horizontal={true}
                                onScroll={onScroll}
                                scrollEventThrottle={16}
                            >
                                <View style={{width: width - 20 + 200, backgroundColor: 'yellow', flex: 1, flexDirection: 'row'}}>
                                    <View style={{height: '100%', width: 100, backgroundColor: 'green'}}></View>
                                    <View style={{backgroundColor: '#111', padding: 10, borderRadius: 16, width: width - 20}}>
                                        <Image source={{uri: `https://www.artic.edu/iiif/2/${item.image_id}/full/843,/0/default.jpg`}} style={{width: 80, height: 80, backgroundColor: 'red', borderRadius: 6}}/>
                                    </View>
                                    <View style={{height: '100%', width: 100, backgroundColor: 'red'}}></View>
                                </View>
                            </ScrollView>
                        )}
                        keyExtractor={({id}) => id}
                        ListFooterComponent={(
                            <View>
                                {!dataStates.refreshing && !dataStates.loading ? <ActivityIndicator color='white' size='small' style={{paddingVertical: 20}}/> : ''}
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
        // flex: 1,
        // alignItems: 'center',
        // justifyContent: 'center'
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold'
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: '80%'
    }
});
