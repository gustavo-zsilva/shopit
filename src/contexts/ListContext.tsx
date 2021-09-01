import React from 'react'
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useState, useEffect } from 'react';

export const CardsContext = createContext({} as CardsContextProps)

type List = {
    id: string;
    title: string;
    items: [];
    createdAt: Date;
}

type CardsContextProps = {
    lists: List[],
    addList: (newList: List) => void,
}

type CardsProviderProps = {
    children: ReactNode;
}

export function CardsProvider({ children }: CardsProviderProps) {

    const [lists, setLists] = useState<List[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    
    async function getLists() {
        const rawLists = await AsyncStorage.getItem('cards')
        const lists = rawLists ? JSON.parse(rawLists) : null
        setLists(lists)
    }

    async function addList(newList: List) {
        const newLists = [...lists, newList]
        await AsyncStorage.setItem('cards', JSON.stringify(newLists))

        setLists(newLists)
        setIsModalOpen(false)
    }

    useEffect(() => {
        getLists()
    }, [])

    return (
        <CardsContext.Provider
            value={{
                lists,
                addList,
            }}
        >
            {children}
        </CardsContext.Provider>
    )
}