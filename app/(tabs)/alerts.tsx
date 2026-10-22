import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '@/constants/theme';
import { Panel, SectionHeading, ActionButton } from '@/components/weather/UI';
import { useWeather } from '@/context/WeatherContext';
import { activeAlerts, labelOf, uvLabel } from '@/services/weather';
import { ALERTS } from '@/types/weather';
import FoxMascot from '@/components/fox/FoxMascot';
export default function Alerts(){
 const {weather,prefs,updatePrefs}=useWeather();
 const warnings=weather?activeAlerts(weather,prefs.alerts):[];
 const toggle=(key:string)=>updatePrefs({alerts:prefs.alerts.includes(key)?prefs.alerts.filter(x=>x!==key):[...prefs.alerts,key]});
 return <SafeAreaView style={styles.root} edges={['top']}><StatusBar style="dark"/><ScrollView contentContainerStyle={styles.content}>
  <Text style={styles.eyebrow}>SUA SEGURANÇA IMPORTA</Text><Text style={styles.title}>Alertas do tempo 🔔</Text><Text style={styles.sub}>Acompanhe os riscos meteorológicos para suas atividades.</Text>
  <View style={styles.headCard}><View style={{flex:1}}><Text style={styles.headStatus}>{warnings.length?`${warnings.length} ${warnings.length===1?'atenção importante':'avisos importantes'}`:'Tudo tranquilo por aqui!'}</Text><Text style={styles.headDesc}>Condições em {weather?.city||'sua cidade'}</Text></View><FoxMascot size={128} weather={warnings.length?'rain':'sun'}/></View>
  <Panel><SectionHeading title="SITUAÇÃO ATUAL" icon="shield-checkmark-outline"/>
   {!weather?<Text style={styles.note}>Conecte-se à internet para consultar a previsão atualizada.</Text>:
   warnings.length?warnings.map(w=><View key={w.title} style={styles.warning}><Text style={{fontSize:25}}>{w.icon}</Text><View style={{flex:1}}><Text style={styles.warningTitle}>{w.title}</Text><Text style={styles.warningDesc}>{w.description}</Text></View></View>):
   <View style={styles.clearWeather}><Ionicons name="checkmark-circle" color={palette.mintDark} size={30}/><Text style={styles.clearText}>Nenhum alerta das categorias selecionadas com base na previsão disponível.</Text></View>}
  </Panel>
  {weather&&<Panel><SectionHeading title="RESUMO DA REGIÃO" icon="partly-sunny-outline"/><Text style={styles.summary}>{labelOf(weather.current.code)} · {Math.round(weather.current.temp)}°C · Vento {Math.round(weather.current.wind)} km/h · UV máx. {uvLabel(weather.current.uv)}</Text></Panel>}
  {weather&&<Panel><SectionHeading title="ATIVIDADE SÍSMICA PRÓXIMA" icon="pulse-outline"/>
   {weather.earthquakes.length===0?<Text style={styles.note}>Nenhum terremoto de magnitude 2 ou maior registrado em até 300 km nos últimos 7 dias.</Text>:
   weather.earthquakes.map(event=><View key={event.id} style={styles.warning}><Text style={{fontSize:23}}>🌎</Text><View style={{flex:1}}><Text style={styles.warningTitle}>Magnitude {event.magnitude.toFixed(1)} · {event.distanceKm} km</Text><Text style={styles.warningDesc}>{event.place} · {new Date(event.time).toLocaleDateString('pt-BR')}</Text></View></View>)}
   <Text style={styles.source}>Fonte: USGS. Este dado é informativo e não substitui alertas oficiais de emergência.</Text>
  </Panel>}
  <Panel><SectionHeading title="ACOMPANHAR FENÔMENOS" icon="options-outline"/>
   {ALERTS.map(a=>{const selected=prefs.alerts.includes(a.id);return <Pressable key={a.id} onPress={()=>toggle(a.id)} style={styles.choice}><Text style={{fontSize:24}}>{a.icon}</Text><Text style={styles.choiceLabel}>{a.label}</Text><Ionicons name={selected?'checkmark-circle':'ellipse-outline'} color={selected?palette.mintDark:'#C4C1D3'} size={25}/></Pressable>})}
  </Panel>
  <Text style={styles.footnote}>Os alertas exibidos são calculados a partir dos dados consultados, enquanto o app estiver aberto. Não substituem avisos oficiais da Defesa Civil. O lembrete diário é local e não verifica mudanças meteorológicas em segundo plano.</Text>
 </ScrollView></SafeAreaView>
}
const styles=StyleSheet.create({root:{flex:1,backgroundColor:'#F5F2FF'},content:{padding:18,paddingTop:32,paddingBottom:40},eyebrow:{fontSize:11,letterSpacing:1.5,color:palette.purple,fontWeight:'900'},title:{fontSize:32,fontWeight:'900',color:palette.ink,marginTop:10},sub:{fontSize:15,lineHeight:22,color:'#858099',marginTop:10,marginBottom:20},headCard:{backgroundColor:'#E8E3FF',borderRadius:24,paddingLeft:19,flexDirection:'row',alignItems:'center',marginBottom:16},headStatus:{fontSize:18,fontWeight:'900',color:palette.ink},headDesc:{fontSize:12,color:'#6A638B',marginTop:8},note:{color:palette.muted,fontSize:13},warning:{flexDirection:'row',alignItems:'flex-start',gap:12,paddingVertical:14,borderTopWidth:1,borderTopColor:'#F0EDF6'},warningTitle:{fontWeight:'900',color:palette.ink,fontSize:15},warningDesc:{color:'#7D7891',fontSize:13,lineHeight:19,marginTop:5},source:{fontSize:11,color:palette.muted,lineHeight:17,marginTop:10},clearWeather:{flexDirection:'row',alignItems:'center',gap:11,backgroundColor:'#E9FBF2',borderRadius:15,padding:14},clearText:{flex:1,color:'#297E64',fontSize:13,lineHeight:20,fontWeight:'700'},summary:{fontSize:14,color:palette.ink,lineHeight:23},choice:{minHeight:60,flexDirection:'row',alignItems:'center',gap:12,borderTopWidth:1,borderTopColor:'#F2F0F8'},choiceLabel:{flex:1,fontSize:15,color:palette.ink,fontWeight:'800'},footnote:{fontSize:11,lineHeight:18,color:'#9690A7',paddingHorizontal:6}})
