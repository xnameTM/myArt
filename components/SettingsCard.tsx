import { useColorScheme, View, Text, StyleSheet } from 'react-native';
import { ReactNode } from 'react';

export default function SettingsCard({label, children}: {label: string, children: ReactNode}) {
    const colorScheme = useColorScheme();

    return (
        <View style={{borderBottomColor: colorScheme === 'dark' ? '#353535' : '#cccccc', ...styles.container}}>
            <Text style={{color: colorScheme === 'dark' ? 'white' : 'black', ...styles.label}}>{label}</Text>
            <View>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    label: {
        fontSize: 16
    }
})