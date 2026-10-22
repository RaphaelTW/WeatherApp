import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '@/constants/theme';
import FoxMascot from '@/components/fox/FoxMascot';
import SkyScene from '@/components/weather/SkyScene';
import { ActionButton } from '@/components/weather/UI';
import { useWeather } from '@/context/WeatherContext';
import { ACTIVITIES, ALERTS, Choice } from '@/types/weather';
import { activateDailyReminder } from '@/services/notifications';

const STEPS=7;
export default function Onboarding(){
 const [step,setStep]=useState(0);const [working,setWorking]=useState(false);
 const {prefs,updatePrefs,useLocation,error}=useWeather();
 const finish=()=>{updatePrefs({completedOnboarding:true});router.replace('/(tabs)');};
 const next=()=>{if(step>=STEPS-1)finish();else setStep(x=>x+1)};
 const toggle=(kind:'activities'|'alerts',value:string)=>{const items=prefs[kind];updatePrefs({[kind]:items.includes(value)?items.filter(x=>x!==value):[...items,value]});};
 const requestLocation=async()=>{setWorking(true);await useLocation();setWorking(false);next()};
 const requestNotifications=async()=>{setWorking(true);const enabled=await activateDailyReminder();updatePrefs({notificationsEnabled:enabled});setWorking(false);finish()};
 const headline=['Seu clima, sua vibe.','Dicas que cuidam de você.','Como a raposa pode ajudar?','O que você ama fazer?','Quais alertas importam?','Previsão do seu cantinho.','Uma ajudinha pela manhã.'][step];
 const subtitle=[
  'Uma previsão inteligente, dicas úteis e uma raposinha para deixar seus dias mais leves.',
  'A raposa combina o clima com suas atividades para sugerir o melhor momento de sair.',
  'Escolha o que combina com a sua rotina. Você pode mudar tudo depois.',
  'Vamos personalizar as recomendações para seus planos favoritos.',
  'Escolha os fenômenos que quer acompanhar no seu painel de alertas.',
  'Você escolhe: usar seu GPS ou buscar qualquer cidade manualmente.',
  'Receba um lembrete diário para conferir a previsão atualizada.',
 ][step];
 const canContinue=(step!==3||prefs.activities.length>0)&&(step!==4||prefs.alerts.length>0);
 return <SafeAreaView style={styles.root} edges={['top','bottom']}>
  <StatusBar barStyle="light-content"/>
  <SkyScene kind={step===1?'rain':'cloud'} mode={prefs.colorMode}/>
  <View style={styles.top}>
   <Pressable onPress={()=>step?setStep(step-1):finish()} style={styles.back} accessibilityLabel="Voltar"><Ionicons name="arrow-back" size={22} color="white"/></Pressable>
   <View style={styles.dots}>{Array.from({length:STEPS}).map((_,i)=><View key={i} style={[styles.dot,i===step&&styles.dotActive]}/>)}</View>
   <Pressable onPress={finish}><Text style={styles.skip}>Pular</Text></Pressable>
  </View>
  <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
   <Text style={styles.eyebrow}>WEATHERAPP  ·  {step+1}/{STEPS}</Text>
   <Text style={styles.heading}>{headline}</Text>
   <Text style={styles.sub}>{subtitle}</Text>
   {step<=1&&<View style={styles.mascotBlock}>
     <FoxMascot size={step===0?250:207} weather={step===1?'rain':'sun'}/>
     <View style={styles.bubble}><Text style={styles.bubbleTitle}>{step===0?'Oi, eu sou a Fifi! 🦊':'Leve um guarda-chuva ☂️'}</Text><Text style={styles.bubbleText}>{step===0?'Sua nova parceira para todo tipo de tempo. Toque em mim!':'O céu pode mudar. Eu te aviso antes!'}</Text></View>
   </View>}
   {step===1&&<View style={styles.preview}><Text style={styles.previewTitle}>PREVISÃO DE HOJE</Text><View style={styles.hourStrip}>{['☀️','🌤️','⛅','🌧️','🌦️'].map((x,i)=><View key={i} style={styles.hour}><Text style={styles.hourTime}>{12+i}:00</Text><Text style={{fontSize:25}}>{x}</Text><Text style={styles.hourTemp}>{[25,26,24,20,19][i]}°</Text></View>)}</View></View>}
   {step===2&&<View style={styles.card}>{[
      ['👕','Escolher o que vestir e levar'],['🏃','Planejar caminhadas e corridas'],['🏝️','Organizar passeios e viagens'],['🔔','Receber avisos meteorológicos']
    ].map(([icon,text],i)=><View key={i} style={[styles.listRow,i!==3&&styles.rowBorder]}><Text style={styles.listEmoji}>{icon}</Text><Text style={styles.listText}>{text}</Text><Ionicons name="checkmark-circle" color={palette.mint} size={25}/></View>)}
    <View style={{alignItems:'center'}}><FoxMascot size={125}/></View>
   </View>}
   {(step===3||step===4)&&<View style={styles.card}>{(step===3?ACTIVITIES:ALERTS).map((item:Choice,i:number)=>{
    const selected=prefs[step===3?'activities':'alerts'].includes(item.id);
    return <Pressable key={item.id} accessibilityRole="checkbox" accessibilityState={{checked:selected}} onPress={()=>toggle(step===3?'activities':'alerts',item.id)} style={[styles.listRow,i!==(step===3?ACTIVITIES:ALERTS).length-1&&styles.rowBorder,selected&&styles.chosen]}>
     <Text style={styles.listEmoji}>{item.icon}</Text><Text style={styles.listText}>{item.label}</Text><Ionicons name={selected?'checkmark-circle':'ellipse-outline'} size={26} color={selected?palette.mint:'#B7B3CA'}/>
    </Pressable>
   })}</View>}
   {step===5&&<View style={styles.permissionCard}><View style={styles.permissionCircle}><Ionicons name="location" color={palette.purple} size={80}/></View><Text style={styles.permissionTitle}>Onde está fazendo sol?</Text><Text style={styles.permissionDesc}>Com sua autorização, vamos consultar o clima local. Suas coordenadas são enviadas ao serviço meteorológico, sem servidor próprio do app.</Text><View style={styles.foxSide}><FoxMascot size={145}/></View></View>}
   {step===6&&<View style={styles.permissionCard}><View style={styles.permissionCircle}><Ionicons name="notifications" color={palette.purple} size={77}/></View><View style={styles.notificationDemo}><Text style={{fontSize:22}}>🦊</Text><View style={{flex:1}}><Text style={styles.notificationTitle}>WeatherApp</Text><Text style={styles.notificationText}>Bom dia! Confira como está o tempo hoje.</Text></View><Text style={{color:palette.muted,fontSize:11}}>7:00</Text></View><View style={styles.foxSide}><FoxMascot size={143}/></View></View>}
  </ScrollView>
  <View style={styles.footer}>
   {step===5?<ActionButton title={working?'Buscando localização...':'Usar minha localização'} busy={working} icon="navigate" onPress={requestLocation}/>:
   step===6?<ActionButton title="Ativar lembrete diário" busy={working} icon="notifications" onPress={requestNotifications}/>:
   <ActionButton title={step===0?'Conhecer a Fifi':'Continuar'} onPress={next} icon="arrow-forward" disabled={!canContinue}/>}
   {step>=5&&<Pressable onPress={next} style={styles.later}><Text style={styles.laterText}>{step===5?'Buscar cidade manualmente':'Agora não'}</Text></Pressable>}
   {error&&step===5&&<Text style={styles.error}>{error}</Text>}
  </View>
 </SafeAreaView>
}
const styles=StyleSheet.create({
 root:{flex:1,backgroundColor:palette.night},top:{height:62,paddingHorizontal:24,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},back:{width:37,padding:5},dots:{flexDirection:'row',gap:5,alignItems:'center'},dot:{width:8,height:8,borderRadius:8,backgroundColor:'#FFFFFF50'},dotActive:{width:24,backgroundColor:palette.mint},skip:{color:'#EFEAFF',fontSize:15,fontWeight:'700'},
 content:{padding:26,paddingTop:28,paddingBottom:30},eyebrow:{color:palette.mint,fontSize:11,fontWeight:'900',letterSpacing:2,marginBottom:12},heading:{color:'white',fontSize:34,lineHeight:40,fontWeight:'900',letterSpacing:-.9},sub:{color:'#D9D1FF',fontSize:16,lineHeight:24,marginTop:10,marginBottom:22},
 mascotBlock:{alignItems:'center',marginTop:12},bubble:{backgroundColor:'white',borderRadius:24,padding:18,marginTop:-5,alignSelf:'stretch'},bubbleTitle:{color:palette.ink,fontWeight:'900',fontSize:17},bubbleText:{color:'#65627B',fontSize:14,marginTop:5,lineHeight:19},
 preview:{marginTop:17,borderRadius:21,padding:15,backgroundColor:'#FFFFFFEB'},previewTitle:{fontSize:12,fontWeight:'900',color:palette.ink,marginBottom:12},hourStrip:{flexDirection:'row',justifyContent:'space-around'},hour:{alignItems:'center',gap:6},hourTime:{fontSize:11,color:'#68637E'},hourTemp:{fontSize:17,fontWeight:'900',color:palette.ink},
 card:{backgroundColor:'white',borderRadius:24,overflow:'hidden',paddingHorizontal:16,marginTop:4},listRow:{minHeight:69,flexDirection:'row',alignItems:'center',paddingHorizontal:5,gap:13},rowBorder:{borderBottomWidth:1,borderBottomColor:'#EDEBF4'},chosen:{backgroundColor:'#F5FFF9'},listEmoji:{fontSize:26,width:35,textAlign:'center'},listText:{flex:1,fontSize:16,lineHeight:22,fontWeight:'700',color:palette.ink},
 permissionCard:{minHeight:365,backgroundColor:'#FCFBFF',borderRadius:26,padding:23,alignItems:'center',overflow:'hidden'},permissionCircle:{width:160,height:160,borderRadius:80,backgroundColor:'#ECE9FF',alignItems:'center',justifyContent:'center'},permissionTitle:{color:palette.ink,fontSize:23,fontWeight:'900',marginTop:16,textAlign:'center'},permissionDesc:{color:'#77738C',textAlign:'center',fontSize:15,lineHeight:22,marginTop:9},foxSide:{alignSelf:'flex-end',height:110,marginTop:6},notificationDemo:{marginTop:20,width:'100%',padding:15,backgroundColor:'#F1EFFF',borderRadius:18,flexDirection:'row',alignItems:'center',gap:8},notificationTitle:{fontSize:13,color:palette.purple,fontWeight:'900'},notificationText:{fontSize:12,color:palette.ink,lineHeight:17},
 footer:{paddingHorizontal:24,paddingBottom:15,paddingTop:8,backgroundColor:'#1A1243D9'},later:{paddingVertical:12,alignItems:'center'},laterText:{color:'#FFFFFFCC',fontWeight:'700',fontSize:14},error:{color:'#FFDAD9',textAlign:'center',fontSize:12}
});
