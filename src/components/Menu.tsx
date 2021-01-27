import React, { useEffect } from 'react';

import { View, Text, StyleSheet, TouchableOpacity, Animated, Vibration } from 'react-native';

import { WhiteColor } from '../styles/global';

import AsyncStorage from '@react-native-async-storage/async-storage';
import saveToStorage from '../utils/saveToStorage';

import Icon from 'react-native-vector-icons/Feather';


function Menu({ item, cards, card = {}, setCards, children }: any) {

    useEffect(() => {
        Vibration.vibrate(50);
    }, [])

    // Item can be a list, a list item and so on. It's just a name for the param.

    // Animated API
    const showAnim = new Animated.Value(-100);

    const show = () => {
        Animated.timing(showAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true
        }).start()
    }


    const deleteItem = () => {
        let newCards = [...cards];
        

        const indexOfId = newCards.indexOf(item);
        // console.log('INDEX OF ID:: ', indexOfId);
        
        
        if (indexOfId < 0) {
            const indexOfCard = newCards.indexOf(card);
            
            const filteredItems = newCards[indexOfCard].items.filter(({ id }: any) => id !== item.id);
            
            newCards[indexOfCard].items = filteredItems;

            setCards(newCards[indexOfCard].items);

        } else {
            newCards = newCards.filter(card => card.id !== item.id);

            setCards(newCards);
        }
        
        saveToStorage(AsyncStorage, newCards)

    }

    // There will always be a "delete" button in the Menu.
    return (
        <View style={styles.container}>

            <TouchableOpacity
                activeOpacity={0.6}
                onPress={deleteItem}
            >
                <View style={styles.button}>
                    <Text style={styles.text}>Excluir</Text>

                    <Icon name="delete" size={26} color="#df0000" />
                </View>
            </TouchableOpacity>

            {children}
        </View>
    );
}

export const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: '#222',
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        padding: 8,
    },

    button: {
        width: '90%',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        borderTopColor: 'gray',
        borderBottomColor: 'transparent',
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderWidth: 1,
        flexDirection: 'row',
        height: 60
    },

    text: {
        color: WhiteColor,
    },

    input: {
        backgroundColor: WhiteColor,
        width: 120,
        padding: 4,
        borderRadius: 4
    }
})

export default Menu;
