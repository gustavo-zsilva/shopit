import React, { useState, useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native'

import {
    View,
    Text,
    TouchableNativeFeedback,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Animated,
    Keyboard
} from 'react-native';

import Menu, { styles as menuStyles } from './Menu';

import AsyncStorage from '@react-native-async-storage/async-storage';
import saveToStorage from '../utils/saveToStorage';

import SlideSide from '../animations/SlideSide';
import { useLists } from '../hooks/useLists';

interface CardProps {
    id: string,
    title: string,
    createdAt: string,
}

export function List({ id, title, createdAt }: CardProps) {

    const { lists, updateLists } = useLists()
    const { navigate } = useNavigation()

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [newListTitle, setNewListTitle] = useState(title);

    const openList = () => {
        setIsMenuOpen(false);

        navigate('List');
    }

    const changeCardTitle = () => {

        if (newListTitle.length <= 0) return;

        const newLists = [...lists]
        newLists.map(list => list.id === id ? list.title = newListTitle : null)

        console.log(newLists)

        updateLists(newLists)
    }

    return (
        
        <TouchableNativeFeedback 
            onPress={openList}
            onLongPress={() => setIsMenuOpen(!isMenuOpen)}
        >
            <View style={[styles.container]}>
                <View style={styles.content}>
                    <Text>{title}</Text>
                    <Text style={styles.date}>{createdAt}</Text>
                </View>
                
                {isMenuOpen && <Menu item={{ title, id, createdAt }}>
                    <TouchableOpacity
                        activeOpacity={0.6}
                        onPress={() => {
                            changeCardTitle();
                            Keyboard.dismiss();
                        }}
                    >
                        <View style={menuStyles.button}>
                            <Text style={menuStyles.text}>Mudar nome</Text>

                            <TextInput
                                value={newListTitle}
                                onChangeText={(text) => setNewListTitle(text)}
                                style={menuStyles.input}
                            />
                        </View>
                    </TouchableOpacity>
                </Menu>}
            </View>

        </TouchableNativeFeedback>
        
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFF',
        flexDirection: 'column',
        alignSelf: 'center',
        width: '90%',
        marginTop: 20,
        borderRadius: 6,
        shadowColor: '#000',
        shadowRadius: 1,
        shadowOpacity: 1,
        elevation: 2,
    },

    content: {
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    date: {
        color: 'gray',
    }
})