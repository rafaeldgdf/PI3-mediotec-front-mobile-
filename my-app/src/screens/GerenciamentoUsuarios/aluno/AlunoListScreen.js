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

const AlunoListScreen = ({ navigation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAlunos();
  }, []);

  // Fetching Students
  const fetchAlunos = async () => {
    setLoading(true);
    try {
      const response = await api.get('/alunos');
      const alunosOrdenados = response.data.sort((a, b) =>
        a.nome.localeCompare(b.nome)
      );
      setAlunos(alunosOrdenados);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      Alert.alert('Erro', 'Falha ao carregar a lista de alunos.');
    } finally {
      setLoading(false);
    }
  };

// Deleting a Student
const handleDelete = async (id) => {
  Alert.alert(
    'Confirmação',
    'Tem certeza que deseja deletar este aluno?',
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Deletar',
        style: 'destructive',
        onPress: async () => {
          try {
            // Faz o DELETE usando o ID do aluno
            const response = await api.delete(`/alunos/${id}`);
            if (response.status === 200 || response.status === 204) {
              Alert.alert('Sucesso', 'Aluno deletado com sucesso.');
              fetchAlunos(); // Recarrega a lista de alunos após exclusão
            }
          } catch (error) {
            console.error('Erro ao deletar aluno:', error.response?.data || error.message);
            Alert.alert('Erro', error.response?.data?.message || 'Falha ao deletar aluno.');
          }
        },
      },
    ]
  );
};


  // Filter Students by Search Term
  const filteredAlunos = alunos
    .filter((aluno) => {
      const searchLower = searchTerm.toLowerCase();
      const nomeCompleto = `${aluno.nome} ${aluno.ultimoNome}`.toLowerCase();
      const turmaNome = aluno.turmas?.map((t) => t.nome).join(', ').toLowerCase() || 'Não associado';

      return (
        nomeCompleto.includes(searchLower) ||
        aluno.cpf.includes(searchLower) ||
        aluno.email.toLowerCase().includes(searchLower) ||
        turmaNome.includes(searchLower)
      );
    })
    .sort((a, b) => a.nome.localeCompare(b.nome));

  return (
    <LayoutWrapper navigation={navigation} handleLogout={() => navigation.navigate('LoginScreen')}>
      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.pageTitle}>
          <Icon name="list" size={24} color="#0056b3" /> Lista de Alunos
        </Text>
        <Text style={styles.subtitle}>
          Gerencie e visualize os alunos cadastrados.
        </Text>
      </View>

      {/* Search Bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar Aluno"
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      {/* Student List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      ) : filteredAlunos.length > 0 ? (
        <FlatList
          data={filteredAlunos}
          keyExtractor={(item) => item.cpf}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {/* Student Info */}
              <Text style={styles.cardTitle}>{`ALUNO(A): ${item.nome} ${item.ultimoNome}`}</Text>
              <Text style={styles.cardInfo}>
                <Icon name="badge" size={16} /> <Text style={styles.bold}>CPF:</Text> {item.cpf}
              </Text>
              <Text style={styles.cardInfo}>
                <Icon name="email" size={16} /> <Text style={styles.bold}>Email:</Text> {item.email}
              </Text>
              <Text style={styles.cardInfo}>
                <Icon name="class" size={16} /> <Text style={styles.bold}>Turma:</Text>{' '}
                {item.turmas?.map((t) => t.nome).join(', ') || 'Não associado'}
              </Text>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.cardButton, styles.openButton]}
                  onPress={() =>
                    navigation.navigate('AlunoDetalhesScreen', {
                      aluno: item,
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
        <Text style={styles.emptyText}>Nenhum aluno encontrado.</Text>
      )}

      {/* Add Student Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AlunoCreateScreen')}
      >
        <Icon name="add" size={20} color="#FFF" />
        <Text style={styles.addButtonText}>Cadastrar Aluno</Text>
      </TouchableOpacity>
    </LayoutWrapper>
  );
};


const styles = StyleSheet.create({
  titleContainer: {
    marginBottom: 16,
    alignItems: 'center',
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
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0056b3',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  cardInfo: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
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

export default AlunoListScreen;
