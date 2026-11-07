import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Category } from '../types';
import { colors, fonts } from '../theme';
import { CATEGORY_COLORS, CATEGORY_ICONS, CategoryIcon } from '../categories';
import { Button, Field } from './ui';
import { Sheet } from './Sheet';

export function CategoryPicker({
  categories,
  value,
  onChange,
}: {
  categories: Category[];
  value: string | null;
  onChange: (id: string | null) => void;
}) {
  return (
    <View style={styles.picker}>
      <Text style={styles.label}>Categoria</Text>
      <View style={styles.wrap}>
        <Chip label="Sem categoria" selected={value == null} onPress={() => onChange(null)} />
        {categories.map((category) => (
          <Chip
            key={category.id}
            label={category.name}
            color={category.color}
            icon={category.icon}
            selected={value === category.id}
            onPress={() => onChange(category.id)}
          />
        ))}
      </View>
    </View>
  );
}

function Chip({
  label,
  selected,
  onPress,
  color,
  icon,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
  icon?: CategoryIcon;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipOn]}
    >
      {icon && <Feather name={icon} size={14} color={selected ? colors.cream : color ?? colors.inkSoft} />}
      <Text style={[styles.chipText, selected && styles.chipTextOn]} numberOfLines={1}>{label}</Text>
    </Pressable>
  );
}

export function CategorySheet({
  visible,
  initial,
  onClose,
  onSave,
  onDelete,
}: {
  visible: boolean;
  initial: Category | null;
  onClose: () => void;
  onSave: (draft: { name: string; color: string; icon: CategoryIcon }) => void;
  onDelete?: () => void;
}) {
  const [name, setName] = useState('');
  const [color, setColor] = useState<string>(CATEGORY_COLORS[0]);
  const [icon, setIcon] = useState<CategoryIcon>('shopping-bag');

  useEffect(() => {
    if (!visible) return;
    setName(initial?.name ?? '');
    setColor(initial?.color ?? CATEGORY_COLORS[0]);
    setIcon(initial?.icon ?? 'shopping-bag');
  }, [visible, initial]);

  return (
    <Sheet
      visible={visible}
      title={initial ? 'Editar categoria' : 'Nova categoria'}
      subtitle="Um nome curto, uma cor e um ícone."
      onClose={onClose}
    >
      <Field
        label="Nome"
        value={name}
        onChangeText={setName}
        placeholder="Hortifruti, limpeza, frios..."
        autoFocus
        maxLength={24}
        returnKeyType="done"
        onSubmitEditing={() => {
          if (name.trim()) onSave({ name, color, icon });
        }}
      />
      <View style={styles.picker}>
        <Text style={styles.label}>Cor</Text>
        <View style={styles.colors}>
          {CATEGORY_COLORS.map((entry) => {
            const selected = entry === color;
            return (
              <Pressable
                key={entry}
                accessibilityRole="button"
                accessibilityLabel="Cor da categoria"
                accessibilityState={{ selected }}
                onPress={() => setColor(entry)}
                style={[styles.swatch, { backgroundColor: entry }, selected && styles.swatchOn]}
              >
                {selected && <Feather name="check" size={14} color={colors.cream} />}
              </Pressable>
            );
          })}
        </View>
      </View>
      <View style={styles.picker}>
        <Text style={styles.label}>Ícone</Text>
        <View style={styles.icons}>
          {CATEGORY_ICONS.map((entry) => {
            const selected = entry === icon;
            return (
              <Pressable
                key={entry}
                accessibilityRole="button"
                accessibilityLabel="Ícone da categoria"
                accessibilityState={{ selected }}
                onPress={() => setIcon(entry)}
                style={[styles.iconChoice, selected && { backgroundColor: color }]}
              >
                <Feather name={entry} size={18} color={selected ? colors.cream : colors.ink} />
              </Pressable>
            );
          })}
        </View>
      </View>
      <Button
        label={initial ? 'Salvar' : 'Criar categoria'}
        onPress={() => onSave({ name, color, icon })}
        disabled={!name.trim()}
      />
      {onDelete && <Button label="Excluir categoria" tone="danger" onPress={onDelete} />}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  picker: {
    gap: 8,
  },
  label: {
    fontFamily: fonts.medium,
    color: colors.inkSoft,
    fontSize: 13,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    minHeight: 38,
    borderRadius: 999,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '100%',
  },
  chipOn: {
    backgroundColor: colors.moss,
    borderColor: colors.moss,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.ink,
  },
  chipTextOn: {
    color: colors.cream,
  },
  colors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  swatch: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchOn: {
    borderWidth: 2,
    borderColor: colors.ink,
  },
  icons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconChoice: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
  },
});
