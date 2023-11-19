import {TouchableOpacity, Image, StyleProp, ViewStyle, Animated, Appearance, useColorScheme} from "react-native";
import getColorScheme = Appearance.getColorScheme;

export default function DynamicHeader({scrollY, headerHeight, children, style}: {scrollY: Animated.Value, headerHeight: number, children: any, style: StyleProp<ViewStyle>}) {
    const diffClamp = Animated.diffClamp(scrollY, 0, headerHeight - 5)
    const translateY = diffClamp.interpolate({
        inputRange: [0, headerHeight],
        outputRange: [0, -headerHeight]
    });
    const opacity = diffClamp.interpolate({
        inputRange: [0, headerHeight],
        outputRange: [1, -.5]
    });

    const colorSheme = useColorScheme();

    return (
        <Animated.View
            style={{
                transform: [
                    {translateY: translateY}
                ],
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 1,
                height: headerHeight,
                backgroundColor: colorSheme === 'dark' ? 'black' : '#fff'
            }}
        >{/* @ts-ignore */}
            <Animated.View style={{opacity, ...style}}>
                {children}
            </Animated.View>
        </Animated.View>
    );
}