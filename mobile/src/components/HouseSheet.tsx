import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Sheet } from './Sheet';
import { Button } from './ui';
import { colors, fonts } from '../theme';
import { useHouse } from '../contexts/HouseContext';
import { describeWhen } from '../utils/reminders';

type HouseSheetProps = {
  visible: boolean;
  shared: boolean;
  onClose: () => void;
};

export function HouseSheet({ visible, shared, onClose }: HouseSheetProps) {
  const { premium, me, house, status, shareCurrentList } = useHouse();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function share() {
    setBusy(true);
    const message = await shareCurrentList();
    setBusy(false);
    setError(message ?? '');
  }

  const people = house?.presence ?? [];
  const members = house?.members ?? [];

  return (
    <Sheet
      visible={visible}
      title="Lista da casa"
      subtitle={shared
        ? 'Quem está nesta lista vê a mudança na hora.'
        : 'Abra a lista para a família acompanhar junto.'}
      onClose={onClose}
    >
      {status !== 'online' && (
        <Text style={styles.warn}>A casa está desconectada. Confira o endereço do servidor.</Text>
      )}

      {!shared && (
        <>
          <Text style={styles.body}>
            {premium
              ? 'Você pode incluir até 4 pessoas. Elas entram com o código, sem pagar.'
              : 'Quem assina, ou usa um código de passe, é quem convida. Dá para incluir até 4 pessoas.'}
          </Text>
          <Button
            label={busy ? 'Abrindo...' : 'Abrir para a casa'}
            onPress={() => void share()}
            disabled={!premium || busy || status !== 'online'}
          />
        </>
      )}

      {shared && house && (
        <>
          <Text style={styles.label}>Código da lista</Text>
          <TextInput value={house.inviteCode} editable={false} selectTextOnFocus style={styles.code} />
          {house.ownerId === me?.id && (
            <Text style={styles.body}>
              {members.filter((member) => member.role !== 'owner').length} de 4 pessoas além de você.
            </Text>
          )}

          <Text style={styles.label}>Agora</Text>
          {people.length === 0 ? (
            <Text style={styles.body}>Ninguém com a lista aberta neste momento.</Text>
          ) : people.map((person) => (
            <Text key={person.userId} style={styles.row}>
              {person.userId === me?.id ? 'Você' : person.name}
              {person.mode === 'adding' ? ' está adicionando' : ' está na lista'}
            </Text>
          ))}

          <Text style={styles.label}>Pessoas</Text>
          {members.map((member) => (
            <View key={member.userId} style={styles.member}>
              <Text style={styles.row}>{member.userId === me?.id ? 'Você' : member.name}</Text>
              <Text style={styles.meta}>{member.role === 'owner' ? 'quem convida' : 'na casa'}</Text>
            </View>
          ))}

          <Text style={styles.label}>Histórico</Text>
          {house.activity.length === 0 ? (
            <Text style={styles.body}>Ainda não houve mudanças.</Text>
          ) : house.activity.slice(0, 30).map((entry) => (
            <View key={entry.id} style={styles.activity}>
              <Text style={styles.row}>{entry.name} {entry.text}</Text>
              <Text style={styles.meta}>{describeWhen(entry.at)}</Text>
            </View>
          ))}
        </>
      )}

      {error ? <Text style={styles.warn}>{error}</Text> : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.inkSoft,
    marginTop: 4,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 21,
    color: colors.inkSoft,
  },
  warn: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.clay,
  },
  code: {
    fontFamily: fonts.display,
    fontSize: 28,
    letterSpacing: 2,
    color: colors.mossDark,
    backgroundColor: colors.mossSoft,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  row: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.ink,
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.mute,
  },
  member: {
    gap: 2,
  },
  activity: {
    gap: 2,
    paddingBottom: 8,
  },
});
