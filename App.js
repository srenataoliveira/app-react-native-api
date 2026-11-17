import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, Alert } from 'react-native';
import { Provider as PaperProvider, MD3LightTheme, Appbar, TextInput, Button, Card, Text, ActivityIndicator } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator();

// Tema personalizado do React Native Paper
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#0284c7',
    background: '#f0f4f8',
  },
};

// ==================== TELA 1: INÍCIO ====================
function HomeScreen({ navigation }) {
  const [climas, setClimas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [textoBusca, setTextoBusca] = useState('');
  const [favoritoSalvo, setFavoritoSalvo] = useState('');

  const consultarClima = async (id, nomeExibicao, lat, lon) => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    const resposta = await fetch(url);
    const dados = await resposta.json();
    return {
      id: id,
      cidade: nomeExibicao,
      temperatura: dados.current_weather.temperature,
      vento: dados.current_weather.windspeed,
    };
  };

  // Carrega dados iniciais e recupera favorito do AsyncStorage
  useEffect(() => {
    async function carregarDadosIniciais() {
      try {
        const dadosSalvos = await AsyncStorage.getItem('@favorito_clima');
        if (dadosSalvos) {
          setFavoritoSalvo(dadosSalvos);
        }

        const capitais = [
          { id: '1', nome: 'Recife - PE', lat: -8.0476, lon: -34.8770 },
          { id: '2', nome: 'São Paulo - SP', lat: -23.5505, lon: -46.6333 },
          { id: '3', nome: 'Rio de Janeiro - RJ', lat: -22.9068, lon: -43.1729 },
        ];
        const reqs = capitais.map(c => consultarClima(c.id, c.nome, c.lat, c.lon));
        const res = await Promise.all(reqs);
        setClimas(res);
      } catch (e) {
        console.error(e);
      } finally {
        setCarregando(false);
      }
    }
    carregarDadosIniciais();
  }, []);

  // Salvar no AsyncStorage
  const salvarFavorito = async (nomeCidade) => {
    try {
      await AsyncStorage.setItem('@favorito_clima', nomeCidade);
      setFavoritoSalvo(nomeCidade);
      Alert.alert('Sucesso', `"${nomeCidade}" foi salva localmente como favorita!`);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível salvar.');
    }
  };

  const buscarCidade = async () => {
    if (!textoBusca.trim()) return;
    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(textoBusca)}&count=1&language=pt&format=json`;
      const res = await fetch(geoUrl);
      const data = await res.json();

      if (!data.results || data.results.length === 0) {
        Alert.alert('Aviso', 'Cidade não encontrada.');
        return;
      }

      const l = data.results[0];
      const nomeFormatado = `${l.name} (${l.country_code})`;
      const novo = await consultarClima(Date.now().toString(), nomeFormatado, l.latitude, l.longitude);

      setClimas([novo, ...climas]);
      setTextoBusca('');
    } catch (e) {
      Alert.alert('Erro', 'Falha na busca.');
    }
  };

  return (
    <View style={estilos.container}>
      <Appbar.Header style={{ backgroundColor: '#0284c7' }}>
        <Appbar.Content title="Clima & Tempo API" titleStyle={{ color: '#fff', fontWeight: 'bold' }} />
        <Appbar.Action icon="information" color="#fff" onPress={() => navigation.navigate('Detalhes')} />
      </Appbar.Header>

      <View style={estilos.conteudo}>
        {favoritoSalvo ? (
          <Card style={estilos.cardFavorito}>
            <Card.Content>
              <Text variant="titleMedium" style={{ color: '#0369a1', fontWeight: 'bold' }}>⭐ Cidade Favorita Salva:</Text>
              <Text variant="bodyLarge">{favoritoSalvo}</Text>
            </Card.Content>
          </Card>
        ) : null}

        <View style={estilos.linhaBusca}>
          <TextInput
            label="Digite uma cidade..."
            value={textoBusca}
            onChangeText={setTextoBusca}
            style={estilos.input}
            mode="outlined"
            dense
          />
          <Button mode="contained" onPress={buscarCidade} style={estilos.botao}>
            Buscar
          </Button>
        </View>

        {carregando ? (
          <ActivityIndicator animating={true} size="large" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={climas}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Card style={estilos.card} onPress={() => salvarFavorito(item.cidade)}>
                <Card.Title 
                  title={item.cidade} 
                  subtitle={`Vento: ${item.vento} km/h (Toque para salvar favorita)`}
                  right={(props) => <Text {...props} style={estilos.temp}>{item.temperatura}°C</Text>}
                />
              </Card>
            )}
          />
        )}
      </View>
    </View>
  );
}

// ==================== TELA 2: DETALHES ====================
function DetailsScreen({ navigation }) {
  const [favorito, setFavorito] = useState('Nenhuma');

  useEffect(() => {
    async function pegarFavorito() {
      const salvo = await AsyncStorage.getItem('@favorito_clima');
      if (salvo) setFavorito(salvo);
    }
    pegarFavorito();
  }, []);

  return (
    <View style={estilos.container}>
      <Appbar.Header style={{ backgroundColor: '#0284c7' }}>
        <Appbar.BackAction color="#fff" onPress={() => navigation.goBack()} />
        <Appbar.Content title="Sobre o Projeto" titleStyle={{ color: '#fff', fontWeight: 'bold' }} />
      </Appbar.Header>

      <View style={[estilos.conteudo, { padding: 20 }]}>
        <Card style={estilos.card}>
          <Card.Content>
            <Text variant="titleLarge" style={{ fontWeight: 'bold', marginBottom: 10 }}>Sobre o Aplicativo</Text>
            <Text variant="bodyMedium" style={{ marginBottom: 15 }}>
              Este aplicativo consome dados meteorológicos em tempo real da API pública Open-Meteo, utilizando React Native, Expo, React Native Paper para estilização e AsyncStorage para persistência de dados localmente.
            </Text>
            <Text variant="bodyLarge" style={{ fontWeight: 'bold', color: '#0284c7' }}>
              Local favorito salvo no AsyncStorage:
            </Text>
            <Text variant="bodyMedium" style={{ marginTop: 5, fontStyle: 'italic' }}>{favorito}</Text>
          </Card.Content>
        </Card>
      </View>
    </View>
  );
}

// ==================== NAVEGAÇÃO PRINCIPAL ====================
export default function App() {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Inicio" component={HomeScreen} />
          <Stack.Screen name="Detalhes" component={DetailsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  conteudo: { flex: 1, padding: 16 },
  linhaBusca: { flexDirection: 'row', gap: 8, marginBottom: 16, alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#fff' },
  botao: { justifyContent: 'center', height: 48 },
  card: { marginBottom: 10, backgroundColor: '#fff' },
  cardFavorito: { marginBottom: 16, backgroundColor: '#e0f2fe' },
  temp: { fontSize: 22, fontWeight: 'bold', color: '#0284c7', marginRight: 16 },
});