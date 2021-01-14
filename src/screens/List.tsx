import React, { useState } from 'react';

import {
    View,
    Text,
    StyleSheet,
    TouchableNativeFeedback,
    TouchableOpacity,
    StatusBar,
    TextInput,
    ScrollView
} from 'react-native';

import { useNavigation } from '@react-navigation/native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

import { LinearGradient } from 'expo-linear-gradient';

import Icon from 'react-native-vector-icons/Feather';
import Item from '../components/Item';

interface Card {
    title: string;
    items: {
        id: string;
        isCompleted: boolean;
        title: string;
        price: number;
    }[];
    id: string;
    createdAt: string;
}

function List({ route }: any) {

    const navigation = useNavigation();

    const card: Card = route.params.card;
    const cards = route.params.cards;
    

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemName, setItemName] = useState('');
    const [itemPrice, setItemPrice] = useState(0);

    const newCard = {...card}

    // Checked items array
    let completedItems = newCard.items.filter(item => item.isCompleted);

    // Sum of completed items prices
    let pricesArray = completedItems
        .map((item: any) => item.price)
        .reduce((accumulator: number, currentValue: number) => accumulator + currentValue, 0);

    const [itemsLeft, setItemsLeft] = useState(completedItems.length);
    const [completedItemsPrice, setCompletedItemsPrice] = useState(pricesArray);

    // Function to refresh states to use between components, to avoid passing many constants on props
    const refreshStates = () => {
        completedItems = newCard.items.filter(item => item.isCompleted);
   
        pricesArray = completedItems
            .map((item: any) => item.price)
            .reduce((accumulator: number, currentValue: number) => accumulator + currentValue, 0);

        setItemsLeft(completedItems.length);
        setCompletedItemsPrice(pricesArray);
    }


    const addNewItem = async () => {

        if (itemName === '' || itemPrice === 0) return;

        const newItem = {
            title: itemName,
            price: itemPrice,
            isCompleted: false,
            id: uuidv4()
        }

        // Copiar o array de cards
        const newCards = [...cards];

        // Pegar o index do card na lista de cards e mudar seus items, adicionando o novo
        const indexOfCard = cards.indexOf(card);
        newCards[indexOfCard].items.push(newItem);

        try {
            await AsyncStorage.setItem('cards', JSON.stringify(newCards));
        } catch (err) {
            console.error(err);
        }

        setItemName('');
        setItemPrice(0);
        setIsModalOpen(false);
    }
    

    return (

        <View style={styles.container}>

        <ScrollView>

            {/* Header */}
            <View style={styles.header}>
                <TouchableNativeFeedback onPress={() => navigation.goBack()}>
                    <View style={styles.icon}>
                        <Icon
                            name="arrow-left"
                            size={32}
                            color="#FFF"
                        />
                    </View>
                </TouchableNativeFeedback>

                <Text style={styles.headerText}>
                    {card.title}
                </Text>

                <Text style={[styles.headerText, styles.date]}>
                    {itemsLeft}/{card.items.length}
                </Text>

                <TouchableOpacity onPress={() => setIsModalOpen(true)}>
                    <View style={styles.icon}>
                        <Icon
                            name="plus"
                            size={32}
                            color="#FFF"
                        />
                    </View>
                </TouchableOpacity>

                {
                    isModalOpen && (
                        <View style={[styles.header, styles.modal]}>

                            <View style={styles.inputBlock}>
                                <Text style={styles.label}>
                                    Nome
                                </Text>
                                <TextInput
                                    placeholder="ex: Cebola"
                                    style={styles.input}
                                    value={itemName}
                                    onChangeText={(text) => setItemName(text)}
                                />
                            </View>

                            <View style={styles.inputBlock}>
                                <Text style={styles.label}>
                                    R$
                                </Text>
                                <TextInput
                                    placeholder="0"
                                    style={styles.input}
                                    keyboardType="numeric"
                                    onChangeText={(text) => {
                                        text.replace(/[^0-9]/g, '');
                                        text.replace(/./g, ',')
                                        return setItemPrice(Number(text));
                                    }}
                                    maxLength={8}
                                />
                            </View>

                            <View style={styles.modalBtnContainer}>

                                <TouchableNativeFeedback onPress={addNewItem}>
                                    <View style={[styles.icon, styles.addItemIcon]}>
                                        <Icon
                                            name="plus"
                                            size={32}
                                            color="#FFF"
                                        />
                                    </View>
                                </TouchableNativeFeedback>

                                <TouchableNativeFeedback onPress={() => setIsModalOpen(false)}>
                                    <View style={[styles.icon, styles.closeModalIcon]}>
                                        <Icon
                                            name="minus"
                                            size={32}
                                            color="#FFF"
                                        />
                                    </View>
                                </TouchableNativeFeedback>

                            </View>
                        </View>
                    )
                }
            </View>

            <View style={styles.listContainer}>
                {
                    card.items.map((item: any, index) => {
                        return <Item
                            key={index}
                            itemArray={[item, card.items, index]}
                            cardArray={[cards, card]}
                            refreshStates={refreshStates}
                        />
                    })
                }
            </View>
        </ScrollView>

        <LinearGradient
            colors={['#FFF', 'transparent']}
            style={styles.totalPrice}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
        >
            <Text style={styles.totalPriceText}>
                R$ {" "}
                <Text style={styles.totalPriceNumber}>
                    {completedItemsPrice.toFixed(2)}
                </Text>
            </Text>
        </LinearGradient>


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

    label: {
        color: '#FFF',
        fontSize: 14,
        marginBottom: 4
    },

    input: {
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
    },

    listContainer: {
        margin: 20,
        borderRadius: 8,
        elevation: 5,
        marginBottom: 100
        
    },

    totalPrice: {
        position: 'absolute',
        bottom: 10,
        left: 0,
        padding: 25,
        width: '60%'
    },

    totalPriceText: {
        fontSize: 20
    },

    totalPriceNumber: {
        fontSize: 28
    }
})

export default List;