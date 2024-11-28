import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../../../api/api';
import LayoutWrapper from '../../../components/LayoutWrapper';

const CoordenacaoListScreen = ({ navigation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [coordenacoes, setCoordenacoes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCoordenacoes();
  }, []);

  const fetchCoordenacoes = async () => {
    setLoading(true);
    try {
      const response = await api.get('/coordenacoes');
      setCoordenacoes(response.data);
    } catch (error) {
      console.error('Erro ao buscar coordenações:', error);
      Alert.alert('Erro', 'Falha ao carregar coordenações.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Confirmação',
      'Tem certeza que deseja deletar esta coordenação?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/coordenacoes/${id}`);
              Alert.alert('Sucesso', 'Coordenação deletada com sucesso.');
              fetchCoordenacoes(); // Atualizar a lista
            } catch (error) {
              console.error('Erro ao deletar coordenação:', error);
              Alert.alert('Erro', 'Falha ao deletar coordenação.');
            }
          },
        },
      ]
    );
  };

  const filteredCoordenacoes = coordenacoes.filter((item) => {
    const searchLower = searchTerm.toLowerCase();

    return (
      item.nome.toLowerCase().includes(searchLower) ||
      item.descricao?.toLowerCase().includes(searchLower) ||
      item.telefones?.some((tel) => `(${tel.ddd}) ${tel.numero}`.includes(searchLower)) ||
      item.coordenadores?.some(
        (coord) =>
          coord.nomeCoordenador?.toLowerCase().includes(searchLower) || // Nome do coordenador
          coord.email?.toLowerCase().includes(searchLower) // Email do coordenador
      )
    );
  });

  return (
    <LayoutWrapper navigation={navigation} handleLogout={() => navigation.navigate('LoginScreen')}>
      <View style={styles.titleContainer}>
        <Text style={styles.pageTitle}>
          <Icon name="list" size={24} color="#0056b3" /> Lista de Coordenações
        </Text>
        <Text style={styles.subtitle}>
          Gerencie e visualize as coordenações cadastradas.
        </Text>
      </View>


      <TextInput
        style={styles.searchInput}
        placeholder="Buscar Coordenação"
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      ) : filteredCoordenacoes.length > 0 ? (
        <FlatList
          data={filteredCoordenacoes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>

              <Text style={styles.cardTitle}>{`COORDENAÇÃO: ${item.nome}`}</Text>


              {/* Descrição */}
              <Text style={styles.cardDescription}>{item.descricao || 'Sem descrição disponível'}</Text>

              {/* Telefones */}
              <View style={styles.cardInfo}>
                <Icon name="phone" size={16} style={styles.icon} />
                <Text style={styles.cardInfoLabel}>Telefone(s):</Text>
                <Text style={styles.cardInfoContent}>
                  {item.telefones?.map((tel) => `(${tel.ddd}) ${tel.numero}`).join(', ') || 'Não informado'}
                </Text>
              </View>

              {/* Coordenadores */}
              <View style={styles.cardInfo}>
                <Icon name="group" size={16} style={styles.icon} />
                <Text style={styles.cardInfoLabel}>Coordenador(es):</Text>
              </View>
              {item.coordenadores && item.coordenadores.length > 0 ? (
                item.coordenadores.map((coord, index) => (
                  <View key={index} style={styles.coordinatorItem}>
                    <Text style={styles.coordinatorName}>
                      {coord.nomeCoordenador || 'Sem nome'}
                    </Text>
                    <Text style={styles.coordinatorEmail}>
                      {coord.email || 'Sem email'}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.cardInfoContent}>Não informado</Text>
              )}


              {/* Botões */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.cardButton, styles.openButton]}
                  onPress={() =>
                    navigation.navigate('CoordenacaoDetalhesScreen', {
                      coordenacao: item,
                    })
                  }
                >
                  <Icon name="open-in-new" size={18} color="#FFF" />
                  <Text style={styles.buttonText}>Abrir</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.cardButton, styles.deleteButton]}
                  onPress={() => handleDelete(item.id)}
                >
                  <Icon name="delete" size={18} color="#FFF" />
                  <Text style={styles.buttonText}>Deletar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      ) : (
        <Text style={styles.emptyText}>Nenhuma coordenação encontrada.</Text>
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('CoordenacaoCreateScreen')}
      >
        <Icon name="add" size={20} color="#FFF" />
        <Text style={styles.addButtonText}>Cadastrar Coordenação</Text>
      </TouchableOpacity>
    </LayoutWrapper>
  );
};

const styles = StyleSheet.create({
  titleContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0056b3',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
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
    marginVertical: 12, // Espaçamento maior entre os cartões
    marginHorizontal: 16,
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
    fontSize: 20, // Destaque no título
    fontWeight: 'bold',
    color: '#0056b3', // Azul forte para uniformidade
    marginBottom: 8,
    textTransform: 'uppercase',
    borderBottomWidth: 1, // Linha de separação
    borderBottomColor: '#ccc',
    paddingBottom: 4,
  },
  cardInfo: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
    flexDirection: 'row', // Ícones alinhados ao texto
    alignItems: 'center',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  cardInfoLabel: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 14,
    marginRight: 8,
  },
  cardInfoContent: {
    fontSize: 14,
    color: '#555',
    flex: 1, // Ajusta a largura
  },
  icon: {
    marginRight: 8, // Espaço entre ícone e texto
    color: '#444',
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
    backgroundColor: '#28A745', // Verde para o botão "Abrir"
  },
  deleteButton: {
    backgroundColor: '#DC3545', // Vermelho para o botão "Deletar"
  },
  buttonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  addButton: {
    backgroundColor: '#007BFF', // Azul para o botão de adicionar
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
  coordinatorItem: {
    marginBottom: 8, // Espaçamento entre coordenadores
    paddingLeft: 24, // Alinhamento com o ícone
  },
  coordinatorName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  coordinatorEmail: {
    fontSize: 14,
    color: '#555',
    marginTop: 2, // Pequeno espaçamento abaixo do nome
  },
});

export default CoordenacaoListScreen;
