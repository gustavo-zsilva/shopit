import React, { ReactNode, useEffect, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Easing,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts } from '../theme';

type SheetProps = {
  visible: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
};

export function Sheet({ visible, title, subtitle, onClose, children }: SheetProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [keyboardOverlap, setKeyboardOverlap] = useState(0);
  const [mounted, setMounted] = useState(visible);
  const progress = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    let active = true;
    if (visible) setMounted(true);
    const animation = Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: visible ? 260 : 180,
      easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start(({ finished }) => {
      if (!visible && active && finished) setMounted(false);
    });
    return () => {
      active = false;
      animation.stop();
    };
  }, [visible, progress]);

  useEffect(() => {
    if (!visible) {
      setKeyboardOverlap(0);
      return undefined;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => subscription.remove();
  }, [visible, onClose]);

  useEffect(() => {
    if (!visible) return undefined;

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, (event) => {
      const top = event.endCoordinates.screenY;
      const overlap = top > 0 ? Math.max(0, Math.round(height - top)) : Math.round(event.endCoordinates.height);
      setKeyboardOverlap(overlap);
    });
    const hide = Keyboard.addListener(hideEvent, () => setKeyboardOverlap(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, [visible, height]);

  if (!mounted) return null;

  const bottomGap = keyboardOverlap > 0 ? 8 : Math.max(insets.bottom, 16);
  const available = Math.max(220, height - keyboardOverlap - bottomGap - 12);
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [28, 0],
  });

  return (
    <View style={styles.overlay} pointerEvents={visible ? 'box-none' : 'none'}>
      <Animated.View style={[styles.backdrop, { opacity: progress }]}>
        <Pressable style={styles.backdropPress} onPress={onClose} accessibilityLabel="Fechar" />
      </Animated.View>
      <View style={{ marginBottom: keyboardOverlap }}>
        <Animated.View style={[styles.sheet, { maxHeight: available, paddingBottom: bottomGap, opacity: progress, transform: [{ translateY }] }]}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.handle} />
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            <View style={styles.body}>{children}</View>
          </ScrollView>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 30,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(20, 18, 15, 0.46)',
  },
  backdropPress: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    width: '100%',
  },
  scrollContent: {
    width: '100%',
  },
  handle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.ink,
  },
  subtitle: {
    marginTop: 6,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 21,
    color: colors.inkSoft,
  },
  body: {
    marginTop: 18,
    gap: 14,
  },
});
