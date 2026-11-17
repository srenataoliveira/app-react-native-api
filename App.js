import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  ActivityIndicator, 
  SafeAreaView 
} from 'react-native';

// Coordenadas reais das cidades para consultar na API
const CIDADES = [
  { id: '1', nome: 'Recife - PE', lat: -8.0476, lon: -34.8770 },
  { id: '2', nome: 'São Paulo - SP', lat: -23.5505, lon: -46.6333 },
  { id: '3', nome: 'Rio de Janeiro - RJ', lat: -22.9068, lon: -43.1729 },
  { id: '4', nome: 'Brasília - DF', lat: -15.7975, lon: -47.8919 },
  { id: '5', nome: 'Curitiba - PR', lat: -25.4284, lon: -49.2733 },
];

export default function App() {
  const [climas, setClimas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const buscarTemperaturas = async () => {
    try {
      // Busca a temperatura real de todas as cidades da lista ao mesmo tempo
      const requisicoes = CIDADES.map(async (cidade) => {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${cidade.lat}&longitude=${cidade.lon}&current_weather=true`;
        const resposta = await fetch(url);
        const dados = await resposta.json();

        return {
          id: cidade.id,
          cidade: cidade.nome,
          temperatura: dados.current_weather.temperature,
          vento: dados.current_weather.windspeed,
        };
      });

      const resultados = await Promise.all(requisicoes);
      setClimas(resultados);
    } catch (erro) {
      console.error('Erro ao buscar clima:', erro);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarTemperaturas();
  }, []);

  const renderizarItem = ({ item }) => (
    <View style={estilos.cartao}>
      <View>
        <Text style={estilos.cidade}>{item.cidade}</Text>
        <Text style={estilos.vento}>💨 Vento: {item.vento} km/h</Text>
      </View>
      <Text style={estilos.temperatura}>{item.temperatura}°C</Text>
    </View>
  );

  return (
    <SafeAreaView style={estilos.container}>
      <Text style={estilos.titulo}>Clima Agora (Tempo Real)</Text>

      {carregando ? (
        <ActivityIndicator size="large" color="#0284c7" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={climas}
          keyExtractor={(item) => item.id}
          renderItem={renderizarItem}
          contentContainerStyle={estilos.lista}
        />
      )}
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0f2fe',
    paddingTop: 40,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#0369a1',
    marginBottom: 20,
  },
  lista: {
    paddingHorizontal: 16,
  },
  cartao: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cidade: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  vento: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  temperatura: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0284c7',
  },
});