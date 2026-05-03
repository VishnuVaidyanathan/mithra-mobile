import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThreads } from './store';

export const ThreadsContext = createContext({});

const API_KEY_STORAGE = 'mithra_api_key_v1';

export function ThreadsProvider({ children }) {
  const store   = useThreads();
  const [apiKey, setApiKeyState] = useState('');

  // Load saved API key on startup
  useEffect(() => {
    AsyncStorage.getItem(API_KEY_STORAGE)
      .then(k => { if (k) setApiKeyState(k); })
      .catch(() => {});
  }, []);

  // Persist API key whenever it changes
  const setApiKey = (key) => {
    setApiKeyState(key);
    AsyncStorage.setItem(API_KEY_STORAGE, key).catch(() => {});
  };

  return (
    <ThreadsContext.Provider value={{ ...store, apiKey, setApiKey }}>
      {children}
    </ThreadsContext.Provider>
  );
}
