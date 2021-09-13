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
    isCompleted: boolean,
    id: string,
}

export function ItemMenu({ title, price, unities, isCompleted, id }) {

    const [newItemPrice, setNewItemPrice] = useState(price)
    const [newItemTitle, setNewItemTitle] = useState(title)
    const [newItemUnities, setNewItemUnities] = useState(unities)
    let itemIndex = null
    const { updateItems, items } = useItems()

    useEffect(() => {
        itemIndex = items.findIndex(item => item.id === id)
    }, [])
    
    function handleChangeItemUnities() {
        const newItems = [...items]
        newItems[itemIndex].unities = newItemUnities
        updateItems(newItems)
    }
    
    function handleChangeItemTitle() {
        const newItems = [...items]
        newItems[itemIndex].title = newItemTitle
        updateItems(newItems)
    }

    function handleChangeItemPrice() {
        const newItems = [...items]
        newItems[itemIndex].price = newItemPrice
        updateItems(newItems)
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
                        value={newItemTitle}
                        onChangeText={(text) => setNewItemTitle(text)}
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
                        value={newItemPrice}
                        keyboardType="numeric"
                        onChangeText={(text) => setNewItemPrice(text)}
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
                        value={newItemUnities}
                        keyboardType="numeric"
                        onChangeText={(text) => setNewItemUnities(text)}
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