import React, { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Sheet } from './Sheet';
import { Button, Field } from './ui';
import { colors, fonts } from '../theme';
import { useHouse } from '../contexts/HouseContext';
import { FREE_MONTHLY_USES } from '../utils/quota';

type AccountSheetProps = {
  visible: boolean;
  onClose: () => void;
  onJoined: () => void;
};

export function AccountSheet({ visible, onClose, onJoined }: AccountSheetProps) {
  const { me, premium, serverUrl, status, quota, setName, setServerUrl, redeem, joinList, remaining } = useHouse();
  const [name, setDraftName] = useState(me?.name ?? '');
  const [pass, setPass] = useState('');
  const [invite, setInvite] = useState('');
  const [address, setAddress] = useState(serverUrl);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const voiceLeft = remaining('voice');
  const photoLeft = remaining('pricePhoto');

  useEffect(() => {
    if (!visible) return;
    setDraftName(me?.name ?? '');
    setAddress(serverUrl);
    setMessage('');
  }, [visible, me?.name, serverUrl]);

  async function saveName() {
    await setName(name);
    setMessage('Nome salvo.');
  }

  async function usePass() {
    setBusy(true);
    const error = await redeem(pass);
    setBusy(false);
    if (error) {
      setMessage(error);
      return;
    }
    setPass('');
    setMessage('Premium liberado neste celular.');
  }

  async function enterList() {
    setBusy(true);
    const error = await joinList(invite);
    setBusy(false);
    if (error) {
      setMessage(error);
      return;
    }
    setInvite('');
    onJoined();
  }

  async function saveAddress() {
    await setServerUrl(address);
    setMessage('Endereço salvo. Reconectando.');
  }

  return (
    <Sheet
      visible={visible}
      title="Casa"
      subtitle={premium ? 'Premium neste celular.' : 'Grátis. A lista da casa entra com o premium.'}
      onClose={onClose}
    >
      <Text style={styles.status}>
        {status === 'online' ? 'Conectado à casa' : status === 'connecting' ? 'Conectando...' : 'Desconectado'}
      </Text>
      <Text style={styles.quota}>
        {premium
          ? 'Voz e foto do preço sem limite.'
          : `Neste mês: ${voiceLeft ?? 0} de ${FREE_MONTHLY_USES} frases e ${photoLeft ?? 0} de ${FREE_MONTHLY_USES} fotos de preço.`}
      </Text>
      <Field label="Seu nome na lista" value={name} onChangeText={setDraftName} placeholder="Gustavo" maxLength={32} />
      <Button label="Salvar nome" tone="ghost" onPress={() => void saveName()} disabled={!name.trim()} />

      {!premium && (
        <>
          <Field
            label="Código de passe"
            value={pass}
            onChangeText={setPass}
            placeholder="CASA-LIVRE-01"
            autoCapitalize="characters"
            maxLength={40}
          />
          <Button label={busy ? 'Conferindo...' : 'Liberar premium'} onPress={() => void usePass()} disabled={!pass.trim() || busy} />
        </>
      )}

      <Field
        label="Entrar numa lista"
        value={invite}
        onChangeText={setInvite}
        placeholder="Código de quem convidou"
        autoCapitalize="characters"
        maxLength={12}
      />
      <Button label="Entrar" tone="ghost" onPress={() => void enterList()} disabled={!invite.trim() || busy || status !== 'online'} />

      <Field
        label="Servidor da casa"
        value={address}
        onChangeText={setAddress}
        placeholder="http://192.168.0.239:8787"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Button label="Salvar servidor" tone="ghost" onPress={() => void saveAddress()} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  status: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.mossDark,
  },
  quota: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkSoft,
  },
  message: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
  },
});