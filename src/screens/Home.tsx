import React, {useState, useEffect} from 'react';

import 'react-native-get-random-values';

import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Header from '../components/Header';
import Card from '../components/Card';

interface Data {
    title: string;
    id: string;
    createdAt: string;
}

function Home({ navigation, route }: any) {

    const [cards, setCards] = useState<Data[]>([])

    

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
            setCards([])
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        console.log('Fui chamado');
        

        getCards();
    }, [])

    return (
        <View style={styles.container}>
            <Header cards={cards} setCards={setCards} />

            <ScrollView contentContainerStyle={{alignItems: 'center'}} style={styles.scrollView}>
                
                    {
                        cards.length <= 0 && (
                            <View style={styles.noListsMessage}>
                                <Icon name="moon" size={32} color="#517aff" />
                                <Text style={styles.noListsText}>Ainda não há listas aqui.</Text>
                            </View>
                        )
                    }
                    
                    {
                        cards.map((card, index) => {
                        
                            return <Card
                                key={index}
                                card={card}
                                cards={cards}
                                index={index}
                                navigation={navigation}
                            />
                        })
                    }
            </ScrollView>

            <TouchableOpacity 
                style={styles.deleteAllBtn} 
                onPress={deleteAlert}
                activeOpacity={0.5}
            >        
                <MaterialIcon name="delete-outline" size={28} color="#FFF" />
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
    }
})

export default Home;