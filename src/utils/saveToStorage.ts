async function saveToStorage(asyncStorage: any, cards: any) {
    try {
        await asyncStorage.setItem('cards', JSON.stringify(cards));

        return { success: true };
    } catch (err) {
        console.error(err);

        return { success: false };
    }
}

export default saveToStorage;