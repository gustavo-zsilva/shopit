import { useContext } from "react";
import { ItemContext } from "../contexts/ItemContext";

export function useItems() {
    return useContext(ItemContext)
}