import React, {useRef, useEffect} from 'react';
import { View, StyleSheet, StatusBar, Animated } from 'react-native';

function HeaderNew({ children, statusBar = true }: any) {

    // Animated API
    const showAnim = useRef(new Animated.Value(-100)).current;

    const ShowView = (props: any) => {
        useEffect(() => {
            Animated.timing(showAnim, {
                toValue: 0,
                // easing: Easing.back(),
                duration: 300,
                useNativeDriver: true
            }).start();
        })

        return (
            <Animated.View
                style={[styles.header, {transform: [{translateY: showAnim}]}]}
            >
                {children}
            </Animated.View>
        )
    }

    return (
        <View style={[styles.header]}>
            {statusBar && <StatusBar backgroundColor="dodgerblue" />}

            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        paddingTop: StatusBar.currentHeight,
        backgroundColor: 'dodgerblue',
        shadowColor: '#000',
        shadowRadius: 1,
        elevation: 6
    }
})

export default HeaderNew;