import React, { useEffect, useState } from 'react'
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    TextInput,
} from 'react-native'

import { useItems } from '../hooks/useItems';

import Icon from 'react-native-vector-icons/Feather'
import SlideDown from "../animations/SlideDown";
import { WhiteColor } from '../styles/global'

type ItemMenuProps = {
    title: string,
    price: number,
    unities: number,
    id: string,
    closeMenu: () => void,
}

export function ItemMenu({ title, price, unities, id, closeMenu }: ItemMenuProps) {

    const [newPrice, setNewPrice] = useState(price)
    const [newTitle, setNewTitle] = useState(title)
    const [newUnities, setNewUnities] = useState(unities)
    const { updateItems, items } = useItems()
    let itemIndex = items.findIndex(item => item.id === id)
    
    function handleChangeItemUnities() {
        const newItems = [...items]
        newItems[itemIndex].unities = newUnities
        updateItems(newItems)
        closeMenu()
    }
    
    function handleChangeItemTitle() {
        const newItems = [...items]
        newItems[itemIndex].title = newTitle
        updateItems(newItems)
        closeMenu()
    }

    function handleChangeItemPrice() {
        const newItems = [...items]
        newItems[itemIndex].price = newPrice
        updateItems(newItems)
        closeMenu()
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
                onPress={handleChangeItemTitle}
            >
                <View style={styles.button}>
                    <View style={styles.buttonPlaceholder}>
                        <Icon name="chevron-right" size={24} color="#222" />
                        <Text style={styles.text}>Mudar nome</Text>
                    </View>

                    <TextInput
                        value={newTitle}
                        onChangeText={(text) => setNewTitle(text)}
                        style={styles.input}
                    />
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                activeOpacity={0.6}
                onPress={handleChangeItemPrice}
            >
                <View style={styles.button}>
                    <View style={styles.buttonPlaceholder}>
                        <Icon name="chevron-right" size={24} color="#222" />
                        <Text style={styles.text}>Mudar preço</Text>
                    </View>

                    <TextInput
                        value={String(newPrice)}
                        keyboardType="numeric"
                        onChangeText={(text) => setNewPrice(Number(text))}
                        style={styles.input}
                    />
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                activeOpacity={0.6}
                onPress={handleChangeItemUnities}
            >
                <View style={styles.button}>
                    <View style={styles.buttonPlaceholder}>
                        <Icon name="chevron-right" size={24} color="#222" />
                        <Text style={styles.text}>Mudar unidades</Text>
                    </View>

                    <TextInput
                        value={String(newUnities)}
                        keyboardType="numeric"
                        onChangeText={(text) => setNewUnities(Number(text))}
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
        fontWeight: '600',
    },

    input: {
        color: '#222',
        width: 120,
        padding: 4,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#222',
    }
})