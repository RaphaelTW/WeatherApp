import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Easing,
  Image,
} from 'react-native';
import axios from 'axios';

// Definindo os tipos das respostas da API
interface WeatherMain {
  temp: number;
}

interface WeatherDescription {
  description: string;
  icon: string;
}

interface WeatherData {
  name: string;
  main: WeatherMain;
  weather: WeatherDescription[];
}

export default function WeatherApp() {
  const [city, setCity] = useState('São Paulo');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [opacity] = useState(new Animated.Value(0));
  const [rotation] = useState(new Animated.Value(0));

  const API_KEY = 'fb5dabe48ffbfd75aaf5e01cc720e335';

  const fetchWeather = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
      );
      setWeatherData(response.data);
    } catch (err) {
      setError('Erro ao buscar dados do clima. Verifique a cidade ou a conexão.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 1000,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotationInterpolation = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, { opacity }]}>
        <Text style={styles.title}>Previsão do Tempo</Text>
        <Animated.Image
          source={{
            uri: `http://openweathermap.org/img/wn/${weatherData ? weatherData.weather[0].icon : '01d'}@4x.png`, // GET aqui onde pega o ícone da API
          }}
          style={[styles.icon, { transform: [{ rotate: rotationInterpolation }] }]}
        />
      </Animated.View>
      <TextInput
        style={styles.input}
        placeholder="Digite uma cidade"
        value={city}
        onChangeText={(text) => setCity(text)}
      />
      <TouchableOpacity style={styles.button} onPress={fetchWeather}>
        <Text style={styles.buttonText}>Buscar</Text>
      </TouchableOpacity>
      {loading ? (
        <ActivityIndicator size="large" color="#000" style={styles.loader} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        weatherData && (
          <View style={styles.weatherContainer}>
            <Text style={styles.city}>{weatherData.name}</Text>
            <Text style={styles.temp}>{Math.round(weatherData.main.temp)}°C</Text>
            <Text style={styles.desc}>{weatherData.weather[0].description}</Text>
            <Image
              source={{
                uri: `http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png`, // POST aqui onde mostra o icone da api
              }}
              style={styles.weatherIcon}
            />
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#87CEEB',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  icon: {
    width: 80,
    height: 80,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#4682B4',
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
    color: '#ff4d4d',
    textAlign: 'center',
    marginTop: 20,
  },
  weatherContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  city: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  temp: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  desc: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#fff',
    marginBottom: 10,
  },
  weatherIcon: {
    width: 100,
    height: 100,
  },
});
