import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { WeatherKind } from '@/types/weather';

type Props={size?:number; weather?:WeatherKind; animate?:boolean; style?:ViewStyle; onPress?:()=>void};

// Mascote vetorial autoral: sem imagem remota, escalável e com acessórios por condição climática.
export function foxSvg(weather:WeatherKind='sun', wink=false): string {
  const umbrella = weather==='rain'||weather==='storm' ? `
    <path d="M177 104 Q208 16 248 98 Q214 90 177 104Z" fill="#5F62F3" stroke="#383A99" stroke-width="4"/>
    <path d="M177 104 Q205 68 248 98" stroke="#C5C5FF" fill="none" stroke-width="3"/>
    <path d="M209 58 L191 181 Q187 204 176 196" stroke="#41336C" fill="none" stroke-width="5" stroke-linecap="round"/>
    <path d="M228 39 l-5 12 M241 53 l-5 11 M225 112 l-5 12" stroke="#6BCDF5" stroke-width="4" stroke-linecap="round"/>
  ` : '';
  const scarf = weather==='snow' ? `<path d="M87 143 Q131 158 172 138 Q187 154 168 163 L149 168 L144 211 L120 209 L128 172 Q99 173 84 158Z" fill="#79E4D2" stroke="#1C8B87" stroke-width="3"/>` : '';
  const sun = weather==='sun'?`<circle cx="220" cy="42" r="19" fill="#FFD46B" opacity=".94"/><g stroke="#FFD46B" stroke-linecap="round" stroke-width="4"><path d="M220 14v-8 M220 72v8 M192 42h-8 M248 42h8 M200 22l-6-6 M240 62l6 6 M239 22l6-6"/></g>`:'';
  const eyes = wink ? `<path d="M106 111 Q119 103 133 111" stroke="#30203D" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="160" cy="108" rx="7" ry="11" fill="#312137"/><circle cx="162" cy="104" r="3" fill="white"/>` : `<ellipse cx="117" cy="108" rx="7" ry="11" fill="#30203D"/><ellipse cx="160" cy="108" rx="7" ry="11" fill="#30203D"/><circle cx="119" cy="104" r="3" fill="white"/><circle cx="162" cy="104" r="3" fill="white"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="260" height="260" viewBox="0 0 260 260">
    <ellipse cx="124" cy="240" rx="83" ry="10" fill="#000" opacity=".1"/>
    ${sun}
    <path d="M145 187 C180 135 245 170 232 213 C221 243 181 240 159 221" fill="#E87824" stroke="#A64B25" stroke-width="4"/>
    <path d="M175 194 C191 179 218 182 225 204 C211 230 180 229 166 215" fill="#FFF6E9"/>
    <path d="M93 187 Q68 210 83 233 Q109 247 122 226Z" fill="#DF6C26" stroke="#9B4928" stroke-width="3"/>
    <path d="M156 188 Q186 209 173 232 Q143 245 134 223Z" fill="#DF6C26" stroke="#9B4928" stroke-width="3"/>
    <path d="M91 144 Q78 153 79 196 Q84 237 136 235 Q185 231 180 191 Q180 161 164 144Z" fill="#F68E37" stroke="#B65A2A" stroke-width="4"/>
    <ellipse cx="131" cy="188" rx="31" ry="42" fill="#FFF1D7"/>
    <path d="M81 158 Q56 165 58 187 Q65 204 87 187" fill="#F68E37" stroke="#B65A2A" stroke-width="4"/>
    <path d="M174 159 Q192 161 199 184 Q194 201 179 188" fill="#F68E37" stroke="#B65A2A" stroke-width="4"/>
    <path d="M77 94 L70 24 Q104 28 119 71 Z" fill="#E87525" stroke="#A34A25" stroke-width="4"/>
    <path d="M78 84 L80 39 Q103 48 108 71 Z" fill="#F8BAA0"/>
    <path d="M147 72 Q170 25 203 19 L202 109 Z" fill="#E87525" stroke="#A34A25" stroke-width="4"/>
    <path d="M164 70 Q183 42 195 39 L193 87 Z" fill="#F8BAA0"/>
    <path d="M78 76 Q111 50 150 61 Q191 67 198 105 Q204 145 169 163 Q129 185 93 157 Q54 136 65 100Z" fill="#FF9A3B" stroke="#A74D25" stroke-width="4"/>
    <path d="M67 119 Q76 136 93 140 L103 129 Q112 147 133 151 Q153 146 165 128 L177 140 Q193 132 199 115 Q196 155 166 164 Q124 186 89 159 Q71 148 67 119Z" fill="#FFF2DD"/>
    <ellipse cx="131" cy="137" rx="17" ry="11" fill="#FFF2DD"/>
    ${eyes}
    <ellipse cx="138" cy="129" rx="11" ry="8" fill="#423044"/>
    <path d="M132 142 Q138 153 147 142" fill="none" stroke="#603C3A" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="93" cy="131" rx="11" ry="7" fill="#F98385" opacity=".9"/>
    <ellipse cx="178" cy="131" rx="11" ry="7" fill="#F98385" opacity=".9"/>
    <path d="M96 170 Q133 194 165 169" fill="none" stroke="#604CE2" stroke-width="5" stroke-linecap="round"/>
    <circle cx="133" cy="183" r="7" fill="#69DCC1" stroke="#209F9A" stroke-width="2"/>
    ${scarf}${umbrella}
  </svg>`;
}

export default function FoxMascot({size=180,weather='sun',animate=true,style,onPress}:Props) {
  const float=useRef(new Animated.Value(0)).current;
  const bounce=useRef(new Animated.Value(1)).current;
  const [wink,setWink]=useState(false);
  useEffect(()=>{
    if(!animate)return;
    const looping=Animated.loop(Animated.sequence([Animated.timing(float,{toValue:-7,duration:1700,useNativeDriver:true}),Animated.timing(float,{toValue:0,duration:1700,useNativeDriver:true})]));looping.start();
    return ()=>looping.stop();
  },[animate,float]);
  const handleTap=()=>{
    setWink(x=>!x);onPress?.();
    Animated.sequence([Animated.spring(bounce,{toValue:1.12,useNativeDriver:true,speed:25}),Animated.spring(bounce,{toValue:1,useNativeDriver:true,speed:12})]).start();
  };
  return <Pressable accessibilityLabel="Raposa mascote. Toque para interagir." accessibilityRole="button" onPress={handleTap}>
    <Animated.View style={[style,{width:size,height:size,transform:[{translateY:float},{scale:bounce}]}]}>
      <SvgXml xml={foxSvg(weather,wink)} width={size} height={size}/>
    </Animated.View>
  </Pressable>;
}
