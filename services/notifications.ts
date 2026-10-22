import { Platform } from 'react-native';
import Constants from 'expo-constants';

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

export async function activateDailyReminder():Promise<boolean>{
 const Notifications=await getNotifications();
 if(!Notifications)return false;
 const permissions=await Notifications.requestPermissionsAsync();
 if(!permissions.granted)return false;
 try {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('weatherapp', {
      name: 'Lembretes do tempo',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  await Notifications.cancelAllScheduledNotificationsAsync();
  // Lembrete local; não afirma ter atualizado os dados meteorológicos em background.
  await Notifications.scheduleNotificationAsync({
   content:{title:'🦊 Bom dia! A raposa já acordou.',body:'Abra o WeatherApp para conferir a previsão atualizada do seu dia.'},
   trigger:{type:Notifications.SchedulableTriggerInputTypes.DAILY,hour:7,minute:0,channelId:'weatherapp'},
  });
  return true;
 } catch{return false;}
}
export async function stopDailyReminder(){const Notifications=await getNotifications();if(Notifications)try{await Notifications.cancelAllScheduledNotificationsAsync();}catch{}}
