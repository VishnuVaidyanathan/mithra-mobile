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

// ── Bubble ─────────────────────────────────────────────────────────────
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
        <Text style={s.bubbleTxt}>{msg.content}</Text>
      </View>
    </View>
  );
}

// ── Chat Screen ────────────────────────────────────────────────────────
export default function ChatScreen({ route, navigation }) {
  const { threadId } = route.params;
  const { threads, appendMessage, updateThread } = useContext(ThreadsContext);
  const thread = threads.find(t => t.id === threadId);

  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const listRef               = useRef(null);

  const apiKey = useContext(ThreadsContext).apiKey;

  // Scroll to bottom
  const scrollEnd = () =>
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);

  useEffect(() => {
    if (thread?.messages?.length === 0) {
      // Welcome message on first open
      appendMessage(threadId, {
        id: `w_${Date.now()}`,
        role: 'mithra',
        content: "Hey, I'm Mithra. What's on your mind?",
      });
    }
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading || !thread) return;

    const userMsg = { id: `u_${Date.now()}`, role: 'user', content: text };
    appendMessage(threadId, userMsg);
    setInput('');
    setLoading(true);
    scrollEnd();

    try {
      const data = await sendMessage({
        text,
        sessionId: thread.sessionId,
        apiKey: apiKey || '',
      });
      appendMessage(threadId, {
        id: `m_${Date.now()}`,
        role: 'mithra',
        content: data.reply,
      });
    } catch (e) {
      appendMessage(threadId, {
        id: `e_${Date.now()}`,
        role: 'mithra',
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
    // Generate new session id for fresh backend state
    updateThread(threadId, {
      sessionId: `s_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`,
      messages: [],
    });
  };

  if (!thread) {
    return (
      <SafeAreaView style={s.safe}>
        <Text style={{ color: C.textMuted, padding: 20 }}>Thread not found.</Text>
      </SafeAreaView>
    );
  }

  const title = thread.title.length > 30
    ? thread.title.slice(0, 30) + '…'
    : thread.title;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backTxt}>‹</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle} numberOfLines={1}>{title}</Text>
          <View style={s.onlineDot} />
        </View>
        <TouchableOpacity style={s.iconBtn} onPress={handleReset}>
          <Text style={s.iconTxt}>↺</Text>
        </TouchableOpacity>
      </View>

      {/* Chat */}
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
        />

        {loading && (
          <View style={s.typingRow}>
            <View style={s.avatar}><Text style={s.avatarTxt}>M</Text></View>
            <View style={[s.bubble, s.botBubble, { paddingVertical: 12, paddingHorizontal: 18 }]}>
              <ActivityIndicator size="small" color={C.accentLight} />
            </View>
          </View>
        )}

        {/* Input */}
        <View style={s.inputRow}>
          <TextInput
            style={s.input}
            value={input}
            onChangeText={setInput}
            placeholder="Say something…"
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: C.surface,
    borderBottomWidth: 1, borderBottomColor: C.border,
    gap: 8,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  backTxt: { color: C.accentLight, fontSize: 28, lineHeight: 32, marginTop: -2 },
  headerCenter: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  headerTitle: {
    color: C.textPrimary, fontSize: 16, fontWeight: '700', flex: 1,
  },
  onlineDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: C.teal,
  },
  iconBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: C.border,
  },
  iconTxt: { color: C.textMuted, fontSize: 16 },

  // List
  list: { paddingVertical: 12 },
  row: {
    flexDirection: 'row', marginVertical: 4,
    marginHorizontal: 12, alignItems: 'flex-end',
  },
  rowRight: { justifyContent: 'flex-end' },
  rowLeft:  { justifyContent: 'flex-start' },

  // Avatar
  avatar: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center',
    marginRight: 8, marginBottom: 2,
  },
  avatarTxt: { color: '#fff', fontWeight: '800', fontSize: 13 },

  // Bubbles
  bubble: { maxWidth: '78%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  userBubble: {
    backgroundColor: C.userBubble, borderBottomRightRadius: 4,
    borderWidth: 1, borderColor: C.border,
  },
  botBubble: {
    backgroundColor: C.botBubble, borderBottomLeftRadius: 4,
    borderWidth: 1, borderColor: C.accent + '44',
  },
  bubbleTxt: { color: C.textPrimary, fontSize: 15, lineHeight: 22 },

  typingRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    marginHorizontal: 12, marginBottom: 4,
  },

  // Input
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: C.surface,
    borderTopWidth: 1, borderTopColor: C.border, gap: 10,
  },
  input: {
    flex: 1, backgroundColor: C.bg, borderRadius: 20,
    borderWidth: 1, borderColor: C.border,
    color: C.textPrimary, paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 15, maxHeight: 120,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center',
  },
  sendDisabled: { opacity: 0.35 },
  sendTxt: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: -1 },
});
