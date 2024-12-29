import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Animated, { Easing, FadeIn, SlideInLeft } from 'react-native-reanimated'; // Usando animações do reanimated

interface WeatherData {
  current: {
    temp: number;
    humidity: number;
    weather: { description: string }[];
  };
  daily: {
    temp: { min: number; max: number };
    weather: { description: string }[];
    sunrise: number;
    sunset: number;
    moonrise: number;
    moonset: number;
  }[];
}

const API_KEY = 'fb5dabe48ffbfd75aaf5e01cc720e335';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export default function TabTwoScreen() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  useEffect(() => {
    const getLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error('Permissão para acessar localização negada');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setLatitude(location.coords.latitude);
        setLongitude(location.coords.longitude);
      } catch (error) {
        console.error('Erro ao obter a localização:', error);
      }
    };

    getLocation();
  }, []);

  useEffect(() => {
    if (latitude !== null && longitude !== null) {
      const fetchWeather = async () => {
        try {
          setLoading(true);
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=London&units=metric&appid=fb5dabe48ffbfd75aaf5e01cc720e335`
          );

          const data = await response.json();
          console.log('Dados recebidos:', data);

          if (data && data.main) {
            setWeatherData({
              current: {
                temp: data.main.temp,
                humidity: data.main.humidity,
                weather: data.weather,
              },
              daily: [],
            });
          } else {
            console.error('Dados climáticos inválidos');
          }
        } catch (error) {
          console.error('Erro ao buscar dados climáticos:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchWeather();
    }
  }, [latitude, longitude]);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BASE_URL}/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely,hourly,alerts&units=metric&appid=${API_KEY}`
      );

      const data = await response.json();
      console.log('Dados recebidos:', data);

      if (data && data.daily) {
        setWeatherData(data);
      } else {
        console.error('Dados climáticos inválidos');
      }
    } catch (error) {
      console.error('Erro ao buscar dados climáticos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#150791" />
        <ThemedText>Carregando dados climáticos...</ThemedText>
      </ThemedView>
    );
  }

  if (!weatherData || !weatherData.daily) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Erro ao carregar dados climáticos</ThemedText>
      </ThemedView>
    );
  }

  const dailyData = weatherData.daily.slice(1, 7); // Próximos 6 dias

  return (
    <ScrollView style={styles.container}>
      <Animated.View
        style={styles.titleContainer}
        entering={FadeIn} // Usando FadeIn para animação de entrada
      >
        <ThemedText type="title">Explore</ThemedText>
      </Animated.View>

      <Animated.View entering={SlideInLeft} style={styles.subtitleContainer}>
        <ThemedText style={styles.subtitle}>
          Temperatura Atual: {Math.round(weatherData.current.temp)}°C
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Umidade: {weatherData.current.humidity}%
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Condição: {weatherData.current.weather[0].description}
        </ThemedText>
      </Animated.View>

      <Animated.View style={styles.forecastContainer}>
        {dailyData.map((day, index) => (
          <Animated.View
            key={index}
            style={styles.forecastItem}
            entering={SlideInLeft} // Animação de entrada para cada item
          >
            <ThemedText>
              Dia {index + 1}: Min {Math.round(day.temp.min)}°C, Max{' '}
              {Math.round(day.temp.max)}°C, {day.weather[0].description}
            </ThemedText>
          </Animated.View>
        ))}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#140E50',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#140E50',
  },
  titleContainer: {
    marginBottom: 16,
  },
  subtitleContainer: {
    marginBottom: 16,
  },
  subtitle: {
    marginBottom: 8,
    color: '#fff',
  },
  forecastContainer: {
    marginVertical: 16,
  },
  forecastItem: {
    marginBottom: 8,
    backgroundColor: '#150791',
    padding: 12,
    borderRadius: 8,
  },
});
