import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, fonts } from '../theme';
import { formatPlain } from '../utils/format';

type MoneyFieldProps = {
  value: number;
  onChange: (value: number) => void;
  autoFocus?: boolean;
};

function digitsFromValue(value: number) {
  if (!(value > 0)) return '';
  return String(Math.round(value * 100));
}

export function MoneyField({ value, onChange, autoFocus }: MoneyFieldProps) {
  const [digits, setDigits] = useState(digitsFromValue(value));
  const amount = Number(digits || '0') / 100;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Preço</Text>
      <View style={styles.row}>
        <Text style={styles.symbol}>R$</Text>
        <TextInput
          value={digits ? formatPlain(amount) : ''}
          autoFocus={autoFocus}
          placeholder="0,00"
          placeholderTextColor={colors.mute}
          selectionColor={colors.moss}
          keyboardType="number-pad"
          onChangeText={(next) => {
            const only = next.replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, 8);
            setDigits(only);
            onChange(Number(only || '0') / 100);
          }}
          style={styles.input}
        />
      </View>
      <Text style={styles.hint}>Sem vírgula: 250 vira R$ 2,50 e 2590 vira R$ 25,90.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  label: {
    fontFamily: fonts.medium,
    color: colors.inkSoft,
    fontSize: 13,
  },
  row: {
    minHeight: 72,
    borderRadius: 18,
    backgroundColor: colors.mossSoft,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  symbol: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.mossDark,
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontFamily: fonts.display,
    fontSize: 36,
    color: colors.mossDark,
    paddingVertical: 8,
    fontVariant: ['tabular-nums'],
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.mute,
  },
});
