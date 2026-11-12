import AsyncStorage from '@react-native-async-storage/async-storage';
import initialData from '../data/initialData.json';

const STORAGE_KEY = '@campus_companion_v2_data';

export const getAppData = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (jsonValue === null) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(jsonValue);
  } catch (e) {
    console.error('Failed to load data', e);
    return initialData;
  }
};

export const saveAppData = async (data) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data', e);
  }
};

export const resetAppData = async () => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    return initialData;
  } catch (e) {
    console.error('Failed to reset data', e);
    return initialData;
  }
};
