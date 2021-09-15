import React from 'react';
import { StyleSheet, StatusBar } from 'react-native';

import SlideDown from '../animations/SlideDown';
import { PrimaryColor } from '../styles/global';

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
        padding: 10,
        paddingHorizontal: 18,
        backgroundColor: 'dodgerblue',
        shadowColor: '#000',
        shadowRadius: 1,
        elevation: 6,
        margin: 18,
        borderRadius: 9999,
    },
})

export default Header;