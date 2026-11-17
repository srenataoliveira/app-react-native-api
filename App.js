import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  ActivityIndicator, 
  SafeAreaView 
} from 'react-native';

export default function App() {
  // 1. Estados (memória temporária da tela)
  const [usuarios, setUsuarios] = useState([]); // Guarda a lista vinda da API
  const [carregando, setCarregando] = useState(true); // Controla a bolinha de carregamento

  // 2. Função que busca os dados na internet (API)
  const buscarDados = async () => {
    try {
      // Faz o pedido para a API pública
      const resposta = await fetch('https://jsonplaceholder.typicode.com/users');
      // Converte a resposta para o formato JSON (que o JavaScript entende)
      const dados = await resposta.json();
      // Salva os dados no nosso estado
      setUsuarios(dados);
    } catch (erro) {
      console.error('Erro ao buscar dados:', erro);
    } finally {
      // Desliga a bolinha de carregamento, dando certo ou errado
      setCarregando(false);
    }
  };

  // 3. useEffect: Executa a busca automaticamente assim que o app abre
  useEffect(() => {
    buscarDados();
  }, []);

  // 4. Como cada item da lista será desenhado na tela
  const renderizarItem = ({ item }) => (
    <View style={estilos.cartao}>
      <Text style={estilos.nome}>{item.name}</Text>
      <Text style={estilos.info}>📧 {item.email}</Text>
      <Text style={estilos.info}>🏙️ Cidade: {item.address.city}</Text>
      <Text style={estilos.info}>🏢 Empresa: {item.company.name}</Text>
    </View>
  );

  // 5. O que aparece na tela do celular
  return (
    <SafeAreaView style={estilos.container}>
      <Text style={estilos.titulo}>Lista de Contatos (API)</Text>

      {/* Se ainda estiver carregando, mostra a rodinha girando. Senão, mostra a lista */}
      {carregando ? (
        <ActivityIndicator size="large" color="#0066cc" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={usuarios}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderizarItem}
          contentContainerStyle={estilos.lista}
        />
      )}
    </SafeAreaView>
  );
}

// 6. Estilização (CSS do React Native)
const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    paddingTop: 40,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1e293b',
    marginBottom: 15,
  },
  lista: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  cartao: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    // Sombra leve
    elevation: 3, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  nome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 6,
  },
  info: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 2,
  },
});