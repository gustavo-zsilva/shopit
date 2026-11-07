import React, { ReactNode, useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Item } from '../types';
import { colors, fonts } from '../theme';
import { CategoryIcon } from '../categories';
import { formatBRL } from '../utils/format';
import { Collapse } from './motion';

export function categorySummary(items: Item[]) {
  const toBuy = items.filter((item) => !item.isCompleted).length;
  const sum = items.reduce((total, item) => total + item.price * item.unities, 0);
  const money = formatBRL(sum);
  if (items.length === 0) return { toBuy, sum, label: 'Vazia' };
  if (toBuy === 0) return { toBuy, sum, label: `Tudo no carrinho · ${money}` };
  const count = toBuy === 1 ? '1 para comprar' : `${toBuy} para comprar`;
  return { toBuy, sum, label: `${count} · ${money}` };
}

export function CategoryCard({
  name,
  color,
  icon,
  summary,
  open,
  onToggle,
  onEdit,
  children,
  empty,
}: {
  name: string;
  color: string;
  icon: CategoryIcon;
  summary: string;
  open: boolean;
  onToggle: () => void;
  onEdit?: () => void;
  children: ReactNode;
  empty?: string;
}) {
  const turn = useRef(new Animated.Value(open ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(turn, {
      toValue: open ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [open, turn]);

  const rotate = turn.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={open ? `Recolher ${name}` : `Expandir ${name}`}
          onPress={onToggle}
          style={styles.headerMain}
        >
          <View style={styles.bubble}>
            <View style={[styles.bubbleWash, { backgroundColor: color }]} />
            <Feather name={icon} size={16} color={color} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.name} numberOfLines={1}>{name}</Text>
            <Text style={styles.summary} numberOfLines={1}>{summary}</Text>
          </View>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Feather name="chevron-down" size={18} color={colors.mute} />
          </Animated.View>
        </Pressable>
        {onEdit && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Editar ${name}`}
            hitSlop={8}
            onPress={onEdit}
            style={styles.edit}
          >
            <Feather name="edit-2" size={16} color={colors.inkSoft} />
          </Pressable>
        )}
      </View>
      <Collapse open={open}>
        <View style={styles.body}>
          {empty ? <Text style={styles.empty}>{empty}</Text> : children}
        </View>
      </Collapse>
    </View>
  );
}

export function ProductRow({
  item,
  onToggle,
  onEdit,
  onMove,
  grouped = false,
}: {
  item: Item;
  onToggle: () => void;
  onEdit: () => void;
  onMove?: () => void;
  grouped?: boolean;
}) {
  const line = item.price * item.unities;
  const scale = useRef(new Animated.Value(1)).current;

  function toggle() {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.84, duration: 80, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();
    onToggle();
  }

  return (
    <View style={[styles.row, grouped ? styles.rowGrouped : styles.rowCard, item.isCompleted && styles.rowDone]}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: item.isCompleted }}
        accessibilityLabel={item.isCompleted ? 'Tirar do carrinho' : 'Colocar no carrinho'}
        onPress={toggle}
      >
        <Animated.View style={[styles.check, item.isCompleted && styles.checkOn, { transform: [{ scale }] }]}>
          {item.isCompleted && <Feather name="check" size={16} color={colors.cream} />}
        </Animated.View>
      </Pressable>
      <Pressable onPress={onEdit} style={styles.rowBody}>
        <Text style={[styles.itemTitle, item.isCompleted && styles.itemDone]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.itemMeta}>
          {item.note ?? `${item.unities} un`}
          {item.store ? ` · ${item.store}` : ''}
          {item.unities > 1 && item.price > 0 ? ` · ${formatBRL(item.price)} cada` : ''}
        </Text>
      </Pressable>
      {onMove && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Mover ${item.title}`}
          hitSlop={6}
          onPress={onMove}
          style={styles.move}
        >
          <Feather name="folder" size={16} color={colors.mute} />
        </Pressable>
      )}
      <Text style={[styles.itemPrice, line <= 0 && styles.itemMissing]}>
        {line > 0 ? formatBRL(line) : 'sem preço'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 10,
    gap: 4,
  },
  headerMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 48,
  },
  bubble: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bubbleWash: {
    ...StyleSheet.absoluteFill,
    opacity: 0.16,
  },
  headerText: {
    flex: 1,
    gap: 1,
  },
  name: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.ink,
  },
  summary: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.inkSoft,
  },
  edit: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: 8,
    paddingBottom: 4,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.mute,
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  row: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
  },
  rowGrouped: {
    backgroundColor: colors.paper,
  },
  rowDone: {
    backgroundColor: colors.mossSoft,
  },
  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.moss,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: {
    backgroundColor: colors.moss,
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.ink,
  },
  itemDone: {
    textDecorationLine: 'line-through',
    color: colors.inkSoft,
  },
  itemMeta: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.mute,
  },
  move: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemPrice: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  itemMissing: {
    color: colors.clay,
    fontFamily: fonts.medium,
  },
});
