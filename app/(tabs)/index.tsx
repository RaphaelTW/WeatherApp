import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Share, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Svg,{ Line, Circle, Polyline, Text as SvgText } from 'react-native-svg';
import { palette } from '@/constants/theme';
import FoxMascot from '@/components/fox/FoxMascot';
import SkyScene from '@/components/weather/SkyScene';
import WeatherIcon from '@/components/weather/WeatherIcon';
import { ActionButton, Panel, SectionHeading } from '@/components/weather/UI';
import { useWeather } from '@/context/WeatherContext';
import { activeAlerts, compass, dateOf, friendlyDay, hourOf, kindOf, labelOf, personalizedAdvice, uvLabel } from '@/services/weather';
import { Hourly } from '@/types/weather';

type Metric='temp'|'feels'|'rain'|'wind';
const metricOptions:{id:Metric;label:string;icon:keyof typeof Ionicons.glyphMap;unit:string}[]=[
 {id:'temp',label:'Temp.',icon:'thermometer-outline',unit:'°'},
 {id:'feels',label:'Sensação',icon:'body-outline',unit:'°'},
 {id:'rain',label:'Chuva',icon:'water-outline',unit:'%'},
 {id:'wind',label:'Vento',icon:'flag-outline',unit:' km/h'},
];
const round=(n:number)=>Math.round(n);
const timeDisplay=(str:string)=>hourOf(str);
export default function Home(){
 const {weather,busy,error,refresh,prefs,toggleFavorite}=useWeather();
 const [mode,setMode]=useState<'list'|'chart'>('list');const [metric,setMetric]=useState<Metric>('temp');
 const [expandAll,setExpandAll]=useState(false);const [expanded,setExpanded]=useState<string|null>(null);
 const [selectedHour,setSelectedHour]=useState<string|null>(null);
 const {width}=useWindowDimensions();
 const hours=useMemo(()=>{if(!weather)return [];const start=`${weather.current.time.slice(0,13)}:00`;return weather.hourly.filter(h=>h.time>=start).slice(0,12);},[weather]);
 const activeHour=hours.find(h=>h.time===selectedHour);
 const advice=weather?personalizedAdvice(weather,prefs.activities):'';
 const alerts=weather?activeAlerts(weather,prefs.alerts):[];
 const shareWeather=async()=>{
  if(!weather)return;
  try{await Share.share({message:`🦊 WeatherApp em ${weather.city}: ${round(weather.current.temp)}°C, ${labelOf(weather.current.code)}. Hoje entre ${round(weather.daily[0].min)}° e ${round(weather.daily[0].max)}°. ${advice}`});}catch{}
 };
 const val=(h:Hourly)=>h[metric];
 const graphValues=hours.map(val);
 const graphMin=graphValues.length?Math.min(...graphValues):0, graphMax=graphValues.length?Math.max(...graphValues):1;
 const plot=graphValues.map((v,i)=>`${32.5+i*67},${99-(v-graphMin)/(graphMax-graphMin||1)*54}`).join(' ');
 return <SafeAreaView style={styles.root} edges={['top']}><StatusBar style="light"/>
  <ScrollView style={{flex:1}} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={busy&&!!weather} onRefresh={()=>void refresh()} tintColor={palette.mint}/> }>
   <View style={styles.hero}>
    <SkyScene kind={kindOf(weather?.current.code||2)} mode={prefs.colorMode}/>
    <View style={styles.topRow}>
     <Pressable style={styles.roundButton} onPress={()=>router.push('/(tabs)/settings')} accessibilityLabel="Configurações"><Ionicons name="color-palette-outline" color="white" size={23}/></Pressable>
     <Pressable style={styles.citySelect} onPress={()=>router.push('/(tabs)/explore')}><Ionicons name="navigate" size={18} color={palette.mint}/><Text style={styles.cityName} numberOfLines={1}>{weather?.city||'WeatherApp'}</Text><Ionicons name="chevron-down" color="white" size={18}/></Pressable>
     <Pressable style={styles.roundButton} onPress={()=>void shareWeather()} accessibilityLabel="Compartilhar previsão"><Ionicons name="share-social-outline" color="white" size={22}/></Pressable>
    </View>
    <View style={styles.heroText}>
     <Text style={styles.hello}>CLIMA DO SEU JEITO</Text>
     <Text style={styles.temp}>{weather?`${round(weather.current.temp)}°`:'--°'}</Text>
     <Text style={styles.feels}>{weather?`Sensação de ${round(weather.current.feels)}°`:'Carregando o clima...'}</Text>
     <Text style={styles.condition}>{weather?labelOf(weather.current.code):'Sua previsão começa aqui'}</Text>
    </View>
    <View style={styles.heroFox}><FoxMascot size={Math.min(205,width*.52)} weather={kindOf(weather?.current.code||2)}/></View>
    <View style={styles.heroBottom}><Ionicons name="sparkles" color={palette.gold} size={15}/><Text style={styles.heroNote}>Toque na Fifi para uma surpresa!</Text></View>
   </View>
   <View style={styles.content}>
    <View style={styles.adviceCard}>
     <View style={styles.adviceTop}><Text style={{fontSize:22}}>🦊</Text><Text style={styles.adviceLabel}>CONSELHO DA FIFI</Text><Ionicons name="sparkles" color={palette.purple} size={18}/></View>
     <Text style={styles.adviceText}>{weather?advice:busy?'Consultando o céu...':'Escolha sua cidade para ver dicas personalizadas.'}</Text>
     {alerts.length>0&&<Text style={styles.attention}>🔔 {alerts.length} {alerts.length===1?'alerta merece':'alertas merecem'} sua atenção</Text>}
    </View>
    {error&&<Panel style={{backgroundColor:'#FFEFF2'}}><Text style={{fontSize:14,color:'#B93151',lineHeight:21}}>Não foi possível atualizar: {error}</Text><View style={{marginTop:12}}><ActionButton title="Tentar novamente" icon="refresh" onPress={()=>void refresh()}/></View></Panel>}
    {busy&&!weather&&<View style={{padding:25}}><ActivityIndicator color={palette.purple} size="large"/></View>}
    {weather&&<>
     <Panel>
      <SectionHeading title="PREVISÃO POR HORA" icon="time-outline" right={<View style={styles.toggle}><Pressable onPress={()=>setMode('list')} style={[styles.toggleOption,mode==='list'&&styles.toggleActive]}><Text style={[styles.toggleText,mode==='list'&&styles.toggleTextActive]}>Lista</Text></Pressable><Pressable onPress={()=>setMode('chart')} style={[styles.toggleOption,mode==='chart'&&styles.toggleActive]}><Text style={[styles.toggleText,mode==='chart'&&styles.toggleTextActive]}>Gráfico</Text></Pressable></View>}/>
      {activeHour&&<View style={styles.selectedInfo}><Text style={styles.selectedInfoText}>{timeDisplay(activeHour.time)} · {labelOf(activeHour.code)} · {round(activeHour.rain)}% de chuva</Text><Pressable onPress={()=>setSelectedHour(null)}><Ionicons name="close-circle" color={palette.muted} size={19}/></Pressable></View>}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginHorizontal:-5}}>
       <View>
        <View style={styles.hourRow}>{hours.map((h,i)=><Pressable key={h.time} onPress={()=>setSelectedHour(h.time)} style={[styles.hourItem,selectedHour===h.time&&styles.hourActive]}><Text style={styles.hourTime}>{i===0?'Agora':timeDisplay(h.time)}</Text><WeatherIcon code={h.code} size={29}/><Text style={styles.hourRain}>{round(h.rain)}%</Text>{mode==='list'&&<Text style={styles.hourTemp}>{round(val(h))}{metric==='temp'||metric==='feels'?'°':metric==='rain'?'%':''}</Text>}{mode==='list'&&metric==='wind'&&<Text style={styles.smallUnit}>km/h</Text>}</Pressable>)}</View>
        {mode==='chart'&&<View style={{marginTop:10,marginBottom:3}}><Svg height={117} width={Math.max(490,hours.length*67)} viewBox={`0 0 ${Math.max(490,hours.length*67)} 117`}>
         <Line x1="0" y1="101" x2={Math.max(490,hours.length*67)} y2="101" stroke="#EBE7F7" strokeWidth="1"/>
         <Polyline points={plot} fill="none" stroke={palette.purple} strokeWidth="3.2" strokeLinejoin="round" strokeLinecap="round"/>
         {graphValues.map((v,i)=>{const x=32.5+i*67;const y=99-(v-graphMin)/(graphMax-graphMin||1)*54;return <React.Fragment key={i}><Circle cx={x} cy={y} r={4} fill="white" stroke={palette.purple} strokeWidth={2.5}/><SvgText x={x} y={y-15} fill={palette.ink} fontSize="12" fontWeight="bold" textAnchor="middle">{round(v)}{metricOptions.find(m=>m.id===metric)?.unit}</SvgText></React.Fragment>})}
        </Svg></View>}
       </View>
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.metricRow}>{metricOptions.map(item=><Pressable key={item.id} onPress={()=>setMetric(item.id)} style={[styles.metricButton,metric===item.id&&styles.metricSelected]}><Ionicons name={item.icon} size={17} color={metric===item.id?palette.purple:palette.muted}/><Text style={[styles.metricLabel,metric===item.id&&{color:palette.purple}]}>{item.label}</Text></Pressable>)}</ScrollView>
     </Panel>
     <Panel>
      <SectionHeading title="PREVISÃO DIÁRIA" icon="calendar-outline" right={<Text style={styles.dailyHeads}>MÍN       MÁX</Text>}/>
      {(expandAll?weather.daily:weather.daily.slice(0,7)).map((day,i)=>{const isOpen=expanded===day.date;return <View key={day.date} style={styles.dayWrap}>
       <Pressable onPress={()=>setExpanded(isOpen?null:day.date)} style={styles.dayRow}>
        <View style={styles.dayIcon}><WeatherIcon code={day.code} size={28}/><Text style={styles.dayRain}>{round(day.rain)}%</Text></View>
        <View style={{flex:1}}><Text style={styles.dayTitle}>{i===0?'Hoje':friendlyDay(day.date)}</Text><Text style={styles.dayDate}>{dateOf(day.date)}</Text></View>
        <Text style={styles.dayMin}>{round(day.min)}°</Text><Text style={styles.dayMax}>{round(day.max)}°</Text><Ionicons name={isOpen?'chevron-up':'chevron-down'} color="#A6A2BA" size={17}/>
       </Pressable>
       {isOpen&&<View style={styles.expansion}><Text style={styles.expansionText}>{labelOf(day.code)} · Precipitação: {day.precipitation.toFixed(1)} mm</Text><Text style={styles.expansionText}>UV máximo: {round(day.uv)} · Nascer: {hourOf(day.sunrise)} · Pôr do sol: {hourOf(day.sunset)}</Text></View>}
      </View>})}
      <Pressable onPress={()=>setExpandAll(x=>!x)} style={styles.showMore}><Ionicons name={expandAll?'chevron-up-circle':'calendar'} size={18} color={palette.ink}/><Text style={styles.showMoreText}>{expandAll?'Mostrar somente 7 dias':'Mostrar previsão de 16 dias'}</Text></Pressable>
     </Panel>
     <View style={styles.secondaryHead}><Text style={styles.secondaryTitle}>Seu dia em detalhes</Text><Text style={styles.secondarySubtitle}>Tudo que você precisa saber ✨</Text></View>
     <View style={styles.detailGrid}>
      <StatCard label="CHUVA AGORA" icon="water-outline" value={`${weather.current.precipitation.toFixed(1)} mm`} detail="Precipitação atual" iconColor={palette.blue}/>
      <StatCard label="ÍNDICE UV MÁX." icon="sunny-outline" value={`${round(weather.current.uv)}`} detail={uvLabel(weather.current.uv)} iconColor={palette.gold}/>
      <StatCard label="VENTO" icon="flag-outline" value={`${round(weather.current.wind)} km/h`} detail={`Direção ${compass(weather.current.windDirection)}`} iconColor={palette.mintDark}/>
      <StatCard label="PÔR DO SOL" icon="partly-sunny-outline" value={hourOf(weather.daily[0]?.sunset)} detail={`Nascer: ${hourOf(weather.daily[0]?.sunrise)}`} iconColor={palette.orange}/>
      <StatCard label="SENSAÇÃO" icon="thermometer-outline" value={`${round(weather.current.feels)}°`} detail="Sensação térmica" iconColor={palette.orange}/>
      <StatCard label="UMIDADE" icon="water" value={`${weather.current.humidity}%`} detail="Umidade relativa" iconColor={palette.blue}/>
      <StatCard label="VISIBILIDADE" icon="eye-outline" value={`${(weather.current.visibility/1000).toFixed(1)} km`} detail="Visibilidade local" iconColor={palette.purple}/>
      <StatCard label="QUALIDADE DO AR" icon="leaf-outline" value={weather.current.aqi==null?'—':`${weather.current.aqi} AQI`} detail={weather.current.aqi==null?'Indisponível':weather.current.aqi<=50?'Boa':weather.current.aqi<=100?'Moderada':'Atenção'} iconColor={palette.mintDark}/>
     </View>
     <View style={styles.bottomFox}><FoxMascot size={110} weather="sun"/><View style={{flex:1}}><Text style={styles.bottomTitle}>Até a próxima previsão!</Text><Text style={styles.bottomSub}>A raposa cuida do clima. Você cuida dos seus planos.</Text><Text style={styles.source}>Dados: Open-Meteo · atualizado {new Date(weather.fetchedAt).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</Text></View></View>
    </>}
   </View>
  </ScrollView>
 </SafeAreaView>
}
function StatCard({label,icon,value,detail,iconColor}:{label:string;icon:keyof typeof Ionicons.glyphMap;value:string;detail:string;iconColor:string}){return <View style={styles.stat}><View style={styles.statHead}><Ionicons name={icon} color={iconColor} size={16}/><Text style={styles.statLabel}>{label}</Text></View><Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>{value}</Text><Text style={styles.statDetail}>{detail}</Text></View>}
const styles=StyleSheet.create({
 root:{flex:1,backgroundColor:'#F4F1FF'},hero:{height:376,overflow:'hidden'},topRow:{height:72,paddingHorizontal:18,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},roundButton:{height:44,width:44,borderRadius:22,backgroundColor:'#FFFFFF25',alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'#FFFFFF20'},citySelect:{maxWidth:'68%',flexDirection:'row',alignItems:'center',gap:8},cityName:{color:'white',fontSize:18,fontWeight:'900'},heroText:{paddingTop:20,paddingLeft:27,zIndex:2},hello:{color:'#D6CFF8',letterSpacing:1.2,fontWeight:'900',fontSize:10},temp:{color:'white',fontSize:93,fontWeight:'300',letterSpacing:-6,lineHeight:110},feels:{color:'#E6DCFF',fontSize:15,fontWeight:'700',marginTop:-8},condition:{color:'white',fontSize:21,fontWeight:'900',marginTop:7,maxWidth:225},heroFox:{position:'absolute',right:1,bottom:17},heroBottom:{position:'absolute',left:24,bottom:25,flexDirection:'row',gap:6,alignItems:'center'},heroNote:{color:'#E5DBFF',fontSize:10,fontWeight:'600'},
 content:{paddingHorizontal:15,paddingBottom:30,marginTop:-4},adviceCard:{padding:19,borderRadius:25,backgroundColor:'#E3FAF4',marginBottom:13,borderColor:'#CDFAEA',borderWidth:1},adviceTop:{flexDirection:'row',alignItems:'center',gap:8,marginBottom:9},adviceLabel:{fontSize:12,fontWeight:'900',color:palette.mintDark,letterSpacing:.8,flex:1},adviceText:{fontSize:15.5,color:'#1E4243',lineHeight:23,fontWeight:'600'},attention:{fontSize:12,color:'#BD6279',fontWeight:'800',marginTop:12},
 toggle:{flexDirection:'row',padding:3,borderRadius:10,backgroundColor:'#F0EEF8'},toggleOption:{borderRadius:8,paddingHorizontal:10,paddingVertical:6},toggleActive:{backgroundColor:palette.purple},toggleText:{color:palette.muted,fontSize:12,fontWeight:'900'},toggleTextActive:{color:'#fff'},selectedInfo:{backgroundColor:'#F5F1FF',padding:8,borderRadius:10,flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:12},selectedInfoText:{fontSize:12,color:palette.purple,fontWeight:'700'},hourRow:{flexDirection:'row',gap:2},hourItem:{width:65,alignItems:'center',gap:11,paddingVertical:8,borderRadius:11},hourActive:{backgroundColor:'#EFEBFF'},hourTime:{fontSize:11,color:'#817D97',fontWeight:'700'},hourRain:{fontSize:11,color:'#519DDF',fontWeight:'900'},hourTemp:{fontSize:19,color:palette.ink,fontWeight:'900'},smallUnit:{fontSize:9,color:palette.muted,marginTop:-10},metricRow:{paddingTop:16,paddingBottom:3,gap:8},metricButton:{flexDirection:'row',gap:5,paddingHorizontal:11,paddingVertical:10,borderRadius:11,borderWidth:1,borderColor:'#E9E6F2',alignItems:'center'},metricSelected:{backgroundColor:'#F0EAFF',borderColor:palette.purple},metricLabel:{fontSize:12,color:'#898599',fontWeight:'800'},
 dailyHeads:{fontSize:11,color:'#9A96A9',fontWeight:'900'},dayWrap:{borderTopWidth:1,borderColor:'#F1EEF6'},dayRow:{height:76,flexDirection:'row',alignItems:'center',gap:8},dayIcon:{width:57,alignItems:'center',gap:1},dayRain:{fontSize:11,color:'#4E9EDD',fontWeight:'900'},dayTitle:{fontSize:18,fontWeight:'900',color:palette.ink},dayDate:{fontSize:12,color:palette.muted,marginTop:2},dayMin:{width:43,fontSize:18,color:'#8F8B9E',fontWeight:'600'},dayMax:{width:43,fontSize:18,color:palette.ink,fontWeight:'900'},expansion:{backgroundColor:'#F5F3FF',borderRadius:12,padding:12,marginBottom:8},expansionText:{fontSize:12,color:'#635C80',marginVertical:2},showMore:{backgroundColor:palette.gold,minHeight:48,borderRadius:15,flexDirection:'row',gap:9,alignItems:'center',justifyContent:'center',marginTop:16},showMoreText:{fontSize:14,fontWeight:'900',color:palette.ink},
 secondaryHead:{marginTop:8,marginBottom:12},secondaryTitle:{fontSize:22,fontWeight:'900',color:palette.ink},secondarySubtitle:{fontSize:12,color:palette.muted,marginTop:4},detailGrid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between'},stat:{width:'48.4%',minHeight:132,padding:15,borderRadius:22,backgroundColor:'white',marginBottom:12,justifyContent:'space-between',shadowColor:'#2C2150',shadowOpacity:.04,shadowRadius:8},statHead:{flexDirection:'row',alignItems:'center',gap:6},statLabel:{color:'#6D6980',fontSize:10,fontWeight:'900'},statValue:{color:palette.ink,fontSize:29,fontWeight:'800',letterSpacing:-1,marginTop:7},statDetail:{fontSize:11,color:palette.muted,marginTop:7},bottomFox:{borderRadius:24,backgroundColor:'#E7E1FF',padding:12,flexDirection:'row',alignItems:'center',marginBottom:12},bottomTitle:{fontSize:17,fontWeight:'900',color:palette.ink},bottomSub:{fontSize:12,color:'#716A91',marginTop:3,lineHeight:18},source:{fontSize:10,color:'#817B9C',marginTop:7}
});
