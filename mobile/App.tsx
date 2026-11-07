import React, { useEffect } from 'react';
import { AppState, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Fraunces_600SemiBold, Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import StackNavigator from './src/navigation/StackNavigator';
import { ListsProvider, useLists } from './src/contexts/ListContext';
import { ItemProvider, useItems } from './src/contexts/ItemContext';
import { HouseProvider } from './src/contexts/HouseContext';
import { applyDueRecurring } from './src/utils/recurring';
import { colors } from './src/theme';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function ShoppingSync() {
  const { refreshStats } = useLists();
  const { reloadItems } = useItems();

  useEffect(() => {
    const run = () => {
      void applyDueRecurring()
        .then(() => refreshStats())
        .then(() => reloadItems())
        .catch((error) => console.error(error));
    };

    run();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') run();
    });
    return () => subscription.remove();
  }, [refreshStats, reloadItems]);

  return null;
}

export default function App() {
  const [loaded, error] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return <View style={{ flex: 1, backgroundColor: colors.paper }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.paper }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <ListsProvider>
          <ItemProvider>
            <HouseProvider>
              <ShoppingSync />
              <StackNavigator />
            </HouseProvider>
          </ItemProvider>
        </ListsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
