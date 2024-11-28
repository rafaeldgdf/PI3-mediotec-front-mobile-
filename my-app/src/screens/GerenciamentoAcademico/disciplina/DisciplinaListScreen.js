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

const DisciplinaListScreen = ({ navigation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [disciplinas, setDisciplinas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDisciplinas();
  }, []);

  // Buscar Disciplinas
  const fetchDisciplinas = async () => {
    setLoading(true);
    try {
      const response = await api.get('/disciplinas');
      const disciplinas = response.data;

      // Adicionar detalhes de turma e professor
      const disciplinasComDetalhes = await Promise.all(
        disciplinas.map(async (disciplina) => {
          const detalhes = { ...disciplina };

          // Buscar informações da turma
          if (disciplina.idTurma) {
            try {
              const turmaResponse = await api.get(`/turmas/${disciplina.idTurma}`);
              detalhes.nomeTurma = turmaResponse.data.nome || 'Não associada';
            } catch {
              detalhes.nomeTurma = 'Não associada';
            }
          } else {
            detalhes.nomeTurma = 'Não associada';
          }

          // Buscar informações do professor
          if (disciplina.idProfessor) {
            try {
              const professorResponse = await api.get(`/professores/${disciplina.idProfessor}`);
              const professor = professorResponse.data;
              detalhes.nomeProfessor = `${professor.nome} ${professor.ultimoNome}` || 'Não associado';
            } catch {
              detalhes.nomeProfessor = 'Não associado';
            }
          } else {
            detalhes.nomeProfessor = 'Não associado';
          }

          return detalhes;
        })
      );

      setDisciplinas(disciplinasComDetalhes);
    } catch (error) {
      console.error('Erro ao buscar disciplinas:', error);
      Alert.alert('Erro', 'Falha ao carregar as disciplinas.');
    } finally {
      setLoading(false);
    }
  };


  // Deletar Disciplina
  const handleDelete = async (id) => {
    Alert.alert(
      'Confirmação',
      'Tem certeza que deseja deletar esta disciplina?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              // Faz a requisição para deletar a disciplina
              await api.delete(`/disciplinas/${id}`);
              Alert.alert('Sucesso', 'Disciplina deletada com sucesso.');
              fetchDisciplinas(); // Atualizar a lista após a exclusão
            } catch (error) {
              console.error('Erro ao deletar disciplina:', error.response?.data || error.message);

              // Tratar mensagens específicas do erro
              const errorMessage =
                error.response?.data?.message ||
                (error.response?.status === 404
                  ? 'Disciplina não encontrada. Já pode ter sido removida.'
                  : 'Falha ao deletar disciplina. Verifique se há dependências.');

              Alert.alert('Erro', errorMessage);
            }
          },
        },
      ]
    );
  };

  // Filtrar Disciplinas pelo Termo de Busca
  const filteredDisciplinas = disciplinas.filter((disciplina) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      disciplina.nome.toLowerCase().includes(searchLower) ||
      disciplina.nomeTurma?.toLowerCase().includes(searchLower) ||
      disciplina.nomeProfessor?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <LayoutWrapper navigation={navigation} handleLogout={() => navigation.navigate('LoginScreen')}>
      {/* Título da Página */}
      <View style={styles.titleContainer}>
        <Text style={styles.pageTitle}>
          <Icon name="list" size={24} color="#0056b3" /> Lista de Disciplinas
        </Text>
        <Text style={styles.subtitle}>Gerencie e visualize as disciplinas cadastradas.</Text>
      </View>

      {/* Barra de Pesquisa */}
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar Disciplina"
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      {/* Lista de Disciplinas */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      ) : filteredDisciplinas.length > 0 ? (
        <FlatList
          data={filteredDisciplinas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {/* Informações da Disciplina */}
              <Text style={styles.cardTitle}>{`${item.nome}`}</Text>
              <Text style={styles.cardInfo}>
                <Icon name="badge" size={16} /> <Text style={styles.bold}>ID:</Text> {item.id}
              </Text>
              <Text style={styles.cardInfo}>
                <Icon name="class" size={16} /> <Text style={styles.bold}>Turma:</Text> {item.nomeTurma || 'Não associada'}
              </Text>
              <Text style={styles.cardInfo}>
                <Icon name="person" size={16} /> <Text style={styles.bold}>Professor:</Text> {item.nomeProfessor || 'Não associado'}
              </Text>

              {/* Botões de Ação */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.cardButton, styles.openButton]}
                  onPress={() =>
                    navigation.navigate('DisciplinaDetalhesScreen', {
                      disciplina: item,
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
        <Text style={styles.emptyText}>Nenhuma disciplina encontrada.</Text>
      )}

      {/* Botão de Cadastro */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('DisciplinaCreateScreen')}
      >
        <Icon name="add" size={20} color="#FFF" />
        <Text style={styles.addButtonText}>Cadastrar Disciplina</Text>
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

export default DisciplinaListScreen;
