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

const ProfessorListScreen = ({ navigation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [professores, setProfessores] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfessores();
  }, []);

  // Buscar Professores
  const fetchProfessores = async () => {
    setLoading(true);
    try {
      const response = await api.get('/professores');
      setProfessores(response.data);
    } catch (error) {
      console.error('Erro ao buscar professores:', error);
      Alert.alert('Erro', 'Falha ao carregar professores.');
    } finally {
      setLoading(false);
    }
  };

  // Deletar Professor
  const handleDelete = async (cpf) => {
    Alert.alert(
      'Confirmação',
      'Tem certeza que deseja deletar este professor?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/professores/${cpf}`);
              Alert.alert('Sucesso', 'Professor deletado com sucesso.');
              fetchProfessores();
            } catch (error) {
              console.error('Erro ao deletar professor:', error);
              Alert.alert('Erro', 'Falha ao deletar professor.');
            }
          },
        },
      ]
    );
  };

  // Filtrar Professores pelo Termo de Busca
  // Filtrar Professores pelo Termo de Busca
  const filteredProfessores = professores.filter((professor) => {
    const searchLower = searchTerm.toLowerCase();
    const nomeCompleto = `${professor.nome} ${professor.ultimoNome}`.toLowerCase();
    const cpf = professor.cpf.toLowerCase();
    const email = professor.email.toLowerCase();
    const disciplinas = professor.turmaDisciplinaProfessores
      ? Array.from(
        new Set(
          professor.turmaDisciplinaProfessores.map((td) => td.disciplina?.nome.toLowerCase() || '')
        )
      ).join(' ')
      : '';

    return (
      nomeCompleto.includes(searchLower) ||
      cpf.includes(searchLower) ||
      email.includes(searchLower) ||
      disciplinas.includes(searchLower)
    );
  });

  return (
    <LayoutWrapper navigation={navigation} handleLogout={() => navigation.navigate('LoginScreen')}>
      {/* Título da Página */}
      <View style={styles.titleContainer}>
        <Text style={styles.pageTitle}>
          <Icon name="list" size={24} color="#0056b3" /> Lista de Professores
        </Text>
        <Text style={styles.subtitle}>
          Gerencie e visualize os professores cadastrados.
        </Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar Professor"
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      ) : filteredProfessores.length > 0 ? (
        <FlatList
          data={filteredProfessores}
          keyExtractor={(item) => item.cpf}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{`PROF. ${item.nome} ${item.ultimoNome}`}</Text>
              <Text style={styles.cardInfo}>
                <Icon name="badge" /><Text style={styles.bold}>CPF:</Text> {item.cpf}
              </Text>
              <Text style={styles.cardInfo}>
                <Icon name="email" size={16} /><Text style={styles.bold}>Email:</Text> {item.email}
              </Text>
              <Text style={styles.cardInfo}>
                <Icon name="class" size={16} /><Text style={styles.bold}>Disciplinas:</Text>{' '}
                {item.turmaDisciplinaProfessores && item.turmaDisciplinaProfessores.length > 0
                  ? Array.from(
                    new Set(
                      item.turmaDisciplinaProfessores.map((td) => td.disciplina?.nome || 'Não informado')
                    )
                  ).join(', ')
                  : 'Nenhuma disciplina cadastrada.'}
              </Text>


              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.cardButton, styles.openButton]}
                  onPress={() =>
                    navigation.navigate('ProfessorDetalhesScreen', {
                      professor: item,
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
        <Text style={styles.emptyText}>Nenhum professor encontrado.</Text>
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('ProfessorCreateScreen')}
      >
        <Icon name="add" size={20} color="#FFF" />
        <Text style={styles.addButtonText}>Cadastrar Professor</Text>
      </TouchableOpacity>
    </LayoutWrapper>
  );
};

const styles = StyleSheet.create({
  titleContainer: {
    marginBottom: 16, // Espaçamento inferior do título
    alignItems: 'center', // Centraliza o título e subtítulo
  },
  pageTitle: {
    fontSize: 24, // Tamanho maior para destaque
    fontWeight: 'bold', // Negrito para destaque
    color: '#0056b3', // Azul consistente com o tema
    textAlign: 'center', // Centraliza o texto
    marginBottom: 4, // Espaçamento entre o título e o subtítulo
  },
  subtitle: {
    fontSize: 14, // Menor para o subtítulo
    color: '#666', // Cinza para suavidade
    textAlign: 'center', // Centraliza o texto
    marginBottom: 16, // Espaçamento inferior antes do campo de busca
  },
  searchInput: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    fontSize: 14, // Consistência com outros elementos
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
    fontSize: 20, // Destaque maior para o título do cartão
    fontWeight: 'bold',
    color: '#0056b3', // Azul para destaque
    textTransform: 'uppercase', // Títulos em letras maiúsculas
    marginBottom: 8, // Espaçamento inferior
    borderBottomWidth: 2, // Linha decorativa
    borderBottomColor: '#E5E5E5',
    paddingBottom: 4,
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


export default ProfessorListScreen;
