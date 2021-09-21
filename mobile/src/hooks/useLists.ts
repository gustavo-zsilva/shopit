import { useContext } from "react";
import { ListsContext } from "../contexts/ListContext";

export function useLists() {
    return useContext(ListsContext)
}