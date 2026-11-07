import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Sheet } from './Sheet';
import { Button, Field } from './ui';
import { colors, fonts } from '../theme';
import { parseSpeech, SpokenItem } from '../utils/parseSpeech';
import { describeWhen } from '../utils/reminders';
import { tap } from '../utils/haptics';

type SpeechModule = {
  ExpoSpeechRecognitionModule: {
    requestPermissionsAsync: () => Promise<{ granted: boolean }>;
    start: (options: { lang: string; interimResults: boolean; continuous: boolean }) => void;
    stop: () => void;
    abort: () => void;
    addListener: (event: string, listener: (payload: { results?: { transcript?: string }[]; error?: string }) => void) => { remove: () => void };
  };
};

async function loadSpeech(): Promise<SpeechModule | null> {
  try {
    return await import('expo-speech-recognition') as SpeechModule;
  } catch {
    return null;
  }
}

type VoiceSheetProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (items: SpokenItem[], due?: Date) => void;
};

export function VoiceSheet({ visible, onClose, onConfirm }: VoiceSheetProps) {
  const [text, setText] = useState('');
  const [listening, setListening] = useState(false);
  const [hint, setHint] = useState('');
  const [remind, setRemind] = useState(true);
  const listeners = useRef<{ remove: () => void }[]>([]);
  const parsed = parseSpeech(text);

  async function toggleMic() {
    const speech = await loadSpeech();
    if (!speech) {
      setHint('O microfone entra quando o app está instalado no celular. Por enquanto, escreva a frase.');
      return;
    }

    if (listening) {
      speech.ExpoSpeechRecognitionModule.stop();
      setListening(false);
      return;
    }

    const permission = await speech.ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permission.granted) {
      setHint('Permita o microfone para ditar a lista.');
      return;
    }

    listeners.current.forEach((listener) => listener.remove());
    listeners.current = [
      speech.ExpoSpeechRecognitionModule.addListener('result', (event) => {
        const transcript = event.results?.[0]?.transcript ?? '';
        if (transcript) setText(transcript);
      }),
      speech.ExpoSpeechRecognitionModule.addListener('end', () => setListening(false)),
      speech.ExpoSpeechRecognitionModule.addListener('error', (event) => {
        setListening(false);
        if (event.error === 'aborted' || event.error === 'no-speech') return;
        setHint('Não consegui ouvir. Tente de novo ou escreva a frase.');
      }),
    ];

    setHint('');
    setListening(true);
    try {
      speech.ExpoSpeechRecognitionModule.start({
        lang: 'pt-BR',
        interimResults: true,
        continuous: true,
      });
      tap('light');
    } catch {
      setListening(false);
      setHint('O microfone entra quando o app está instalado no celular. Por enquanto, escreva a frase.');
    }
  }

  function close() {
    listeners.current.forEach((listener) => listener.remove());
    listeners.current = [];
    setListening(false);
    setText('');
    setHint('');
    onClose();
  }

  function confirm() {
    if (!parsed.items.length) return;
    onConfirm(parsed.items, remind ? parsed.due : undefined);
    tap('success');
    close();
  }

  return (
    <Sheet
      visible={visible}
      title="Falar a compra"
      subtitle="Diga os produtos, as quantidades e, se quiser, até quando."
      onClose={close}
    >
      <Button
        label={listening ? 'Parar' : 'Ditar'}
        icon={listening ? 'square' : 'mic'}
        onPress={() => void toggleMic()}
      />
      <Field
        label="Frase"
        value={text}
        onChangeText={setText}
        placeholder="Dois cachos de banana, 2 pacotes de aveia e 500 gramas de queijo, até quinta"
        multiline
        autoCorrect
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      {parsed.items.length > 0 && (
        <View style={styles.preview}>
          {parsed.items.map((item) => (
            <Text key={`${item.title}-${item.note ?? ''}`} style={styles.previewItem}>
              {item.note ? `${item.note} de ${item.title}` : item.title}
            </Text>
          ))}
          {parsed.due && (
            <Button
              label={remind ? `Lembrar ${describeWhen(parsed.due)}` : 'Não lembrar'}
              tone="ghost"
              onPress={() => setRemind((current) => !current)}
            />
          )}
        </View>
      )}
      <Button label="Colocar na lista" onPress={confirm} disabled={!parsed.items.length} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  hint: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.inkSoft,
  },
  preview: {
    gap: 6,
  },
  previewItem: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.ink,
  },
});
