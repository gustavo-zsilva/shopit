import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Crypto from 'expo-crypto';
import { Feather } from '@expo/vector-icons';

import { useLists } from '../contexts/ListContext';
import { useItems } from '../contexts/ItemContext';
import { RootStackParamList } from '../navigation/types';
import { Category, Item } from '../types';
import { colors, fonts } from '../theme';
import { formatBRL } from '../utils/format';
import { tap } from '../utils/haptics';
import { Button, IconButton, SectionLabel } from '../components/ui';
import { CategoryCard, ProductRow, categorySummary } from '../components/CategoryCard';
import { CategoryPicker, CategorySheet } from '../components/CategorySheet';
import { FadeIn, ProgressBar } from '../components/motion';
import { CategoryIcon, MAX_CATEGORIES } from '../categories';
import { Sheet } from '../components/Sheet';
import { ItemFields } from '../components/ItemFields';
import { VoiceSheet } from '../components/VoiceSheet';
import { ReminderSheet } from '../components/ReminderSheet';
import { RecurringSheet } from '../components/RecurringSheet';
import { HouseSheet } from '../components/HouseSheet';
import { useHouse } from '../contexts/HouseContext';
import { pricesFor, PriceRecord } from '../utils/priceHistory';
import { SpokenItem } from '../utils/parseSpeech';
import { clearReminder, reminderFor, scheduleReminder, ShoppingReminder, describeWhen } from '../utils/reminders';
import { readRecurring } from '../utils/recurring';
import { RecurringPurchase } from '../types';

type EditorState =
  | { mode: 'create' }
  | { mode: 'edit'; item: Item }
  | null;

export default function ListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { currentList, deleteList } = useLists();
  const {
    items,
    totalPrice,
    estimatedPrice,
    categories,
    addItem,
    updateItem,
    moveItem,
    toggleItem,
    deleteItem,
    clearItems,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useItems();
  const [editor, setEditor] = useState<EditorState>(null);
  const [folded, setFolded] = useState<Record<string, boolean>>({});
  const [moving, setMoving] = useState<Item | null>(null);
  const [categoryEditor, setCategoryEditor] = useState<Category | 'new' | null>(null);
  const [menu, setMenu] = useState(false);
  const [voice, setVoice] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [repeatOpen, setRepeatOpen] = useState(false);
  const [reminder, setReminder] = useState<ShoppingReminder | null>(null);
  const [repeats, setRepeats] = useState<RecurringPurchase[]>([]);
  const [houseOpen, setHouseOpen] = useState(false);
  const { house, setAdding, remaining, consume } = useHouse();

  useEffect(() => {
    if (!currentList) navigation.goBack();
  }, [currentList, navigation]);

  async function refreshExtras() {
    if (!currentList) return;
    const [nextReminder, rules] = await Promise.all([
      reminderFor(currentList.id),
      readRecurring(),
    ]);
    setReminder(nextReminder);
    setRepeats(rules.filter((rule) => rule.listId === currentList.id));
  }

  useEffect(() => {
    void refreshExtras();
  }, [currentList?.id]);

  useEffect(() => {
    if (!currentList) return undefined;
    let cancel = false;
    AsyncStorage.getItem('categoryFolds')
      .then((raw) => {
        if (cancel || !raw) return;
        const all = JSON.parse(raw) as Record<string, string[]>;
        const ids = Array.isArray(all[currentList.id]) ? all[currentList.id] : [];
        const next: Record<string, boolean> = {};
        for (const id of ids) next[id] = true;
        setFolded(next);
      })
      .catch(() => undefined);
    return () => {
      cancel = true;
    };
  }, [currentList?.id]);

  function toggleFold(id: string) {
    if (!currentList) return;
    setFolded((current) => {
      const next = { ...current, [id]: !current[id] };
      const ids = Object.entries(next).filter(([, closed]) => closed).map(([key]) => key);
      void AsyncStorage.getItem('categoryFolds').then((raw) => {
        const all = raw ? JSON.parse(raw) as Record<string, string[]> : {};
        all[currentList.id] = ids;
        return AsyncStorage.setItem('categoryFolds', JSON.stringify(all));
      }).catch(() => undefined);
      return next;
    });
    tap('light');
  }

  useEffect(() => {
    setAdding(voice || editor !== null);
    return () => setAdding(false);
  }, [voice, editor, setAdding]);

  const pending = items.filter((item) => !item.isCompleted);
  const done = items.filter((item) => item.isCompleted);
  const sections = [
    pending.length ? { title: 'Para pegar', data: pending } : null,
    done.length ? { title: 'No carrinho', data: done } : null,
  ].filter((section): section is { title: string; data: Item[] } => section !== null);

  function saveItem(draft: { title: string; price: number; unities: number; store: string; categoryId: string | null }) {
    const title = draft.title.trim();
    if (!title || !editor) return;
    const unities = Math.max(1, Math.round(draft.unities) || 1);
    const price = Number.isFinite(draft.price) ? draft.price : 0;
    const store = draft.store.trim() || undefined;

    if (editor.mode === 'create') {
      addItem({
        id: Crypto.randomUUID(),
        title,
        price,
        unities,
        store,
        categoryId: draft.categoryId || undefined,
        isCompleted: false,
      });
    } else {
      updateItem(editor.item.id, { title, price, unities, store, categoryId: draft.categoryId });
    }

    setEditor(null);
    tap('success');
  }

  function addSpoken(item: SpokenItem) {
    addItem({
      id: Crypto.randomUUID(),
      title: item.title,
      price: item.price ?? 0,
      unities: item.unities,
      note: item.note,
      isCompleted: false,
    });
  }

  function confirmClear() {
    Alert.alert(
      'Esvaziar esta lista?',
      'Os itens saem. A lista continua.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Esvaziar',
          style: 'destructive',
          onPress: () => {
            clearItems();
            setMenu(false);
            tap('warning');
          },
        },
      ],
    );
  }

  function confirmDeleteList() {
    if (!currentList) return;
    Alert.alert(
      'Excluir esta lista?',
      `"${currentList.title}" e os itens dela saem do celular.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            tap('warning');
            void deleteList(currentList.id);
            navigation.goBack();
          },
        },
      ],
    );
  }

  function saveCategory(draft: { name: string; color: string; icon: CategoryIcon }) {
    if (categoryEditor && categoryEditor !== 'new') {
      updateCategory({ ...categoryEditor, ...draft, name: draft.name.trim() });
      setCategoryEditor(null);
      tap('success');
      return;
    }
    if (categories.length >= MAX_CATEGORIES) {
      Alert.alert('Limite de categorias', 'Dá para ter até 12 categorias nesta lista.');
      return;
    }
    const created = addCategory({
      id: Crypto.randomUUID(),
      name: draft.name.trim(),
      color: draft.color,
      icon: draft.icon,
    });
    if (!created) {
      Alert.alert('Limite de categorias', 'Dá para ter até 12 categorias nesta lista.');
      return;
    }
    setCategoryEditor(null);
    tap('success');
  }

  function confirmDeleteCategory(category: Category) {
    Alert.alert(
      'Excluir esta categoria?',
      'Os produtos continuam na lista. Eles só saem desse grupo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            deleteCategory(category.id);
            setCategoryEditor(null);
            tap('warning');
          },
        },
      ],
    );
  }

  if (!currentList) return <View style={styles.screen} />;

  const progress = items.length === 0 ? 0 : done.length / items.length;
  const loose = items.filter((item) => !categories.some((category) => category.id === item.categoryId));

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <IconButton name="arrow-left" label="Voltar" onPress={() => navigation.goBack()} />
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={1}>{currentList.title}</Text>
          <Text style={styles.subtitle}>
            {reminder
              ? `Lembrete ${describeWhen(reminder.at)}`
              : items.length === 0
                ? 'Nada por aqui ainda'
                : `${done.length} de ${items.length} no carrinho`}
          </Text>
          {house && house.presence.length > 0 && (
            <Text style={styles.subtitle}>
              {house.presence.map((person) => (
                person.mode === 'adding' ? `${person.name} está adicionando` : person.name
              )).join(' · ')}
            </Text>
          )}
        </View>
        <IconButton name="more-horizontal" label="Opções da lista" onPress={() => setMenu(true)} />
      </View>

      <View style={styles.progressWrap}>
        <ProgressBar value={progress} />
        {categories.length === 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Organizar em categorias"
            onPress={() => setCategoryEditor('new')}
            hitSlop={8}
            style={styles.organize}
          >
            <Text style={styles.organizeText}>Organizar em categorias</Text>
          </Pressable>
        )}
      </View>

      {items.length === 0 && categories.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Nada nesta lista</Text>
          <Text style={styles.emptyText}>
            Fale a compra, escaneie o código ou digite o item. Marque quando ele entrar no carrinho — o total de baixo soma só esses.
          </Text>
        </View>
      ) : categories.length === 0 ? (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 170 }}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => <SectionLabel>{section.title}</SectionLabel>}
          renderItem={({ item }) => (
            <ProductRow
              item={item}
              onToggle={() => {
                toggleItem(item.id);
                tap('light');
              }}
              onEdit={() => setEditor({ mode: 'edit', item })}
            />
          )}
        />
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 170, paddingTop: 8 }}
        >
          {categories.map((category) => {
            const group = items.filter((item) => item.categoryId === category.id);
            const summary = categorySummary(group);
            return (
              <CategoryCard
                key={category.id}
                name={category.name}
                color={category.color}
                icon={category.icon}
                summary={summary.label}
                open={!folded[category.id]}
                onToggle={() => toggleFold(category.id)}
                onEdit={() => setCategoryEditor(category)}
                empty={group.length === 0 ? 'Mova um produto para cá.' : undefined}
              >
                {group.map((item) => (
                  <ProductRow
                    key={item.id}
                    grouped
                    item={item}
                    onToggle={() => {
                      toggleItem(item.id);
                      tap('light');
                    }}
                    onEdit={() => setEditor({ mode: 'edit', item })}
                    onMove={() => setMoving(item)}
                  />
                ))}
              </CategoryCard>
            );
          })}
          {loose.length > 0 && (
            <CategoryCard
              name="Sem categoria"
              color={colors.mute}
              icon="tag"
              summary={categorySummary(loose).label}
              open={!folded.loose}
              onToggle={() => toggleFold('loose')}
            >
              {loose.map((item) => (
                <ProductRow
                  key={item.id}
                  grouped
                  item={item}
                  onToggle={() => {
                    toggleItem(item.id);
                    tap('light');
                  }}
                  onEdit={() => setEditor({ mode: 'edit', item })}
                  onMove={() => setMoving(item)}
                />
              ))}
            </CategoryCard>
          )}
        </ScrollView>
      )}

      <FadeIn style={[styles.dock, { paddingBottom: Math.max(insets.bottom, 12) }]} delay={40}>
        <View style={styles.totalBlock}>
          <Text style={styles.totalLabel}>No carrinho</Text>
          <Text style={styles.totalValue}>{formatBRL(totalPrice)}</Text>
          <Text style={styles.estimate}>Lista inteira {formatBRL(estimatedPrice)}</Text>
        </View>
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Escanear etiqueta"
            onPress={() => navigation.navigate('Scanner')}
            style={({ pressed }) => [styles.action, styles.actionGhost, pressed && styles.pressed]}
          >
            <Feather name="camera" size={18} color={colors.mossDark} />
            <Text style={styles.actionGhostText}>Escanear</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Falar a compra"
            onPress={() => {
              if (remaining('voice') === 0) {
                Alert.alert('Frases do mês esgotadas', 'No grátis são 3 frases por mês. Um código premium libera a voz.');
                return;
              }
              setVoice(true);
            }}
            style={({ pressed }) => [styles.action, styles.actionGhost, pressed && styles.pressed]}
          >
            <Feather name="mic" size={18} color={colors.mossDark} />
            <Text style={styles.actionGhostText}>Falar</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Adicionar item"
            onPress={() => setEditor({ mode: 'create' })}
            style={({ pressed }) => [styles.action, styles.actionSolid, pressed && styles.pressed]}
          >
            <Feather name="plus" size={18} color={colors.cream} />
            <Text style={styles.actionSolidText}>Item</Text>
          </Pressable>
        </View>
      </FadeIn>

      <ItemEditor
        editor={editor}
        categories={categories}
        onClose={() => setEditor(null)}
        onSave={saveItem}
        onDelete={() => {
          if (!editor || editor.mode !== 'edit') return;
          deleteItem(editor.item.id);
          setEditor(null);
          tap('warning');
        }}
      />

      <Sheet visible={menu} title="Opções" onClose={() => setMenu(false)}>
        <Button
          label="Nova categoria"
          tone="ghost"
          onPress={() => {
            setMenu(false);
            setCategoryEditor('new');
          }}
        />
        <Button
          label={currentList.shared ? 'Lista da casa' : 'Abrir para a casa'}
          tone="ghost"
          onPress={() => {
            setMenu(false);
            setHouseOpen(true);
          }}
        />
        <Button
          label="Lembrar de comprar"
          tone="ghost"
          onPress={() => {
            setMenu(false);
            setReminderOpen(true);
          }}
        />
        <Button
          label={repeats.length ? `Repetições (${repeats.length})` : 'Compras que voltam'}
          tone="ghost"
          onPress={() => {
            setMenu(false);
            setRepeatOpen(true);
          }}
        />
        <Button
          label="Esvaziar lista"
          tone="ghost"
          onPress={confirmClear}
          disabled={items.length === 0}
        />
        <Button label="Excluir lista" tone="danger" onPress={confirmDeleteList} />
      </Sheet>

      <VoiceSheet
        visible={voice}
        onClose={() => setVoice(false)}
        onConfirm={(spoken, due) => {
          void consume('voice').then((allowed) => {
            if (!allowed) {
              Alert.alert('Frases do mês esgotadas', 'No grátis são 3 frases por mês. Um código premium libera a voz.');
              return;
            }
            for (const item of spoken) addSpoken(item);
            if (due && currentList) {
              void scheduleReminder(currentList.id, currentList.title, due)
                .then((next) => {
                  if (next) setReminder(next);
                  else Alert.alert('Não marquei o aviso', 'Permita as notificações para lembrar dessa compra.');
                })
                .catch(() => {
                  Alert.alert('Não marquei o aviso', 'Permita as notificações para lembrar dessa compra.');
                });
            }
          });
        }}
      />
      <ReminderSheet
        visible={reminderOpen}
        current={reminder}
        onClose={() => setReminderOpen(false)}
        onSchedule={(when) => {
          if (!currentList) return;
          void scheduleReminder(currentList.id, currentList.title, when)
            .then((next) => {
              setReminderOpen(false);
              if (next) setReminder(next);
              else Alert.alert('Não marquei o aviso', 'Escolha um horário que ainda não passou e permita as notificações.');
            })
            .catch(() => {
              setReminderOpen(false);
              Alert.alert('Não marquei o aviso', 'Escolha um horário que ainda não passou e permita as notificações.');
            });
        }}
        onClear={() => {
          if (!currentList) return;
          void clearReminder(currentList.id).then(() => {
            setReminder(null);
            setReminderOpen(false);
          });
        }}
      />
      <HouseSheet
        visible={houseOpen}
        shared={Boolean(currentList.shared)}
        onClose={() => setHouseOpen(false)}
      />
      <CategorySheet
        visible={categoryEditor !== null}
        initial={categoryEditor && categoryEditor !== 'new' ? categoryEditor : null}
        onClose={() => setCategoryEditor(null)}
        onSave={saveCategory}
        onDelete={categoryEditor && categoryEditor !== 'new' ? () => confirmDeleteCategory(categoryEditor) : undefined}
      />
      <Sheet
        visible={moving !== null}
        title="Mover produto"
        subtitle={moving?.title}
        onClose={() => setMoving(null)}
      >
        {moving?.categoryId && (
          <Button
            label="Tirar da categoria"
            tone="ghost"
            onPress={() => {
              moveItem(moving.id, null);
              setMoving(null);
              tap('light');
            }}
          />
        )}
        {categories.map((category) => (
          <Button
            key={category.id}
            label={category.name}
            icon={category.icon}
            tone={moving?.categoryId === category.id ? 'solid' : 'ghost'}
            onPress={() => {
              if (!moving) return;
              moveItem(moving.id, category.id);
              setMoving(null);
              tap('light');
            }}
          />
        ))}
      </Sheet>
      {currentList && (
        <RecurringSheet
          visible={repeatOpen}
          listId={currentList.id}
          onClose={() => setRepeatOpen(false)}
          onChanged={() => void refreshExtras()}
        />
      )}
    </View>
  );
}

function ItemEditor({
  editor,
  categories,
  onClose,
  onSave,
  onDelete,
}: {
  editor: EditorState;
  categories: Category[];
  onClose: () => void;
  onSave: (draft: { title: string; price: number; unities: number; store: string; categoryId: string | null }) => void;
  onDelete: () => void;
}) {
  const remembered = useRef<Exclude<EditorState, null> | null>(null);
  if (editor) remembered.current = editor;
  const shown = editor ?? remembered.current;
  const initial = shown?.mode === 'edit' ? shown.item : null;
  const [title, setTitle] = useState(initial?.title ?? '');
  const [price, setPrice] = useState(initial?.price ?? 0);
  const [unities, setUnities] = useState(initial?.unities ?? 1);
  const [store, setStore] = useState(initial?.store ?? '');
  const [categoryId, setCategoryId] = useState<string | null>(initial?.categoryId ?? null);
  const [history, setHistory] = useState<PriceRecord[]>([]);

  useEffect(() => {
    if (!editor) return;
    const item = editor.mode === 'edit' ? editor.item : null;
    setTitle(item?.title ?? '');
    setPrice(item?.price ?? 0);
    setUnities(item?.unities ?? 1);
    setStore(item?.store ?? '');
    setCategoryId(item?.categoryId ?? null);
  }, [editor]);

  useEffect(() => {
    const name = title.trim();
    if (name.length < 2) {
      setHistory([]);
      return undefined;
    }
    const timer = setTimeout(() => {
      void pricesFor(name, initial?.barcode).then(setHistory);
    }, 200);
    return () => clearTimeout(timer);
  }, [title, initial?.barcode]);

  if (!shown) return null;
  const creating = shown.mode === 'create';

  return (
    <Sheet
      visible={editor !== null}
      title={creating ? 'Novo item' : 'Editar item'}
      subtitle={creating ? 'O preço pode ficar para a hora da etiqueta.' : undefined}
      onClose={onClose}
    >
      <ItemFields
        title={title}
        price={price}
        unities={unities}
        priceKey={initial?.id ?? 'new'}
        onChangeTitle={setTitle}
        onChangePrice={setPrice}
        onChangeUnities={setUnities}
        store={store}
        onChangeStore={setStore}
      />
      {categories.length > 0 && (
        <CategoryPicker categories={categories} value={categoryId} onChange={setCategoryId} />
      )}
      {history[0] && (
        <Text style={styles.history}>
          Última vez: {formatBRL(history[0].price)}
          {history[0].store ? ` no ${history[0].store}` : ''}
          {history.length > 1 ? ` · ${history.length} preços guardados` : ''}
        </Text>
      )}
      <Button
        label={creating ? 'Adicionar' : 'Salvar'}
        onPress={() => onSave({ title, price, unities, store, categoryId })}
        disabled={!title.trim()}
      />
      {!creating && (
        <Button label="Excluir item" tone="danger" onPress={onDelete} />
      )}
    </Sheet>
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
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.inkSoft,
  },
  progressWrap: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 10,
  },
  organize: {
    alignSelf: 'flex-start',
  },
  organizeText: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.mossDark,
  },
  empty: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
    gap: 10,
  },
  emptyTitle: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.ink,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 23,
    color: colors.inkSoft,
    maxWidth: 360,
  },
  history: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkSoft,
  },
  dock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  totalBlock: {
    gap: 1,
  },
  totalLabel: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.mute,
  },
  totalValue: {
    fontFamily: fonts.display,
    fontSize: 34,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  estimate: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.inkSoft,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  action: {
    flex: 1,
    minHeight: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionGhost: {
    backgroundColor: colors.mossSoft,
  },
  actionSolid: {
    backgroundColor: colors.moss,
  },
  actionGhostText: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.mossDark,
  },
  actionSolidText: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.cream,
  },
  pressed: {
    opacity: 0.82,
  },
});
