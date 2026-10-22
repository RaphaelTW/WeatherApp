import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useWeather } from '@/context/WeatherContext';
import { palette } from '@/constants/theme';
export default function Boot(){const {ready,prefs}=useWeather();if(!ready)return <View style={{flex:1,backgroundColor:palette.night,alignItems:'center',justifyContent:'center'}}><ActivityIndicator color={palette.mint}/></View>;return <Redirect href={prefs.completedOnboarding?'/(tabs)':'/onboarding'}/>}
