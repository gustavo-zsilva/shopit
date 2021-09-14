import { StyleSheet } from 'react-native';

const PrimaryColor = '#5389F3';
const WhiteColor = '#FFF';
const BlackColor = 'rgba(0, 0, 0, 0.3)';
const BgColor = '#f0f0f0';

const globalStyles = StyleSheet.create({
    text: {
        fontSize: 20,
        color: WhiteColor,
    },

    label: {
        color: WhiteColor,
        fontSize: 14,
        marginBottom: 4,
    },

    input: {
        backgroundColor: WhiteColor,
        padding: 4,
        borderRadius: 5,
    },

    deleteBtn: {
        backgroundColor: 'red',
        padding: 15,
        borderRadius: 50,
        position: 'absolute',
        bottom: 20,
        right: 20,
        shadowColor: BlackColor,
        shadowRadius: 1,
        elevation: 5,
    },

    modal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        backgroundColor: PrimaryColor,
        padding: 24,
        elevation: 5,
        borderRadius: 9999,
    },
})

export { globalStyles, PrimaryColor, WhiteColor, BlackColor, BgColor };