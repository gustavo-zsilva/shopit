import React, {useState, useEffect} from 'react';

import 'react-native-get-random-values';

import { globalStyles, WhiteColor, BgColor } from '../styles/global';
import { iconStyles } from '../styles/icons';

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
    TextInput,
    ImageBackground
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import Header from '../components/Header';
import Card from '../components/Card';

interface Data {
    title: string;
    id: string;
    createdAt: string;
    items: Object[];
}

function Home({ navigation }: any) {

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
            setCards(newCards);
            
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
        <ImageBackground source={require('../assets/shop-app-bg.png')} style={styles.container} >

            <Header>
                <Text style={globalStyles.text}>Suas Listas</Text>
                <TouchableNativeFeedback onPress={() => setIsModalOpen(true)}>
                    <View style={iconStyles.icon}>
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
                        <View style={globalStyles.modal}>
                            <View style={styles.inputBlock}>
                                <Text style={globalStyles.label}>Nome da lista</Text>
                                <TextInput
                                    style={globalStyles.input}
                                    value={listName}
                                    onChangeText={(text) => setListName(text)}
                                    placeholder="Ex: Fruteira, Supermercado, ..."
                                />
                            </View>
    
                            <View style={styles.buttonBlock}>
    
                                <TouchableNativeFeedback onPress={addNewList}>
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

           

            
            <ScrollView contentContainerStyle={{alignItems: 'center'}} style={styles.scrollView}>          
                    {
                        cards.length > 0 ? (
                            cards.map((card, index) => {
                                return <Card
                                    key={index}
                                    card={card}
                                    cards={cards}
                                    setCards={setCards}
                                    index={index}
                                    navigation={navigation}
                                />
                            })
                        ) : (
                            <View style={styles.noListsMessage}>
                                <Icon
                                    name="moon"
                                    size={44}
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
        flex: 1
    },

    scrollView: {
        backgroundColor: 'transparent',
        width: '100%'
    },

    cardsContainer: {
        width: '100%',
        alignItems: 'center',
       
    },

    noListsMessage: {
        
        alignItems: 'center',
        marginTop: '50%',

    },

    noListsText: {
        marginTop: 10,
        color: '#517aff',
        fontSize: 16
    },

    deleteBtnText: {
        color: WhiteColor,
        fontSize: 16,
        textAlign: 'center',
        flex: 1
    },

    inputBlock: {
        flex: 1,
        marginRight: 30
    },

    buttonBlock: {
        flexDirection: 'row',
    },
})

export default Home;