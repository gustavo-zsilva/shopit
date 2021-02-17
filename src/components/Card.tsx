import React, { useState, useEffect, useRef } from 'react';

import {
    View,
    Text,
    TouchableNativeFeedback,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Animated,
    Keyboard
} from 'react-native';

import Menu, { styles as menuStyles } from '../components/Menu';

import AsyncStorage from '@react-native-async-storage/async-storage';
import saveToStorage from '../utils/saveToStorage';

import SlideSide from '../animations/SlideSide';

interface CardProps {
    card: {
        title: string,
        id: string,
        createdAt: string,
        items: Object[],
    };
    cards: {
        title: string,
        id: string,
        createdAt: string,
        items: Object[],
    }[];
    setCards: Function;
    index: Number;
    navigation: {
        push: Function,
        goBack: Function,
    };
}

function Card({ card, cards, setCards, index, navigation }: CardProps) {

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const [newCardName, setNewCardName] = useState(card.title);



    const openList = () => {
        setIsMenuOpen(false);

        navigation.push('List', { card, cards });
    }

    const changeCardTitle = () => {

        if (newCardName.length <= 0 ) return;

        const newCards = [...cards];
        const indexOfCard = newCards.indexOf(card);

        newCards[indexOfCard].title = newCardName;

        setCards(newCards);

        saveToStorage(AsyncStorage, newCards);
    }

    return (
        
        <TouchableNativeFeedback 
            onPress={openList}
            onLongPress={() => setIsMenuOpen(!isMenuOpen)}
        >
            <View style={[styles.container, {marginBottom: index === cards.length - 1 ? 90 : 0}]}>
                <View style={styles.content}>
                    <Text>{card.title}</Text>
                    <Text style={styles.date}>{card.createdAt}</Text>
                </View>
                
                {isMenuOpen && <Menu item={card} cards={cards} setCards={setCards}>
                    <TouchableOpacity
                        activeOpacity={0.6}
                        onPress={() => {
                            changeCardTitle();
                            Keyboard.dismiss();
                        }}
                    >
                        <View style={menuStyles.button}>
                            <Text style={menuStyles.text}>Mudar nome</Text>

                            <TextInput
                                value={newCardName}
                                onChangeText={(text) => {
                                    setNewCardName(text);
                                    changeCardTitle();
                                }}
                                style={menuStyles.input}
                            />
                        </View>
                    </TouchableOpacity>
                </Menu>}
            </View>

        </TouchableNativeFeedback>
        
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFF',
        flexDirection: 'column',
        alignSelf: 'center',
        width: '90%',
        marginTop: 20,
        borderRadius: 6,
        shadowColor: '#000',
        shadowRadius: 1,
        shadowOpacity: 1,
        elevation: 2,
    },

    content: {
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    date: {
        color: 'gray',
    }
})

export default Card;