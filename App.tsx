import React from 'react';

import StackNavigator from './src/navigation/StackNavigator';
import { ListsProvider } from './src/contexts/ListContext'

export default function App() {
  return (
    <ListsProvider>
      <StackNavigator />
    </ListsProvider>
  );
}

