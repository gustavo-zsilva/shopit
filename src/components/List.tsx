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

import { Menu, styles as menuStyles } from './ListMenu';

import AsyncStorage from '@react-native-async-storage/async-storage';
import saveToStorage from '../utils/saveToStorage';

import SlideSide from '../animations/SlideSide';
import { useLists } from '../hooks/useLists';

type ListProps = {
    id: string,
    title: string,
    createdAt: string,
}

export function List({ id, title, createdAt }: ListProps) {

    const { lists, updateLists, deleteList } = useLists()
    const { navigate } = useNavigation()

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const openList = () => {
        setIsMenuOpen(false);

        navigate('List');
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
                
                {isMenuOpen && <Menu title={title} id={id} createdAt={createdAt} />}
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