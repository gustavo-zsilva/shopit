import React, { useState } from 'react';

import {
    View,
    Text,
    StyleSheet,
    TouchableNativeFeedback,
    TextInput,
    StatusBar
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { v4 as uuidv4 } from 'uuid';

import Icon from 'react-native-vector-icons/Feather';


interface HeaderProps {
    cards: {
        title: string,
        id: string,
        createdAt: string
    }[],
    setCards: Function
}

function Header({ cards, setCards }: HeaderProps) {


    return (
 

            
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        marginTop: StatusBar.currentHeight,
        backgroundColor: 'dodgerblue',
        shadowColor: '#000',
        shadowRadius: 1,
        elevation: 6
    },

    icon: {
        backgroundColor: '#517aff',
        padding: 10,
        borderRadius: 50,
        shadowColor: '#000',
        shadowRadius: 1,
        elevation: 5
    },
    
    modal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        backgroundColor: 'dodgerblue',
        padding: 24,
        elevation: 5
    },

    inputBlock: {
        flex: 1,
        marginRight: 30
    },

    buttonBlock: {
        flexDirection: 'row',
    },

    inputLabel: {
        color: '#FFF',
        fontSize: 14,
        marginBottom: 4
    },

    newListNameInput: {
        backgroundColor: '#FFF',
        padding: 6,
        borderRadius: 5,
    },

    minusIcon: {
        backgroundColor: '#ff4848',
    },

    plusIcon: {
        marginRight: 10,
        backgroundColor: '#00e200'
    }
})

export default Header;