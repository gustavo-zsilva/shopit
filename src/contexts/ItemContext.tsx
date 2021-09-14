import React, { createContext, ReactNode, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { useLists } from "../hooks/useLists";

export const ItemContext = createContext({} as ItemContextProps)

type ItemContextProps = {
    items: Item[],
    completedItems: Item[],
    totalPrice: number,
    isModalOpen: boolean,
    addItem: (newItem: Item) => void,
    getItems: () => void,
    clearItems: () => void,
    updateItems: (newItems: Item[]) => void,
    openModal: () => void,
    closeModal: () => void,
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

type ItemProviderProps = {
    children: ReactNode,
}

export function ItemProvider({ children }: ItemProviderProps) {

    const [items, setItems] = useState<Item[]>([])
    const completedItems = items.filter(item => item.isCompleted)
    const [totalPrice, setTotalPrice] = useState(0)
    
    const [allItems, setAllItems] = useState<ItemsList[]>([])
    const [currentItemListId, setCurrentItemListId] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const { currentList } = useLists()

    async function getItems() {
        try {
            const rawItems = await AsyncStorage.getItem('items')

            if (rawItems !== null) {
                const parsedItems: ItemsList[] = JSON.parse(rawItems)
                const currentItemList = parsedItems.filter(item => item.id === currentList?.id)[0]
                console.log('RAWITEMS !== NULL')
                console.log('Items Id (ItemContext.tsx):', parsedItems)
                setItems(currentItemList.items)
                setCurrentItemListId(currentItemList.id)
                setAllItems(parsedItems)
            }
        } catch (err) {
            console.error(err)
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

    function updateItems(newItems: Item[]) {
        setItems(newItems)
    }

    async function saveToAsyncStorage() {
        const newAllItems = [...allItems]
        const itemsIndex = allItems.findIndex(item => item.id === currentItemListId)
        newAllItems[itemsIndex].items = items
        console.log('newAllItems (ItemContext.tsx):', newAllItems)

        await AsyncStorage.setItem('items', JSON.stringify(newAllItems))
    }

    function openModal() {
        setIsModalOpen(true)
    }

    function closeModal() {
        setIsModalOpen(false)
    }

    function calculateTotalPrice() {
        const finalPrice = completedItems.map(item => item.price * item.unities)
            .reduce((prevNumber, currentNumber) => prevNumber + currentNumber, 0)
        setTotalPrice(finalPrice)
    }

    useEffect(() => {
        saveToAsyncStorage()
    }, [items])

    useEffect(() => {
        calculateTotalPrice()
    }, [completedItems])

    useEffect(() => {
        getItems()
        return () => setItems([])
    }, [currentList])

    return (
        <ItemContext.Provider
            value={{
                items,
                completedItems,
                totalPrice,
                addItem,
                getItems,
                clearItems,
                updateItems,
                isModalOpen,
                openModal,
                closeModal,
            }}
        >
            {children}
        </ItemContext.Provider>
    )
}