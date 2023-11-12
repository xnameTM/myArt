import {SafeAreaView, Text, TouchableOpacity} from 'react-native';
import {Stack, useLocalSearchParams, useRouter} from "expo-router";
import {ExternalLink} from "../../components/templates/ExternalLink";
import React from "react";

export default function SearchScreen() {
    const router = useRouter();
    const {filter, text} = useLocalSearchParams();

    // endpoint: `https://api.artic.edu/api/v1/artworks/search?query[bool][must][match][artist_display]=Pablo+Picasso`

    const obj = {};
    // @ts-ignore
    obj[`query[bool][must][match][${filter}]`] = String(text);

    return (
        <SafeAreaView>
            <Stack.Screen options={{headerShown: false}}/>
            <TouchableOpacity onPress={() => router.back()}><Text style={{color: 'white'}}>Back</Text></TouchableOpacity>
            <Text style={{color: 'white'}}>Filter: {filter}</Text>
            <Text style={{color: 'white'}}>Text: {text}</Text>
            <ExternalLink
                href={`https://api.artic.edu/api/v1/artworks/search?${new URLSearchParams(filter == 'default' ? {q: String(text)} : obj)}`}>
                <Text style={{color: 'yellow'}}>See JSON</Text>
            </ExternalLink>
        </SafeAreaView>
    );
}