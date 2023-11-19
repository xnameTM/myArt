import {
    Alert,
    Dimensions,
    Image,
    NativeScrollEvent,
    Pressable,
    ScrollView,
    Text,
    useColorScheme,
    View,
    StyleSheet
} from 'react-native';
import { useCallback, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { formatDesciption, shortenText } from '../utils/Utils';

const snapOffsets = [0, 100, 200];
export default function FavouriteCard({item, removeFavourite, handlePress, language}: {item: any, removeFavourite: () => void, handlePress: () => void, language: string}) {
    const {width} = Dimensions.get('window');
    const scrollViewRef = useRef<ScrollView>(null);
    const [outOfPage, setOutOfPage] = useState<boolean>(false);
    const colorScheme = useColorScheme();

    const recenter = useCallback((animated: boolean = false) => {
        scrollViewRef.current?.scrollTo({x: snapOffsets[1], y: 0, animated: animated});
    }, []);

    const handleScroll = ({nativeEvent}: {nativeEvent: NativeScrollEvent}) => {
        if (nativeEvent.contentOffset.x > snapOffsets[0] && nativeEvent.contentOffset.x < snapOffsets[2])
            setOutOfPage(false);

        if (outOfPage) return;

        if (nativeEvent.contentOffset.x < snapOffsets[0] - 90) {
            setOutOfPage(true);
            recenter();
            handlePress();
        } else if (nativeEvent.contentOffset.x > snapOffsets[2] + 90) {
            setOutOfPage(true);
            Alert.alert(language === 'Polish' ? 'Jesteś pewien?' : 'Are you sure?', undefined, [
                {
                    text: language === 'Polish' ? 'Tak' : 'Yes',
                    onPress: () => {
                        removeFavourite();
                        setOutOfPage(false);
                    },
                    style: 'default'
                },
                {
                    text: language === 'Polish' ? 'Nie' : 'No',
                    onPress: () => {
                        recenter(true);
                        setOutOfPage(false);
                    },
                    style: 'cancel'
                }
            ]);
        }
    };

    const open = () => {
        recenter()
        handlePress()
    };

    const remove = () => {
        Alert.alert(language === 'Polish' ? 'Jesteś pewien?' : 'Are you sure?', '', [
            {
                text: language === 'Polish' ? 'Tak' : 'Yes',
                onPress: () => {
                    removeFavourite();
                    setOutOfPage(false);
                },
                style: 'default'
            },
            {
                text: language === 'Polish' ? 'Nie' : 'No',
                onPress: () => {
                    recenter(true);
                    setOutOfPage(false);
                },
                style: 'cancel'
            }
        ])
    };

    return (
        <ScrollView
            ref={scrollViewRef}
            snapToOffsets={snapOffsets}
            snapToInterval={snapOffsets[1]}
            snapToAlignment={'start'}
            contentOffset={{x: 100, y: 0}}
            disableScrollViewPanResponder={true}
            disableIntervalMomentum={true}
            decelerationRate={0.001}
            style={styles.container}
            showsHorizontalScrollIndicator={false}
            horizontal={true}
            scrollEventThrottle={50}
            onScroll={handleScroll}
        >
            <View style={{...styles.wrapper, width: width - 20 + 200}}>
                <Pressable onPress={open} style={styles.openBtn}>
                    <Text style={styles.openBtnText}>{language === 'Polish' ? 'Zobacz' : 'See'}</Text>
                </Pressable>
                <Pressable
                    onPress={handlePress}
                    style={{
                        backgroundColor: colorScheme === 'dark' ? '#111' : '#eee',
                        width: width - 20,
                        ...styles.mainView
                    }}
                >
                    <Image
                        source={{uri: `https://www.artic.edu/iiif/2/${item.image_id}/full/843,/0/default.jpg`}}
                        style={styles.image}
                    />
                    <View style={styles.texts}>
                        <Text
                            style={{...styles.title, color: colorScheme === 'dark' ? '#eee' : '#111'}}
                        >
                            {shortenText(item.title ?? 'Unknown', 20)}
                        </Text>
                        <Text style={{color: colorScheme === 'dark' ? '#aaa' : '#555'}}>
                            {formatDesciption(item.description ?? '', 25)}
                        </Text>
                    </View>
                </Pressable>
                <Pressable onPress={remove} style={styles.removeBtn}>
                    <Ionicons name="trash-outline" size={32} color='white'></Ionicons>
                </Pressable>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden'
    },
    wrapper: {
        flex: 1,
        flexDirection: 'row',
        position: 'relative'
    },
    openBtn: {
        height: 100,
        width: 500,
        backgroundColor: '#1ed760',
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 400,
        left: -400,
        position: 'absolute'
    },
    openBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500'
    },
    mainView: {
        padding: 10,
        marginLeft: 100,
        flexDirection: 'row',
        gap: 10
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 6
    },
    texts: {
        backgroundColor: 'transparent'
    },
    title: {
        fontSize: 18
    },
    removeBtn: {
        height: 100,
        width: 500,
        backgroundColor: '#E8383B',
        justifyContent: 'center',
        alignItems: 'center',
        paddingRight: 400
    }
})