import React, { useState } from 'react'
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    TextInput,
} from 'react-native'

import Icon from 'react-native-vector-icons/Feather'
import SlideDown from "../animations/SlideDown";
import { WhiteColor } from '../styles/global'

export function Menu() {

    const [newItemPrice, setNewItemPrice] = useState(item.price);
    const [newItemTitle, setNewItemTitle] = useState(item.title);
    const [newItemUnities, setNewItemUnities] = useState(item.unities);
    
    const changeItemUnities = () => {

        if (newItemUnities <= 0) return;

        const newCards = [...cards]
        const indexOfCard = newCards.indexOf(card)

        const newItems = [...items]
        newItems[itemIndex].unities = newItemUnities
        setItems(newItems)
        setIsMenuOpen(false)

        newCards[indexOfCard].items = items

    }

    
    const changeItemName = () => {
        const newCards = [...cards];
        const indexOfCard = newCards.indexOf(card);
        
        const newItems = [...items];
        newItems[itemIndex].title = newItemTitle;
        setItems(newItems);
        setIsMenuOpen(false)

        newCards[indexOfCard].items = items;

        saveToStorage(AsyncStorage, newCards);
    }
   

    const changeItemPrice = () => {

        if (newItemPrice < 0) return;

        const newCards = [...cards];
        const indexOfCard = newCards.indexOf(card);

        const newItems = [...items];
        newItems[itemIndex].price = newItemPrice;
        setItems(newItems);
        setIsMenuOpen(false)

        newCards[indexOfCard].items = items;

        saveToStorage(AsyncStorage, newCards);
    }

    return (
        <SlideDown>
            <TouchableOpacity
                activeOpacity={0.6}
            >
                <View style={styles.button}>
                    <View style={styles.buttonPlaceholder}>
                        <Icon name="chevron-right" size={24} color="#222" />
                        <Text style={styles.text}>Excluir</Text>
                    </View>

                    <Icon name="delete" size={26} color="#df0000" />
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                activeOpacity={0.6}
            >
                <View style={styles.button}>
                    <View style={styles.buttonPlaceholder}>
                        <Icon name="chevron-right" size={24} color="#222" />
                        <Text style={styles.text}>Mudar nome</Text>
                    </View>

                    <TextInput
                        // value={newListTitle}
                        // onChangeText={(text) => setNewListTitle(text)}
                        style={styles.input}
                    />
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                activeOpacity={0.6}
            >
                <View style={styles.button}>
                    <View style={styles.buttonPlaceholder}>
                        <Icon name="chevron-right" size={24} color="#222" />
                        <Text style={styles.text}>Mudar nome</Text>
                    </View>

                    <TextInput
                        // value={newListTitle}
                        // onChangeText={(text) => setNewListTitle(text)}
                        style={styles.input}
                    />
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                activeOpacity={0.6}
            >
                <View style={styles.button}>
                    <View style={styles.buttonPlaceholder}>
                        <Icon name="chevron-right" size={24} color="#222" />
                        <Text style={styles.text}>Mudar nome</Text>
                    </View>

                    <TextInput
                        // value={newListTitle}
                        // onChangeText={(text) => setNewListTitle(text)}
                        style={styles.input}
                    />
                </View>
            </TouchableOpacity>
        </SlideDown>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: '#FFF',
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        padding: 8,
    },

    button: {
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
        flexDirection: 'row',
        height: 60
    },

    buttonPlaceholder: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    text: {
        color: '#222',
        fontWeight: '700',
    },

    input: {
        backgroundColor: '#222',
        color: WhiteColor,
        width: 120,
        padding: 4,
        borderRadius: 4
    }
})