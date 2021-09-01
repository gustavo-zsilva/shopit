import { useContext } from "react";
import { CardsContext } from "../contexts/ListContext";

export function useCards() {
    return useContext(CardsContext)
}