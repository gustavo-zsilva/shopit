import React from 'react';

import { StatusBar } from 'expo-status-bar';

import { View, Text, StyleSheet, TouchableNativeFeedback } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';




function Header({ navigation }: any) {

    

    return (
        <View style={styles.container}>
            <StatusBar translucent style="light" />
            <Text style={styles.text}>Suas Listas</Text>
            <TouchableNativeFeedback onPress={() => navigation.push('Form')}>
                <View style={styles.addIcon}>
                    <Icon name="plus" size={32} color="#FFF" />
                </View>
            </TouchableNativeFeedback>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        paddingTop: 28,
        backgroundColor: 'dodgerblue',
        shadowColor: '#000',
        shadowRadius: 1,
        elevation: 6
    },

    text: {
        fontSize: 20,
        color: '#FFF'
    },

    addIcon: {
        backgroundColor: '#517aff',
        padding: 10,
        borderRadius: 50,
        shadowColor: '#000',
        shadowRadius: 1,
        elevation: 5
    }
})

export default Header;