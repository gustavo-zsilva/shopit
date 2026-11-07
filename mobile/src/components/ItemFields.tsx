import React from 'react';
import { View } from 'react-native';

import { Field, Stepper } from './ui';
import { MoneyField } from './MoneyField';

type ItemFieldsProps = {
  title: string;
  price: number;
  unities: number;
  priceKey: string;
  focus?: 'title' | 'price' | 'none';
  store?: string;
  onChangeTitle: (value: string) => void;
  onChangePrice: (value: number) => void;
  onChangeUnities: (value: number) => void;
  onChangeStore?: (value: string) => void;
};

export function ItemFields({
  title,
  price,
  unities,
  priceKey,
  focus = 'title',
  store = '',
  onChangeTitle,
  onChangePrice,
  onChangeUnities,
  onChangeStore,
}: ItemFieldsProps) {
  return (
    <View style={{ gap: 14 }}>
      <Field
        label="Nome"
        value={title}
        onChangeText={onChangeTitle}
        placeholder="Arroz, leite, sabonete..."
        autoFocus={focus !== 'price' && focus !== 'none'}
        maxLength={48}
        returnKeyType="done"
      />
      <MoneyField
        key={priceKey}
        value={price}
        onChange={onChangePrice}
        autoFocus={focus === 'price'}
      />
      <Stepper value={unities} onChange={onChangeUnities} />
      {onChangeStore && (
        <Field
          label="Mercado"
          value={store}
          onChangeText={onChangeStore}
          placeholder="Extra, feira, farmácia..."
          maxLength={32}
        />
      )}
    </View>
  );
}
