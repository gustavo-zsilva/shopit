import React, { useState } from 'react';

import 'react-native-get-random-values';

import { globalStyles, WhiteColor, BgColor } from '../styles/global';
import { iconStyles } from '../styles/icons';

import { v4 as uuid } from 'uuid';

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
import { List } from '../components/List';
import SlideDown from '../animations/SlideDown';
import { useLists } from '../hooks/useLists'

function Home({ navigation }: any) {

    const [listName, setListName] = useState('');
    const { lists, getLists, addList, clearLists, isModalOpen, openModal, closeModal } = useLists()

    function handleAddList() {
        if (!listName) return

        const newList = {
            id: uuid(),
            title: listName,
            items: [],
            createdAt: new Date().toLocaleDateString(),
        }

        addList(newList)
    }

    return (
        <ImageBackground source={require('../assets/shop-app-bg.png')} style={styles.container} >

            <Header>
                <Text style={globalStyles.text}>Suas Listas</Text>
                <TouchableNativeFeedback onPress={openModal}>
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
    
                                <TouchableNativeFeedback onPress={handleAddList}>
                                    <View style={[iconStyles.icon, iconStyles.plusIcon]}>
                                        <Icon
                                            name="plus"
                                            size={32}
                                            color="#FFF"
                                        />
                                    </View>
                                </TouchableNativeFeedback>
                                
                                <TouchableNativeFeedback onPress={closeModal}>
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

            <FlatList
                data={lists}
                refreshing={false}
                onRefresh={getLists}
                keyboardShouldPersistTaps={'always'}
                renderItem={({ item }) => (
                    <List
                        key={item.id}
                        id={item.id}
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
                onPress={clearLists}
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