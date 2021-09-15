import React, { createContext, ReactNode, useState, useEffect } from 'react'
import { Alert } from 'react-native'
import AsyncStorage from "@react-native-async-storage/async-storage"

export const ListsContext = createContext({} as ListsContextProps)

type List = {
    id: string;
    title: string;
    createdAt: string;
}

type ListsContextProps = {
    lists: List[],
    isModalOpen: boolean,
    currentList: List | null,
    addList: (newList: List) => void,
    deleteList: (id: string) => void,
    getLists: () => Promise<void>,
    updateLists: (newLists: List[]) => void,
    clearLists: () => void,
    openModal: () => void,
    closeModal: () => void,
    setOpenList: (list: List) => void,
}

type ListsProviderProps = {
    children: ReactNode;
}

export function ListsProvider({ children }: ListsProviderProps) {

    const [lists, setLists] = useState<List[]>([])
    const [currentList, setCurrentList] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    
    async function getLists() {
        const rawLists = await AsyncStorage.getItem('cards')

        if (rawLists !== null) {
            const parsedLists = JSON.parse(rawLists)
            setLists(parsedLists)
        }
    }

    async function addList(newList: List) {
        setLists([...lists, newList])
        const listItems = {
            id: newList.id,
            items: [],
        }
        
        try {
            const prevItems = await AsyncStorage.getItem('items')

            const parsedItems = prevItems === null ? [] : JSON.parse(prevItems)
            console.log('There are lists: ', parsedItems)
            const newItems = [...parsedItems, listItems]
            await AsyncStorage.setItem('items', JSON.stringify(newItems))
            setIsModalOpen(false)
            

        } catch (err) {
            console.error(err)
        }
    }

    function deleteList(id: string) {
        const newLists = lists.filter(list => list.id !== id)
        setLists(newLists)
    }

    function updateLists(newLists: List[]) {
        setLists(newLists)
    }

    function clearLists() {
        if (lists.length <= 0) return;

        Alert.alert(
            "Esta ação irá remover todas suas listas.",
            "Deseja prosseguir?",
            [
                {
                    text: "Sim",
                    onPress: async () => {
                        setLists([])
                        await AsyncStorage.clear()
                    },
                    style: 'destructive'
                },
                {
                    text: "Voltar",
                    style: 'cancel'
                }
            ]
        )
    }

    function openModal() {
        setIsModalOpen(true)
    }

    function closeModal() {
        setIsModalOpen(false)
    }

    function setOpenList(list: List) {
        setCurrentList(list)
    }

    async function saveToAsyncStorage() {
        await AsyncStorage.setItem('cards', JSON.stringify(lists))
    }

    useEffect(() => {
        getLists()
        setCurrentList(null)
    }, [])

    useEffect(() => {
        saveToAsyncStorage()
    }, [lists])

    useEffect(() => {
        console.log('Current List opened (ListContext.tsx):', currentList)
    }, [currentList])

    return (
        <ListsContext.Provider
            value={{
                lists,
                addList,
                deleteList,
                getLists,
                updateLists,
                clearLists,
                isModalOpen,
                openModal,
                closeModal,
                currentList,
                setOpenList,
            }}
        >
            {children}
        </ListsContext.Provider>
    )
}