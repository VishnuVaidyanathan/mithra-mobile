/**
 * In-memory thread store.
 * Each thread: { id, title, messages: [], sessionId, createdAt, updatedAt }
 */

import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'mithra_threads_v1';

// ── Helpers ──────────────────────────────────────────────────────────
function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function makeThread(title = 'New conversation') {
  const now = Date.now();
  return {
    id:        makeId(),
    title,
    messages:  [],
    sessionId: `s_${makeId()}`,
    createdAt: now,
    updatedAt: now,
  };
}

// ── Persistence ───────────────────────────────────────────────────────
export async function loadThreads() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveThreads(threads) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
  } catch { /* ignore */ }
}

// ── Hook ──────────────────────────────────────────────────────────────
export function useThreads() {
  const [threads, setThreads] = useState([]);

  useEffect(() => {
    loadThreads().then(setThreads);
  }, []);

  const persist = (updated) => {
    setThreads(updated);
    saveThreads(updated);
  };

  const createThread = () => {
    const t = makeThread();
    persist([t, ...threads]);
    return t;
  };

  const deleteThread = (id) => {
    persist(threads.filter(t => t.id !== id));
  };

  const updateThread = (id, patch) => {
    persist(threads.map(t => t.id === id ? { ...t, ...patch, updatedAt: Date.now() } : t));
  };

  const appendMessage = (id, msg) => {
    persist(
      threads.map(t => {
        if (t.id !== id) return t;
        const messages  = [...t.messages, msg];
        const title     = t.messages.length === 0 && msg.role === 'user'
          ? msg.content.slice(0, 48)
          : t.title;
        return { ...t, messages, title, updatedAt: Date.now() };
      })
    );
  };

  return { threads, createThread, deleteThread, updateThread, appendMessage };
}
