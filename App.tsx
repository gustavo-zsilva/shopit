import React from 'react';

import StackNavigator from './src/navigation/StackNavigator';
import { ListsProvider } from './src/contexts/ListContext'
import { ItemProvider } from './src/contexts/ItemContext';

export default function App() {
  return (
    <ListsProvider>
      <ItemProvider>
        <StackNavigator />
      </ItemProvider>
    </ListsProvider>
  );
}

