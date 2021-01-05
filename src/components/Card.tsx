import React from 'react';

import { View, Text, TouchableNativeFeedback, StyleSheet } from 'react-native';

interface CardProps {
    title: String;
    cards: Object[];
    index: Number;
    createdAt: String;
}

function Card({ title, createdAt, cards, index }: CardProps) {
    return (
        <TouchableNativeFeedback>
            <View style={[styles.container, {marginBottom: index === cards.length - 1 ? 150 : 0}]}>
                <Text>{title}</Text>
                <Text style={styles.date}>{createdAt}</Text>
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