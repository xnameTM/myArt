import {
  ActivityIndicator,
  Animated as Anim,
  Dimensions,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Text,
  FlatList,
  useColorScheme
} from 'react-native';
import DynamicHeader from '../../components/DynamicHeader';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import {Stack, useRouter} from 'expo-router';
import { SearchFilter } from '../../components/SearchFilter';
import {getLanguage} from "../../utils/Settings";

const headerHeight: number = 50;

const filters = [
  {'en': 'Default', 'pl': 'Domyślne', 'icon': 'star-outline', 'key': 'default'},
  {'en': 'Title', 'pl': 'Tytuł', 'icon': 'text-outline', 'key': 'title'},
  {'en': 'Artist', 'pl': 'Artysta', 'icon': 'people-outline', 'key': 'artist_title'},
  {'en': 'Place', 'pl': 'Miejsce', 'icon': 'map-outline', 'key': 'place_of_origin'},
  {'en': 'Date', 'pl': 'Data', 'icon': 'calendar-outline', 'key': 'date_display'},
  {'en': 'Style', 'pl': 'Styl', 'icon': 'brush-outline', 'key': 'style_title'},
  {'en': 'Classification', 'pl': 'Klasyfikacja', 'icon': 'layers-outline', 'key': 'classification_title'},
  {'en': 'Medium', 'pl': 'Medium', 'icon': 'image-outline', 'key': 'medium_display'},
  {'en': 'Department', 'pl': 'Dział', 'icon': 'file-tray-full-outline', 'key': 'department_title'},
];

export default function SearchTab() {
  const router = useRouter();
  const scrollY = new Anim.Value(0);
  const textInputRef = useRef<TextInput>(null);
  const {width, height} = Dimensions.get('window');
  const searchBarFocus = useSharedValue<number>(0);
  const [page, setPage] = useState<number>(1);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingNextPage, setLoadingNextPage] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('default');
  const [isFilterVisible, setFilterVisible] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const colorScheme = useColorScheme();
  const [language, setLanguage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const newData : {data: {id: number, image_id: string}[]} = await (await fetch('https://api.artic.edu/api/v1/artworks?' + new URLSearchParams({
        page: String(page),
        limit: '24',
        field: 'id,image_id'
      }))).json();

      setData(data.concat(newData.data.map((item) => ({image: `https://www.artic.edu/iiif/2/${item.image_id}/full/843,/0/default.jpg`, ...item}))));
      setError(null);
    } catch {
      setError('Unable to load gallery photos...')
    }

    setRefreshing(false);
    setLoadingNextPage(false);
    setLoading(false);
  };

  useEffect(() => {
    if (!language) {
      getLanguage().then(lang => {
        setLanguage(lang);
        if (loading || refreshing || loadingNextPage)
          loadData();
      });
      return;
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

  const animatedTextInput = useAnimatedStyle(() => ({
    width: width - 10 - headerHeight - 40 * searchBarFocus.value,
  }))

  const animatedCancelButton = useAnimatedStyle(() => ({
    right: -70 + 80 * searchBarFocus.value,
    opacity: searchBarFocus.value
  }))

  const animatedFilterButton = useAnimatedStyle(() => ({
    opacity: 1 - searchBarFocus.value
  }))

  const submitEditing = () => {
    // @ts-ignore
    router.push(`/search-artworks?${new URLSearchParams({filter, text: searchText})}`)
  }

  if (loading)
    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator color='white' size='large'/>
        </View>
    );

  return (
      <SafeAreaView style={{position: 'relative'}}>
        <DynamicHeader scrollY={scrollY} headerHeight={headerHeight} style={{backgroundColor: 'black', position: 'relative', paddingHorizontal: 10}}>
          <Animated.View style={[{paddingVertical: 5, position: 'absolute', top: 0, left: 10, height: headerHeight}, animatedTextInput]}>
            <TextInput
                ref={textInputRef}
                keyboardType='web-search'
                enablesReturnKeyAutomatically={true}
                placeholder={language == 'Polish' ? 'Wyszukaj' : 'Search'}
                inputMode='search'
                placeholderTextColor='#888'
                selectionColor='#888'
                style={{
                  backgroundColor: colorScheme === 'dark' ? '#252525' : '#ccc',
                  height: '100%',
                  flex: 1,
                  paddingHorizontal: 14,
                  borderRadius: 10,
                  fontSize: 18,
                  color: colorScheme === 'dark' ? '#fff': '#000',
                  width: '100%'
                }}
                value={searchText}
                onChangeText={(text) => setSearchText(text)}
                onFocus={() => {
                  scrollY.setValue(0);
                  searchBarFocus.value = withTiming(1, {
                    duration: 400,
                    easing: Easing.bezier(0.31, -0.02, 0, 1.03)
                  });
                  setFilterVisible(false);
                }}
                onEndEditing={() => {
                  searchBarFocus.value = withTiming(0, {
                    duration: 400,
                    easing: Easing.bezier(0.31, -0.02, 0, 1.03)
                  })
                }}
                onSubmitEditing={() => submitEditing()}
            />
          </Animated.View>

          <Animated.View style={[{position: 'absolute', top: 0, zIndex: 1, backgroundColor: colorScheme === 'dark' ? 'black' : 'white'}, animatedCancelButton]}>
            <TouchableOpacity onPress={() => {
              if (textInputRef.current)
                textInputRef.current.blur();
            }} style={{height: headerHeight, flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8}}>
              <Text style={{color: colorScheme === 'dark' ? 'white' : 'black', fontSize: 18}}>{language == 'Polish' ? 'Anuluj' : 'Cancel'}</Text>
            </TouchableOpacity>
          </Animated.View>
          <Animated.View style={[{position: 'absolute', top: 5, right: 10, width: headerHeight - 20, height: headerHeight - 10}, animatedFilterButton]}>
            <TouchableOpacity onPress={() => {
              setFilterVisible(value => !value);
              scrollY.setValue(0)
            }} style={{width: '100%', height: '100%', flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 2}}>
              <Ionicons name='ellipsis-horizontal' size={26} color={colorScheme === 'dark' ? 'white' : 'black'}/>
            </TouchableOpacity>
            <SearchFilter filters={filters} currentFilter={filter} setCurrentFilter={setFilter} isVisible={isFilterVisible} setVisible={setFilterVisible}/>
          </Animated.View>
        </DynamicHeader>
        {error ? (
            <View style={{height: height - 175, justifyContent: 'center', gap: 5}}>
              <Text style={{fontSize: 20, color: colorScheme === 'dark' ? '#fff' : '#000', textAlign: 'center'}}>{error}</Text>
              <TouchableOpacity onPress={onRefresh}>
                <Text style={{fontSize: 20, fontWeight: '500', color: colorScheme === 'dark' ? '#fff' : '#000', textAlign: 'center'}}>Reload?</Text>
              </TouchableOpacity>
            </View>
        ) : (
            <FlatList
                removeClippedSubviews={true}
                keyboardDismissMode='on-drag'
                contentContainerStyle={{gap: 3}}
                columnWrapperStyle={{gap: 3}}
                data={data}
                numColumns={3}
                renderItem={({item}) => (
                    <TouchableOpacity key={item.id} onPress={() => router.push(`/details/${item.id}`)}>
                      <Image source={{uri: item.image}} style={{width: (width - 6) / 3, height: (width - 6) / 3}}/>
                    </TouchableOpacity>
                )}
                keyExtractor={({id}) => id}
                style={{height: height - 115, top: -headerHeight, paddingTop: headerHeight, position: 'relative'}}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                  />
                }
                scrollEnabled={!isFilterVisible}
                indicatorStyle={colorScheme == 'dark' ? 'white' : 'black'}
                onScroll={({nativeEvent}) => {
                  if (!isFilterVisible)
                    scrollY.setValue(Math.max(nativeEvent.contentOffset.y, 0));

                  if (nativeEvent.contentOffset.y >= nativeEvent.contentSize.height - nativeEvent.layoutMeasurement.height && data.length > 0)
                    handleLoadMore();
                }}
                scrollEventThrottle={16}
                stickyHeaderHiddenOnScroll={true}
                ListFooterComponent={(
                    <View>
                      {!refreshing && !loading ? <ActivityIndicator color='white' size='small' style={{paddingVertical: 20}}/> : ''}
                    </View>
                )}
            />
        )}
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
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
