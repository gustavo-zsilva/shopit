import React from "react";
import { View, TouchableOpacity } from "react-native";
import { useItems } from "../hooks/useItems";

import Icon from 'react-native-vector-icons/Feather'
import { iconStyles } from '../styles/icons'
import { PrimaryColor } from '../styles/global'

export function OpenModalButton() {

    const { openModal } = useItems()

    return (
        <TouchableOpacity onPress={openModal}>
            <View style={iconStyles.icon}>
                <Icon
                    name="plus"
                    size={32}
                    color={PrimaryColor}
                />
            </View>
        </TouchableOpacity>
    )
}