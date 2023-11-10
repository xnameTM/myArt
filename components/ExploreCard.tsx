import {Text, View} from './Themed';
import {Image, Pressable, TouchableOpacity, Vibration} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Ionicons} from '@expo/vector-icons';
import {useRef, useState} from 'react';
import {TapGestureHandler} from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

function shortenText(text: string, length: number) {
    if (text.length > length) {
        const indexOfNextSpace = text.substring(50).indexOf(' ');

        if (indexOfNextSpace != -1)
            return text.substring(0, length + indexOfNextSpace) + '...';
    }

    return text;
}

function formatDesciption(text: string) {
    return shortenText(text.replace(/(<([^>]+)>)/ig, ""), 50);
}


export default function ExploreCard({item, index}: {item: any, index: number}) {
    const [liked, setLiked] = useState<boolean>(false);
    const [favourited, setFavourited] = useState<boolean>(false);

    return (
        <View style={{paddingHorizontal: 15, paddingVertical: 20, flex: 1, gap: 11}} key={index}>
            <View style={{position: 'relative'}}>
                <TapGestureHandler
                    maxDelayMs={200}
                    numberOfTaps={2}
                    onEnded={() => {
                        setLiked(true);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    }}
                >
                    <Image source={{uri: item.image}} style={{width: '100%', height: item.height, borderRadius: 10}}/>
                </TapGestureHandler>
                <LinearGradient colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0)']} style={{position: 'absolute', top: 0, left: 0, width: '100%', paddingTop: 8, paddingBottom: 12, paddingHorizontal: 16, borderTopLeftRadius: 10, borderTopRightRadius: 10}}>
                    <Text style={{fontWeight: '600'}}>{shortenText(item.title, 35)}</Text>
                </LinearGradient>
            </View>
            <View style={{flex: 1, flexDirection: 'row'}}>
                <View style={{flex: 1, flexDirection: 'row', gap: 10}}>
                    <TouchableOpacity>
                        <Ionicons name={liked ? 'heart' : 'heart-outline'} onPress={() => {
                            if (!liked)
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                            setLiked(prev => !prev)
                        }} size={30} color={liked ? 'red' : 'white'}/>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Ionicons name='chatbubble-outline' size={30} color='white'/>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Ionicons name='share-outline' size={30} color='white'/>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity>
                    <Ionicons name={favourited ? 'bookmark' : 'bookmark-outline'} onPress={() => {
                        if (!favourited)
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                        setFavourited(prev => !prev)
                    }} size={30} color={favourited ? '#EFAD29' : 'white'}/>
                </TouchableOpacity>
            </View>
            <Text>Likes: 6376</Text>
            <Text style={{color: 'white'}}>
                <Text style={{fontWeight: '600'}}>{item.artist_title} </Text>
                <Text>{formatDesciption(item.description ?? '')}</Text>
            </Text>
            <View style={{flex: 1, gap: 5, alignItems: 'flex-start', flexDirection: 'row', maxWidth: '100%', flexWrap: 'wrap'}}>
                {(item.subject_titles ?? []).map((hashtag: string, index: number) => (
                    <Pressable style={{backgroundColor: '#333', paddingVertical: 2, paddingHorizontal: 4, borderRadius: 3}} key={index}>
                        <Text>
                            #{shortenText(hashtag, 2)}
                        </Text>
                    </Pressable>
                ))}
            </View>
        </View>
    );
}