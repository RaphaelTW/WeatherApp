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
import * as Location from 'expo-location';

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
  sys: {
    country: string;
    state: string;
  };
}

interface LocationObject {
  coords: {
    latitude: number;
    longitude: number;
  };
}

export default function WeatherApp() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [location, setLocation] = useState<LocationObject | null>(null);
  const [opacity] = useState(new Animated.Value(0));
  const [rotation] = useState(new Animated.Value(0));

  const API_KEY = 'fb5dabe48ffbfd75aaf5e01cc720e335'; // Substitua pela sua chave da API do OpenWeather

  const fetchWeather = async (city: string) => {
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

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setError('Permissão para acessar a localização negada');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    setLocation(location);

    const { latitude, longitude } = location.coords;
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
    );
    setWeatherData(response.data);
    setCity(response.data.name);
  };

  useEffect(() => {
    getLocation();
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

  const handleSearch = () => {
    if (city) {
      fetchWeather(city);
    }
  };

  const formatLocation = () => {
    if (!weatherData) return '';
    const { name, sys } = weatherData;
    const { state, country } = sys;
    return `${name}, ${state ? state : ''} - ${country}`;
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, { opacity }]}>
        <Text style={styles.title}>Previsão do Tempo</Text>
        <Animated.Image
          source={{
            uri: `http://openweathermap.org/img/wn/${weatherData ? weatherData.weather[0].icon : '01d'}@4x.png`, // Obtendo ícone da API
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
      <TouchableOpacity style={styles.button} onPress={handleSearch}>
        <Text style={styles.buttonText}>Buscar</Text>
      </TouchableOpacity>
      {loading ? (
        <ActivityIndicator size="large" color="#4A9107" style={styles.loader} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        weatherData && (
          <View style={styles.weatherContainer}>
            <Text style={styles.city}>{formatLocation()}</Text>
            <Text style={styles.temp}>{Math.round(weatherData.main.temp)}°C</Text>
            <Text style={styles.desc}>{weatherData.weather[0].description}</Text>
            <Image
              source={{
                uri: `http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png`, // Exibindo ícone da API
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
    backgroundColor: '#140E50',
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
    backgroundColor: '#F9000022',
    borderRadius: 8,
    color: '#FF0000',
    textAlign: 'center',
    marginTop: 20,
    fontWeight: 'bold',
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
