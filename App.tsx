import React from 'react';

import StackNavigator from './src/navigation/StackNavigator';
import { CardsProvider } from './src/contexts/ListContext'

export default function App() {
  return (
    <CardsProvider>
      <StackNavigator />
    </CardsProvider>
  );
}

