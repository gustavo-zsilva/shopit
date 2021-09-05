import { createContext, ReactNode, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const ItemContext = createContext({} as ItemContextProps)

type ItemContextProps = {
    list: List,
    items: Object[],
}

type List = {
    id: string;
    title: string;
    items: Object[];
    createdAt: string;
}

type ItemProviderProps = {
    children: ReactNode,
    list: List,
}

export function ItemProvider({ children, list }: ItemProviderProps) {

    const [items, setItems] = useState<Object[]>(list.items)
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    

    return (
        <ItemContext.Provider
            value={{
                list,
                items,
            }}
        >
            {children}
        </ItemContext.Provider>
    )
}