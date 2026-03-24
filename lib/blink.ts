import { createClient, AsyncStorageAdapter } from '@blinkdotnew/sdk';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';

// Initialize Blink SDK for Muslim Russia
// authRequired: false allows users to see prayer times and adhkar without login
export const blink = createClient({
  projectId: process.env.EXPO_PUBLIC_BLINK_PROJECT_ID!,
  authRequired: false,
  auth: { 
    mode: 'headless', 
    webBrowser: WebBrowser 
  },
  storage: new AsyncStorageAdapter(AsyncStorage)
});
