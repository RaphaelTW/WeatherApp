import { CurrentWeather, Daily, Hourly, NearbyEarthquake, WeatherBundle, WeatherKind } from '@/types/weather';

const API = 'https://api.open-meteo.com/v1/forecast';
const GEO = 'https://geocoding-api.open-meteo.com/v1/search';
const AQI = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const EARTHQUAKES = 'https://earthquake.usgs.gov/fdsnws/event/1/query';
const NETWORK_ERROR = 'Sem conexão com a internet. Verifique o Wi-Fi ou os dados móveis e tente novamente.';
const timeoutFetch = async (url: string) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 14000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    if (error instanceof Error && /^HTTP \d+$/.test(error.message)) {
      throw new Error('O serviço meteorológico está temporariamente indisponível. Tente novamente em alguns minutos.');
    }
    throw new Error(NETWORK_ERROR);
  } finally { clearTimeout(timer); }
};

export function kindOf(code: number): WeatherKind {
  if (code === 0) return 'sun';
  if (code <= 3) return 'cloud';
  if (code === 45 || code === 48) return 'fog';
  if (code >= 71 && code <= 77) return 'snow';
  if (code >= 95) return 'storm';
  return 'rain';
}
export function labelOf(code: number): string {
  if(code===0)return 'Céu limpo';if(code===1)return 'Ensolarado';if(code===2)return 'Parcialmente nublado';if(code===3)return 'Nublado';
  if(code===45||code===48)return 'Neblina';if(code>=51&&code<=57)return 'Garoa';if(code>=61&&code<=67)return 'Chuva';
  if(code>=71&&code<=77)return 'Neve';if(code>=80&&code<=82)return 'Pancadas de chuva';if(code>=95)return 'Trovoadas';return 'Tempo instável';
}
export function hourOf(date: string) { return date?.split('T')[1]?.substring(0,5) ?? '--:--'; }
export function friendlyDay(date: string): string {
  const d = new Date(`${date}T12:00:00`);
  return d.toLocaleDateString('pt-BR', {weekday:'short'}).replace('.', '').replace(/^./, c=>c.toUpperCase());
}
export function dateOf(date: string) { const [y,m,d] = date.split('-');return `${d}/${m}`; }
export function compass(deg: number) { return ['N','NE','L','SE','S','SO','O','NO'][Math.round(deg/45)%8]; }
export function uvLabel(uv: number){return uv<3?'Baixo':uv<6?'Moderado':uv<8?'Alto':uv<11?'Muito alto':'Extremo';}

export async function geocodeCity(city: string) {
  const data = await timeoutFetch(`${GEO}?name=${encodeURIComponent(city)}&count=5&language=pt&format=json`);
  const results: { name:string; admin1?:string; country?:string; latitude:number; longitude:number }[] = data.results || [];
  if (!results.length) throw new Error('Cidade não encontrada. Confira o nome e tente novamente.');
  return results;
}
export async function reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
  // Open-Meteo geocoder não oferece reverse geocoding: preservamos o rótulo original ao atualizar pelo GPS.
  return null;
}
export async function getWeather(latitude: number, longitude: number, city: string, country?:string): Promise<WeatherBundle> {
  const params = [
    `latitude=${latitude}`,`longitude=${longitude}`,`timezone=auto`,`forecast_days=16`,
    `current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,visibility`,
    `hourly=temperature_2m,apparent_temperature,precipitation_probability,wind_speed_10m,weather_code`,
    `daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,uv_index_max,sunrise,sunset`,
  ];
  const earthquakeStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const [data, air, earthquakeData] = await Promise.all([
    timeoutFetch(`${API}?${params.join('&')}`),
    timeoutFetch(`${AQI}?latitude=${latitude}&longitude=${longitude}&current=us_aqi&timezone=auto`).catch(() => null),
    timeoutFetch(`${EARTHQUAKES}?format=geojson&latitude=${latitude}&longitude=${longitude}&maxradiuskm=300&minmagnitude=2&starttime=${encodeURIComponent(earthquakeStart)}&orderby=time&limit=3`).catch(() => null),
  ]);
  if (!data.current || !data.daily || !data.hourly) throw new Error('Os dados desta região estão indisponíveis.');
  const c = data.current;
  const current:CurrentWeather = {temp:c.temperature_2m,feels:c.apparent_temperature,humidity:c.relative_humidity_2m,wind:c.wind_speed_10m,windDirection:c.wind_direction_10m,precipitation:c.precipitation,visibility:c.visibility,code:c.weather_code,isDay:!!c.is_day,time:c.time,uv:data.daily.uv_index_max?.[0] ?? 0,aqi: typeof air?.current?.us_aqi==='number'? air.current.us_aqi:null};
  const hourly:Hourly[] = data.hourly.time.map((time:string,i:number)=>({time,temp:data.hourly.temperature_2m[i],feels:data.hourly.apparent_temperature[i],rain:data.hourly.precipitation_probability[i]??0,wind:data.hourly.wind_speed_10m[i],code:data.hourly.weather_code[i]}));
  const daily:Daily[] = data.daily.time.map((date:string,i:number)=>({date, min:data.daily.temperature_2m_min[i],max:data.daily.temperature_2m_max[i],rain:data.daily.precipitation_probability_max[i]??0,precipitation:data.daily.precipitation_sum[i]??0,code:data.daily.weather_code[i],uv:data.daily.uv_index_max[i]??0,sunrise:data.daily.sunrise[i],sunset:data.daily.sunset[i]}));
  const earthquakes: NearbyEarthquake[] = (earthquakeData?.features || []).map((feature:any) => {
    const [eventLongitude,eventLatitude] = feature.geometry?.coordinates || [];
    return {id:feature.id,place:feature.properties?.place || 'Local não informado',magnitude:feature.properties?.mag ?? 0,time:feature.properties?.time ?? 0,distanceKm:Math.round(distanceKm(latitude,longitude,eventLatitude,eventLongitude))};
  }).filter((event:NearbyEarthquake) => Number.isFinite(event.distanceKm));
  return {city,country,latitude,longitude,current,hourly,daily,earthquakes,fetchedAt:Date.now()};
}

function distanceKm(latitudeA:number, longitudeA:number, latitudeB:number, longitudeB:number) {
  const radians=(value:number)=>value*Math.PI/180;
  const dLatitude=radians(latitudeB-latitudeA), dLongitude=radians(longitudeB-longitudeA);
  const a=Math.sin(dLatitude/2)**2+Math.cos(radians(latitudeA))*Math.cos(radians(latitudeB))*Math.sin(dLongitude/2)**2;
  return 6371*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

export function personalizedAdvice(w:WeatherBundle, activities: string[]): string {
  const {code,temp,wind,uv} = w.current; const tomorrow = w.hourly.filter(h=>h.time> w.current.time && h.time.substring(0,10)===w.current.time.substring(0,10));
  const rainSoon = tomorrow.slice(0,7).some(h=>h.rain>=55 || kindOf(h.code)==='rain' || kindOf(h.code)==='storm');
  const parts: string[]=[];
  if(kindOf(code)==='rain'||kindOf(code)==='storm')parts.push('A raposa recomenda levar um guarda-chuva: está chovendo por aí.');
  else if(rainSoon)parts.push('Aproveite o momento! Pode chover nas próximas horas; leve um guarda-chuva.');
  else if(temp>=29)parts.push('Dia quente! Hidrate-se e procure sombra nas horas mais quentes.');
  else if(temp<=15)parts.push('Está friozinho! Um casaco vai fazer diferença.');
  else parts.push('O clima está convidativo. Aproveite o dia com a companhia da raposa!');
  if(uv>=8)parts.push('O índice UV está alto: use proteção solar.');
  if(wind>=35)parts.push('Atenção às rajadas e aos objetos soltos.');
  if(activities.includes('correr')||activities.includes('caminhar')||activities.includes('pedalar'))parts.push(rainSoon?'Para atividades ao ar livre, prefira um horário sem chuva.':'Bom momento para planejar sua atividade ao ar livre.');
  if(activities.includes('cachorro')&&rainSoon)parts.push('Para passear com seu cachorro, prefira um intervalo de tempo seco.');
  if(activities.includes('piquenique')&&rainSoon)parts.push('Talvez seja melhor adiar o piquenique.');
  return parts.join(' ');
}
export function activeAlerts(w:WeatherBundle, alerts:string[]) {
  const out: {icon:string;title:string;description:string}[]=[];
  if(alerts.includes('chuva') && (w.hourly.filter(h=>h.time>=w.current.time).slice(0,8).some(h=>h.rain>=65)))out.push({icon:'🌧️',title:'Possibilidade de chuva',description:'Há probabilidade elevada de chuva nas próximas horas.'});
  if(alerts.includes('trovoada') && (kindOf(w.current.code)==='storm'||w.hourly.filter(h=>h.time>=w.current.time).slice(0,8).some(h=>kindOf(h.code)==='storm')))out.push({icon:'⚡',title:'Risco de trovoada',description:'Verifique as condições antes de sair.'});
  if(alerts.includes('uv')&&w.current.uv>=8)out.push({icon:'☀️',title:'Índice UV elevado',description:`UV ${Math.round(w.current.uv)} (${uvLabel(w.current.uv)}). Evite exposição solar sem proteção.`});
  if(alerts.includes('vento')&&w.current.wind>=35)out.push({icon:'💨',title:'Ventos fortes',description:`Ventos de ${Math.round(w.current.wind)} km/h.`});
  if(alerts.includes('nevoeiro')&&kindOf(w.current.code)==='fog')out.push({icon:'🌫️',title:'Nevoeiro',description:'A visibilidade pode estar reduzida.'});
  if(alerts.includes('neve')&&kindOf(w.current.code)==='snow')out.push({icon:'❄️',title:'Neve',description:'Há condições de neve na região.'});
  return out;
}
