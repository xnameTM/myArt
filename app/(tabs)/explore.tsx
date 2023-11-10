import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Image,
  Pressable, TouchableOpacity
} from 'react-native';
import { Text, View } from '../../components/Themed';
import { useCallback, useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {Ionicons} from "@expo/vector-icons";
import ExploreCard from "../../components/ExploreCard";

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    .replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}

export default function AllTab() {
  const [page, setPage] = useState<number>(1);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingNextPage, setLoadingNextPage] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const newData : {data: any[]} = await (await fetch('https://api.artic.edu/api/v1/artworks?' + new URLSearchParams({
        page: String(page),
        limit: '20'
      }))).json();

      const formattedNewData = (await Promise.all(newData.data.map(async (item) => {
        try {
          const {width, height} = await (await fetch(`https://www.artic.edu/iiif/2/${item.image_id}`)).json();

          const imageWidth = Dimensions.get('window').width
          const imageHeight = Math.floor(height / width * imageWidth);

          return {image: `https://www.artic.edu/iiif/2/${item.image_id}/full/${imageWidth},${imageHeight}/0/default.jpg`, height: imageHeight, id: uuidv4(), ...item};
        } catch {
          return null;
        }
      }))).filter((el) => el != null);

      setData(data.concat(formattedNewData));
      setError(null);
    } catch {
      setError('Unable to load gallery photos...')
    }

    setLoading(false);
    setRefreshing(false);
    setLoadingNextPage(false);
  };

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

  if (loading)
    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator color='white' size='large'/>
        </View>
    );

  return (
    <SafeAreaView>
      <ScrollView
          style={{height: '100%'}}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.container}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          indicatorStyle='white'
          onScroll={({nativeEvent}) => {
            if (nativeEvent.contentOffset.y >= nativeEvent.contentSize.height - nativeEvent.layoutMeasurement.height * 4) {
              handleLoadMore();
            }
          }}
          scrollEventThrottle={100}
      >

        {error ? (
            <View style={{paddingTop: 50, flex: 1, alignItems: 'center'}}>
              <Text style={{fontSize: 20, color: 'white'}}>{error}</Text>
            </View>
        ) : (
            <>
              <View>
                {data.map((item, index) => (
                    <ExploreCard item={item} index={index}/>
                ))}
              </View>
              {!refreshing ? <ActivityIndicator color='white' size='small' style={{paddingVertical: 20}}/> : ''}
            </>
        )}
      </ScrollView>
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
