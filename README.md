# WeatherApp ☀⛈

WeatherApp é um aplicativo desenvolvido com [React Native](https://reactnative.dev) e [Expo](https://expo.dev) para fornecer previsões do tempo em tempo real e outras informações meteorológicas. Ele utiliza a [OpenWeatherMap API](https://openweathermap.org/api), que exige a aquisição de uma chave de API para funcionamento.

## Funcionalidades 🌤☔

1. **Previsão do Tempo Atual**:
   - Informações como temperatura, umidade, velocidade do vento, e descrição do tempo.
   - Endpoint: `(https://api.openweathermap.org/data/2.5/weather)`
   - Parâmetros: `q` (cidade), `units` (Celsius/Fahrenheit).

2. **Previsão para 5 Dias**:
   - Previsão detalhada com intervalos de 3 horas.
   - Endpoint: `(https://api.openweathermap.org/data/2.5/forecast)`
   - Parâmetros: `q` (cidade), `units` (Celsius/Fahrenheit).

3. **Ícones de Clima**:
   - Exibe ícones representando as condições meteorológicas.
   - Endpoint: `(https://openweathermap.org/img/wn/{icon}@2x.png)` (substituindo {icon} pelo código do ícone).

4. **Índice UV**:
   - Informações sobre o índice UV atual.
   - Endpoint: `(https://api.openweathermap.org/data/2.5/uvi)`

5. **Qualidade do Ar**:
   - Dados sobre a qualidade do ar na região informada.
   - Endpoint: `(https://api.openweathermap.org/data/2.5/air_pollution)`

### Parâmetros Comuns ⚖

- `q`: Cidade (nome ou coordenadas).
- `units`: Unidades de medida (`metric`/Celsius, `imperial`/Fahrenheit).
- `appid`: Chave API (obrigatória).
- `lang`: Idioma (opcional).

## Configuração Inicial 🛠️

1. Clone o repositório e instale as dependências:

   ```
   git clone <https://github.com/RaphaelTW/WeatherApp>
   cd WeatherApp
   npm install
   ```

2. Obtenha uma chave de API gratuita na [OpenWeatherMap](https://openweathermap.org).

3. Configure sua chave no código:

   Abra o arquivo `index.tsx` e substitua `COLOCAR SUA CHAVE KEY AQUI!` pela sua chave:

   ```tsx
   const API_KEY = 'SUA_CHAVE_AQUI';
   ```

4. Inicie o aplicativo:

   ```
   npx expo start
   ```

## Como Usar 🔍

1. **Busca por Cidade**:
   - Insira o nome de uma cidade no campo de busca e pressione o botão "Buscar".

2. **Localização Atual**:
   - O aplicativo solicita permissão para acessar a localização do dispositivo e exibe as condições climáticas da região.

3. **Visualização de Dados**:
   - Informações detalhadas sobre o clima atual e previsões para os próximos dias são exibidas com ícones e textos descritivos.

## Recursos Utilizados ⚛

- **React Native**: Desenvolvimento do aplicativo.
- **Expo**: Plataforma para desenvolvimento, build e distribuição.
- **Axios**: Requisições HTTP para consumir a API.
- **OpenWeatherMap API**: Fonte de dados meteorológicos.

## Limitações da API ⚠

- **Requisições**: Limite de 60 requisições por minuto.
- **Histórico**: Dados históricos são limitados.

## Contribuição 🌟

Contribuições são bem-vindas! Por favor, abra uma [issue](https://github.com/RaphaelTW/WeatherApp) ou envie um [pull request](https://github.com/RaphaelTW/WeatherApp).

## Criação 🧒🏽
Este projeto foi desenvolvido por [RaphaelTW](https://github.com/RaphaelTW).

## Licença ©

Este projeto está licenciado sob a [MIT License](https://opensource.org/licenses/MIT).
