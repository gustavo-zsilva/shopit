import React from 'react'
import { View, StyleSheet } from 'react-native'
import { useItems } from '../hooks/useItems'
import Item from './Item'

export function ItemList() {

    const { items } = useItems()

    return (
        <View style={styles.container}>
            {items.map(item => (
                <Item
                    key={item.id}
                    { ...item }
                />
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        margin: 20,
        borderRadius: 8,
        elevation: 3,
        marginBottom: 100,
        overflow: 'hidden',
    },
})