import React, {useRef, useEffect} from 'react';
import { View, StyleSheet, StatusBar, Animated } from 'react-native';

import SlideDown from '../animations/SlideDown';

function Header({ children, statusBar = true }: any) {

    return (
        <SlideDown style={styles.header}>
            {statusBar && <StatusBar backgroundColor="dodgerblue" />}

            {children}
        </SlideDown>
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

export default Header;