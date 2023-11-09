import { ActivityIndicator, FlatList, RefreshControl, SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { Text, View } from '../../components/Themed';
import { useCallback, useEffect, useState } from "react";

export default function AllTab() {
  const [page, setPage] = useState<number>(1);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);


  useEffect(() => {
    fetch('https://api.artic.edu/api/v1/artworks?' + new URLSearchParams({
      page: String(page),
      limit: '10'
    }))
        .then(response => response.json())
        .then(({data}) => setData(data))
        .catch(error => console.error(error))
        .finally(() => {
          setLoading(false);
          setRefreshing(false);
        });
  }, [refreshing]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
  }, []);

  if (loading)
    return null;

  return (
    <SafeAreaView>
      <ScrollView style={{height: '100%'}} contentContainerStyle={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>} indicatorStyle='white'>
        <Text>WTF</Text>
          {data.map((item) => <Text style={{color: 'white'}} key={item.image_id}>{item.artist_display}</Text>)}
        <Text>WTF</Text>
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
