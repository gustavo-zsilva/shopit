import React from 'react';
import { NavigationContainer, NavigationProp } from '@react-navigation/native';
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack'

import Home from '../screens/Home';
import List from '../screens/List';

type RootStackParamList = {
    Home: undefined,
    List: undefined
};

type HomeScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    'Home'
>;

type Props = {
    navigation: HomeScreenNavigationProp;
}

function StackNavigator() {

    const { Navigator, Screen } = createStackNavigator<RootStackParamList>();

    return (
        <NavigationContainer>
            <Navigator initialRouteName="Home" headerMode="none">
                <Screen name="Home" component={Home} />

                <Screen name="List" component={List} />
            </Navigator>
        </NavigationContainer>
    );
}

export default StackNavigator;