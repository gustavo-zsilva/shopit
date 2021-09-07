import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native'

import {
    View,
    Text,
    TouchableNativeFeedback,
    StyleSheet,
} from 'react-native';

import { Menu } from './ListMenu';
import { useLists } from '../hooks/useLists';

type ListProps = {
    title: string,
    createdAt: string,
    id: string,
}

export function List({ title, createdAt, id }: ListProps) {

    const { navigate } = useNavigation()
    const { lists } = useLists()
    const list = lists.find(list => list.id === id)
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    function openList() {
        setIsMenuOpen(false)
        navigate('List', { list })
    }

    function closeMenu() {
        setIsMenuOpen(false)
    }

    return (
        <TouchableNativeFeedback 
            onPress={openList}
            onLongPress={() => setIsMenuOpen(!isMenuOpen)}
        >
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text>{title}</Text>
                    <Text style={styles.date}>{createdAt}</Text>
                </View>
                
                {isMenuOpen && <Menu title={title} id={id} createdAt={createdAt} closeMenu={closeMenu} />}
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