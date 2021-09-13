import React from "react";
import { View, TouchableNativeFeedback } from "react-native";
import { useItems } from "../hooks/useItems";

import Icon from 'react-native-vector-icons/Feather'
import { iconStyles } from '../styles/icons'

export function CloseModalButton() {
    const { closeModal } = useItems()

    return (
        <TouchableNativeFeedback onPress={closeModal}>
            <View style={[iconStyles.icon, iconStyles.minusIcon]}>
                <Icon
                    name="minus"
                    size={32}
                    color="#FFF"
                />
            </View>
        </TouchableNativeFeedback>
    )
}