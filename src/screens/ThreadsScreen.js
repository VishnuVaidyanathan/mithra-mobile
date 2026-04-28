import React, { useContext, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, StatusBar, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C } from '../theme';
import { ThreadsContext } from '../ThreadsContext';
import SettingsModal from '../SettingsModal';

// ── Helpers ────────────────────────────────────────────────────────────
function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Thread Card ────────────────────────────────────────────────────────
function ThreadCard({ thread, onPress, onDelete }) {
  const last    = thread.messages[thread.messages.length - 1];
  const preview = last
    ? (last.role === 'user' ? 'You: ' : '') + last.content.slice(0, 55)
    : 'Tap to start talking…';
  const count = thread.messages.length;

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.7}>
      {/* Avatar */}
      <View style={s.cardAvatar}>
        <Text style={s.cardAvatarTxt}>M</Text>
      </View>

      {/* Body */}
      <View style={s.cardBody}>
        <View style={s.cardRow}>
          <Text style={s.cardTitle} numberOfLines={1}>{thread.title}</Text>
          <Text style={s.cardTime}>{timeAgo(thread.updatedAt)}</Text>
        </View>
        <Text style={s.cardPreview} numberOfLines={2}>{preview}</Text>
      </View>

      {/* Delete */}
      <TouchableOpacity style={s.del} onPress={() => onDelete(thread.id)} hitSlop={12}>
        <Text style={s.delTxt}>×</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

// ── Empty State ────────────────────────────────────────────────────────
function Empty({ onNew }) {
  return (
    <View style={s.empty}>
      <View style={s.emptyOrb} />
      <Text style={s.emptySymbol}>✦</Text>
      <Text style={s.emptyTitle}>Start a conversation</Text>
      <Text style={s.emptySub}>
        Mithra listens, understands,{'\n'}and responds with care.
      </Text>
      <TouchableOpacity style={s.emptyBtn} onPress={onNew} activeOpacity={0.85}>
        <Text style={s.emptyBtnTxt}>+ New Chat</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Main Screen ────────────────────────────────────────────────────────
export default function ThreadsScreen({ navigation }) {
  const { threads, createThread, deleteThread, apiKey, setApiKey } = useContext(ThreadsContext);
  const [showSettings, setShowSettings] = useState(false);

  const handleNew = () => {
    const t = createThread();
    navigation.navigate('Chat', { threadId: t.id });
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* ── Header ── */}
      <View style={s.header}>
        <View style={s.headerBrand}>
          <View style={s.logoCircle}>
            <Text style={s.logoTxt}>✦</Text>
          </View>
          <View>
            <Text style={s.brand}>MITHRA</Text>
            <Text style={s.tagline}>Emotional AI Companion</Text>
          </View>
        </View>
        <TouchableOpacity style={s.settingsBtn} onPress={() => setShowSettings(true)}>
          <Text style={s.settingsTxt}>⚙</Text>
        </TouchableOpacity>
      </View>

      {/* ── Section title ── */}
      {threads.length > 0 && (
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>Conversations</Text>
          <Text style={s.sectionCount}>{threads.length}</Text>
        </View>
      )}

      {/* ── List or Empty ── */}
      {threads.length === 0 ? (
        <Empty onNew={handleNew} />
      ) : (
        <FlatList
          data={threads}
          keyExtractor={t => t.id}
          renderItem={({ item }) => (
            <ThreadCard
              thread={item}
              onPress={() => navigation.navigate('Chat', { threadId: item.id })}
              onDelete={deleteThread}
            />
          )}
          contentContainerStyle={s.list}
          ItemSeparatorComponent={() => <View style={s.sep} />}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* ── FAB ── */}
      <View style={s.fabWrap}>
        <TouchableOpacity style={s.fab} onPress={handleNew} activeOpacity={0.85}>
          <Text style={s.fabTxt}>+ New Chat</Text>
        </TouchableOpacity>
      </View>

      <SettingsModal
        visible={showSettings}
        apiKey={apiKey}
        onSave={setApiKey}
        onClose={() => setShowSettings(false)}
      />
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  headerBrand: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoCircle: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: C.accentGlow,
    borderWidth: 1, borderColor: C.accent + '60',
    alignItems: 'center', justifyContent: 'center',
  },
  logoTxt:  { color: C.accentLight, fontSize: 18 },
  brand:    { color: C.textPrimary, fontSize: 18, fontWeight: '800', letterSpacing: 2 },
  tagline:  { color: C.textMuted, fontSize: 11, letterSpacing: 0.5, marginTop: 1 },
  settingsBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: C.card, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: C.border,
  },
  settingsTxt: { color: C.textMuted, fontSize: 17 },

  // Section row
  sectionRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10, gap: 8,
  },
  sectionTitle: { color: C.textMuted, fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  sectionCount: {
    backgroundColor: C.card, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2,
    color: C.textSub, fontSize: 11, fontWeight: '700',
  },

  // List
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  sep:  { height: 8 },

  // Card
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.card, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: C.border, gap: 12,
  },
  cardAvatar: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: C.accent + '22',
    borderWidth: 1.5, borderColor: C.accent + '55',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  cardAvatarTxt: { color: C.accentLight, fontSize: 18, fontWeight: '800' },
  cardBody:      { flex: 1 },
  cardRow:       { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  cardTitle:     { color: C.textPrimary, fontSize: 15, fontWeight: '700', flex: 1, marginRight: 8 },
  cardTime:      { color: C.textFaint, fontSize: 11 },
  cardPreview:   { color: C.textMuted, fontSize: 13, lineHeight: 18 },
  del: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  delTxt: { color: C.textFaint, fontSize: 22 },

  // Empty
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyOrb: {
    position: 'absolute', width: 280, height: 280, borderRadius: 140,
    backgroundColor: C.accentGlow, alignSelf: 'center',
  },
  emptySymbol: { fontSize: 52, color: C.accent, marginBottom: 24 },
  emptyTitle:  { color: C.textPrimary, fontSize: 22, fontWeight: '700', marginBottom: 10 },
  emptySub:    { color: C.textMuted, fontSize: 15, textAlign: 'center', lineHeight: 24, marginBottom: 36 },
  emptyBtn:    { backgroundColor: C.accent, borderRadius: 16, paddingHorizontal: 32, paddingVertical: 16 },
  emptyBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 16 },

  // FAB
  fabWrap: { position: 'absolute', bottom: 28, left: 0, right: 0, alignItems: 'center' },
  fab: {
    backgroundColor: C.accent, borderRadius: 28,
    paddingHorizontal: 32, paddingVertical: 16,
    shadowColor: C.accent, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  fabTxt: { color: '#fff', fontWeight: '700', fontSize: 16, letterSpacing: 0.3 },
});
