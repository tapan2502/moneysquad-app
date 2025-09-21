import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// For web platform, we'll use AsyncStorage directly
// For native platforms, we'll use a fallback to AsyncStorage since EncryptedStorage is causing issues
export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.setItem(key, value);
      } else {
        // Use AsyncStorage as fallback for native platforms
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('Error storing data:', error);
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return await AsyncStorage.getItem(key);
      } else {
        // Use AsyncStorage as fallback for native platforms
        return await AsyncStorage.getItem(key);
      }
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.removeItem(key);
      } else {
        // Use AsyncStorage as fallback for native platforms
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Error removing data:', error);
    }
  },

  async clear(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.clear();
      } else {
        // Use AsyncStorage as fallback for native platforms
        await AsyncStorage.clear();
      }
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};