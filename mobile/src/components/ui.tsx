import React, { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { colors, fonts } from '../theme';

type ButtonProps = {
  label: string;
  onPress: () => void;
  tone?: 'solid' | 'ghost' | 'danger';
  disabled?: boolean;
  icon?: React.ComponentProps<typeof Feather>['name'];
};

export function Button({ label, onPress, tone = 'solid', disabled, icon }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        tone === 'solid' && styles.solid,
        tone === 'ghost' && styles.ghost,
        tone === 'danger' && styles.danger,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      {icon && (
        <Feather
          name={icon}
          size={18}
          color={tone === 'solid' ? colors.cream : tone === 'danger' ? colors.clay : colors.mossDark}
        />
      )}
      <Text
        style={[
          styles.buttonText,
          tone === 'solid' && styles.solidText,
          tone === 'ghost' && styles.ghostText,
          tone === 'danger' && styles.dangerText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

type IconButtonProps = {
  name: React.ComponentProps<typeof Feather>['name'];
  label: string;
  onPress: () => void;
  tone?: 'card' | 'night' | 'moss';
};

export function IconButton({ name, label, onPress, tone = 'card' }: IconButtonProps) {
  const iconColor = tone === 'night' ? colors.cream : tone === 'moss' ? colors.cream : colors.ink;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.iconButton,
        tone === 'card' && styles.iconCard,
        tone === 'night' && styles.iconNight,
        tone === 'moss' && styles.iconMoss,
        pressed && styles.pressed,
      ]}
    >
      <Feather name={name} size={20} color={iconColor} />
    </Pressable>
  );
}

type FieldProps = TextInputProps & {
  label: string;
};

export function Field({ label, style, ...props }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.mute}
        selectionColor={colors.moss}
        style={[styles.input, style]}
        {...props}
      />
    </View>
  );
}

export function Stepper({
  value,
  onChange,
  label = 'Unidades',
}: {
  value: number;
  onChange: (value: number) => void;
  label?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.stepper}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={label === 'Unidades' ? 'Diminuir unidades' : 'Diminuir o intervalo'}
          disabled={value <= 1}
          onPress={() => onChange(Math.max(1, value - 1))}
          style={({ pressed }) => [styles.step, value <= 1 && styles.disabled, pressed && styles.pressed]}
        >
          <Feather name="minus" size={18} color={colors.ink} />
        </Pressable>
        <Text style={styles.stepValue}>{value}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={label === 'Unidades' ? 'Aumentar unidades' : 'Aumentar o intervalo'}
          disabled={value >= 99}
          onPress={() => onChange(Math.min(99, value + 1))}
          style={({ pressed }) => [styles.step, pressed && styles.pressed]}
        >
          <Feather name="plus" size={18} color={colors.ink} />
        </Pressable>
      </View>
    </View>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <Text style={styles.section}>{children}</Text>;
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  solid: {
    backgroundColor: colors.moss,
  },
  ghost: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
  },
  danger: {
    backgroundColor: 'transparent',
  },
  solidText: {
    color: colors.cream,
  },
  ghostText: {
    color: colors.ink,
  },
  dangerText: {
    color: colors.clay,
  },
  buttonText: {
    fontFamily: fonts.semibold,
    fontSize: 16,
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.82,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
  },
  iconNight: {
    backgroundColor: 'rgba(255,252,248,0.12)',
  },
  iconMoss: {
    backgroundColor: colors.moss,
  },
  field: {
    gap: 8,
  },
  label: {
    fontFamily: fonts.medium,
    color: colors.inkSoft,
    fontSize: 13,
  },
  input: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 16,
    fontFamily: fonts.body,
    fontSize: 17,
    color: colors.ink,
  },
  stepper: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  step: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  section: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.mute,
    marginBottom: 10,
    marginTop: 8,
  },
});
