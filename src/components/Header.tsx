import React, { useState } from 'react';

import {
    View,
    Text,
    StyleSheet,
    TouchableNativeFeedback,
    TextInput,
    StatusBar
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { v4 as uuidv4 } from 'uuid';

import Icon from 'react-native-vector-icons/Feather';


interface HeaderProps {
    cards: {
        title: string,
        id: string,
        createdAt: string
    }[],
    setCards: Function
}

function Header({ cards, setCards }: HeaderProps) {

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [listName, setListName] = useState('');

    const [isSaving, setIsSaving] = useState(false);

    const addNewList = async () => {
        if (listName === '') return;

        try {
            setIsSaving(true)

            const newRegister = {
                title: listName,
                items: [],
                id: uuidv4(),
                createdAt: new Date().toLocaleDateString()
            }

            // Aqui o AsyncStorage não estava salvando o último item
            // pois eu estava setando a variavel "cards" e depois 
            // passando ela para salvar, porém ela não tinha terminado de salvar ainda
            const newCards = [...cards, newRegister]

            await AsyncStorage.setItem('cards', JSON.stringify(newCards));
            await setCards(newCards);

            console.log('REGISTRADO');
            
            setIsSaving(false)
            setIsModalOpen(false)
            setListName('')
            
        } catch (err) {
            console.error(err);
            setIsSaving(false)
            setIsModalOpen(false)
            setListName('')
        }
    }

    return (
        <View style={styles.container}>
            <StatusBar translucent barStyle="default" backgroundColor="dodgerblue" />

            {/* Header */}
            <Text style={styles.text}>Suas Listas</Text>
            <TouchableNativeFeedback onPress={() => setIsModalOpen(true)}>
                <View style={styles.icon}>
                    <Icon name="plus" size={32} color="#FFF" />
                </View>
            </TouchableNativeFeedback>

            {
                isSaving && (
                    <View style={{ backgroundColor: 'red' }}>
                        <Text>Salvando...</Text>
                    </View>
                )
            }

            {/* Modal */}
            {
                isModalOpen && (
                    <View style={styles.modal}>
                        <View style={styles.inputBlock}>
                            <Text style={styles.inputLabel}>Nome da lista</Text>
                            <TextInput
                                style={styles.newListNameInput}
                                value={listName}
                                onChangeText={(text) => setListName(text)}
                                placeholder="Ex: Fruteira, Supermercado, ..."
                            />
                        </View>

                        <View style={styles.buttonBlock}>

                            <TouchableNativeFeedback onPress={addNewList}>
                                <View style={[styles.icon, styles.plusIcon]}>
                                    <Icon name="plus" size={32} color="#FFF" />
                                </View>
                            </TouchableNativeFeedback>
                            
                            <TouchableNativeFeedback onPress={() => setIsModalOpen(false)}>
                                <View style={[styles.icon, styles.minusIcon]}>
                                    <Icon name="minus" size={32} color="#FFF" />
                                </View>
                            </TouchableNativeFeedback>

                        </View>
                    </View>
                )
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        marginTop: StatusBar.currentHeight,
        backgroundColor: 'dodgerblue',
        shadowColor: '#000',
        shadowRadius: 1,
        elevation: 6
    },

    text: {
        fontSize: 20,
        color: '#FFF'
    },

    icon: {
        backgroundColor: '#517aff',
        padding: 10,
        borderRadius: 50,
        shadowColor: '#000',
        shadowRadius: 1,
        elevation: 5
    },
    
    modal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        backgroundColor: 'dodgerblue',
        padding: 24,
        elevation: 5
    },

    inputBlock: {
        flex: 1,
        marginRight: 30
    },

    buttonBlock: {
        flexDirection: 'row',
    },

    inputLabel: {
        color: '#FFF',
        fontSize: 14,
        marginBottom: 4
    },

    newListNameInput: {
        backgroundColor: '#FFF',
        padding: 6,
        borderRadius: 5,
    },

    minusIcon: {
        backgroundColor: '#ff4848',
    },

    plusIcon: {
        marginRight: 10,
        backgroundColor: '#00e200'
    }
})

export default Header;