import React, { createContext, ReactNode, useState, useEffect } from 'react'
import { Alert } from 'react-native'
import AsyncStorage from "@react-native-async-storage/async-storage"

export const ListsContext = createContext({} as ListsContextProps)

type List = {
    id: string;
    title: string;
    items: [] | never[];
    createdAt: string;
}

type ListsContextProps = {
    lists: List[],
    isModalOpen: boolean,
    addList: (newList: List) => void,
    getLists: () => Promise<void>,
    updateLists: (newLists: List[]) => void,
    clearLists: () => void,
    openModal: () => void,
    closeModal: () => void,
}

type ListsProviderProps = {
    children: ReactNode;
}

export function ListsProvider({ children }: ListsProviderProps) {

    const [lists, setLists] = useState<List[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    
    async function getLists() {
        const rawLists = await AsyncStorage.getItem('cards')
        const lists = rawLists ? JSON.parse(rawLists) : null
        setLists(lists)
    }

    function addList(newList: List) {
        setLists([...lists, newList])
        setIsModalOpen(false)
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
                    onPress: () => setLists([]),
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

    async function saveToAsyncStorage() {
        await AsyncStorage.setItem('cards', JSON.stringify(lists))
    }

    useEffect(() => {
        getLists()
    }, [])

    useEffect(() => {
        saveToAsyncStorage()
    }, [lists])

    return (
        <ListsContext.Provider
            value={{
                lists,
                addList,
                getLists,
                updateLists,
                clearLists,
                isModalOpen,
                openModal,
                closeModal,
            }}
        >
            {children}
        </ListsContext.Provider>
    )
}