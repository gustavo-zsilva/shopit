import React, { memo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableNativeFeedback,
    TextInput,
    ScrollView,
    ImageBackground,
} from 'react-native';

import { v4 as uuid } from 'uuid';
import { LinearGradient } from 'expo-linear-gradient';

import Header from '../components/Header'

import { useLists } from '../hooks/useLists';
import { GoBackButton } from '../components/GoBackButton';
import { useItems } from '../hooks/useItems';
import { ClearItemsButton } from '../components/ClearItemsButton';
import { OpenModalButton } from '../components/OpenModalButton';
import { ItemList } from '../components/ItemList';

import Icon from 'react-native-vector-icons/Feather'
import { iconStyles } from '../styles/icons';

import { globalStyles, PrimaryColor, WhiteColor } from '../styles/global';

export default function List() {

    const { currentList } = useLists()
    const {
        items,
        addItem,
        isModalOpen,
        completedItems,
        totalPrice,
        closeModal,
    } = useItems()
    console.log('Items: ', items)

    const [itemName, setItemName] = useState('')
    const [itemPrice, setItemPrice] = useState('0')
    const [itemUnities, setItemUnities] = useState(1)

    function handleAddItem() {
        if (itemName === '') return;
        
        const newItem = {
            title: itemName,
            price: Number(Number(itemPrice).toFixed(2)),
            unities: itemUnities,
            isCompleted: false,
            id: uuid()
        }

        addItem(newItem)
        setItemName('')
        setItemPrice('0')
        setItemUnities(1)
        closeModal()
    }

    return (
        <ImageBackground source={require('../assets/shop-app-list-bg.png')} style={styles.container}>
        <ScrollView keyboardShouldPersistTaps={'handled'}>

            {/* Header */}
            <Header>
                <GoBackButton />

                <Text style={styles.headerText}>
                    {currentList?.title}
                </Text>

                <Text style={styles.headerText}>
                    {completedItems.length}/{items.length}
                </Text>

                <OpenModalButton />

                {
                    isModalOpen && (
                        <View style={globalStyles.modal}>

                            <View style={[styles.inputBlock, styles.bigInputBlock]}>
                                <Text style={globalStyles.label}>
                                    Nome
                                </Text>
                                <TextInput
                                    placeholder="ex: Cebola"
                                    style={globalStyles.input}
                                    value={itemName}
                                    onChangeText={(text) => setItemName(text)}
                                    autoFocus={true}
                                    maxLength={38}
                                    returnKeyType="done"
                                    blurOnSubmit={false}
                                />
                            </View>

                            <View style={styles.inputBlock}>
                                <Text style={globalStyles.label}>
                                    R$
                                </Text>
                                <TextInput
                                    placeholder="0"
                                    style={globalStyles.input}
                                    keyboardType="numeric"
                                    maxLength={8}
                                    value={String(itemPrice)}
                                    onChangeText={(text) => {
                                        text.replace(/[^0-9]/g, '')
                                        text.replace(/./g, ',')
                                        setItemPrice(text)
                                    }}
                                />
                            </View>

                            <View style={styles.inputBlock}>
                                <Text style={[globalStyles.label, styles.smallLabel]}>
                                    Unidades
                                </Text>
                                <TextInput
                                    placeholder="1"
                                    style={globalStyles.input}
                                    keyboardType="numeric"
                                    maxLength={3}
                                    value={String(itemUnities)}
                                    onChangeText={(text) => setItemUnities(Number(text))}
                                />
                            </View>

                            <View style={styles.modalBtnContainer}>
                                <TouchableNativeFeedback onPress={handleAddItem}>
                                    <View style={[iconStyles.icon, iconStyles.plusButton]}>
                                        <Icon
                                            name="plus"
                                            size={32}
                                            color={PrimaryColor}
                                        />
                                    </View>
                                </TouchableNativeFeedback>
                                <TouchableNativeFeedback onPress={closeModal}>
                                    <View style={[iconStyles.icon, iconStyles.minusButton]}>
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

            <ItemList />
        </ScrollView>

        <LinearGradient
            colors={['#FFF', 'transparent']}
            style={styles.totalPrice}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 1, y: 0 }}
        >
            <Text style={styles.totalPriceText}>
                R$ {" "}
                <Text style={styles.totalPriceNumber}>
                    {totalPrice.toFixed(2)}
                </Text>
            </Text>
        </LinearGradient>
            <ClearItemsButton />
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    headerText: {
        color: WhiteColor,
        fontSize: 18,
    },

    inputBlock: {
        flex: 1,
        marginRight: 10,
    },

    bigInputBlock: {
        flex: 2,
    },

    smallLabel: {
        fontSize: 11,
    },

    modalBtnContainer: {
        flexDirection: 'row',
    },

    totalPrice: {
        position: 'absolute',
        bottom: 10,
        left: 0,
        padding: 25,
        width: '60%'
    },

    totalPriceText: {
        fontSize: 20
    },

    totalPriceNumber: {
        fontSize: 28
    }
})
