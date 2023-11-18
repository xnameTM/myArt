import { useColorScheme, View, Text } from 'react-native';
import { ReactNode } from 'react';

export default function SettingsCard({label, children}: {label: string, children: ReactNode}) {
    const colorScheme = useColorScheme();

    return (
        <View style={{padding: 10, borderBottomWidth: 1, borderBottomColor: colorScheme === 'dark' ? '#353535' : '#cccccc', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <Text style={{color: colorScheme === 'dark' ? 'white' : 'black', fontSize: 16}}>{label}</Text>
            <View>
                {children}
            </View>
        </View>
    );
}