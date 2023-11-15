import {Text, View} from './templates/Themed';
import {GestureResponderEvent, Image, Pressable, TouchableOpacity} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Ionicons} from '@expo/vector-icons';
import React, {useRef, useState} from 'react';
import {
    GestureHandlerRootView, HandlerStateChangeEvent,
    State,
    TapGestureHandler,
    TapGestureHandlerEventPayload
} from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import {formatDesciption, shortenText} from "../utils/Utils";
import {useRouter} from "expo-router";

function MultiTap({children, onPress, numberOfTouches} : {children: any, onPress: () => void, numberOfTouches: number}) {
    const onStartShouldSetResponder = (event: GestureResponderEvent): boolean => {
        return event.nativeEvent.touches.length === numberOfTouches;
    }

    const onResponderRelease = (event: GestureResponderEvent) => {
        onPress();
    }

    return (
        <View
            onStartShouldSetResponder={onStartShouldSetResponder}
            onResponderRelease={onResponderRelease}
        >
            {children}
        </View>
    );
}

export default function ExploreCard({item, handleCardPress}: {item: any, handleCardPress: () => void}) {
    const router = useRouter();
    const [liked, setLiked] = useState<boolean>(false);
    const [favourited, setFavourited] = useState<boolean>(false);
    const doubleTapRef = useRef();

    const handleSingleTap = (e: HandlerStateChangeEvent<TapGestureHandlerEventPayload>) => {
        if (e.nativeEvent.state === State.ACTIVE)
            handleCardPress();
    };

    const handleDoubleTap = (e: HandlerStateChangeEvent<TapGestureHandlerEventPayload>) => {
        if (e.nativeEvent.state === State.ACTIVE) {
            setLiked(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    };

    return (
        <View style={{paddingHorizontal: 10, flex: 1, gap: 8}}>
            <View style={{position: 'relative'}}>
                {/*<TapGestureHandler*/}
                {/*    maxDelayMs={200}*/}
                {/*    numberOfTaps={2}*/}
                {/*    onEnded={() => {*/}
                {/*        setLiked(true);*/}
                {/*        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)*/}
                {/*    }}*/}
                {/*>*/}
                {/*    <Image source={{uri: item.image}} style={{width: '100%', height: item.height, borderRadius: 10}}/>*/}
                {/*</TapGestureHandler>*/}
                <GestureHandlerRootView>
                    <TapGestureHandler
                        onHandlerStateChange={handleSingleTap}
                        waitFor={doubleTapRef}
                    >
                        <TapGestureHandler
                            onHandlerStateChange={handleDoubleTap}
                            numberOfTaps={2}
                            maxDelayMs={300}
                            ref={doubleTapRef}
                        >
                            <Image source={{uri: item.image}} style={{width: '100%', height: item.height, borderRadius: 10}}/>
                        </TapGestureHandler>
                    </TapGestureHandler>
                </GestureHandlerRootView>
                <LinearGradient
                    colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0)']}
                    style={{position: 'absolute', top: 0, left: 0, width: '100%', paddingTop: 10, paddingBottom: 12, paddingHorizontal: 16, borderTopLeftRadius: 10, borderTopRightRadius: 10}}>
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
            {/*<Text>Likes: 6376</Text>*/}
            {!item.artist_title && !item.description ? '' : (
                <Text style={{color: 'white'}}>
                    <Text style={{fontWeight: '600'}}>{item.artist_title ? item.artist_title + ' ' : ''}</Text>
                    <Text>{formatDesciption(item.description ?? '', 50)}</Text>
                </Text>
            )}
            {(item.subject_titles ?? []).length > 0 ? (
                <View style={{flex: 1, gap: 5, alignItems: 'flex-start', flexDirection: 'row', maxWidth: '100%', flexWrap: 'wrap'}}>
                    {(item.subject_titles ?? []).map((hashtag: string, index: number) => (
                        <TouchableOpacity onPress={() => {
                            // @ts-ignore
                            router.push(`search-artworks?${new URLSearchParams({filter: 'default', text: hashtag})}`)
                        }} style={{backgroundColor: '#333', paddingVertical: 2, paddingHorizontal: 4, borderRadius: 3}} key={index}>
                            <Text>
                                #{shortenText(hashtag, 2)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            ) : null}
        </View>
    );
}