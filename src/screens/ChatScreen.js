import React, { useState, useRef, useContext, useCallback, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, KeyboardAvoidingView, Platform,
  StatusBar, Image, Animated, Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const LOTUS = require('../../assets/adaptive-icon.png');
import { C } from '../theme';
import { ThreadsContext } from '../ThreadsContext';
import { sendMessage, resetSession } from '../api';

// ── Time helper ────────────────────────────────────────────────────────
function fmtTime(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ── Bubble ─────────────────────────────────────────────────────────────
function Bubble({ msg, showTime }) {
  const isUser = msg.role === 'user';
  return (
    <View style={[b.wrap, isUser ? b.wrapRight : b.wrapLeft]}>
      {/* Mithra avatar — only show on first or after gap */}
      {!isUser && (
        <View style={b.avatar}>
          <Image source={LOTUS} style={b.lotusImg} />
        </View>
      )}

      <View style={[b.bubble, isUser ? b.userBubble : b.botBubble]}>
        <Text style={[b.txt, isUser ? b.userTxt : b.botTxt]}>{msg.content}</Text>
        {showTime && msg.ts && (
          <Text style={[b.time, isUser ? b.timeRight : b.timeLeft]}>
            {fmtTime(msg.ts)}
          </Text>
        )}
      </View>
    </View>
  );
}

const b = StyleSheet.create({
  wrap:      { flexDirection: 'row', marginVertical: 4, marginHorizontal: 14, alignItems: 'flex-end' },
  wrapRight: { justifyContent: 'flex-end' },
  wrapLeft:  { justifyContent: 'flex-start' },

  avatar: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: '#0a0a1e',
    borderWidth: 1.5, borderColor: C.gold + '80',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 8, marginBottom: 4, flexShrink: 0,
  },
  lotusImg:  { width: '90%', height: '90%', resizeMode: 'contain' },

  bubble: { maxWidth: '78%', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 11 },
  userBubble: {
    backgroundColor: C.userBubble,
    borderBottomRightRadius: 4,
    borderWidth: 1, borderColor: C.borderSoft,
  },
  botBubble: {
    backgroundColor: C.botBubble,
    borderBottomLeftRadius: 4,
    borderWidth: 1, borderColor: C.border,
  },

  txt:     { fontSize: 16, lineHeight: 24 },
  userTxt: { color: C.textPrimary },
  botTxt:  { color: C.textPrimary },

  time:      { fontSize: 10, marginTop: 5, opacity: 0.45 },
  timeRight: { color: C.textSub, textAlign: 'right' },
  timeLeft:  { color: C.textMuted, textAlign: 'left' },
});

// ── Animated lotus typing indicator ────────────────────────────────────
function LotusTyping() {
  const scale   = useRef(new Animated.Value(0.65)).current;
  const opacity = useRef(new Animated.Value(0.4)).current;
  const glow    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const bloom = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale,   { toValue: 1.05, duration: 900, easing: Easing.inOut(Easing.sine), useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1,    duration: 900, easing: Easing.inOut(Easing.sine), useNativeDriver: true }),
          Animated.timing(glow,    { toValue: 1,    duration: 900, easing: Easing.inOut(Easing.sine), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale,   { toValue: 0.65, duration: 900, easing: Easing.inOut(Easing.sine), useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.4,  duration: 900, easing: Easing.inOut(Easing.sine), useNativeDriver: true }),
          Animated.timing(glow,    { toValue: 0,    duration: 900, easing: Easing.inOut(Easing.sine), useNativeDriver: true }),
        ]),
      ])
    );
    bloom.start();
    return () => bloom.stop();
  }, []);

  return (
    <View style={[b.wrap, b.wrapLeft, { marginBottom: 6 }]}>
      {/* Small lotus avatar beside bubble */}
      <View style={b.avatar}>
        <Image source={LOTUS} style={b.lotusImg} />
      </View>

      {/* Animated lotus inside the bubble */}
      <View style={[b.bubble, b.botBubble, t.bubble]}>
        <Animated.View style={[t.lotusWrap, { transform: [{ scale }], opacity }]}>
          <Image source={LOTUS} style={t.lotus} />
        </Animated.View>
        <Animated.View style={[t.ring, { opacity: glow }]} />
      </View>
    </View>
  );
}

const t = StyleSheet.create({
  bubble:    { paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  lotusWrap: { width: 36, height: 36 },
  lotus:     { width: 36, height: 36, resizeMode: 'contain' },
  ring: {
    position: 'absolute',
    width: 52, height: 52, borderRadius: 26,
    borderWidth: 1.5, borderColor: C.gold + '60',
  },
});

// ── Screen ─────────────────────────────────────────────────────────────
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
        id: `w_${Date.now()}`, role: 'mithra', ts: Date.now(),
        content: "Hey, I'm Mithra. What's on your mind?",
      });
    }
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading || !thread) return;

    appendMessage(threadId, { id: `u_${Date.now()}`, role: 'user', ts: Date.now(), content: text });
    setInput('');
    setLoading(true);
    scrollEnd();

    try {
      const data = await sendMessage({ text, sessionId: thread.sessionId, apiKey: apiKey || '' });
      appendMessage(threadId, { id: `m_${Date.now()}`, role: 'mithra', ts: Date.now(), content: data.reply });
    } catch (e) {
      appendMessage(threadId, { id: `e_${Date.now()}`, role: 'mithra', ts: Date.now(), content: `Something went wrong. ${e.message}` });
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

  if (!thread) return null;

  const title = thread.title.length > 24 ? thread.title.slice(0, 24) + '…' : thread.title;

  return (
    <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={C.surface} />

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}>
          <Text style={s.backTxt}>‹</Text>
        </TouchableOpacity>

        <View style={s.hCenter}>
          <View style={s.hAvatar}>
            <Image source={LOTUS} style={s.hLotusImg} />
          </View>
          <View style={s.hMeta}>
            <Text style={s.hName} numberOfLines={1}>{title}</Text>
            <View style={s.hStatus}>
              <View style={s.onlineDot} />
              <Text style={s.onlineTxt}>Mithra is present</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={s.iconBtn} onPress={handleReset}>
          <Text style={s.iconTxt}>↺</Text>
        </TouchableOpacity>
      </View>

      {/* ── Chat body ── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={listRef}
          data={thread.messages}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => (
            <Bubble
              msg={item}
              showTime={index === thread.messages.length - 1}
            />
          )}
          contentContainerStyle={s.list}
          onContentSizeChange={scrollEnd}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<View style={{ height: 8 }} />}
        />

        {loading && <LotusTyping />}

        {/* ── Input ── */}
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
              style={[s.sendBtn, (!input.trim() || loading) && s.sendOff]}
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
  back:    { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backTxt: { color: C.accentLight, fontSize: 34, lineHeight: 38, marginTop: -6 },

  hCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  hAvatar: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: '#0a0a1e',
    borderWidth: 1.5, borderColor: C.gold + '90',
    alignItems: 'center', justifyContent: 'center',
  },
  hLotusImg:  { width: '80%', height: '80%', resizeMode: 'contain' },
  hMeta:   { flex: 1 },
  hName:   { color: C.textPrimary, fontSize: 15, fontWeight: '700' },
  hStatus: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.online },
  onlineTxt: { color: C.online, fontSize: 11, fontWeight: '500' },

  iconBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.card,
    borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  iconTxt: { color: C.textMuted, fontSize: 15 },

  // Messages
  list: { paddingBottom: 12 },

  // Input area
  inputSafe: { backgroundColor: C.surface },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 12, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: C.border, gap: 10,
  },
  input: {
    flex: 1, backgroundColor: C.card,
    borderRadius: 24, borderWidth: 1, borderColor: C.border,
    color: C.textPrimary, paddingHorizontal: 18, paddingVertical: 12,
    fontSize: 16, lineHeight: 22, maxHeight: 130,
  },
  sendBtn: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: C.accent,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: C.accent, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 10, elevation: 6,
  },
  sendOff:  { opacity: 0.25, elevation: 0, shadowOpacity: 0 },
  sendTxt:  { color: '#fff', fontSize: 20, fontWeight: '700', marginTop: -2 },
});
