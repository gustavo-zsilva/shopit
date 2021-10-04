import React from 'react'
import { View, TouchableNativeFeedback, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'

import Icon from 'react-native-vector-icons/MaterialIcons'
import { iconStyles } from '../styles/icons'
import { PrimaryColor } from '../styles/global'

export function GoBackButton() {
    const { goBack } = useNavigation()

    return (
        <TouchableNativeFeedback onPress={() => goBack()}>
            <View style={iconStyles.icon}>
                <Icon
                    name="keyboard-arrow-left"
                    size={32}
                    color={PrimaryColor}
                />
            </View>
        </TouchableNativeFeedback>
    )
}

const styles = StyleSheet.create({

})