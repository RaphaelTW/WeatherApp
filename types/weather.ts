export type WeatherKind = 'sun' | 'cloud' | 'rain' | 'storm' | 'snow' | 'fog';
export type Hourly = { time: string; temp: number; feels: number; rain: number; wind: number; code: number };
export type Daily = { date: string; min: number; max: number; rain: number; precipitation: number; code: number; uv: number; sunrise: string; sunset: string };
export type CurrentWeather = { temp: number; feels: number; humidity: number; wind: number; windDirection: number; precipitation: number; uv: number; visibility: number; code: number; isDay: boolean; time: string; aqi: number | null };
export type NearbyEarthquake = { id: string; place: string; magnitude: number; time: number; distanceKm: number };
export type WeatherBundle = { city: string; country?: string; latitude: number; longitude: number; current: CurrentWeather; hourly: Hourly[]; daily: Daily[]; earthquakes: NearbyEarthquake[]; fetchedAt: number };
export type Choice = { id: string; icon: string; label: string };
export type UserPrefs = { completedOnboarding: boolean; activities: string[]; alerts: string[]; notificationsEnabled: boolean; favoriteCities: string[]; colorMode: 'aurora' | 'violet' };
export const ACTIVITIES: Choice[] = [
  { id:'correr', icon:'🏃', label:'Corrida' },{ id:'caminhar', icon:'🚶', label:'Caminhada' },{ id:'cachorro', icon:'🐕', label:'Passear com o cachorro' },{ id:'pedalar', icon:'🚴', label:'Ciclismo' },{ id:'piquenique', icon:'🧺', label:'Piquenique' },{ id:'viagem', icon:'🏝️', label:'Viagens e férias' },{ id:'outro', icon:'✨', label:'Outras atividades' },
];
export const ALERTS: Choice[] = [
  { id:'chuva', icon:'🌧️', label:'Chuva' },{ id:'neve', icon:'❄️', label:'Neve' },{ id:'trovoada', icon:'⚡', label:'Trovoada' },{ id:'nevoeiro', icon:'🌫️', label:'Nevoeiro' },{ id:'uv', icon:'☀️', label:'Índice UV alto' },{ id:'vento', icon:'💨', label:'Ventos fortes' },
];
export const initialPrefs: UserPrefs = { completedOnboarding:false, activities:['caminhar'], alerts:['chuva','trovoada','uv'], notificationsEnabled:false, favoriteCities:['São Paulo','Rio de Janeiro'], colorMode:'aurora' };
