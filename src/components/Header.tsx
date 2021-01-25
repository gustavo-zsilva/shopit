import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';

function HeaderNew({ children, statusBar = true }: any) {
    return (
        <View style={styles.header}>
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