import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { API_URL } from "../constants/api";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

const PushNotification = ({ children }) => {

    // Register for push notifications
    const registerForPushNotificationsAsync = async () => {
        let token;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        if (!Device.isDevice) {
            console.warn('Must use physical device for Push Notifications');
            return;
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status ?? existingStatus;
        }

        if (finalStatus !== 'granted') {
            console.warn('Failed to get push token for push notification!');
            return;
        }

        try {
            const projectId = Constants.expoConfig?.extra?.eas?.projectId;
            if (!projectId) {
                console.error('No Expo projectId found!');
                return;
            }

            token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
            return token;
        } catch (error) {
            console.error('Error getting push token:', error);
        }
    };

    const updateToken = async (token) => {
        try {
            const userStr = await SecureStore.getItemAsync("userInfo");
            if (!userStr) return;
            const userId = JSON.parse(userStr).userId;
            await axios.post(`${API_URL}/updatepushtoken`, { userId, token });
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        registerForPushNotificationsAsync().then((token) => {
            if (token) {
                updateToken(token);
            }
        });

        // Notification received listener
        const receivedSubscription = Notifications.addNotificationReceivedListener(
            (notification) => {
                console.log('Notification Received:', notification.request.content.data);
            },
        );

        // Notification tap listener
        const responseSubscription = Notifications.addNotificationResponseReceivedListener(
            (response) => {
                const data = response.notification.request.content.data;
                console.log('Notification Tapped:', data);
            }
        );

        return () => {
            receivedSubscription.remove();
            responseSubscription.remove();
        };
    }, []);

    return <>{children}</>;
};

export default PushNotification;
