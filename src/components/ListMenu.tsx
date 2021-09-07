import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Vibration,
    Keyboard,
    TextInput
} from 'react-native';

import { WhiteColor } from '../styles/global';

import Icon from 'react-native-vector-icons/Feather';

import SlideDown from '../animations/SlideDown';
import { useLists } from '../hooks/useLists';

type MenuProps = {
    id: string,
    title: string,
    createdAt: string,
    closeMenu: () => void,
}

export function Menu({ id, title, createdAt, closeMenu }: MenuProps) {

    const { lists, updateLists, deleteList } = useLists()
    const [newListTitle, setNewListTitle] = useState(title);
    
    useEffect(() => {
        Vibration.vibrate(50);
    }, []);

    function handleChangeCardTitle() {
        if (newListTitle.length <= 0) return;

        const newLists = [...lists]
        newLists.map(list => list.id === id ? list.title = newListTitle : null)

        updateLists(newLists)
        closeMenu()
        Keyboard.dismiss()
    }

    function handleDeleteList() {
        deleteList(id)
    }

    return (
        <SlideDown style={styles.container} value={-30}>
            <TouchableOpacity
                activeOpacity={0.6}
                onPress={handleDeleteList}
            >
                <View style={styles.button}>
                    <View style={styles.buttonPlaceholder}>
                        <Icon name="chevron-right" size={24} color="#222" />
                        <Text style={styles.text}>Excluir</Text>
                    </View>

                    <Icon name="delete" size={26} color="#df0000" />
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                activeOpacity={0.6}
                onPress={handleChangeCardTitle}
            >
                <View style={styles.button}>
                    <View style={styles.buttonPlaceholder}>
                        <Icon name="chevron-right" size={24} color="#222" />
                        <Text style={styles.text}>Mudar nome</Text>
                    </View>

                    <TextInput
                        value={newListTitle}
                        onChangeText={(text) => setNewListTitle(text)}
                        style={styles.input}
                    />
                </View>
            </TouchableOpacity>
        </SlideDown>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: '#FFF',
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        padding: 8,
    },

    button: {
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
        flexDirection: 'row',
        height: 60
    },

    buttonPlaceholder: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    text: {
        color: '#222',
        fontWeight: '700',
    },

    input: {
        backgroundColor: '#222',
        color: WhiteColor,
        width: 120,
        padding: 4,
        borderRadius: 4
    }
})
