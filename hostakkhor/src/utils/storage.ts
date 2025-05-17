import AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageKeys = {
  USER_DATA: '@hostakkhor:user',
  AUTH_TOKEN: '@hostakkhor:auth_token',
  ONBOARDING_COMPLETE: '@hostakkhor:onboarding_complete',
};

export const storage = {
  async getItem(key: string) {
    try {
      const item = await AsyncStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  },

  async setItem(key: string, value: any) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Storage setItem error:', error);
      return false;
    }
  },

  async removeItem(key: string) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage removeItem error:', error);
      return false;
    }
  },

  async clear() {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  },
};