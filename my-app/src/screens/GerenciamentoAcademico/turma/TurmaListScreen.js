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

const TurmaListScreen = ({ navigation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [turmas, setTurmas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTurmas();
  }, []);

  // Buscar Turmas
  const fetchTurmas = async () => {
    setLoading(true);
    try {
      const response = await api.get('/turmas');
      setTurmas(response.data);
    } catch (error) {
      console.error('Erro ao buscar turmas:', error);
      Alert.alert('Erro', 'Falha ao carregar as turmas.');
    } finally {
      setLoading(false);
    }
  };

  // Deletar Turma
  const handleDelete = async (id) => {
    Alert.alert(
      'Confirmação',
      'Tem certeza que deseja deletar esta turma?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log(`Tentando deletar turma com ID: ${id}`);
              await api.delete(`/turmas/${id}`);
              Alert.alert('Sucesso', 'Turma deletada com sucesso.');
              fetchTurmas(); // Atualizar a lista
            } catch (error) {
              console.error('Erro ao deletar turma:', error.response?.data || error.message);
              Alert.alert('Erro', 'Falha ao deletar turma.');
            }
          },
        },
      ]
    );
  };


  // Filtrar Turmas pelo Termo de Busca
  const filteredTurmas = turmas.filter((turma) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      turma.nome.toLowerCase().includes(searchLower) ||
      turma.anoEscolar.toLowerCase().includes(searchLower) ||
      turma.turno.toLowerCase().includes(searchLower) ||
      turma.coordenacao?.nome?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <LayoutWrapper navigation={navigation} handleLogout={() => navigation.navigate('LoginScreen')}>
      {/* Título da Página */}
      <View style={styles.titleContainer}>
        <Text style={styles.pageTitle}>
          <Icon name="list" size={24} color="#0056b3" /> Lista de Turmas
        </Text>
        <Text style={styles.subtitle}>
          Gerencie e visualize as turmas cadastradas.
        </Text>
      </View>

      {/* Barra de Pesquisa */}
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar Turma"
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      {/* Lista de Turmas */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      ) : filteredTurmas.length > 0 ? (
        <FlatList
          data={filteredTurmas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {/* Informações da Turma */}
              <Text style={styles.cardTitle}>{`${item.nome}`}</Text>
              <Text style={styles.cardInfo}>
                <Icon name="calendar-today" size={16} /> <Text style={styles.bold}>Ano Escolar:</Text> {item.anoEscolar}
              </Text>
              <Text style={styles.cardInfo}>
                <Icon name="access-time" size={16} /> <Text style={styles.bold}>Turno:</Text> {item.turno}
              </Text>
              <Text style={styles.cardInfo}>
                <Icon name="date-range" size={16} /> <Text style={styles.bold}>Ano Letivo:</Text> {item.anoLetivo}
              </Text>
              <Text style={styles.cardInfo}>
                <Icon name="group" size={16} /> <Text style={styles.bold}>Coordenação:</Text> {item.coordenacao?.nome || 'Não informado'}
              </Text>

              {/* Botões de Ação */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.cardButton, styles.openButton]}
                  onPress={() =>
                    navigation.navigate('TurmaDetalhesScreen', {
                      turma: item,
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
        <Text style={styles.emptyText}>Nenhuma turma encontrada.</Text>
      )}

      {/* Botão de Cadastro */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('TurmaCreateScreen')}
      >
        <Icon name="add" size={20} color="#FFF" />
        <Text style={styles.addButtonText}>Cadastrar Turma</Text>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0056b3',
    marginBottom: 8,
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 4,
  },
  cardInfo: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
    flexDirection: 'row',
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
    backgroundColor: '#28A745',
  },
  deleteButton: {
    backgroundColor: '#DC3545',
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


export default TurmaListScreen;
