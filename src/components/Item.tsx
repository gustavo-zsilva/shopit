import React, { useState } from 'react';

import CheckBox from '@react-native-community/checkbox';

import Menu, { styles as menuStyles } from '../components/Menu';

import Icon from 'react-native-vector-icons/Ionicons';

import AsyncStorage from '@react-native-async-storage/async-storage';
import saveToStorage from '../utils/saveToStorage';

import { TouchableOpacity, Text, View, StyleSheet, TextInput } from 'react-native';

import { WhiteColor, BgColor, PrimaryColor } from '../styles/global';


function Item({ itemArray, cardArray, items, setItems }: any) {

    const [item, itemIndex] = itemArray;
    const [cards, card] = cardArray;

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [newItemPrice, setNewItemPrice] = useState(item.price);
    const [newItemTitle, setNewItemTitle] = useState(item.title)

    const [toggleCheckBox, setToggleCheckBox] = useState(item.isCompleted);
    // const [] = useState()

    // Handles the checkbox value change and all the actions based on it
    const handleCheckBoxValueChange = async (value: boolean = !toggleCheckBox) => {
        setToggleCheckBox(value);

        const newCards = [...cards];
        const indexOfCard = newCards.indexOf(card);

        const newItems = [...items];
        newItems[itemIndex].isCompleted = value;
        setItems(newItems);

        newCards[indexOfCard].items = items;

        saveToStorage(AsyncStorage, newCards);
    }

    const changeItemPrice = () => {
        const newCards = [...cards];
        const indexOfCard = newCards.indexOf(card);

        const newItems = [...items];
        newItems[itemIndex].price = newItemPrice;
        setItems(newItems);

        newCards[indexOfCard].items = items;

        saveToStorage(AsyncStorage, newCards);
    }

    const changeItemName = () => {
        const newCards = [...cards];
        const indexOfCard = newCards.indexOf(card);
        
        const newItems = [...items];
        newItems[itemIndex].title = newItemTitle;
        setItems(newItems);

        newCards[indexOfCard].items = items;

        saveToStorage(AsyncStorage, newCards);
    }

    return (
        <TouchableOpacity
            style={[styles.item, {
                borderTopRightRadius: itemIndex === 0 ? 8 : 0,
                borderTopLeftRadius: itemIndex === 0 ? 8 : 0,
                borderBottomRightRadius: itemIndex === items.length - 1 ? 8 : 0,
                borderBottomLeftRadius: itemIndex === items.length - 1 ? 8 : 0,
                borderBottomColor: itemIndex !== items.length - 1 ? PrimaryColor : 'transparent',
                backgroundColor: item.isCompleted ? BgColor : WhiteColor
            }]}
            onPress={() => handleCheckBoxValueChange()}
            onLongPress={() => setIsMenuOpen(!isMenuOpen)}
        >
            <View style={styles.wrapper}>
                <CheckBox
                    disabled={false}
                    value={toggleCheckBox}
                    onValueChange={(value) => handleCheckBoxValueChange(value)}
                />

                <View style={styles.info}>    
                    <Text style={{ textDecorationLine: toggleCheckBox ? 'line-through' : 'none' }}>
                        {item.title}
                    </Text>
                    {item.price !== 0 ? (
                        <Text style={item.price}>R$ {item.price}</Text>
                    ) : (
                        <View style={item.price}>
                            <Icon name="pricetags-outline" size={26} color="#b84e4e" />
                        </View>
                    )}
                </View>
            </View>
         
            
            {isMenuOpen && <Menu item={item} cards={cards} card={card} setCards={setItems}>
                <TouchableOpacity
                    activeOpacity={0.6}
                    onPress={changeItemPrice}
                >
                    <View style={menuStyles.button}>
                        <Text style={menuStyles.text}>Novo Preço</Text>
                        <TextInput
                            keyboardType="numeric"
                            maxLength={8}
                            onChangeText={(text) => setNewItemPrice(Number(text))}
                            style={menuStyles.input}
                        />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.6}
                    onPress={changeItemName}
                >
                    <View style={menuStyles.button}>
                        <Text style={menuStyles.text}>Novo Nome</Text>
                        <TextInput
                            value={newItemTitle}
                            onChangeText={(text) => setNewItemTitle(text)}
                            style={menuStyles.input}
                        />
                    </View>
                </TouchableOpacity>
            </Menu>}

        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    item: {
        // flexDirection: 'row',
        backgroundColor: WhiteColor,
        borderBottomWidth: 2
    },

    wrapper: {
        flex: 1,
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    info: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        textDecorationLine: 'line-through',
        alignItems: 'center'
    },

    price: {
        marginRight: 10,
    },
})

export default Item;