import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '@/constants/theme';

export function Panel({children,style,...props}:ViewProps){return <View {...props} style={[styles.panel,style]}>{children}</View>}
export function ActionButton({title,onPress,icon,secondary=false,disabled=false,busy=false}:{title:string;onPress:()=>void;icon?:keyof typeof Ionicons.glyphMap;secondary?:boolean;disabled?:boolean;busy?:boolean}){
 return <Pressable onPress={onPress} disabled={disabled||busy} style={({pressed})=>[styles.action,secondary&&styles.secondary,disabled&&{opacity:.42},pressed&&{opacity:.85,transform:[{scale:.985}]}]}>
 {busy?<ActivityIndicator color={secondary?palette.purple:'#fff'}/>:<>{icon&&<Ionicons name={icon} color={secondary?palette.purple:'#fff'} size={19}/>}<Text style={[styles.actionText,secondary&&{color:palette.purple}]}>{title}</Text></>}
 </Pressable>
}
export function SectionHeading({title,icon,right}:{title:string;icon:keyof typeof Ionicons.glyphMap;right?:React.ReactNode}){return <View style={styles.heading}><View style={styles.headLeft}><Ionicons name={icon} size={17} color={palette.purple}/><Text style={styles.headTitle}>{title}</Text></View>{right}</View>}
export const styles=StyleSheet.create({
 panel:{backgroundColor:'#FFFFFF',borderRadius:27,padding:18,marginBottom:14,shadowColor:'#1B113B',shadowOpacity:.07,shadowRadius:12,elevation:3},
 action:{minHeight:56,paddingHorizontal:20,borderRadius:19,backgroundColor:palette.purple,alignItems:'center',justifyContent:'center',flexDirection:'row',gap:8},
 secondary:{backgroundColor:'#F0ECFF'},actionText:{fontSize:16,fontWeight:'800',color:'#FFFFFF'},
 heading:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:16},headLeft:{flexDirection:'row',alignItems:'center',gap:8},headTitle:{fontSize:16,fontWeight:'800',color:palette.ink},
});
