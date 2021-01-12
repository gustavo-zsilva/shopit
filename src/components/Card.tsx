import React from 'react';

import { View, Text, TouchableNativeFeedback, StyleSheet } from 'react-native';

interface CardProps {
    card: {
        title: string,
        id: string,
        createdAt: string
    };
    cards: {
        title: string,
        id: string,
        createdAt: string
    }[];
    index: Number;
    navigation: {
        push: Function,
        goBack: Function,
    };
}

function Card({ card, cards, index, navigation }: CardProps) {

    const openList = () => { 
        navigation.push('List', { card, cards })
    }

    return (
        <TouchableNativeFeedback onPress={openList}>
            <View style={[styles.container, {marginBottom: index === cards.length - 1 ? 90 : 0}]}>
                <Text>{card.title}</Text>
                <Text style={styles.date}>{card.createdAt}</Text>
            </View>
        </TouchableNativeFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFF',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        width: '90%',
        marginTop: 20,
        borderRadius: 6,
        shadowColor: '#000',
        shadowRadius: 1,
        shadowOpacity: 1,
        elevation: 2
    },

    date: {
        color: 'gray',
    }
})

export default Card;