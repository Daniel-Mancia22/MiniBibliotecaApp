import AsyncStorage from '@react-native-async-storage/async-storage';

export const storageService = {
    saveUserId: async (userId) => {
        try {
            await AsyncStorage.setItem('userId', userId);
        } catch (error) {
            throw error;
        }
    },

    getUserId: async () => {
        try {
            return await AsyncStorage.getItem('userId');
        } catch (error) {
            throw error;
        }
    },

    removeUserId: async () => {
        try {
            await AsyncStorage.removeItem('userId');
        } catch (error) {
            throw error;
        }
    }
};