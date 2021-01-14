import React, { useState } from 'react';

import CheckBox from '@react-native-community/checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';


function Item({ itemArray, cardArray, refreshStates }: any) {

    const [item, items, itemIndex] = itemArray;
    const [cards, card] = cardArray;

    const [toggleCheckBox, setToggleCheckBox] = useState(item.isCompleted);

    // Handles the checkbox value change and all the actions based on it
    const handleCheckBoxValueChange = async (value: boolean = !toggleCheckBox) => {
        setToggleCheckBox(value);

        const newCards = [...cards]
        const indexOfCard = newCards.indexOf(card);

        newCards[indexOfCard].items[itemIndex].isCompleted = value;

        refreshStates();

        try {
            await AsyncStorage.setItem('cards', JSON.stringify(newCards));
        } catch (err) {
            console.error(err);
        }
        
    }

    return (
        <TouchableOpacity
            style={[styles.item, {
                borderTopRightRadius: itemIndex === 0 ? 8 : 0,
                borderTopLeftRadius: itemIndex === 0 ? 8 : 0,
                borderBottomRightRadius: itemIndex === items.length - 1 ? 8 : 0,
                borderBottomLeftRadius: itemIndex === items.length - 1 ? 8 : 0,
                borderBottomColor: itemIndex !== items.length - 1 ? 'dodgerblue' : 'transparent',
                backgroundColor: item.isCompleted ? '#f0f0f0' : '#FFF'
            }]}
            onPress={() => handleCheckBoxValueChange()}
        >
            <CheckBox
                disabled={false}
                value={toggleCheckBox}
                onValueChange={(value) => handleCheckBoxValueChange(value)}
            />

            <View style={styles.info}>    
                <Text style={{ textDecorationLine: toggleCheckBox ? 'line-through' : 'none' }}>
                    {item.title}
                </Text>
                <Text style={styles.price}>
                    R$ {item.price}
                </Text>
            </View>
           
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    item: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        padding: 10,
        alignItems: 'center',
        borderBottomWidth: 2
    },

    info: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        textDecorationLine: 'line-through'
    },

    price: {
        // textDecorationLine: 'line-through',
        marginRight: 10
    },
})

export default Item;