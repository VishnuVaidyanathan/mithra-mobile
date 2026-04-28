import React, { useState, useRef, useContext, useCallback, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C } from '../theme';
import { ThreadsContext } from '../ThreadsContext';
import { sendMessage, resetSession } from '../api';

// ── Timestamp helper ───────────────────────────────────────────────────
function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ── Single bubble ──────────────────────────────────────────────────────
function Bubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <View style={[s.row, isUser ? s.rowRight : s.rowLeft]}>
      {!isUser && (
        <View style={s.avatar}>
          <Text style={s.avatarTxt}>M</Text>
        </View>
      )}
      <View style={[s.bubble, isUser ? s.userBubble : s.botBubble]}>
        <Text style={[s.bubbleTxt, isUser ? s.userTxt : s.botTxt]}>
          {msg.content}
        </Text>
        {msg.ts && (
          <Text style={[s.ts, isUser ? s.tsRight : s.tsLeft]}>
            {formatTime(msg.ts)}
          </Text>
        )}
      </View>
    </View>
  );
}

// ── Typing dots ────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <View style={[s.row, s.rowLeft]}>
      <View style={s.avatar}>
        <Text style={s.avatarTxt}>M</Text>
      </View>
      <View style={[s.bubble, s.botBubble, s.typingBubble]}>
        <ActivityIndicator size="small" color={C.accentLight} />
      </View>
    </View>
  );
}

// ── Chat Screen ────────────────────────────────────────────────────────
export default function ChatScreen({ route, navigation }) {
  const { threadId } = route.params;
  const { threads, appendMessage, updateThread, apiKey } = useContext(ThreadsContext);
  const thread = threads.find(t => t.id === threadId);

  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const listRef               = useRef(null);

  const scrollEnd = () =>
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);

  useEffect(() => {
    if (thread && thread.messages.length === 0) {
      appendMessage(threadId, {
        id:   `w_${Date.now()}`,
        role: 'mithra',
        ts:   Date.now(),
        content: "Hey, I'm Mithra. What's on your mind?",
      });
    }
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading || !thread) return;

    const userMsg = { id: `u_${Date.now()}`, role: 'user', ts: Date.now(), content: text };
    appendMessage(threadId, userMsg);
    setInput('');
    setLoading(true);
    scrollEnd();

    try {
      const data = await sendMessage({ text, sessionId: thread.sessionId, apiKey: apiKey || '' });
      appendMessage(threadId, {
        id:      `m_${Date.now()}`,
        role:    'mithra',
        ts:      Date.now(),
        content: data.reply,
      });
    } catch (e) {
      appendMessage(threadId, {
        id:      `e_${Date.now()}`,
        role:    'mithra',
        ts:      Date.now(),
        content: `Something went wrong. ${e.message}`,
      });
    } finally {
      setLoading(false);
      scrollEnd();
    }
  }, [input, loading, thread, apiKey, threadId]);

  const handleReset = async () => {
    if (!thread) return;
    await resetSession(thread.sessionId);
    updateThread(threadId, {
      sessionId: `s_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`,
      messages: [],
    });
  };

  if (!thread) {
    return (
      <SafeAreaView style={s.safe} edges={['top','left','right','bottom']}>
        <Text style={{ color: C.textMuted, padding: 24, fontSize: 15 }}>Thread not found.</Text>
      </SafeAreaView>
    );
  }

  const title = thread.title.length > 26 ? thread.title.slice(0, 26) + '…' : thread.title;

  return (
    <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backTxt}>‹</Text>
        </TouchableOpacity>

        <View style={s.headerCenter}>
          <View style={s.headerAvatar}>
            <Text style={s.headerAvatarTxt}>M</Text>
          </View>
          <View>
            <Text style={s.headerName} numberOfLines={1}>{title}</Text>
            <View style={s.onlineRow}>
              <View style={s.onlineDot} />
              <Text style={s.onlineTxt}>Active now</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={s.iconBtn} onPress={handleReset}>
          <Text style={s.iconTxt}>↺</Text>
        </TouchableOpacity>
      </View>

      {/* ── Messages ── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={listRef}
          data={thread.messages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <Bubble msg={item} />}
          contentContainerStyle={s.list}
          onContentSizeChange={scrollEnd}
          showsVerticalScrollIndicator={false}
        />

        {loading && <TypingIndicator />}

        {/* ── Input bar ── */}
        <SafeAreaView edges={['bottom']} style={s.inputSafe}>
          <View style={s.inputRow}>
            <TextInput
              style={s.input}
              value={input}
              onChangeText={setInput}
              placeholder="Message Mithra…"
              placeholderTextColor={C.textFaint}
              multiline
              maxLength={1000}
              returnKeyType="send"
              blurOnSubmit={false}
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              style={[s.sendBtn, (!input.trim() || loading) && s.sendDisabled]}
              onPress={handleSend}
              disabled={!input.trim() || loading}
            >
              <Text style={s.sendTxt}>↑</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────
const BUBBLE_RADIUS = 20;

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: C.surface,
    borderBottomWidth: 1, borderBottomColor: C.border,
    gap: 10,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backTxt: { color: C.accentLight, fontSize: 32, lineHeight: 36, marginTop: -4 },

  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAvatar: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: C.accent + '25',
    borderWidth: 1.5, borderColor: C.accent + '60',
    alignItems: 'center', justifyContent: 'center',
  },
  headerAvatarTxt: { color: C.accentLight, fontWeight: '800', fontSize: 15 },
  headerName: { color: C.textPrimary, fontSize: 15, fontWeight: '700' },
  onlineRow:  { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDot:  { width: 7, height: 7, borderRadius: 4, backgroundColor: C.teal },
  onlineTxt:  { color: C.teal, fontSize: 11, fontWeight: '500' },

  iconBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.card, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: C.border,
  },
  iconTxt: { color: C.textMuted, fontSize: 16 },

  // Messages
  list: { paddingVertical: 16, paddingHorizontal: 12 },

  row: {
    flexDirection: 'row', marginVertical: 5, alignItems: 'flex-end',
  },
  rowRight: { justifyContent: 'flex-end' },
  rowLeft:  { justifyContent: 'flex-start' },

  // Avatar
  avatar: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: C.accent + '25',
    borderWidth: 1, borderColor: C.accent + '50',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 8, marginBottom: 4, flexShrink: 0,
  },
  avatarTxt: { color: C.accentLight, fontWeight: '800', fontSize: 13 },

  // Bubbles
  bubble: {
    maxWidth: '80%', borderRadius: BUBBLE_RADIUS,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  userBubble: {
    backgroundColor: C.userBubble,
    borderBottomRightRadius: 5,
    borderWidth: 1, borderColor: C.borderGlow + '80',
  },
  botBubble: {
    backgroundColor: C.botBubble,
    borderBottomLeftRadius: 5,
    borderWidth: 1, borderColor: C.border,
  },
  bubbleTxt: { fontSize: 16, lineHeight: 24 },
  userTxt:   { color: C.textPrimary },
  botTxt:    { color: C.textPrimary },

  ts:      { fontSize: 10, marginTop: 6, opacity: 0.5 },
  tsRight: { color: C.textMuted, textAlign: 'right' },
  tsLeft:  { color: C.textMuted, textAlign: 'left' },

  typingBubble: { paddingVertical: 14, paddingHorizontal: 20 },

  // Input
  inputSafe: { backgroundColor: C.surface },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 14, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: C.border, gap: 10,
  },
  input: {
    flex: 1, backgroundColor: C.card, borderRadius: 22,
    borderWidth: 1, borderColor: C.border,
    color: C.textPrimary,
    paddingHorizontal: 18, paddingVertical: 12,
    fontSize: 16, lineHeight: 22, maxHeight: 130,
  },
  sendBtn: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center',
    shadowColor: C.accent, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  sendDisabled: { opacity: 0.3, elevation: 0, shadowOpacity: 0 },
  sendTxt: { color: '#fff', fontSize: 20, fontWeight: '700', marginTop: -2 },
});
