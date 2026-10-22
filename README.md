# WeatherApp 🦊

Aplicativo de previsão meteorológica feito em React Native e Expo. A Fifi, a raposa-guia, apresenta condições atuais, previsão de até 16 dias, qualidade do ar, alertas e dicas personalizadas.

## Recursos

- Clima atual, previsão por hora e previsão de 16 dias.
- Busca de cidades, localização atual e favoritos.
- Qualidade do ar, índice UV, vento, umidade e visibilidade.
- Atividade sísmica recente próxima à cidade selecionada.
- Alertas calculados para chuva, trovoada, UV, vento, nevoeiro e neve.
- Preferências persistidas localmente e lembrete diário opcional às 7h.

## Executar

```bash
npm install
npx expo start -c
```

Abra o projeto no Expo Go compatível com Expo SDK 57, em um emulador, ou pressione `w` no terminal para executá-lo na web.

## Gerar APK

Faça login na Expo e execute o perfil `apk` já configurado em `eas.json`:

```bash
npx eas-cli login
npx eas-cli build --platform android --profile apk
```

Ao concluir, o EAS fornecerá o link para baixar o APK instalável. O perfil `production` permanece configurado para gerar o formato AAB destinado à Google Play.

## Dados e permissões

O projeto não exige chave de API. Ele consulta Open-Meteo para clima, geocodificação e qualidade do ar; o catálogo do USGS é usado apenas para atividade sísmica recente.

A localização é opcional. Ao autorizá-la, as coordenadas são enviadas diretamente aos serviços meteorológicos para consultar o clima local. O lembrete diário é uma notificação local e não atualiza dados em segundo plano.

## Verificações

```bash
npm run typecheck
npm run check:logic
npm run test:ci
npm audit
```

## Limitações

Previsões, qualidade do ar e sismos dependem de conexão com a internet e da disponibilidade dos serviços de dados. Os alertas do aplicativo são informativos e não substituem comunicações oficiais da Defesa Civil ou de órgãos de emergência.
