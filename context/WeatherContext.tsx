import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { getWeather, geocodeCity } from '@/services/weather';
import { refreshDailyReminders } from '@/services/notifications';
import { initialPrefs, UserPrefs, WeatherBundle } from '@/types/weather';

const PREF_KEY='weatherapp.preferences.v2';
const LEGACY_PREF_KEY='climaraposa.preferences.v2';
const WEATHER_CACHE_KEY='weatherapp.last-weather.v1';
type WeatherContextValue={
 prefs:UserPrefs; updatePrefs:(changes:Partial<UserPrefs>)=>void; ready:boolean;
 weather:WeatherBundle|null; busy:boolean; error:string|null; clearError:()=>void;
 refresh:()=>Promise<void>; searchCity:(name:string)=>Promise<boolean>; useLocation:()=>Promise<boolean>;
 toggleFavorite:(city:string)=>void;
};
const WeatherContext=createContext<WeatherContextValue|null>(null);
export function WeatherProvider({children}:{children:React.ReactNode}){
 const [prefs,setPrefs]=useState<UserPrefs>(initialPrefs);
 const [ready,setReady]=useState(false);
 const [weather,setWeather]=useState<WeatherBundle|null>(null);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState<string|null>(null);
 const [selection,setSelection]=useState({latitude:-23.5505,longitude:-46.6333,city:'São Paulo',country:'Brasil'});
 const initialized=useRef(false);
 useEffect(()=>{let active=true;Promise.all([AsyncStorage.getItem(PREF_KEY),AsyncStorage.getItem(LEGACY_PREF_KEY),AsyncStorage.getItem(WEATHER_CACHE_KEY)]).then(([current,legacy,cachedWeather])=>{
  const stored=current||legacy;
  if(stored&&active){try{setPrefs({...initialPrefs,...JSON.parse(stored)});}catch{}}
  if(cachedWeather&&active){try{const cached=JSON.parse(cachedWeather) as WeatherBundle;if(cached?.current&&cached?.daily&&cached?.hourly){setWeather(cached);setSelection({latitude:cached.latitude,longitude:cached.longitude,city:cached.city,country:cached.country||''});}}catch{}}
 }).catch(()=>{}).finally(()=>{if(active)setReady(true)});return()=>{active=false};},[]);
 const updatePrefs=useCallback((changes:Partial<UserPrefs>)=>{setPrefs(p=>({...p,...changes}));},[]);
 useEffect(()=>{if(ready)AsyncStorage.setItem(PREF_KEY,JSON.stringify(prefs)).catch(()=>{});},[prefs,ready]);
 useEffect(()=>{if(ready&&prefs.notificationsEnabled&&weather)void refreshDailyReminders(weather);},[prefs.notificationsEnabled,ready,weather]);
 const load=useCallback(async(location:typeof selection)=>{
   setBusy(true);setError(null);
   try{const data=await getWeather(location.latitude,location.longitude,location.city,location.country);setWeather(data);setSelection(location);AsyncStorage.setItem(WEATHER_CACHE_KEY,JSON.stringify(data)).catch(()=>{});}catch(e){setError(e instanceof Error?e.message:'Não foi possível consultar a previsão. Confira sua conexão.');}
   finally{setBusy(false)}
 },[]);
 const refresh=useCallback(async()=>{await load(selection);},[load,selection]);
 const searchCity=useCallback(async(name:string)=>{
   setBusy(true);setError(null);
   try{const places=await geocodeCity(name.trim());const place=places[0];
     await load({latitude:place.latitude,longitude:place.longitude,city:place.name,country:place.country||''});return true;
   }catch(e){setError(e instanceof Error?e.message:'Não foi possível localizar esta cidade.');return false;}
   finally{setBusy(false)}
 },[load]);
 const useLocation=useCallback(async()=>{
  try{
   if(Platform.OS==='web' && typeof navigator==='undefined')throw new Error('Localização indisponível neste dispositivo.');
   const permission=await Location.requestForegroundPermissionsAsync();
   if(permission.status!=='granted')throw new Error('Permissão negada. Você ainda pode buscar cidades manualmente.');
   setBusy(true);
   const pos=await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.Balanced});
   let city='Minha localização';let country='';
   try{const addresses=await Location.reverseGeocodeAsync(pos.coords);city=addresses[0]?.city||addresses[0]?.subregion||city;country=addresses[0]?.country||country;}catch{}
   await load({latitude:pos.coords.latitude,longitude:pos.coords.longitude,city,country});return true;
  }catch(e){setError(e instanceof Error?e.message:'GPS indisponível.');return false;}finally{setBusy(false)}
 },[load]);
 useEffect(()=>{
  if(!ready||initialized.current)return;
  initialized.current=true;
  if(!prefs.completedOnboarding){void load(selection);return;}
  void useLocation().then(found=>{if(!found)void load(selection);});
 },[load,prefs.completedOnboarding,ready,selection,useLocation]);
 const toggleFavorite=useCallback((city:string)=>{setPrefs(p=>({...p,favoriteCities:p.favoriteCities.includes(city)?p.favoriteCities.filter(x=>x!==city):[...p.favoriteCities,city].slice(0,8)}));},[]);
 return <WeatherContext.Provider value={{prefs,updatePrefs,ready,weather,busy,error,clearError:()=>setError(null),refresh,searchCity,useLocation,toggleFavorite}}>{children}</WeatherContext.Provider>;
}
export function useWeather(){const context=useContext(WeatherContext);if(!context)throw new Error('WeatherProvider ausente');return context;}
