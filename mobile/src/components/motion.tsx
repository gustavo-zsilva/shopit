import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { colors } from '../theme';

export function FadeIn({
  children,
  delay = 0,
  style,
}: {
  children: ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const shift = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 340,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(shift, {
        toValue: 0,
        duration: 340,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, opacity, shift]);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY: shift }] }]}>
      {children}
    </Animated.View>
  );
}

export function ProgressBar({ value }: { value: number }) {
  const width = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(width, {
      toValue: Math.max(0, Math.min(1, value)),
      duration: 380,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [value, width]);

  return (
    <View style={styles.track}>
      <Animated.View
        style={[
          styles.fill,
          {
            width: width.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
}

export function Collapse({ open, children }: { open: boolean; children: ReactNode }) {
  const progress = useRef(new Animated.Value(open ? 1 : 0)).current;
  const [height, setHeight] = useState(0);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: open ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [open, progress]);

  const maxHeight = height > 0
    ? progress.interpolate({ inputRange: [0, 1], outputRange: [0, height] })
    : undefined;

  return (
    <Animated.View style={{ maxHeight: open || height > 0 ? maxHeight : 0, overflow: 'hidden' }}>
      <View
        onLayout={(event) => {
          const next = Math.ceil(event.nativeEvent.layout.height);
          if (next > 0 && next !== height) setHeight(next);
        }}
      >
        {children}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: 99,
    backgroundColor: colors.paperDeep,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.moss,
    borderRadius: 99,
  },
});
