import { useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';

export default function ArtistDetailsPage() {
    const params = useLocalSearchParams();
    const id = String(params.id);

    return (
        <Text style={{color: 'white'}}>Tequila {id}</Text>
    );
}