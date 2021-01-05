import React, {useState, useEffect} from 'react';

import 'react-native-get-random-values';

import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { v4 as uuidv4 } from 'uuid'
import AsyncStorage from '@react-native-async-storage/async-storage';

import Header from '../components/Header';
import Card from '../components/Card';

interface Data {
    title: String;
    id: String;
    createdAt: String;
}

function Home({ navigation }: any) {

    const [cards, setCards] = useState<Data[]>([])

    const getCards = async () => {
        try {
            

            const response = await AsyncStorage.getItem('@cards');


            if (response) {
                const data: Data = JSON.parse(response)
                setCards([...cards, data]);
                // console.log(cards)
            }
        } catch (err) {
            console.error(err);
        }
    }

    const setCard = async () => {
        try {
            await AsyncStorage.setItem('@cards', JSON.stringify({title: 'hello world', id: uuidv4(), createdAt: new Date().toLocaleDateString()}))
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        // setCard()

        getCards()

    }, [])

    return (
        <View>
            <Header navigation={navigation} />

            <ScrollView>
                <View style={styles.container}>
                    {
                        cards.map((card, index) => {
                           
                            return <Card
                                key={index}
                                title={card.title}
                                createdAt={card.createdAt}
                                cards={cards}
                                index={index}
                            />
                        })
                    }
                
                </View>
            </ScrollView>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: '100%',
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        width: '100%'
    }
})

export default Home;