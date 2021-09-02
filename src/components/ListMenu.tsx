import React, { ReactNode, useEffect, useState } from 'react';

import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Vibration,
    TouchableOpacityProps,
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
}

export function Menu({ id, title, createdAt }: MenuProps) {

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
        Keyboard.dismiss()
    }

    function handleDeleteList() {
        deleteList(id)
    }

    // There will always be a "delete" button in the Menu.
    return (
        <SlideDown style={styles.container} value={-30}>

            <TouchableOpacity
                activeOpacity={0.6}
                onPress={handleDeleteList}
            >
                <View style={styles.button}>
                    <Text style={styles.text}>Excluir</Text>

                    <Icon name="delete" size={26} color="#df0000" />
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                activeOpacity={0.6}
                onPress={handleChangeCardTitle}
            >
                <View style={styles.button}>
                    <Text style={styles.text}>Mudar nome</Text>

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

export const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: '#222',
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        padding: 8,
    },

    button: {
        width: '90%',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        borderTopColor: 'gray',
        borderBottomColor: 'transparent',
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderWidth: 1,
        flexDirection: 'row',
        height: 60
    },

    text: {
        color: WhiteColor,
    },

    input: {
        backgroundColor: WhiteColor,
        width: 120,
        padding: 4,
        borderRadius: 4
    }
})
