import {
  ActivityIndicator,
  Animated as Anim, Dimensions, Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Text
} from 'react-native';

import DynamicHeader from "../../components/DynamicHeader";
import {useCallback, useEffect, useRef, useState} from "react";
import {Ionicons} from "@expo/vector-icons";
import Animated, {Easing, useAnimatedStyle, useSharedValue, withTiming} from "react-native-reanimated";
import {useRouter} from "expo-router";
import {SearchFilter} from "../../components/SearchFilter";

const headerHeight: number = 50;
const filters = [
  {'name': 'Title', 'icon': 'map-outline'},
  {'name': 'Artists', 'icon': 'people-outline'},
  {'name': 'Places', 'icon': 'map-outline'},
  {'name': 'Artwork Type', 'icon': 'reader-outline'},
  {'name': 'Date', 'icon': 'calendar-outline'},
  {'name': 'Color', 'icon': 'color-filter-outline'},
  {'name': 'Styles', 'icon': 'brush-outline'},
  {'name': 'Subjects', 'icon': 'easel-outline'},
  {'name': 'Classifications', 'icon': 'layers-outline'},
  {'name': 'Medium', 'icon': 'image-outline'},
  {'name': 'Departments', 'icon': 'file-tray-full-outline'}
];

export default function SearchTab() {
  const router = useRouter();
  const scrollY = new Anim.Value(0);
  const textInputRef = useRef<TextInput>(null);
  const width = Dimensions.get('window').width;
  const searchBarFocus = useSharedValue<number>(0);
  const [page, setPage] = useState<number>(1);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingNextPage, setLoadingNextPage] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('Title');
  const [isFilterVisible, setFilterVisible] = useState<boolean>(false);

  const loadData = async () => {
    try {
      const newData : {data: any[]} = await (await fetch('https://api.artic.edu/api/v1/artworks?' + new URLSearchParams({
        page: String(page),
        limit: '24'
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
                placeholder='Search'
                inputMode='search'
                placeholderTextColor='#888'
                selectionColor='#888'
                style={{
                  backgroundColor: '#252525',
                  height: '100%',
                  flex: 1,
                  paddingHorizontal: 14,
                  borderRadius: 10,
                  fontSize: 18,
                  color: 'white',
                  width: '100%'
                }}
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
            />
          </Animated.View>

          <Animated.View style={[{position: 'absolute', top: 0, zIndex: 1, backgroundColor: 'black'}, animatedCancelButton]}>
            <TouchableOpacity onPress={() => {
              if (textInputRef.current)
                textInputRef.current.blur();
            }} style={{height: headerHeight, flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8}}>
              <Text style={{color: 'white', fontSize: 18}}>Cancel</Text>
            </TouchableOpacity>
          </Animated.View>
          <Animated.View style={[{position: 'absolute', top: 5, right: 10, width: headerHeight - 20, height: headerHeight - 10}, animatedFilterButton]}>
            <TouchableOpacity onPress={() => setFilterVisible(value => !value)} style={{width: '100%', height: '100%', flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 2}}>
              <Ionicons name='ellipsis-horizontal' size={26} color='white'/>
            </TouchableOpacity>
            <SearchFilter filters={filters} currentFilter={filter} setCurrentFilter={setFilter} isVisible={isFilterVisible} setVisible={setFilterVisible}/>
          </Animated.View>
        </DynamicHeader>
        <ScrollView
            style={{height: '100%', top: -headerHeight, paddingTop: headerHeight, position: 'relative'}}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
              />
            }
            scrollEnabled={!isFilterVisible}
            indicatorStyle='white'
            onScroll={({nativeEvent}) => {
              scrollY.setValue(Math.max(nativeEvent.contentOffset.y, 0));

              if (nativeEvent.contentOffset.y >= nativeEvent.contentSize.height - nativeEvent.layoutMeasurement.height && data.length > 0)
                handleLoadMore();
            }}
            scrollEventThrottle={16}
            stickyHeaderHiddenOnScroll={true}
        >
          <View style={{flex: 4, marginVertical: 10, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 3}}>
            {data.map(({image, id}, index) => (
                <TouchableOpacity key={index} onPress={() => router.push(`/details/${id}`)}>
                  <Image source={{uri: image}} style={{width: (width - 6) / 3, height: (width - 6) / 3}}/>
                </TouchableOpacity>
            ))}
          </View>
          {!refreshing && !loading ? <ActivityIndicator color='white' size='small' style={{paddingVertical: 20}}/> : ''}
        </ScrollView>
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
