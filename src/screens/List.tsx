import React, { useState, useEffect } from 'react';

import {
    View,
    Text,
    StyleSheet,
    TouchableNativeFeedback,
    TouchableOpacity,
    TextInput,
    Alert,
    ScrollView,
    ImageBackground,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import saveToStorage from '../utils/saveToStorage';
import { v4 as uuidv4 } from 'uuid';

import { LinearGradient } from 'expo-linear-gradient';

import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import Item from '../components/Item';
import Header from '../components/Header';

import { globalStyles, WhiteColor } from '../styles/global';
import { iconStyles } from '../styles/icons';

interface Card {
    title: string;
    items: {
        id: string;
        isCompleted: boolean;
        title: string;
        price: number;
        unities: number;
    }[];
    id: string;
    createdAt: string;
}

function List({ route }: any) {

    const navigation = useNavigation();

    const card: Card = route.params.card;
    const cards = route.params.cards;
    
    const [items, setItems] = useState([...card.items]);
    

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemName, setItemName] = useState('');
    const [itemPrice, setItemPrice] = useState(0);
    const [itemUnities, setItemUnities] = useState(1);

    const newCard = {...card}

    // Completed items array
    let completedItems = items.filter(item => item.isCompleted);

    // Sum of completed items prices
    let pricesArray = completedItems
        .map((item: any) => item.price * item.unities)
        .reduce((accumulator: number, currentValue: number) => accumulator + currentValue, 0);

    const [itemsLeft, setItemsLeft] = useState(completedItems.length);
    const [completedItemsPrice, setCompletedItemsPrice] = useState(pricesArray);


    // Function to refresh states to use between components, to avoid passing many constants on props
    const refreshStates = () => {
        completedItems = items.filter(item => item.isCompleted);
   
        pricesArray = completedItems
            .map((item: any) => item.price * item.unities)
            .reduce((accumulator: number, currentValue: number) => accumulator + currentValue, 0);

        setItemsLeft(completedItems.length);
        setCompletedItemsPrice(pricesArray);
    }

    
    const deleteAlert = () => {

        if (cards.length <= 0) return;

        Alert.alert(
            "Esta ação irá remover todas suas listas.",
            "Deseja prosseguir?",
            [
                {
                    text: "Sim",
                    onPress: () => deleteAllItems(),
                    style: 'destructive'
                },
                {
                    text: "Voltar",
                    style: 'cancel'
                }
            ]
        )
    }

    const deleteAllItems = () => {
        const newCards = [...cards];
        const cardIndex = newCards.indexOf(card);

        setItems([]);
        newCards[cardIndex].items = [];
        
        saveToStorage(AsyncStorage, newCards);
    }


    const addNewItem = () => {
        if (itemName === '') return;

        const newItem = {
            title: itemName,
            price: itemPrice,
            unities: itemUnities,
            isCompleted: false,
            id: uuidv4()
        }

        // Copy the cards array
        const newCards = [...cards];

        const indexOfCard = cards.indexOf(card);
        newCards[indexOfCard].items.push(newItem);

        // Grab the index of the current card, then push the new Item to the card's item array
        setItems(newCards[indexOfCard].items);

        saveToStorage(AsyncStorage, newCards);

        setItemName('');
    }


    useEffect(() => {
        refreshStates();
    }, [items])
    

    return (

        <ImageBackground source={require('../assets/shop-app-list-bg.png')} style={styles.container}>
        <ScrollView keyboardShouldPersistTaps={'handled'}>

            {/* Header */}
            <Header>
                <TouchableNativeFeedback onPress={() => navigation.goBack()}>
                    <View style={iconStyles.icon}>
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

                <Text style={[styles.headerText, styles.itemsLeft]}>
                    {itemsLeft}/{items.length}
                </Text>

                <TouchableOpacity onPress={() => setIsModalOpen(true)}>
                    <View style={iconStyles.icon}>
                        <Icon
                            name="plus"
                            size={32}
                            color="#FFF"
                        />
                    </View>
                </TouchableOpacity>

                {
                    isModalOpen && (
                        <View style={globalStyles.modal}>

                            <View style={[styles.inputBlock, styles.bigInputBlock]}>
                                <Text style={globalStyles.label}>
                                    Nome
                                </Text>
                                <TextInput
                                    placeholder="ex: Cebola"
                                    style={globalStyles.input}
                                    value={itemName}
                                    onChangeText={(text) => setItemName(text)}
                                    autoFocus={true}
                                    maxLength={38}
                                    returnKeyType="done"
                                    blurOnSubmit={false}
                                />
                            </View>

                            <View style={styles.inputBlock}>
                                <Text style={globalStyles.label}>
                                    R$
                                </Text>
                                <TextInput
                                    placeholder="0"
                                    style={globalStyles.input}
                                    keyboardType="numeric"
                                    // value={itemPrice}
                                    onChangeText={(text) => {
                                        text.replace(/[^0-9]/g, '');
                                        text.replace(/./g, ',')
                                        return setItemPrice(Number(text));
                                    }}
                                    maxLength={8}
                                />
                            </View>

                            <View style={styles.inputBlock}>
                                <Text style={[globalStyles.label, styles.smallLabel]}>
                                    Unidades
                                </Text>
                                <TextInput
                                    placeholder="1"
                                    style={globalStyles.input}
                                    // value={itemUnities}
                                    keyboardType="numeric"
                                    onChangeText={(text) => {
                                        text.replace(/[^0-9]/g, '');
                                        text.replace(/./g, ',')
                                        return setItemUnities(Number(text));
                                    }}
                                    maxLength={3}
                                />
                            </View>

                            <View style={styles.modalBtnContainer}>

                                <TouchableNativeFeedback onPress={addNewItem}>
                                    <View style={[iconStyles.icon, iconStyles.plusIcon]}>
                                        <Icon
                                            name="plus"
                                            size={32}
                                            color="#FFF"
                                        />
                                    </View>
                                </TouchableNativeFeedback>

                                <TouchableNativeFeedback onPress={() => setIsModalOpen(false)}>
                                    <View style={[iconStyles.icon, iconStyles.minusIcon]}>
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
            </Header>

            <View style={styles.listContainer}>
                {
                    items.map((item: any, index) => {
                        return <Item
                            key={index}
                            itemArray={[item, index]}
                            cardArray={[cards, card]}
                            refreshStates={refreshStates}
                            items={items}
                            setItems={setItems}
                        />
                    })
                }
            </View>
        </ScrollView>

        <LinearGradient
            colors={['#FFF', 'transparent']}
            style={styles.totalPrice}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 1, y: 0 }}
        >
            <Text style={styles.totalPriceText}>
                R$ {" "}
                <Text style={styles.totalPriceNumber}>
                    {completedItemsPrice.toFixed(2)}
                </Text>
            </Text>
        </LinearGradient>

        <TouchableOpacity 
            style={globalStyles.deleteBtn} 
            onPress={deleteAlert}
            activeOpacity={0.5}
        >
            <MaterialIcon
                name="delete-outline"
                size={28}
                color="#FFF"
            />
        </TouchableOpacity>

        </ImageBackground>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    headerText: {
        color: WhiteColor,
        fontSize: 18
    },

    itemsLeft: {
        fontSize: 16
    },

    inputBlock: {
        flex: 1,
        marginRight: 20
    },

    bigInputBlock: {
        flex: 2
    },

    smallLabel: {
        fontSize: 12
    },

    modalBtnContainer: {
        flexDirection: 'row'
    },

    listContainer: {
        margin: 20,
        borderRadius: 8,
        elevation: 3,
        marginBottom: 100,
        backgroundColor: 'transparent'
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