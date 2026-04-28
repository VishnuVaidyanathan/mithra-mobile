import React, { useContext, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, StatusBar, Image,
} from 'react-native';

const LOTUS = require('../../assets/adaptive-icon.png');
import { SafeAreaView } from 'react-native-safe-area-context';
import { C } from '../theme';
import { ThreadsContext } from '../ThreadsContext';
import SettingsModal from '../SettingsModal';

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

// ── Thread Row ─────────────────────────────────────────────────────────
function ThreadRow({ thread, onPress, onDelete }) {
  const last    = thread.messages[thread.messages.length - 1];
  const preview = last
    ? last.content.slice(0, 60)
    : 'Start talking to Mithra…';
  const isFromUser = last?.role === 'user';

  return (
    <TouchableOpacity style={s.row} onPress={onPress} activeOpacity={0.7}>
      {/* Left accent bar */}
      <View style={s.rowAccent} />

      {/* Avatar */}
      <View style={s.rowAvatar}>
        <Image source={LOTUS} style={s.lotusImg} />
      </View>

      {/* Content */}
      <View style={s.rowBody}>
        <View style={s.rowTop}>
          <Text style={s.rowTitle} numberOfLines={1}>{thread.title}</Text>
          <Text style={s.rowTime}>{timeAgo(thread.updatedAt)}</Text>
        </View>
        <Text style={s.rowPreview} numberOfLines={1}>
          {isFromUser ? <Text style={s.youLabel}>You  </Text> : null}
          {preview}
        </Text>
      </View>

      {/* Delete */}
      <TouchableOpacity style={s.del} onPress={() => onDelete(thread.id)} hitSlop={14}>
        <Text style={s.delTxt}>×</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

// ── Empty ──────────────────────────────────────────────────────────────
function Empty({ onNew }) {
  return (
    <View style={s.empty}>
      {/* Soft glow rings */}
      <View style={[s.ring, s.ring3]} />
      <View style={[s.ring, s.ring2]} />
      <View style={[s.ring, s.ring1]} />

      <View style={s.emptyLogo}>
        <Text style={s.emptyLogoTxt}>✦</Text>
      </View>
      <Text style={s.emptyH}>Your space to feel heard</Text>
      <Text style={s.emptySub}>
        Talk freely. Mithra listens without{'\n'}judgment and responds with care.
      </Text>
      <TouchableOpacity style={s.emptyBtn} onPress={onNew} activeOpacity={0.85}>
        <Text style={s.emptyBtnTxt}>Begin a conversation</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Screen ─────────────────────────────────────────────────────────────
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

      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.logo}>
            <Text style={s.logoTxt}>✦</Text>
          </View>
          <View>
            <Text style={s.brand}>MITHRA</Text>
            <Text style={s.tagline}>Emotional AI Companion</Text>
          </View>
        </View>
        <View style={s.headerRight}>
          {threads.length > 0 && (
            <TouchableOpacity style={s.newBtn} onPress={handleNew} activeOpacity={0.85}>
              <Text style={s.newBtnTxt}>+ New</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={s.iconBtn} onPress={() => setShowSettings(true)}>
            <Text style={s.iconTxt}>⚙</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Body */}
      {threads.length === 0 ? (
        <Empty onNew={handleNew} />
      ) : (
        <>
          <View style={s.listHeader}>
            <Text style={s.listLabel}>RECENT</Text>
          </View>
          <FlatList
            data={threads}
            keyExtractor={t => t.id}
            renderItem={({ item }) => (
              <ThreadRow
                thread={item}
                onPress={() => navigation.navigate('Chat', { threadId: item.id })}
                onDelete={deleteThread}
              />
            )}
            contentContainerStyle={s.list}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={s.sep} />}
          />
        </>
      )}

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
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  headerLeft:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: C.accentSoft,
    borderWidth: 1, borderColor: C.accent + '50',
    alignItems: 'center', justifyContent: 'center',
  },
  logoTxt:  { color: C.accentLight, fontSize: 18 },
  brand:    { color: C.textPrimary, fontSize: 18, fontWeight: '800', letterSpacing: 2.5 },
  tagline:  { color: C.textMuted, fontSize: 10, letterSpacing: 0.8, marginTop: 1 },
  newBtn: {
    backgroundColor: C.accent, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  newBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 13 },
  iconBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.card, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: C.border,
  },
  iconTxt: { color: C.textMuted, fontSize: 16 },

  // List header
  listHeader: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  listLabel:  { color: C.textFaint, fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },

  // List
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  sep:  { height: 1, backgroundColor: C.border, marginLeft: 72 },

  // Row
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingRight: 12, gap: 12,
    backgroundColor: C.bg,
  },
  rowAccent: {
    width: 3, height: 44, borderRadius: 2,
    backgroundColor: C.accent, marginLeft: 4,
  },
  rowAvatar: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: '#0a0a1e',
    borderWidth: 1.5, borderColor: C.gold + '80',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  lotusImg:     { width: '90%', height: '90%', resizeMode: 'contain' },
  rowBody:      { flex: 1 },
  rowTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 4,
  },
  rowTitle:   { color: C.textPrimary, fontSize: 15, fontWeight: '700', flex: 1, marginRight: 6 },
  rowTime:    { color: C.textFaint, fontSize: 11 },
  rowPreview: { color: C.textMuted, fontSize: 13, lineHeight: 18 },
  youLabel:   { color: C.accentLight, fontWeight: '600' },
  del: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  delTxt: { color: C.textFaint, fontSize: 20 },

  // Empty
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  ring: {
    position: 'absolute', borderRadius: 999,
    borderWidth: 1, borderColor: C.accent + '20',
    alignSelf: 'center',
  },
  ring1: { width: 160, height: 160, top: '22%' },
  ring2: { width: 240, height: 240, top: '16%' },
  ring3: { width: 320, height: 320, top: '10%' },
  emptyLogo: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: C.accentSoft,
    borderWidth: 1.5, borderColor: C.accent + '60',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 28,
  },
  emptyLogoTxt: { color: C.accentLight, fontSize: 32 },
  emptyH:   { color: C.textPrimary, fontSize: 21, fontWeight: '700', marginBottom: 10, textAlign: 'center' },
  emptySub: { color: C.textMuted, fontSize: 15, textAlign: 'center', lineHeight: 24, marginBottom: 36 },
  emptyBtn: {
    backgroundColor: C.accent, borderRadius: 16,
    paddingHorizontal: 28, paddingVertical: 15,
  },
  emptyBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
