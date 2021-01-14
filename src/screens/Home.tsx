import React, {useState, useEffect} from 'react';

import 'react-native-get-random-values';

import { v4 as uuidv4 } from 'uuid';

import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    TouchableNativeFeedback,
    TextInput
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import Header from '../components/HeaderNew';
import Card from '../components/Card';

interface Data {
    title: string;
    id: string;
    createdAt: string;
}

function Home({ navigation, route }: any) {

    const [cards, setCards] = useState<Data[]>([])

    // Header State
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [listName, setListName] = useState('');

    const [isSaving, setIsSaving] = useState(false);


    // Pegar cards do AsyncStorage
    const getCards = async () => {
        try {
            const response = await AsyncStorage.getItem('cards');

            if (response === null) return;

            const data = await JSON.parse(response);

            setCards(data);
            
        } catch (err) {
            console.error(err);
        }
    }

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

    const deleteAlert = () => {

        if (cards.length <= 0) return;

        Alert.alert(
            "Esta ação irá remover todas suas listas.",
            "Deseja prosseguir?",
            [
                {
                    text: "Sim",
                    onPress: () => deleteAllLists(),
                    style: 'destructive'
                },
                {
                    text: "Voltar",
                    style: 'cancel'
                }
            ]
        )
    }

    const deleteAllLists = async () => {
        try {
            await AsyncStorage.clear();
            setCards([]);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        getCards();
    }, [])

    return (
        <View style={styles.container}>

            <Header>
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
                                        <Icon
                                            name="plus"
                                            size={32}
                                            color="#FFF"
                                        />
                                    </View>
                                </TouchableNativeFeedback>
                                
                                <TouchableNativeFeedback onPress={() => setIsModalOpen(false)}>
                                    <View style={[styles.icon, styles.minusIcon]}>
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

            <ScrollView contentContainerStyle={{alignItems: 'center'}} style={styles.scrollView}>          
                    {
                        cards.length > 0 ? (
                            cards.map((card, index) => {
                                return <Card
                                    key={index}
                                    card={card}
                                    cards={cards}
                                    index={index}
                                    navigation={navigation}
                                />
                            })
                        ) : (
                            <View style={styles.noListsMessage}>
                                <Icon
                                    name="moon"
                                    size={32}
                                    color="#517aff"
                                />
                                <Text style={styles.noListsText}>
                                    Ainda não há listas aqui.
                                </Text>
                            </View>
                        )
                    }
            </ScrollView>

            <TouchableOpacity 
                style={styles.deleteAllBtn} 
                onPress={deleteAlert}
                activeOpacity={0.5}
            >        
                <MaterialIcon
                    name="delete-outline"
                    size={28}
                    color="#FFF"
                />
            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },

    scrollView: {
        backgroundColor: '#f0f0f0',
        width: '100%',
    },

    cardsContainer: {
        width: '100%',
        alignItems: 'center',
       
    },

    noListsMessage: {
        alignItems: 'center',
        marginTop: 30
    },

    noListsText: {
        marginTop: 10,
        color: '#517aff',
        
    },

    deleteAllBtn: {
        backgroundColor: 'red',
        padding: 15,
        borderRadius: 50,
        position: 'absolute',
        bottom: 20,
        right: 20,
        shadowColor: '#000',
        shadowRadius: 1,
        elevation: 5
    },

    deleteBtnText: {
        color: '#FFF',
        fontSize: 16,
        textAlign: 'center',
        flex: 1
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

export default Home;