import React from 'react'
import { View, TouchableNativeFeedback } from 'react-native'
import { useNavigation } from '@react-navigation/native'

import Icon from 'react-native-vector-icons/Feather'
import { iconStyles } from '../styles/icons'

export function GoBackButton() {
    const { goBack } = useNavigation()

    return (
        <TouchableNativeFeedback onPress={() => goBack()}>
            <View style={iconStyles.icon}>
                <Icon
                    name="arrow-left"
                    size={32}
                    color="#FFF"
                />
            </View>
        </TouchableNativeFeedback>
    )
}