import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Crypto from 'expo-crypto';

import { Sheet } from './Sheet';
import { Button, Field, Stepper } from './ui';
import { colors, fonts } from '../theme';
import { RecurringPurchase } from '../types';
import { deleteRecurring, readRecurring, upsertRecurring } from '../utils/recurring';
import { useItems } from '../contexts/ItemContext';

type RecurringSheetProps = {
  visible: boolean;
  listId: string;
  onClose: () => void;
  onChanged: () => void;
};

export function RecurringSheet({ visible, listId, onClose, onChanged }: RecurringSheetProps) {
  const { items, addItem } = useItems();
  const [rules, setRules] = useState<RecurringPurchase[]>([]);
  const [title, setTitle] = useState('');
  const [days, setDays] = useState(7);

  async function reload() {
    const all = await readRecurring();
    setRules(all.filter((rule) => rule.listId === listId));
  }

  useEffect(() => {
    if (visible) void reload();
  }, [visible, listId]);

  async function addRule() {
    const name = title.trim();
    if (!name) return;
    const next = new Date();
    next.setDate(next.getDate() + days);
    const alreadyThere = items.some((item) => (
      !item.isCompleted && item.title.trim().toLocaleLowerCase() === name.toLocaleLowerCase()
    ));
    if (!alreadyThere) {
      addItem({
        id: Crypto.randomUUID(),
        title: name,
        price: 0,
        unities: 1,
        isCompleted: false,
      });
    }
    await upsertRecurring({
      id: Crypto.randomUUID(),
      listId,
      title: name,
      unities: 1,
      intervalDays: days,
      nextAt: next.toISOString(),
    });
    setTitle('');
    setDays(7);
    await reload();
    onChanged();
  }

  async function remove(id: string) {
    await deleteRecurring(id);
    await reload();
    onChanged();
  }

  return (
    <Sheet
      visible={visible}
      title="Compras que voltam"
      subtitle="O produto entra nesta lista agora e volta sozinho depois do prazo."
      onClose={onClose}
    >
      {rules.map((rule) => (
        <View key={rule.id} style={styles.rule}>
          <View style={styles.ruleText}>
            <Text style={styles.ruleTitle}>{rule.title}</Text>
            <Text style={styles.ruleMeta}>a cada {rule.intervalDays} {rule.intervalDays === 1 ? 'dia' : 'dias'}</Text>
          </View>
          <Pressable onPress={() => void remove(rule.id)} hitSlop={8}>
            <Text style={styles.remove}>Tirar</Text>
          </Pressable>
        </View>
      ))}
      <Field
        label="Produto"
        value={title}
        onChangeText={setTitle}
        placeholder="Banana"
        autoFocus={rules.length === 0}
      />
      <Stepper label="A cada quantos dias" value={days} onChange={setDays} />
      <Text style={styles.hint}>
        {days === 1 ? 'Entra de novo todo dia.' : `Entra de novo a cada ${days} dias.`}
      </Text>
      <Button label="Salvar repetição" onPress={() => void addRule()} disabled={!title.trim()} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  rule: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 4,
  },
  ruleText: {
    flex: 1,
    gap: 2,
  },
  ruleTitle: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.ink,
  },
  ruleMeta: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.mute,
  },
  remove: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.clay,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkSoft,
    marginTop: -6,
  },
});
