import React, { useState, useEffect } from 'react';

import { Animated } from 'react-native';

function SlideDown(props: any) {
    const value = useState(new Animated.Value(props.value || -100))[0];
    
    useEffect(() => {
        Animated.spring(value, {
            toValue: 0,
            useNativeDriver: true
        }).start();
    }, [])

    return (
        <Animated.View style={[
            props.style,
            { transform: [{ translateY: value }] }
        ]}>
            {props.children}
        </Animated.View>
    );
}

export default SlideDown;