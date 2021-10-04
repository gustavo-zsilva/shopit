import { StyleSheet } from 'react-native';

import { BlackColor } from './global';

const IconColor = '#FFF'
const BorderColor = '#5A85EE'

const iconStyles = StyleSheet.create({

    icon: {
        backgroundColor: IconColor,
        borderWidth: 2,
        borderColor: BorderColor,
        padding: 8,
        borderRadius: 50,
        shadowColor: BlackColor,
        shadowRadius: 1,
        elevation: 5
    },

    minusButton: {
        backgroundColor: '#ff4848',
        borderRadius: 0,
        borderTopRightRadius: 50,
        borderBottomRightRadius: 50,
    },

    plusButton: {
        backgroundColor: IconColor,
        borderRadius: 0,
        borderTopLeftRadius: 50,
        borderBottomLeftRadius: 50,
    }
})

export { iconStyles, IconColor, BorderColor }