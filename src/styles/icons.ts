import { StyleSheet } from 'react-native';

import { BlackColor } from './global';

const IconColor = '#517aff';

const iconStyles = StyleSheet.create({

    icon: {
        backgroundColor: '#517aff',
        padding: 10,
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

export { iconStyles, IconColor }