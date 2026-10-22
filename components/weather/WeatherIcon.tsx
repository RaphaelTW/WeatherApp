import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { kindOf } from '@/services/weather';
export default function WeatherIcon({code,size=28,color}:{code:number,size?:number,color?:string}){
 const k=kindOf(code);
 const names={sun:'sunny',cloud:'partly-sunny',rain:'rainy',storm:'thunderstorm',snow:'snow',fog:'cloud'} as const;
 const colors={sun:'#FFBF54',cloud:'#A6B0CB',rain:'#7ACDFF',storm:'#DBB2FF',snow:'#D7EDFF',fog:'#BFC7D8'};
 return <Ionicons name={names[k]} color={color||colors[k]} size={size}/>;
}
