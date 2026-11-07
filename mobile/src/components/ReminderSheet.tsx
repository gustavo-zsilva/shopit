import React, { useState } from 'react';
import { Platform, StyleSheet, Text } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { Sheet } from './Sheet';
import { Button } from './ui';
import { colors, fonts } from '../theme';
import { describeWhen, ShoppingReminder } from '../utils/reminders';

type ReminderSheetProps = {
  visible: boolean;
  current: ShoppingReminder | null;
  onClose: () => void;
  onSchedule: (when: Date) => void;
  onClear: () => void;
};

function atHour(base: Date, hours: number) {
  const next = new Date(base);
  next.setHours(hours, 0, 0, 0);
  return next;
}

export function ReminderSheet({ visible, current, onClose, onSchedule, onClear }: ReminderSheetProps) {
  const [picking, setPicking] = useState<'datetime' | 'date' | 'time' | null>(null);
  const [picked, setPicked] = useState(new Date());

  function todayEvening() {
    const when = atHour(new Date(), 19);
    if (when.getTime() <= Date.now()) when.setDate(when.getDate() + 1);
    onSchedule(when);
  }

  function tomorrowMorning() {
    const when = atHour(new Date(), 9);
    when.setDate(when.getDate() + 1);
    onSchedule(when);
  }

  return (
    <Sheet
      visible={visible}
      title="Lembrar de comprar"
      subtitle={current ? `Já marcado: ${describeWhen(current.at)}.` : 'Um aviso no celular, na hora que você escolher.'}
      onClose={onClose}
    >
      <Button label="Hoje às 19h" tone="ghost" onPress={todayEvening} />
      <Button label="Amanhã às 9h" tone="ghost" onPress={tomorrowMorning} />
      <Button
        label="Escolher dia e hora"
        tone="ghost"
        onPress={() => setPicking(Platform.OS === 'android' ? 'date' : 'datetime')}
      />
      {picking && (
        <DateTimePicker
          value={picked}
          mode={picking === 'datetime' ? 'datetime' : picking}
          minimumDate={picking === 'time' ? undefined : new Date()}
          onChange={(event, selected) => {
            if (event.type === 'dismissed' || !selected) {
              setPicking(null);
              return;
            }
            if (picking === 'date' && Platform.OS === 'android') {
              const next = new Date(picked);
              next.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
              setPicked(next);
              setPicking('time');
              return;
            }
            if (picking === 'time' && Platform.OS === 'android') {
              const next = new Date(picked);
              next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
              setPicked(next);
              setPicking(null);
              onSchedule(next);
              return;
            }
            setPicked(selected);
          }}
        />
      )}
      {picking === 'datetime' && (
        <Button label={`Marcar ${describeWhen(picked)}`} onPress={() => onSchedule(picked)} />
      )}
      {current && <Button label="Cancelar lembrete" tone="danger" onPress={onClear} />}
      {!current && <Text style={styles.note}>O aviso chega mesmo com o app fechado.</Text>}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  note: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.mute,
  },
});
