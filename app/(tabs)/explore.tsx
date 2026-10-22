import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ActivityIndicator, Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { palette } from '@/constants/theme';
import FoxMascot from '@/components/fox/FoxMascot';
import { ActionButton, Panel, SectionHeading } from '@/components/weather/UI';
import { useWeather } from '@/context/WeatherContext';
import WeatherIcon from '@/components/weather/WeatherIcon';
import { labelOf } from '@/services/weather';
export default function Explore(){
 const [query,setQuery]=useState('');const {weather,busy,error,searchCity,useLocation,prefs,toggleFavorite}=useWeather();
 const choose=async(city:string)=>{Keyboard.dismiss();const result=await searchCity(city);if(result){setQuery('');router.replace('/(tabs)');}};
 const locate=async()=>{Keyboard.dismiss();if(await useLocation())router.replace('/(tabs)');};
 return <SafeAreaView style={styles.root} edges={['top']}><StatusBar style="dark"/><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
  <Text style={styles.eyebrow}>DESCUBRA O MUNDO</Text><Text style={styles.title}>Qual céu vamos explorar? 🌎</Text><Text style={styles.sub}>Encontre a previsão de qualquer cidade e salve seus lugares favoritos.</Text>
  <View style={styles.searchBox}><Ionicons name="search" color={palette.purple} size={22}/><TextInput style={styles.input} placeholder="Buscar cidade, ex.: Curitiba" placeholderTextColor="#AAA4B8" value={query} onChangeText={setQuery} onSubmitEditing={()=>void choose(query)} returnKeyType="search" autoCapitalize="words" autoCorrect={false}/>{query.length>0&&<Pressable onPress={()=>setQuery('')}><Ionicons name="close-circle" size={20} color={palette.muted}/></Pressable>}</View>
  <ActionButton title="Buscar previsão" busy={busy} icon="search" onPress={()=>void choose(query)} disabled={!query.trim()}/>
  <Pressable onPress={()=>void locate()} style={styles.locationButton}><Ionicons name="locate" color={palette.purple} size={20}/><Text style={styles.locationText}>Usar minha localização atual</Text><Ionicons name="arrow-forward" color={palette.purple} size={18}/></Pressable>
  {error&&<View style={styles.error}><Ionicons name="alert-circle-outline" color="#B63A58" size={20}/><Text style={styles.errorText}>{error}</Text></View>}
  {busy&&<ActivityIndicator color={palette.purple} style={{marginTop:16}}/>}
  <Panel style={{marginTop:21}}><SectionHeading title="LUGARES FAVORITOS" icon="heart-outline"/>
   {prefs.favoriteCities.length===0?<Text style={styles.empty}>Toque no coração de uma cidade para adicioná-la.</Text>:prefs.favoriteCities.map(city=><View key={city} style={styles.favoriteRow}>
    <Pressable onPress={()=>void choose(city)} style={{flexDirection:'row',flex:1,alignItems:'center',gap:10}}><Ionicons name="location-outline" color={palette.purple} size={22}/><Text style={styles.favoriteCity}>{city}</Text></Pressable>
    <Pressable onPress={()=>toggleFavorite(city)} accessibilityLabel={`Remover ${city} dos favoritos`}><Ionicons name="heart" color={palette.danger} size={22}/></Pressable>
   </View>)}
  </Panel>
  {weather&&<Panel><SectionHeading title="CIDADE SELECIONADA" icon="navigate-circle-outline"/><View style={styles.selectedWeather}><WeatherIcon code={weather.current.code} size={44}/><View style={{flex:1}}><Text style={styles.favoriteCity}>{weather.city}</Text><Text style={styles.selectedDesc}>{labelOf(weather.current.code)}</Text></View><Text style={styles.selectedTemp}>{Math.round(weather.current.temp)}°</Text></View>
   <View style={{marginTop:14}}><ActionButton title={prefs.favoriteCities.includes(weather.city)?'Remover dos favoritos':'Salvar cidade'} icon={prefs.favoriteCities.includes(weather.city)?'heart':'heart-outline'} onPress={()=>toggleFavorite(weather.city)} secondary/></View>
  </Panel>}
  <View style={styles.endCard}><View style={{flex:1}}><Text style={styles.endTitle}>A Fifi é sua guia!</Text><Text style={styles.endSub}>Da praia à montanha, sempre uma previsão ao seu lado.</Text></View><FoxMascot size={135}/></View>
 </ScrollView></SafeAreaView>
}
const styles=StyleSheet.create({root:{flex:1,backgroundColor:'#F5F2FF'},content:{padding:19,paddingTop:31,paddingBottom:45},eyebrow:{fontWeight:'900',letterSpacing:1.6,color:palette.purple,fontSize:11},title:{fontSize:33,fontWeight:'900',lineHeight:39,color:palette.ink,marginTop:12},sub:{fontSize:15,color:'#817C98',lineHeight:23,marginTop:11,marginBottom:24},searchBox:{height:58,backgroundColor:'white',borderRadius:18,paddingHorizontal:17,flexDirection:'row',alignItems:'center',gap:10,borderWidth:1,borderColor:'#EBE6FF',marginBottom:12},input:{flex:1,fontSize:15,color:palette.ink,height:'100%'},locationButton:{height:55,flexDirection:'row',gap:10,alignItems:'center',justifyContent:'center',marginTop:12},locationText:{fontSize:14,color:palette.purple,fontWeight:'800'},error:{backgroundColor:'#FFECF0',padding:15,borderRadius:14,flexDirection:'row',alignItems:'center',gap:7,marginTop:10},errorText:{color:'#B63A58',fontSize:13,flex:1},favoriteRow:{flexDirection:'row',paddingVertical:14,borderTopWidth:1,borderTopColor:'#F1EEF8',alignItems:'center'},favoriteCity:{fontSize:16,fontWeight:'800',color:palette.ink},selectedWeather:{flexDirection:'row',alignItems:'center',gap:12},selectedDesc:{fontSize:12,color:palette.muted,marginTop:3},selectedTemp:{fontSize:34,fontWeight:'900',color:palette.ink},empty:{fontSize:13,color:palette.muted},endCard:{backgroundColor:'#E5E0FF',borderRadius:23,paddingLeft:18,flexDirection:'row',alignItems:'center'},endTitle:{fontSize:17,fontWeight:'900',color:palette.ink},endSub:{fontSize:12,color:'#716C90',lineHeight:19,marginTop:6}});
