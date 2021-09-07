import React, { createContext, ReactNode, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

export const ItemContext = createContext({} as ItemContextProps)

type ItemContextProps = {
    list: List,
    items: Item[],
    addItem: (newItem: Item) => void,
    clearItems: () => void,
}

type ItemsList = {
    id: string,
    items: Item[],
}

type Item = {
    title: string,
    price: number,
    unities: number,
    isCompleted: boolean,
    id: string,
}

type List = {
    id: string;
    title: string;
    createdAt: string;
}

type ItemProviderProps = {
    children: ReactNode,
    list: List,
}

export function ItemProvider({ children, list }: ItemProviderProps) {

    const [items, setItems] = useState<Item[]>([])
    const [allItems, setAllItems] = useState<ItemsList[]>([])
    const [id, setId] = useState('')
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    async function getItems() {
        const rawItems = await AsyncStorage.getItem('items')

        if (rawItems !== null) {
            const parsedItems: ItemsList[] = JSON.parse(rawItems)
            const { items, id } = parsedItems.filter(item => item.id === list.id)[0]
            setItems(items)
            setId(id)
            setAllItems(parsedItems)
        }
    }

    function addItem(newItem: Item) {
        setItems([...items, newItem])
    }

    function clearItems() {
        Alert.alert(
            "Esta ação irá remover todos itens desta lista.",
            "Deseja prosseguir?",
            [
                {
                    text: "Sim",
                    onPress: () => setItems([]),
                    style: 'destructive'
                },
                {
                    text: "Voltar",
                    style: 'cancel'
                }
            ]
        )
    }

    async function saveToAsyncStorage() {
        const newAllItems = [...allItems]
        const currentItemsIndex = newAllItems.findIndex(item => item.id === id)
        newAllItems[currentItemsIndex].items = items
        await AsyncStorage.setItem('items', JSON.stringify(newAllItems))
    }

    useEffect(() => {
        getItems()
    }, [])

    useEffect(() => {
        saveToAsyncStorage()
    }, [items])

    return (
        <ItemContext.Provider
            value={{
                list,
                items,
                addItem,
                clearItems,
            }}
        >
            {children}
        </ItemContext.Provider>
    )
}