import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Text,
  View
} from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import ExploreCard, { CardPlacementType } from '../../components/ExploreCard';
import DynamicHeader from '../../components/DynamicHeader';
import {useFocusEffect, useRouter} from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getLanguage} from "../../utils/Settings";

const headerHeight = 60;
const disabledIds = ['id', 'title', 'artisi_title', 'subject_titles', 'image_id'];

export default function ExploreTab() {
  const [page, setPage] = useState<number>(1);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingNextPage, setLoadingNextPage] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const router = useRouter();

  const loadData = async () => {
    const language = await getLanguage();
    try {
      const newData : {data: any[]} = await (await fetch('https://api.artic.edu/api/v1/artworks?' + new URLSearchParams({
        page: String(page),
        limit: '20',
        fields: 'id,title,artist_title,description,subject_titles,image_id'
      }))).json();

      const formattedNewData = (await Promise.all(newData.data.map(async (item) => {
        try {
          const {width, height} = await (await fetch(`https://www.artic.edu/iiif/2/${item.image_id}`)).json();

          const imageWidth = Dimensions.get('window').width - 20;
          const imageHeight = Math.floor(height / width * imageWidth);

          if (language == 'Polish') {
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
      setError(language === 'Polish' ? 'Nie można załadować galerii...' : 'Unable to load gallery photos...')
    }

    setLoading(false);
    setRefreshing(false);
    setLoadingNextPage(false);
  };

  useEffect(() => {
    getLanguage().then(lang => setLanguage(lang))
  }, []);

  useEffect(() => {
    if (loading || refreshing || loadingNextPage)
      loadData();
  }, [refreshing, loadingNextPage]);

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

  useFocusEffect(() => {
    AsyncStorage.getItem('reload-explore-card')
        .then((ids): (string | null)[] => JSON.parse(ids ?? '[]'))
        .then((ids) => {
            if (ids.includes(null)) {
              onRefresh();
              AsyncStorage.setItem('reload-explore-card', JSON.stringify(ids.filter(id => id != null)))
            }
        })
  })

  if (loading)
    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator color={colorScheme === 'dark' ? 'black' : 'white'} size='large'/>
        </View>
    );

  const scrollY = new Animated.Value(0);

  return (
    <SafeAreaView style={{position: 'relative'}}>
      <DynamicHeader scrollY={scrollY} headerHeight={headerHeight} style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10}}>
        <TouchableOpacity onPress={onRefresh}>
          <Text style={{fontSize: 20, fontWeight: '600', color: colorScheme === 'dark' ? 'white' : 'black'}}>{language === 'English' ? 'Explore' : language === 'Polish' ? 'Odkrywaj' : ''}</Text>
        </TouchableOpacity>
      </DynamicHeader>
        {error ? (
            <View style={{paddingTop: 50, flex: 1, alignItems: 'center'}}>
              <Text style={{fontSize: 20, color: 'white'}}>{error}</Text>
            </View>
        ) : (
            <FlatList
                removeClippedSubviews={true}
                contentContainerStyle={{gap: 20}}
                style={{height: '100%', top: -headerHeight, paddingTop: headerHeight, position: 'relative'}}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                  />
                }
                indicatorStyle={colorScheme == 'dark' ? 'white' : 'black'}
                onScroll={({nativeEvent}) => {
                  scrollY.setValue(Math.max(nativeEvent.contentOffset.y, 0));

                  if (nativeEvent.contentOffset.y >= nativeEvent.contentSize.height - nativeEvent.layoutMeasurement.height * 4 && data.length > 0)
                    handleLoadMore();
                }}
                scrollEventThrottle={16}
                stickyHeaderHiddenOnScroll={true}
                data={data}
                renderItem={({item, index}) => (
                    <ExploreCard placementType={CardPlacementType.Explore} item={item} key={index} handleCardPress={() => router.push(`/details/${item.id}?${new URLSearchParams({height: String(item.height), image: item.image})}`)}/>
                )}
                keyExtractor={({id, image_id}) => `explore-${image_id}-${id}`}
                ListFooterComponent={(
                    <View style={{paddingVertical: 30}}>
                      {!refreshing && !loading ? <ActivityIndicator color={colorScheme === 'dark' ? 'black' : 'white'} size='small'/> : ''}
                    </View>
                )}
            />
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
