import React, { useContext } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C } from '../theme';
import { ThreadsContext } from '../ThreadsContext';

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function ThreadCard({ thread, onPress, onDelete }) {
  const lastMsg = thread.messages[thread.messages.length - 1];
  const preview = lastMsg
    ? (lastMsg.role === 'user' ? 'You: ' : 'Mithra: ') + lastMsg.content.slice(0, 60)
    : 'Start the conversation…';

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.75}>
      <View style={s.cardLeft}>
        <View style={s.dot} />
      </View>
      <View style={s.cardBody}>
        <View style={s.cardTop}>
          <Text style={s.cardTitle} numberOfLines={1}>{thread.title}</Text>
          <Text style={s.cardTime}>{timeAgo(thread.updatedAt)}</Text>
        </View>
        <Text style={s.cardPreview} numberOfLines={1}>{preview}</Text>
      </View>
      <TouchableOpacity style={s.deleteBtn} onPress={() => onDelete(thread.id)} hitSlop={8}>
        <Text style={s.deleteTxt}>×</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function EmptyState({ onNew }) {
  return (
    <View style={s.empty}>
      <View style={s.emptyGlow} />
      <Text style={s.emptyIcon}>✦</Text>
      <Text style={s.emptyTitle}>No conversations yet</Text>
      <Text style={s.emptySub}>Tap the button below{'\n'}to start talking to Mithra.</Text>
      <TouchableOpacity style={s.emptyBtn} onPress={onNew}>
        <Text style={s.emptyBtnTxt}>+ New Chat</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function ThreadsScreen({ navigation }) {
  const { threads, createThread, deleteThread } = useContext(ThreadsContext);

  const handleNew = () => {
    const t = createThread();
    navigation.navigate('Chat', { threadId: t.id });
  };

  const handleOpen = (thread) => {
    navigation.navigate('Chat', { threadId: thread.id });
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* ── Header ── */}
      <View style={s.header}>
        <View>
          <Text style={s.brand}>MITHRA</Text>
          <Text style={s.tagline}>Emotional AI Companion</Text>
        </View>
        <TouchableOpacity
          style={s.newBtn}
          onPress={handleNew}
          activeOpacity={0.8}
        >
          <Text style={s.newBtnTxt}>+ New Chat</Text>
        </TouchableOpacity>
      </View>

      {threads.length === 0 ? (
        <EmptyState onNew={handleNew} />
      ) : (
        <FlatList
          data={threads}
          keyExtractor={t => t.id}
          renderItem={({ item }) => (
            <ThreadCard
              thread={item}
              onPress={() => handleOpen(item)}
              onDelete={deleteThread}
            />
          )}
          contentContainerStyle={s.list}
          ItemSeparatorComponent={() => <View style={s.sep} />}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: C.bg },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: C.border,
    backgroundColor: C.surface,
  },
  brand: {
    fontSize: 22, fontWeight: '900', letterSpacing: 3,
    color: C.accentLight,
  },
  tagline: {
    fontSize: 11, color: C.textMuted, letterSpacing: 0.8,
    marginTop: 2, fontWeight: '500',
  },
  newBtn: {
    backgroundColor: C.accent, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  newBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // List
  list: { padding: 16, paddingBottom: 40 },
  sep:  { height: 10 },

  // Card
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.card, borderRadius: 16,
    padding: 14, borderWidth: 1, borderColor: C.border,
  },
  cardLeft: { marginRight: 12 },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: C.accent,
  },
  cardBody: { flex: 1 },
  cardTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 4,
  },
  cardTitle: {
    color: C.textPrimary, fontSize: 15, fontWeight: '600', flex: 1, marginRight: 8,
  },
  cardTime: { color: C.textFaint, fontSize: 11 },
  cardPreview: { color: C.textMuted, fontSize: 13 },
  deleteBtn: {
    marginLeft: 10, width: 28, height: 28,
    alignItems: 'center', justifyContent: 'center',
  },
  deleteTxt: { color: C.textFaint, fontSize: 20, lineHeight: 22 },

  // Empty state
  empty: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40,
  },
  emptyGlow: {
    position: 'absolute',
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: C.accentGlow,
    top: '30%', alignSelf: 'center',
  },
  emptyIcon: {
    fontSize: 48, color: C.accent, marginBottom: 20,
  },
  emptyTitle: {
    color: C.textPrimary, fontSize: 20, fontWeight: '700', marginBottom: 8,
  },
  emptySub: {
    color: C.textMuted, fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 30,
  },
  emptyBtn: {
    backgroundColor: C.accent, borderRadius: 14,
    paddingHorizontal: 28, paddingVertical: 14,
  },
  emptyBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
