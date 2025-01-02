import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import axios from 'axios';
import * as Location from 'expo-location';

interface WeatherData {
  temp: number;
  humidity: number;
  wind_speed: number;
  description: string;
  icon: string;
}

interface ForecastData {
  dt: number;
  temp: number;
  description: string;
  icon: string;
}

export default function WeatherApp() {
  const [city, setCity] = useState('');
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);

  const API_KEY = 'COLOCAR SUA CHAVE KEY AQUI!';

  const fetchWeather = async (lat: number, lon: number) => {
    setLoading(true);
    setError('');
    try {
      const [currentRes, forecastRes] = await Promise.all([
        axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        ),
        axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        ),
      ]);

      const currentData = currentRes.data;
      const forecastData = forecastRes.data;

      setCurrentWeather({
        temp: currentData.main.temp,
        humidity: currentData.main.humidity,
        wind_speed: currentData.wind.speed,
        description: currentData.weather[0].description,
        icon: currentData.weather[0].icon,
      });

      const uniqueDays = new Map();
      const forecastList = forecastData.list
        .filter((item: any) => {
          const date = new Date(item.dt * 1000).toLocaleDateString('pt-BR');
          if (!uniqueDays.has(date)) {
            uniqueDays.set(date, true);
            return true;
          }
          return false;
        })
        .slice(0, 5)
        .map((item: any) => ({
          dt: item.dt,
          temp: item.main.temp,
          description: item.weather[0].description,
          icon: item.weather[0].icon,
        }));

      setForecast(forecastList);
    } catch (err: any) {
      setError('Erro ao buscar dados do clima.');
    } finally {
      setLoading(false);
    }
  };

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setError('Permissão para acessar a localização negada.');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;
    setLocation({ lat: latitude, lon: longitude });
    fetchWeather(latitude, longitude);
  };

  useEffect(() => {
    getLocation();
  }, []);

  const handleSearch = () => {
    if (city) {
      axios
        .get(
          `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`
        )
        .then((res) => {
          if (res.data.length > 0) {
            const { lat, lon } = res.data[0];
            setLocation({ lat, lon });
            fetchWeather(lat, lon);
          } else {
            setError('Cidade não encontrada.');
          }
        })
        .catch(() => setError('Erro ao buscar coordenadas da cidade.'));
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Previsão do Tempo</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite uma cidade"
        value={city}
        onChangeText={(text) => setCity(text)}
      />
      <TouchableOpacity style={styles.button} onPress={handleSearch}>
        <Text style={styles.buttonText}>Buscar</Text>
      </TouchableOpacity>
      {loading ? (
        <ActivityIndicator size="large" color="#4A9107" style={styles.loader} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        currentWeather && (
          <View>
            <View style={styles.currentWeather}>
              <Text style={styles.temp}>{Math.round(currentWeather.temp)}°C</Text>
              <Text style={styles.desc}>{currentWeather.description}</Text>
              <Text style={styles.info}>Umidade: {currentWeather.humidity}%</Text>
              <Text style={styles.info}>Vento: {currentWeather.wind_speed} m/s</Text>
              <Image
                source={{
                  uri: `http://openweathermap.org/img/wn/${currentWeather.icon}@2x.png`,
                }}
                style={styles.icon}
              />
            </View>

            <Text style={styles.sectionTitle}>Previsão para os próximos dias</Text>
            {forecast.map((day, index) => (
              <View key={index} style={styles.dailyCard}>
                <Text style={styles.date}>{formatDate(day.dt)}</Text>
                <Text style={styles.info}>{day.description}</Text>
                <Text style={styles.info}>Temperatura: {Math.round(day.temp)}°C</Text>
                <Image
                  source={{
                    uri: `http://openweathermap.org/img/wn/${day.icon}@2x.png`,
                  }}
                  style={styles.icon}
                />
              </View>
            ))}
          </View>
        )
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#140E50',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#150791',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 20,
  },
  error: {
    color: '#FF0000',
    textAlign: 'center',
    marginTop: 20,
  },
  currentWeather: {
    marginVertical: 20,
    alignItems: 'center',
  },
  temp: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  desc: {
    fontSize: 18,
    color: '#fff',
  },
  info: {
    fontSize: 16,
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
  },
  dailyCard: {
    backgroundColor: '#150791',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  date: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  icon: {
    width: 50,
    height: 50,
  },
});
