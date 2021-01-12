import React, { useState } from 'react';

import { View, Text, StyleSheet, TouchableNativeFeedback, StatusBar, TextInput } from 'react-native';

import { useNavigation } from '@react-navigation/native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

import Icon from 'react-native-vector-icons/Feather';

interface Card {
    title: string;
    items: Object[];
    id: string;
    createdAt: string;
}

function List({ route }: any) {

    const navigation = useNavigation();

    const card: Card = route.params.card;
    const cards = route.params.cards;
    

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemName, setItemName] = useState('');


    const addNewItem = async () => {

        const newItem = {
            title: itemName,
            id: uuidv4()
        }

        // Copiar o array de cards
        const newCards = [...cards];

        // Pegar o index do card na lista de cards e mudar seus items, adicionando o novo
        const indexOfCard = cards.indexOf(card);
        newCards[indexOfCard].items.push(newItem)

        try {
            await AsyncStorage.setItem('cards', JSON.stringify(newCards));
        } catch (err) {
            console.error(err);
        }

        setItemName('');
        setIsModalOpen(false);
    }

    return (
        <View style={styles.container}>

            {/* Header */}
            <View style={styles.header}>
                <TouchableNativeFeedback onPress={() => navigation.goBack()}>
                    <View style={styles.icon}>
                        <Icon name="arrow-left" size={32} color="#FFF" />
                    </View>
                </TouchableNativeFeedback>

                <Text style={styles.headerText}>{card.title}</Text>

                <Text style={[styles.headerText, styles.date]}>{card.createdAt}</Text>

                <TouchableNativeFeedback onPress={() => setIsModalOpen(true)}>
                    <View style={styles.icon}>
                        <Icon name="plus" size={32} color="#FFF" />
                    </View>
                </TouchableNativeFeedback>

                {
                    isModalOpen && (
                        <View style={[styles.header, styles.modal]}>
                            <View style={styles.inputBlock}>
                                <Text style={styles.nameLabel}>Nome</Text>
                                <TextInput
                                    placeholder="ex: Cebola"
                                    style={styles.nameInput}
                                    value={itemName}
                                    onChangeText={(text) => setItemName(text)}
                                />
                            </View>

                            <View style={styles.modalBtnContainer}>

                                <TouchableNativeFeedback onPress={addNewItem}>
                                    <View style={[styles.icon, styles.addItemIcon]}>
                                        <Icon name="plus" size={32} color="#FFF" />
                                    </View>
                                </TouchableNativeFeedback>

                                <TouchableNativeFeedback onPress={() => setIsModalOpen(false)}>
                                    <View style={[styles.icon, styles.closeModalIcon]}>
                                        <Icon name="minus" size={32} color="#FFF" />
                                    </View>
                                </TouchableNativeFeedback>

                            </View>
                     
                        </View>
                    )
                }
            </View>

            {
                card.items.map((item: any, index) => {
                    return <Text key={index}> {item.title} </Text>
                })
            }

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: StatusBar.currentHeight,
    },

    header: {
        flexDirection: 'row',
        padding: 20,
        backgroundColor: 'dodgerblue',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 1,
        elevation: 5
    },

    headerText: {
        color: '#FFF',
        fontSize: 20
    },

    icon: {
        borderRadius: 50,
        backgroundColor: '#517aff',
        padding: 10,
        shadowColor: '#000',
        shadowRadius: 1,
        elevation: 5
    },

    date: {
        fontSize: 16
    },

    modal: {
        position: 'absolute',
        top: 0,
        right: 0,
        left: 0,
        bottom: 0,
        alignItems: 'flex-end'
    },

    inputBlock: {
        flex: 1,
        marginRight: 30
    },

    nameLabel: {
        color: '#FFF',
        fontSize: 14,
        marginBottom: 4
    },

    nameInput: {
        backgroundColor: '#FFF',
        padding: 6,
        borderRadius: 5
    },

    modalBtnContainer: {
        flexDirection: 'row'
    },

    addItemIcon: {
        backgroundColor: '#00e200',
        marginRight: 10
    },

    closeModalIcon: {
        backgroundColor: '#ff4848'
    }
})

export default List;