import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { WeatherProvider } from '@/context/WeatherContext';
import 'react-native-reanimated';
export default function RootLayout(){return <WeatherProvider><StatusBar style="auto"/><Stack screenOptions={{headerShown:false,animation:'fade'}}><Stack.Screen name="index"/><Stack.Screen name="onboarding"/><Stack.Screen name="(tabs)"/></Stack></WeatherProvider>}
