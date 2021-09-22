import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, TextInput } from 'react-native';

import CheckBox from '@react-native-community/checkbox';

import { useItems } from '../hooks/useItems';
import { ItemMenu } from './ItemMenu';

import Icon from 'react-native-vector-icons/Ionicons';
import { WhiteColor, BgColor, PrimaryColor } from '../styles/global';

type ItemProps = {
    title: string,
    price: number,
    unities: number,
    isCompleted: boolean,
    id: string,
}

function Item({ title, price, unities, isCompleted, id }: ItemProps) {    

    const [toggleCheckBox, setToggleCheckBox] = useState(isCompleted)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { items, updateItems } = useItems()

    // Handles the checkbox value change and all the actions based on it
    function handleCheckBoxValueChange(currentCheckBoxValue: boolean = !toggleCheckBox) {
        setToggleCheckBox(currentCheckBoxValue)
        const itemIndex = items.findIndex(item => item.id === id)

        const newItems = [...items]
        newItems[itemIndex].isCompleted = currentCheckBoxValue
        
        updateItems(newItems)
    }

    function closeMenu() {
        setIsMenuOpen(false)
    }

    return (
        <TouchableOpacity
            style={[styles.item]}
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
                        {title}
                    </Text>

                    <View style={styles.subInfo}>
                        <Text style={styles.unities}>
                            <Text style={{ fontSize: 12, color: 'gray' }}>
                                x
                            </Text>
                            {unities}
                        </Text>

                        {price !== 0 ? (
                            <Text style={styles.price}>R$ {price}</Text>
                        ) : (
                            <View style={styles.price}>
                                <Icon name="pricetags-outline" size={26} color="#b84e4e" />
                            </View>
                        )}
                    </View>
                </View>
            </View>
            
            {isMenuOpen && <ItemMenu
                title={title}
                price={price}
                unities={unities}
                id={id}
                closeMenu={closeMenu}
            />}

        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    item: {
        backgroundColor: WhiteColor,
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

    subInfo: {
        flexDirection: 'row',
        alignItems: 'center'
    },

    price: {
        marginRight: 10,
    },

    unities: {
        marginRight: 10,
        borderWidth: 1,
        borderColor: PrimaryColor,
        padding: 5,
        paddingHorizontal: 10,
        borderRadius: 4,
        textAlign: 'center'
    }
})

export default Item;