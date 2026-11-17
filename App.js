import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  ActivityIndicator, 
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert
} from 'react-native';

const CIDADES_INICIAIS = [
  { id: '1', nome: 'Recife - PE', lat: -8.0476, lon: -34.8770 },
  { id: '2', nome: 'São Paulo - SP', lat: -23.5505, lon: -46.6333 },
  { id: '3', nome: 'Rio de Janeiro - RJ', lat: -22.9068, lon: -43.1729 },
  { id: '4', nome: 'Brasília - DF', lat: -15.7975, lon: -47.8919 },
  { id: '5', nome: 'Curitiba - PR', lat: -25.4284, lon: -49.2733 },
];

export default function App() {
  const [climas, setClimas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [textoBusca, setTextoBusca] = useState('');
  const [buscandoCidade, setBuscandoCidade] = useState(false);

  // Busca o clima a partir da latitude e longitude
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

  // Carrega as capitais iniciais ao abrir o app
  const carregarCapitais = async () => {
    try {
      const requisicoes = CIDADES_INICIAIS.map((cidade) =>
        consultarClima(cidade.id, cidade.nome, cidade.lat, cidade.lon)
      );
      const resultados = await Promise.all(requisicoes);
      setClimas(resultados);
    } catch (erro) {
      console.error('Erro ao carregar capitais:', erro);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarCapitais();
  }, []);

  // Busca uma nova cidade digitada pelo usuário
  const buscarNovaCidade = async () => {
    if (!textoBusca.trim()) return;

    setBuscandoCidade(true);
    try {
      // 1. Descobre a latitude e longitude pelo nome da cidade
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(textoBusca)}&count=1&language=pt&format=json`;
      const geoResposta = await fetch(geoUrl);
      const geoDados = await geoResposta.json();

      if (!geoDados.results || geoDados.results.length === 0) {
        Alert.alert('Ops!', 'Cidade não encontrada. Tente outro nome.');
        return;
      }

      const lugar = geoDados.results[0];
      const nomeFormatado = `${lugar.name}${lugar.admin1 ? ` - ${lugar.admin1}` : ''} (${lugar.country_code})`;

      // 2. Busca a temperatura dessa cidade encontrada
      const novoClima = await consultarClima(
        Date.now().toString(),
        nomeFormatado,
        lugar.latitude,
        lugar.longitude
      );

      // Adiciona a cidade buscada no topo da lista
      setClimas([novoClima, ...climas]);
      setTextoBusca('');
    } catch (erro) {
      console.error('Erro na busca:', erro);
      Alert.alert('Erro', 'Não foi possível buscar a cidade.');
    } finally {
      setBuscandoCidade(false);
    }
  };

  const renderizarItem = ({ item }) => (
    <View style={estilos.cartao}>
      <View style={{ flex: 1, paddingRight: 10 }}>
        <Text style={estilos.cidade}>{item.cidade}</Text>
        <Text style={estilos.vento}>💨 Vento: {item.vento} km/h</Text>
      </View>
      <Text style={estilos.temperatura}>{item.temperatura}°C</Text>
    </View>
  );

  return (
    <SafeAreaView style={estilos.container}>
      <Text style={estilos.titulo}>Clima em Tempo Real</Text>

      {/* Área de Busca */}
      <View style={estilos.areaBusca}>
        <TextInput
          style={estilos.input}
          placeholder="Digite uma cidade (ex: Olinda, Lisboa)..."
          value={textoBusca}
          onChangeText={setTextoBusca}
          onSubmitEditing={buscarNovaCidade}
        />
        <TouchableOpacity 
          style={estilos.botao} 
          onPress={buscarNovaCidade}
          disabled={buscandoCidade}
        >
          <Text style={estilos.textoBotao}>
            {buscandoCidade ? '...' : 'Buscar'}
          </Text>
        </TouchableOpacity>
      </View>

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
    marginBottom: 16,
  },
  areaBusca: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  botao: {
    backgroundColor: '#0284c7',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  textoBotao: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  lista: {
    paddingHorizontal: 16,
    paddingBottom: 20,
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
    fontSize: 17,
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