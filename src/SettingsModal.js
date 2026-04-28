import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { C } from './theme';

export default function SettingsModal({ visible, apiKey, onSave, onClose }) {
  const [key, setKey] = useState(apiKey || '');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.overlay}
      >
        <View style={s.card}>
          <Text style={s.title}>⚙  Settings</Text>
          <Text style={s.label}>Google AI Studio API Key</Text>
          <Text style={s.hint}>
            Get a free key at{' '}
            <Text style={{ color: C.accentLight }}>aistudio.google.com</Text>
          </Text>

          <TextInput
            style={s.input}
            value={key}
            onChangeText={setKey}
            placeholder="AIza..."
            placeholderTextColor={C.textFaint}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={s.row}>
            <TouchableOpacity style={[s.btn, s.cancel]} onPress={onClose}>
              <Text style={s.cancelTxt}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.btn, s.save]}
              onPress={() => { onSave(key); onClose(); }}
            >
              <Text style={s.saveTxt}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  card: {
    width: '100%', backgroundColor: C.surface,
    borderRadius: 20, padding: 24,
    borderWidth: 1, borderColor: C.border,
  },
  title: {
    color: C.textPrimary, fontSize: 20, fontWeight: '700', marginBottom: 16,
  },
  label: {
    color: C.textSub, fontSize: 12, fontWeight: '600',
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4,
  },
  hint: {
    color: C.textMuted, fontSize: 13, marginBottom: 14, lineHeight: 18,
  },
  input: {
    backgroundColor: C.bg, borderRadius: 12,
    borderWidth: 1, borderColor: C.border,
    color: C.textPrimary, padding: 14, fontSize: 14, marginBottom: 20,
  },
  row: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  cancel: { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border },
  save:   { backgroundColor: C.accent },
  cancelTxt: { color: C.textMuted, fontWeight: '600' },
  saveTxt:   { color: '#fff', fontWeight: '700' },
});
