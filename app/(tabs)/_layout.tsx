import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '@/constants/theme';
export default function TabLayout(){return <Tabs screenOptions={{headerShown:false,tabBarActiveTintColor:palette.purple,tabBarInactiveTintColor:'#A19CB4',tabBarStyle:{backgroundColor:'#fff',borderTopWidth:0,height:76,paddingBottom:10,paddingTop:10,elevation:10,shadowColor:'#251852',shadowOpacity:.08,shadowRadius:10},tabBarLabelStyle:{fontWeight:'800',fontSize:11}}}>
 <Tabs.Screen name="index" options={{title:'Clima',tabBarIcon:({color,focused})=><Ionicons name={focused?'partly-sunny':'partly-sunny-outline'} size={25} color={color}/>}}/>
 <Tabs.Screen name="explore" options={{title:'Explorar',tabBarIcon:({color,focused})=><Ionicons name={focused?'search-circle':'search-circle-outline'} size={25} color={color}/>}}/>
 <Tabs.Screen name="alerts" options={{title:'Alertas',tabBarIcon:({color,focused})=><Ionicons name={focused?'notifications':'notifications-outline'} size={24} color={color}/>}}/>
 <Tabs.Screen name="settings" options={{title:'Ajustes',tabBarIcon:({color,focused})=><Ionicons name={focused?'settings':'settings-outline'} size={24} color={color}/>}}/>
 </Tabs>}
