import React from "react"
import { TouchableOpacity } from 'react-native'
import { useItems } from "../hooks/useItems"

import Icon from 'react-native-vector-icons/MaterialIcons'
import { globalStyles } from '../styles/global'

export function ClearItemsButton() {

    const { clearItems } = useItems()

    return (
        <TouchableOpacity 
            style={globalStyles.deleteBtn}
            onPress={clearItems}
            activeOpacity={0.5}
        >
            <Icon
                name="delete-outline"
                size={28}
                color="#FFF"
            />
        </TouchableOpacity>
    )
}