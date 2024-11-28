import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../../../api/api';
import LayoutWrapper from '../../../components/LayoutWrapper';

const CoordenadorListScreen = ({ navigation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [coordenadores, setCoordenadores] = useState([]);
  const [coordenacoes, setCoordenacoes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCoordenadores();
    fetchCoordenacoes();
  }, []);

  // Buscar Coordenadores
  const fetchCoordenadores = async () => {
    setLoading(true);
    try {
      const response = await api.get('/coordenadores');
      setCoordenadores(response.data);
    } catch (error) {
      console.error('Erro ao buscar coordenadores:', error);
      Alert.alert('Erro', 'Falha ao carregar coordenadores.');
    } finally {
      setLoading(false);
    }
  };

  // Buscar Coordenações
  const fetchCoordenacoes = async () => {
    try {
      const response = await api.get('/coordenacoes');
      setCoordenacoes(response.data);
    } catch (error) {
      console.error('Erro ao buscar coordenações:', error);
      Alert.alert('Erro', 'Falha ao carregar coordenações.');
    }
  };

  // Obter Nome da Coordenação pelo ID
  const getCoordenacaoNome = (idCoordenacao) => {
    const coordenacao = coordenacoes.find((c) => c.id === idCoordenacao);
    return coordenacao ? coordenacao.nome : 'Não associado';
  };

  // Deletar Coordenador
  const handleDelete = async (cpf) => {
    Alert.alert(
      'Confirmação',
      'Tem certeza que deseja deletar este coordenador?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/coordenadores/${cpf}`);
              Alert.alert('Sucesso', 'Coordenador deletado com sucesso.');
              fetchCoordenadores();
            } catch (error) {
              console.error('Erro ao deletar coordenador:', error);
              Alert.alert('Erro', 'Falha ao deletar coordenador.');
            }
          },
        },
      ]
    );
  };

  // Filtrar Coordenadores pelo Termo de Busca
  const filteredCoordenadores = coordenadores.filter((coordenador) => {
    const searchLower = searchTerm.toLowerCase();
    const nomeCompleto = `${coordenador.nome} ${coordenador.ultimoNome}`.toLowerCase();
    const nomeCoordenacao = getCoordenacaoNome(coordenador.idCoordenacao).toLowerCase();

    return (
      nomeCompleto.includes(searchLower) ||
      coordenador.cpf.includes(searchLower) ||
      coordenador.email.toLowerCase().includes(searchLower) ||
      nomeCoordenacao.includes(searchLower)
    );
  });

  return (
    <LayoutWrapper navigation={navigation} handleLogout={() => navigation.navigate('LoginScreen')}>
      {/* Título da Página */}
      <View style={styles.titleContainer}>
        <Text style={styles.pageTitle}>
          <Icon name="list" size={24} color="#0056b3" /> Lista de Coordenadores
        </Text>
        <Text style={styles.subtitle}>
          Gerencie e visualize os coordenadores cadastrados.
        </Text>
      </View>

      {/* Barra de Pesquisa */}
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar Coordenador"
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      {/* Lista de Coordenadores */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      ) : filteredCoordenadores.length > 0 ? (
        <FlatList
          data={filteredCoordenadores}
          keyExtractor={(item) => item.cpf}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {/* Informações do Coordenador */}
              <Text style={styles.cardTitle}>{` COORD. ${item.nome} ${item.ultimoNome}`}</Text>
              <Text style={styles.cardInfo}>
              <Icon name="badge"/><Text style={styles.bold}>CPF:</Text> {item.cpf}
              </Text>
              <Text style={styles.cardInfo}>
              <Icon name="email" size={16} /><Text style={styles.bold}>Email:</Text> {item.email}
              </Text>
              <Text style={styles.cardInfo}>
              <Icon name="group" size={16} /><Text style={styles.bold}>Coordenação:</Text> {getCoordenacaoNome(item.idCoordenacao)}
              </Text>

              {/* Botões de Ação */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.cardButton, styles.openButton]}
                  onPress={() =>
                    navigation.navigate('CoordenadorDetalhesScreen', {
                      coordenador: item,
                    })
                  }
                >
                  <Icon name="open-in-new" size={18} color="#FFF" />
                  <Text style={styles.buttonText}>Abrir</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.cardButton, styles.deleteButton]}
                  onPress={() => handleDelete(item.cpf)}
                >
                  <Icon name="delete" size={18} color="#FFF" />
                  <Text style={styles.buttonText}>Deletar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      ) : (
        <Text style={styles.emptyText}>Nenhum coordenador encontrado.</Text>
      )}

      {/* Botão de Cadastro */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('CoordenadorCreateScreen')}
      >
        <Icon name="add" size={20} color="#FFF" />
        <Text style={styles.addButtonText}>Cadastrar Coordenador</Text>
      </TouchableOpacity>
    </LayoutWrapper>
  );
};

const styles = StyleSheet.create({
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0056b3',
    textAlign: 'center',
    marginBottom: 4,
  },

  titleContainer: {
    marginBottom: 16, // Espaçamento entre título/subtítulo e a barra de pesquisa
    alignItems: 'center', // Centralizar os textos
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4, // Espaçamento interno
  },
  searchInput: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#FFF',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20, // Tamanho maior para destaque
    fontWeight: 'bold', // Deixar o texto em negrito
    color: '#0056b3', // Azul forte para consistência
    textTransform: 'uppercase', // Texto em letras maiúsculas
    marginBottom: 8, // Margem inferior para separação do conteúdo
    borderBottomWidth: 2, // Linha de destaque abaixo do título
    borderBottomColor: '#E5E5E5', // Cor da linha para suavidade
    paddingBottom: 4, // Espaçamento entre o texto e a linha
  },
  cardInfo: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
    flexDirection: 'row', // Suporte para ícones alinhados
    alignItems: 'center',
  },
  bold: {
    fontWeight: 'bold',
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  openButton: {
    backgroundColor: '#28A745', // Verde para "Abrir"
  },
  deleteButton: {
    backgroundColor: '#DC3545', // Vermelho para "Deletar"
  },
  buttonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  addButton: {
    backgroundColor: '#007BFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 16,
    paddingVertical: 14,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#007BFF',
    marginTop: 10,
  },
});


export default CoordenadorListScreen;
