import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Crypto from 'expo-crypto';
import { StatusBar } from 'expo-status-bar';

import { useItems } from '../contexts/ItemContext';
import { useHouse } from '../contexts/HouseContext';
import { colors, fonts } from '../theme';
import { parseScan } from '../utils/parseScan';
import { lookupProduct, recallPrice } from '../utils/products';
import { readPrintedPrice } from '../utils/readPrice';
import { formatBRL } from '../utils/format';
import { tap } from '../utils/haptics';
import { Button, Field, IconButton } from '../components/ui';
import { Sheet } from '../components/Sheet';
import { ItemFields } from '../components/ItemFields';

type Origin = 'code' | 'memory' | 'none';

type Draft = {
  title: string;
  price: number;
  unities: number;
  barcode?: string;
  detail: string;
  origin: Origin;
  raw: string;
  suggestedPrice?: number;
  priceToken: number;
};

export default function Scanner() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { addItem } = useItems();
  const { remaining, consume } = useHouse();
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasted, setPasted] = useState('');
  const [help, setHelp] = useState(false);
  const [readingPrice, setReadingPrice] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const lock = useRef(false);

  async function resolveCode(raw: string) {
    const parsed = parseScan(raw);
    let title = parsed.title ?? '';
    const barcode = parsed.barcode;
    let suggestedPrice: number | undefined;

    if (barcode && !title) {
      const known = await recallPrice(barcode);
      if (known?.title) title = known.title;
      if (known && known.price > 0) suggestedPrice = known.price;
    }

    if (barcode && !title) {
      setBusy(true);
      const found = await lookupProduct(barcode);
      setBusy(false);
      if (found) title = found;
    }

    if (suggestedPrice == null && title) {
      const known = await recallPrice(barcode, title);
      if (known && known.price > 0) suggestedPrice = known.price;
      if (!title && known?.title) title = known.title;
    }

    setDraft({
      title,
      price: 0,
      unities: 1,
      barcode,
      detail: title
        ? 'O código traz o nome. O preço fica na embalagem: fotografe o valor ou digite.'
        : 'Não achei o nome desse código. Digite o produto.',
      origin: 'none',
      raw,
      suggestedPrice,
      priceToken: 0,
    });
    tap('success');
  }

  async function capturePrice() {
    if (remaining('pricePhoto') === 0) {
      Alert.alert('Fotos do mês esgotadas', 'No grátis são 3 fotos de preço por mês. Um código premium libera.');
      return;
    }
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.5 });
    if (!photo?.uri) {
      Alert.alert('Não deu para fotografar', 'Tente de novo, com o preço enquadrado.');
      return;
    }

    setBusy(true);
    const price = await readPrintedPrice(photo.uri);
    setBusy(false);

    if (price === 'unavailable') {
      setReadingPrice(false);
      Alert.alert(
        'Leitura do preço impresso',
        'O celular precisa do app instalado, fora do Expo Go, para ler o número na embalagem. Enquanto isso, digite o valor: os dois últimos números são os centavos.',
      );
      return;
    }

    const allowed = await consume('pricePhoto');
    if (!allowed) {
      Alert.alert('Fotos do mês esgotadas', 'No grátis são 3 fotos de preço por mês. Um código premium libera.');
      return;
    }

    if (price == null) {
      Alert.alert('Não achei um preço', 'Aponte para o valor da etiqueta, como R$ 12,90, e fotografe de novo.');
      return;
    }

    setDraft((current) => current ? {
      ...current,
      price,
      priceToken: current.priceToken + 1,
      detail: 'Preço lido na embalagem.',
    } : current);
    setReadingPrice(false);
    tap('success');
  }

  async function onScan({ data }: { data: string }) {
    if (lock.current || !data) return;
    lock.current = true;
    try {
      await resolveCode(data);
    } catch {
      lock.current = false;
    }
  }

  function dismissDraft() {
    setDraft(null);
    setTimeout(() => {
      lock.current = false;
    }, 700);
  }

  function commit(continueScanning: boolean) {
    if (!draft?.title.trim()) return;
    addItem({
      id: Crypto.randomUUID(),
      title: draft.title.trim(),
      price: draft.price,
      unities: Math.max(1, draft.unities),
      isCompleted: false,
      barcode: draft.barcode,
    });
    tap('success');
    if (continueScanning) {
      dismissDraft();
      return;
    }
    navigation.goBack();
  }

  function submitPaste() {
    const value = pasted.trim();
    if (!value) return;
    setPasteOpen(false);
    setPasted('');
    lock.current = true;
    void resolveCode(value);
  }

  const granted = permission?.granted;

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      {granted ? (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={torch}
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'],
          }}
          onBarcodeScanned={draft || busy || pasteOpen || readingPrice ? undefined : onScan}
        />
      ) : (
        <View style={styles.permission}>
          <Text style={styles.permissionTitle}>A câmera lê a etiqueta</Text>
          <Text style={styles.permissionText}>
            O código identifica o produto. O preço você fotografa na embalagem ou digita.
          </Text>
          <Button label="Permitir câmera" onPress={() => void requestPermission()} />
        </View>
      )}

      <View style={[styles.topBar, { paddingTop: insets.top + 10 }]} pointerEvents="box-none">
        <IconButton name="x" label="Fechar" tone="night" onPress={() => navigation.goBack()} />
        {granted && (
          <IconButton
            name={torch ? 'zap-off' : 'zap'}
            label={torch ? 'Desligar lanterna' : 'Ligar lanterna'}
            tone="night"
            onPress={() => setTorch((current) => !current)}
          />
        )}
      </View>

      {granted && !draft && !busy && !readingPrice && (
        <View style={styles.finder} pointerEvents="none">
          <View style={styles.frame}>
            <Corner position="tl" />
            <Corner position="tr" />
            <Corner position="bl" />
            <Corner position="br" />
          </View>
        </View>
      )}

      {readingPrice && (
        <View style={[styles.panel, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <Text style={styles.panelTitle}>Enquadre o preço</Text>
          <Text style={styles.panelText}>Aponte para o valor impresso na embalagem ou na etiqueta da gôndola.</Text>
          <View style={styles.priceActions}>
            <Button label={busy ? 'Lendo...' : 'Fotografar preço'} onPress={() => void capturePrice()} disabled={busy} />
            <Button label="Voltar" tone="ghost" onPress={() => setReadingPrice(false)} />
          </View>
        </View>
      )}

      {!draft && !readingPrice && (
        <View style={[styles.panel, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          {busy ? (
            <View style={styles.busy}>
              <ActivityIndicator color={colors.cream} />
              <Text style={styles.panelTitle}>Buscando o produto...</Text>
            </View>
          ) : (
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.panelTitle}>
                {granted ? 'Encaixe o código na moldura' : 'Ou cole o conteúdo do código'}
              </Text>
              <Text style={styles.panelText}>
                O código preenche o nome. O preço a gente lê na embalagem ou você digita.
              </Text>
              <Pressable onPress={() => setPasteOpen(true)} style={styles.linkHit}>
                <Text style={styles.link}>Colar código</Text>
              </Pressable>
              <Pressable onPress={() => setHelp((current) => !current)} style={styles.linkHit}>
                <Text style={styles.linkMuted}>
                  {help ? 'Esconder formatos' : 'Quais códigos funcionam?'}
                </Text>
              </Pressable>
              {help && (
                <Text style={styles.help}>
                  Código de barras do produto, ou um QR com o nome. O preço impresso é outra foto, do número na embalagem.
                </Text>
              )}
            </ScrollView>
          )}
        </View>
      )}

      {draft && !readingPrice && (
        <DraftSheet
          draft={draft}
          onChange={(patch) => setDraft((current) => (current ? { ...current, ...patch } : current))}
          onClose={dismissDraft}
          onCommit={commit}
          onReadPrice={() => setReadingPrice(true)}
          onUseSuggestion={() => setDraft((current) => current?.suggestedPrice ? {
            ...current,
            price: current.suggestedPrice,
            priceToken: current.priceToken + 1,
            detail: 'Último preço que você salvou para este produto.',
          } : current)}
        />
      )}

      <Sheet
        visible={pasteOpen}
        title="Colar código"
        subtitle="Cole o texto do QR ou os números do código de barras."
        onClose={() => setPasteOpen(false)}
      >
        <Field
          label="Código"
          value={pasted}
          onChangeText={setPasted}
          placeholder='{"nome":"Café","preco":18.90}'
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
          multiline
        />
        <Button label="Ler código" onPress={submitPaste} disabled={!pasted.trim()} />
      </Sheet>
    </View>
  );
}

function DraftSheet({
  draft,
  onChange,
  onClose,
  onCommit,
  onReadPrice,
  onUseSuggestion,
}: {
  draft: Draft;
  onChange: (patch: Partial<Draft>) => void;
  onClose: () => void;
  onCommit: (continueScanning: boolean) => void;
  onReadPrice: () => void;
  onUseSuggestion: () => void;
}) {
  return (
    <Sheet
      visible
      title={draft.title.trim() || 'Item lido'}
      subtitle={draft.detail}
      onClose={onClose}
    >
      <ItemFields
        title={draft.title}
        price={draft.price}
        unities={draft.unities}
        priceKey={`${draft.raw}:${draft.priceToken}`}
        focus={draft.title ? 'none' : 'title'}
        onChangeTitle={(title) => onChange({ title })}
        onChangePrice={(price) => onChange({ price })}
        onChangeUnities={(unities) => onChange({ unities })}
      />
      <Button label="Ler preço na embalagem" tone="ghost" icon="camera" onPress={onReadPrice} />
      {draft.suggestedPrice && draft.price !== draft.suggestedPrice ? (
        <Button
          label={`Usar último preço · ${formatBRL(draft.suggestedPrice)}`}
          tone="ghost"
          onPress={onUseSuggestion}
        />
      ) : null}
      {draft.price <= 0 && (
        <Text style={styles.warn}>Sem preço ainda. Dá para colocar o item e completar depois.</Text>
      )}
      <Button
        label="Colocar e escanear outro"
        onPress={() => onCommit(true)}
        disabled={!draft.title.trim()}
      />
      <Button
        label="Colocar e voltar"
        tone="ghost"
        onPress={() => onCommit(false)}
        disabled={!draft.title.trim()}
      />
    </Sheet>
  );
}

function Corner({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  return (
    <View
      style={[
        styles.corner,
        position === 'tl' && styles.tl,
        position === 'tr' && styles.tr,
        position === 'bl' && styles.bl,
        position === 'br' && styles.br,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.night,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  finder: {
    position: 'absolute',
    top: 96,
    left: 0,
    right: 0,
    bottom: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    width: 250,
    height: 250,
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: colors.cream,
  },
  tl: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  tr: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bl: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  br: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 22,
    paddingTop: 20,
    backgroundColor: 'rgba(20,18,15,0.88)',
    maxHeight: '46%',
  },
  panelTitle: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.cream,
  },
  panelText: {
    marginTop: 8,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 21,
    color: '#D9D0C3',
  },
  linkHit: {
    paddingVertical: 8,
  },
  link: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.cream,
  },
  linkMuted: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: '#B7A99A',
  },
  help: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 20,
    color: '#D9D0C3',
    marginBottom: 8,
  },
  busy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 8,
  },
  priceActions: {
    marginTop: 16,
    gap: 10,
  },
  permission: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 14,
  },
  permissionTitle: {
    fontFamily: fonts.display,
    fontSize: 34,
    color: colors.cream,
  },
  permissionText: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 23,
    color: '#D9D0C3',
  },
  warn: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.clay,
  },
});
