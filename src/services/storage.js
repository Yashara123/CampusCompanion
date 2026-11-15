import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@campus_companion_data_v1';

// Default empty app data so user can add/delete freely without mock reset issues
const DEFAULT_DATA = {
  courses: [],
  plannerTasks: [],
  assignments: []
};

export const getAppData = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (jsonValue != null) {
      return JSON.parse(jsonValue);
    } else {
      // Initialize with default empty data
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
      return DEFAULT_DATA;
    }
  } catch (e) {
    console.error('Failed to load app data', e);
    return DEFAULT_DATA;
  }
};

export const saveAppData = async (data) => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
  } catch (e) {
    console.error('Failed to save app data', e);
  }
};