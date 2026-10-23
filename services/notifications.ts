import { Platform } from 'react-native';
import Constants from 'expo-constants';
import type { Daily, WeatherBundle } from '@/types/weather';

type NotificationsModule = typeof import('expo-notifications');

let handlerConfigured = false;

async function getNotifications(): Promise<NotificationsModule | null> {
  // Expo Go 57 não inclui todos os módulos nativos de expo-notifications.
  // O import tardio evita derrubar o app; development builds continuam suportados.
  if (Platform.OS === 'web' || Constants.executionEnvironment === 'storeClient') return null;
  try {
    const Notifications = await import('expo-notifications');
    if (!handlerConfigured) {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });
      handlerConfigured = true;
    }
    return Notifications;
  } catch {
    return null;
  }
}

function reminderDate(date:string){
 const [year,month,day]=date.split('-').map(Number);
 return new Date(year,month-1,day,7,0,0,0);
}

export function weatherReminderContent(weather:WeatherBundle,day:Daily){
 const hours=weather.hourly.filter(hour=>hour.time.startsWith(day.date));
 const rainyHours=hours.filter(hour=>hour.rain>=55);
 const peakRain=hours.reduce((peak,hour)=>hour.rain>peak.rain?hour:peak,hours[0]||{rain:0,time:''});
 const evening=hours.filter(hour=>Number(hour.time.slice(11,13))>=17);
 const eveningLow=evening.length?Math.min(...evening.map(hour=>hour.temp)):day.min;
 const temperatureDrop=day.max-eveningLow;
 const strongestWind=hours.length?Math.max(...hours.map(hour=>hour.wind)):0;
 const parts:string[]=[];

 if(day.max>=29)parts.push(`Hoje fará calor, chegando a ${Math.round(day.max)}°.`);
 else if(day.min<=14)parts.push(`O dia começa frio, com mínima de ${Math.round(day.min)}°.`);
 else parts.push(`Hoje a temperatura fica entre ${Math.round(day.min)}° e ${Math.round(day.max)}°.`);

 if(rainyHours.length){
  const hour=peakRain.time.slice(11,13);
  parts.push(`Pode haver picos de chuva${hour?` perto das ${hour}h`:''}; leve um guarda-chuva.`);
 }
 if(temperatureDrop>=6&&eveningLow<=21)parts.push(`Leve um agasalho: deve esfriar para cerca de ${Math.round(eveningLow)}° no fim do dia.`);
 else if(strongestWind>=35)parts.push('O vento pode ficar forte; tenha cuidado ao sair.');

 return {title:`🦊 ${weather.city}: previsão de hoje`,body:parts.join(' ')};
}

async function configureAndroidChannel(Notifications:NotificationsModule){
 if(Platform.OS==='android')await Notifications.setNotificationChannelAsync('weatherapp',{name:'Lembretes do tempo',importance:Notifications.AndroidImportance.DEFAULT});
}

export async function refreshDailyReminders(weather:WeatherBundle):Promise<boolean>{
 const Notifications=await getNotifications();
 if(!Notifications)return false;
 const permissions=await Notifications.getPermissionsAsync();
 if(!permissions.granted)return false;
 try{
  await configureAndroidChannel(Notifications);
  await Notifications.cancelAllScheduledNotificationsAsync();
  const now=Date.now();
  const upcoming=weather.daily.slice(0,7).map(day=>({day,date:reminderDate(day.date)})).filter(item=>item.date.getTime()>now);
  for(const {day,date} of upcoming){
   const content=weatherReminderContent(weather,day);
   await Notifications.scheduleNotificationAsync({
    content:{...content,data:{city:weather.city,forecastDate:day.date}},
    trigger:{type:Notifications.SchedulableTriggerInputTypes.DATE,date,channelId:'weatherapp'},
   });
  }
  return upcoming.length>0;
 }catch{return false;}
}

export async function activateDailyReminder(weather?:WeatherBundle|null):Promise<boolean>{
 const Notifications=await getNotifications();
 if(!Notifications)return false;
 const permissions=await Notifications.requestPermissionsAsync();
 if(!permissions.granted)return false;
 try {
  await configureAndroidChannel(Notifications);
  if(weather)return refreshDailyReminders(weather);
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
   content:{title:'🦊 Bom dia! A raposa já acordou.',body:'Abra o WeatherApp para conferir a previsão atualizada do seu dia.'},
   trigger:{type:Notifications.SchedulableTriggerInputTypes.DAILY,hour:7,minute:0,channelId:'weatherapp'},
  });
  return true;
 } catch{return false;}
}
export async function stopDailyReminder(){const Notifications=await getNotifications();if(Notifications)try{await Notifications.cancelAllScheduledNotificationsAsync();}catch{}}
