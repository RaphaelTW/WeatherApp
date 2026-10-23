import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg,{Defs,LinearGradient,Stop,Rect,Path,Circle,Ellipse} from 'react-native-svg';
import { WeatherKind } from '@/types/weather';
export default function SkyScene({kind='cloud',mode='aurora'}:{kind?:WeatherKind;mode?:'aurora'|'violet'}){
 const rainy=kind==='rain'||kind==='storm';
 const gradientId=`sky-${mode}`;
 return <View pointerEvents="none" style={StyleSheet.absoluteFill}>
 <Svg key={`${mode}-${kind}`} width="100%" height="100%" viewBox="0 0 400 520" preserveAspectRatio="xMidYMid slice">
  <Defs><LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1"><Stop stopColor={mode==='violet'?'#7048D7':'#0B385F'}/><Stop offset={0.65} stopColor={mode==='violet'?'#A875F4':'#176E83'}/><Stop offset={1} stopColor={mode==='violet'?'#D8B4FE':'#45B8A6'}/></LinearGradient></Defs>
  <Rect x="0" y="0" width="400" height="520" fill={`url(#${gradientId})`}/>
  <Circle cx="332" cy="103" r="77" fill="#FFFFFF" opacity=".05"/><Circle cx="47" cy="25" r="127" fill="#AAB6FF" opacity=".055"/>
  <Circle cx="315" cy="138" r="37" fill={rainy?'#D8D7FF':'#FFDCA2'} opacity=".65"/>
  <Path d="M-20 170 Q0 133 35 158 Q55 109 100 132 Q136 96 163 143 Q206 139 199 173 Z" fill="#FFFFFF" opacity=".12"/>
  <Path d="M207 242 Q220 214 253 218 Q278 175 315 205 Q346 187 360 224 Q398 213 415 247 Z" fill="#FFFFFF" opacity=".13"/>
  <Path d="M-10 454 Q84 382 157 452 Q238 373 409 425 L410 520 L-10 520 Z" fill={mode==='violet'?'#3D176E':'#063E55'} opacity=".65"/>
  <Path d="M-10 482 Q95 427 207 466 Q300 410 414 457 L414 520 L-10 520 Z" fill={mode==='violet'?'#21113A':'#062E42'} opacity=".47"/>
  {[18,80,204,290,345].map((x,i)=><Circle key={i} cx={x} cy={55+(i%3)*72} r={i%2?2:3} fill="#E0DAFF" opacity=".6"/>)}
  {rainy&&[34,93,144,242,301,367].map((x,i)=><Path key={x} d={`M${x} ${252+i%3*22} l-10 20`} stroke="#94CFFC" strokeWidth="3" opacity=".35"/>)}
 </Svg></View>
}
