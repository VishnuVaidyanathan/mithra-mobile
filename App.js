import React, { useContext, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

import { ThreadsProvider, ThreadsContext } from './src/ThreadsContext';
import ThreadsScreen from './src/screens/ThreadsScreen';
import ChatScreen    from './src/screens/ChatScreen';
import SettingsModal from './src/SettingsModal';
import { C } from './src/theme';

const Stack = createNativeStackNavigator();

// Settings icon lives in the nav header
function SettingsButton() {
  const { apiKey, setApiKey } = useContext(ThreadsContext);
  const [show, setShow] = useState(false);
  return (
    <>
      <TouchableOpacity style={hdr.btn} onPress={() => setShow(true)}>
        <Text style={hdr.btnTxt}>⚙</Text>
      </TouchableOpacity>
      <SettingsModal
        visible={show}
        apiKey={apiKey}
        onSave={setApiKey}
        onClose={() => setShow(false)}
      />
    </>
  );
}

const hdr = StyleSheet.create({
  btn:    { padding: 6 },
  btnTxt: { color: C.textMuted, fontSize: 18 },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <ThreadsProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerStyle:      { backgroundColor: C.surface },
              headerTintColor:  C.textPrimary,
              headerTitleStyle: { fontWeight: '700' },
              contentStyle:     { backgroundColor: C.bg },
              animation:        'slide_from_right',
            }}
          >
            <Stack.Screen
              name="Threads"
              component={ThreadsScreen}
              options={{
                title: 'Mithra',
                headerShown: false,   // ThreadsScreen has its own header
              }}
            />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{
                headerShown: false,   // ChatScreen has its own header
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </ThreadsProvider>
    </SafeAreaProvider>
  );
}
