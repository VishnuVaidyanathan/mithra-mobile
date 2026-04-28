import React, { createContext, useState } from 'react';
import { useThreads } from './store';

export const ThreadsContext = createContext({});

export function ThreadsProvider({ children }) {
  const store   = useThreads();
  const [apiKey, setApiKey] = useState('');

  return (
    <ThreadsContext.Provider value={{ ...store, apiKey, setApiKey }}>
      {children}
    </ThreadsContext.Provider>
  );
}
