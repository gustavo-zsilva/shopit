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
    ImageBackground,
    Animated,
    FlatList
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import Header from '../components/Header';
import Card from '../components/Card';
import SlideDown from '../animations/SlideDown';

function Home({ navigation }: any) {

    const [listName, setListName] = useState('');

    // const deleteAlert = () => {

    //     if (cards.length <= 0) return;

    //     Alert.alert(
    //         "Esta ação irá remover todas suas listas.",
    //         "Deseja prosseguir?",
    //         [
    //             {
    //                 text: "Sim",
    //                 onPress: () => deleteAllLists(),
    //                 style: 'destructive'
    //             },
    //             {
    //                 text: "Voltar",
    //                 style: 'cancel'
    //             }
    //         ]
    //     )
    // }

    // const deleteAllLists = async () => {
    //     try {
    //         await AsyncStorage.clear();
    //         setCards([]);
    //     } catch (err) {
    //         console.error(err);
    //     }
    // }

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
                    isModalOpen && (
                        <SlideDown style={globalStyles.modal}>
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
    
                                <TouchableNativeFeedback>
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
                        </SlideDown>
                    )
                }
            </Header>

           

            
            {/* <ScrollView contentContainerStyle={{alignItems: 'center'}} style={styles.scrollView}>          
                    
            </ScrollView> */}
            

            {/* <FlatList
                data={cards}
                refreshing={false}
                onRefresh={getCards}
                keyboardShouldPersistTaps={'always'}
                renderItem={({ item, index }) => (
                    <Card
                        key={index}
                        card={item}
                        cards={cards}
                        setCards={setCards}
                        index={index}
                        navigation={navigation}
                    />
                )}
                ListEmptyComponent={
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
                }
            />
           
            

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
            </TouchableOpacity> */}

        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },

    flatList: {
        backgroundColor: 'transparent',
        width: '100%',
        
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