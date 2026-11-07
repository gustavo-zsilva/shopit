import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Crypto from 'expo-crypto';
import { Feather } from '@expo/vector-icons';

import { statsFor, useLists } from '../contexts/ListContext';
import { RootStackParamList } from '../navigation/types';
import { ShoppingList } from '../types';
import { colors, fonts } from '../theme';
import { formatBRL, formatDate } from '../utils/format';
import { tap } from '../utils/haptics';
import { Button, Field } from '../components/ui';
import { Sheet } from '../components/Sheet';
import { AccountSheet } from '../components/AccountSheet';

export default function Home() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { lists, stats, ready, addList, renameList, deleteList, clearLists, setOpenList } = useLists();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [editing, setEditing] = useState<ShoppingList | null>(null);
  const [draftName, setDraftName] = useState('');
  const [account, setAccount] = useState(false);

  function openList(list: ShoppingList) {
    setOpenList(list);
    navigation.navigate('List');
  }

  function createList() {
    const title = name.trim();
    if (!title) return;
    const list: ShoppingList = {
      id: Crypto.randomUUID(),
      title,
      createdAt: new Date().toISOString(),
    };
    addList(list);
    setName('');
    setCreating(false);
    tap('success');
    setOpenList(list);
    navigation.navigate('List');
  }

  function confirmClear() {
    Alert.alert(
      'Apagar todas as listas?',
      'As listas e os itens saem deste celular. Os preços lembrados pelos códigos continuam salvos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: () => {
            tap('warning');
            void clearLists();
          },
        },
      ],
    );
  }

  function saveRename() {
    if (!editing) return;
    const title = draftName.trim();
    if (!title) return;
    renameList(editing.id, title);
    setEditing(null);
    tap('success');
  }

  function confirmDelete(list: ShoppingList) {
    Alert.alert(
      'Excluir esta lista?',
      `"${list.title}" e os itens dela saem do celular.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            tap('warning');
            void deleteList(list.id);
            setEditing(null);
          },
        },
      ],
    );
  }

  if (!ready) {
    return <View style={styles.screen} />;
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={lists}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={{
          paddingTop: insets.top + 18,
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 120,
          flexGrow: 1,
        }}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <Text style={styles.brand}>SHOPIT</Text>
              <View style={styles.brandActions}>
                <Pressable onPress={() => setAccount(true)} hitSlop={8}>
                  <Text style={styles.quiet}>Casa</Text>
                </Pressable>
                {lists.length > 0 && (
                  <Pressable onPress={confirmClear} hitSlop={8}>
                    <Text style={styles.quiet}>Apagar tudo</Text>
                  </Pressable>
                )}
              </View>
            </View>
            <Text style={styles.title}>Suas listas</Text>
            <Text style={styles.subtitle}>
              {lists.length === 0
                ? 'Uma lista para o mercado, a feira ou a farmácia.'
                : `${lists.length} ${lists.length === 1 ? 'lista' : 'listas'} neste celular.`}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const info = statsFor(stats, item.id);
          const progress = info.count === 0 ? 0 : info.done / info.count;
          return (
            <View style={styles.card}>
              <Pressable
                accessibilityRole="button"
                onPress={() => openList(item)}
                style={({ pressed }) => [styles.cardMain, pressed && styles.pressed]}
              >
                <View style={styles.cardTop}>
                  <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.cardDate}>
                    {item.shared ? 'Casa · ' : ''}{formatDate(item.createdAt)}
                  </Text>
                </View>
                {info.count === 0 ? (
                  <Text style={styles.cardMeta}>Nenhum item ainda</Text>
                ) : (
                  <>
                    <View style={styles.track}>
                      <View style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]} />
                    </View>
                    <View style={styles.cardBottom}>
                      <Text style={styles.cardMeta}>
                        {info.done} de {info.count} no carrinho
                      </Text>
                      <Text style={styles.cardPrice}>{formatBRL(info.total)}</Text>
                    </View>
                  </>
                )}
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Opções de ${item.title}`}
                hitSlop={8}
                onPress={() => {
                  setEditing(item);
                  setDraftName(item.title);
                }}
                style={styles.more}
              >
                <Feather name="more-horizontal" size={20} color={colors.inkSoft} />
              </Pressable>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.mark}>
              <View style={styles.markLine} />
              <View style={[styles.markLine, styles.markMid]} />
              <View style={[styles.markLine, styles.markShort]} />
            </View>
            <Text style={styles.emptyTitle}>A sacola está vazia</Text>
            <Text style={styles.emptyText}>
              Crie uma lista e leve o Shopit para a loja. Dá para digitar o item ou escanear a etiqueta.
            </Text>
          </View>
        }
      />

      <View style={[styles.dock, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Button label="Nova lista" icon="plus" onPress={() => setCreating(true)} />
      </View>

      <Sheet
        visible={creating}
        title="Nova lista"
        subtitle="Um nome curto já resolve."
        onClose={() => setCreating(false)}
      >
        <Field
          label="Nome"
          value={name}
          onChangeText={setName}
          placeholder="Mercado, feira, farmácia..."
          autoFocus
          maxLength={40}
          returnKeyType="done"
          onSubmitEditing={createList}
        />
        <Button label="Criar lista" onPress={createList} disabled={!name.trim()} />
      </Sheet>

      <Sheet
        visible={editing !== null}
        title="Editar lista"
        onClose={() => setEditing(null)}
      >
        <Field
          label="Nome"
          value={draftName}
          onChangeText={setDraftName}
          maxLength={40}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={saveRename}
        />
        <Button label="Salvar" onPress={saveRename} disabled={!draftName.trim()} />
        {editing && (
          <Button label="Excluir lista" tone="danger" onPress={() => confirmDelete(editing)} />
        )}
      </Sheet>

      <AccountSheet
        visible={account}
        onClose={() => setAccount(false)}
        onJoined={() => {
          setAccount(false);
          navigation.navigate('List');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  list: {
    flex: 1,
  },
  header: {
    marginBottom: 22,
    gap: 6,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  brand: {
    fontFamily: fonts.bold,
    letterSpacing: 2.4,
    fontSize: 13,
    color: colors.moss,
  },
  quiet: {
    fontFamily: fonts.medium,
    color: colors.mute,
    fontSize: 14,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 40,
    color: colors.ink,
    marginTop: 10,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 22,
    color: colors.inkSoft,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  cardMain: {
    flex: 1,
    paddingVertical: 16,
    paddingLeft: 16,
    paddingRight: 4,
    gap: 12,
  },
  pressed: {
    opacity: 0.82,
  },
  cardTop: {
    gap: 4,
    paddingRight: 8,
  },
  cardTitle: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.ink,
  },
  cardDate: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.mute,
  },
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
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  cardMeta: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.inkSoft,
  },
  cardPrice: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.mossDark,
    fontVariant: ['tabular-nums'],
  },
  more: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: 28,
    gap: 12,
  },
  mark: {
    width: 84,
    height: 96,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    transform: [{ rotate: '-7deg' }],
    padding: 16,
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  markLine: {
    height: 6,
    borderRadius: 99,
    backgroundColor: colors.paperDeep,
    width: '100%',
  },
  markMid: {
    width: '72%',
  },
  markShort: {
    width: '46%',
    backgroundColor: colors.mossSoft,
  },
  emptyTitle: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.ink,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 23,
    color: colors.inkSoft,
    maxWidth: 320,
  },
  dock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: colors.paper,
  },
});
