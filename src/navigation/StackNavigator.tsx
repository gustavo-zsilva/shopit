import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack'

import Home from '../screens/Home';
import Form from '../screens/Form';

function StackNavigator() {

    const { Navigator, Screen } = createStackNavigator();

    return (
        <NavigationContainer>
            <Navigator initialRouteName="Home" headerMode="none">
                <Screen name="Home" component={Home} />

                <Screen name="Form" component={Form} />
            </Navigator>
        </NavigationContainer>
    );
}

export default StackNavigator;