import { StyleSheet } from 'react-native';

import { BlackColor, WhiteColor } from './global';

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

    minusIcon: {
        backgroundColor: '#ff4848',
    },

    plusIcon: {
        marginRight: 10,
        backgroundColor: '#00e200'
    }
})

export { iconStyles, IconColor, BorderColor }