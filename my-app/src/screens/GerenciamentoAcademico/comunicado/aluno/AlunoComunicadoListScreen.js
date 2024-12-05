import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../../api/api';
import LayoutWrapper from '../../../../components/LayoutWrapper';

const AlunoComunicadoListScreen = ({ navigation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [comunicados, setComunicados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alunoNome, setAlunoNome] = useState('');
  const [turmaNome, setTurmaNome] = useState('');
  const [alunoId, setAlunoId] = useState(null);
  const [showAllDestinatarios, setShowAllDestinatarios] = useState({});

  // Função para buscar os dados do aluno
  const fetchAlunoData = async (id) => {
    try {
      const response = await api.get(`/alunos/${id}`);
      const aluno = response.data;
      setAlunoNome(`${aluno.nome} ${aluno.ultimoNome}`);
      setTurmaNome(aluno.turmas[0]?.nome || 'Sem Turma'); // Assume a primeira turma associada
      return aluno.turmas[0]?.id || null; // Retorna o ID da turma associada
    } catch (error) {
      console.error('Erro ao buscar dados do aluno:', error);
      throw new Error('Não foi possível carregar os dados do aluno.');
    }
  };

  // Função para buscar os comunicados
  const fetchComunicados = async (alunoId, turmaId) => {
    try {
      const [alunoResponse, turmaResponse] = await Promise.all([
        api.get(`/comunicados/aluno/${alunoId}`),
        turmaId ? api.get(`/comunicados/turma/${turmaId}`) : Promise.resolve({ data: [] }),
      ]);
      const alunoComunicados = alunoResponse.data || [];
      const turmaComunicados = turmaResponse.data || [];
      setComunicados([...alunoComunicados, ...turmaComunicados]);
    } catch (error) {
      console.error('Erro ao buscar comunicados:', error);
      throw new Error('Não foi possível carregar os comunicados.');
    }
  };

  // Função para formatar os destinatários
  const formatDestinatarios = (alunos, turmas, comunicadoId) => {
    if (turmas?.length > 0) {
      return (
        <Text style={styles.destinatarioItem}>
          <Icon name="people" size={16} color="#6c757d" /> Turma: {turmas[0].nome}
        </Text>
      );
    }

    if (alunos?.length > 0) {
      const showAll = showAllDestinatarios[comunicadoId];
      const displayedAlunos = showAll ? alunos : alunos.slice(0, 5);

      return (
        <View>
          <Text style={styles.destinatarioItem}>
            <Icon name="people" size={16} color="#6c757d" />{' '}
            {displayedAlunos.map((aluno) => `${aluno.nome} ${aluno.ultimoNome}`).join(', ')}
          </Text>
          {alunos.length > 5 && (
            <TouchableOpacity
              onPress={() =>
                setShowAllDestinatarios((prev) => ({
                  ...prev,
                  [comunicadoId]: !prev[comunicadoId],
                }))
              }
            >
              <Text style={styles.verMaisText}>
                {showAll ? 'Ver menos...' : 'Ver mais...'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return <Text style={styles.destinatarioItem}>Destinatários não informados.</Text>;
  };

  // Função principal para carregar os dados iniciais
  const loadData = async () => {
    setLoading(true);
    try {
      const userInfo = await AsyncStorage.getItem('userInfo');
      if (!userInfo) {
        throw new Error('Usuário não encontrado. Faça login novamente.');
      }

      const parsedUserInfo = JSON.parse(userInfo);
      const { usuario } = parsedUserInfo;

      if (!usuario?.id) {
        throw new Error('ID do aluno não encontrado.');
      }

      setAlunoId(usuario.id);

      // Busca o ID da turma do aluno
      const turmaId = await fetchAlunoData(usuario.id);

      // Busca os comunicados do aluno e da turma
      await fetchComunicados(usuario.id, turmaId);
    } catch (error) {
      Alert.alert('Erro', error.message);
      navigation.navigate('LoginScreen');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (comunicado) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      comunicado.titulo?.toLowerCase().includes(searchLower) ||
      comunicado.conteudo?.toLowerCase().includes(searchLower) ||
      comunicado.remetente?.toLowerCase().includes(searchLower) ||
      new Date(comunicado.dataEnvio).toLocaleDateString().includes(searchLower)
    );
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <LayoutWrapper navigation={navigation}>
      <View style={styles.container}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Icon name="mail-outline" size={28} color="#0056b3" style={styles.headerIcon} />
          <Text style={styles.headerTitle}>Comunicados de {alunoNome}</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          Visualize os comunicados enviados para você e sua turma: {turmaNome}.
        </Text>

        {/* Campo de busca */}
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar comunicado"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />

        {/* Lista de comunicados */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007BFF" />
            <Text style={styles.loadingText}>Carregando...</Text>
          </View>
        ) : comunicados.length > 0 ? (
          <FlatList
            data={comunicados.filter(handleSearch)}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Icon name="mail" size={20} color="#007BFF" />
                  <Text style={styles.cardTitle}>{item.titulo || 'Sem Título'}</Text>
                </View>
                <Text style={styles.cardContent}>{item.conteudo || 'Sem conteúdo'}</Text>
                <Text style={styles.cardInfo}>
                  <Icon name="calendar" size={16} /> <Text style={styles.bold}>Data:</Text>{' '}
                  {new Date(item.dataEnvio).toLocaleString()}
                </Text>
                <Text style={styles.cardInfo}>
                  <Icon name="person-circle" size={16} />{' '}
                  <Text style={styles.bold}>Remetente:</Text> {item.remetente || 'N/A'}
                </Text>
                <Text style={styles.cardInfo}>
                  <Text style={styles.bold}>Destinatários:</Text>
                </Text>
                {formatDestinatarios(item.alunos, item.turmas, item.id)}
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 80 }}
          />
        ) : (
          <Text style={styles.emptyText}>Nenhum comunicado encontrado.</Text>
        )}
      </View>
    </LayoutWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  headerIcon: { marginRight: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#0056b3' },
  headerSubtitle: { fontSize: 14, color: '#6c757d', marginBottom: 16 },
  searchInput: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#343a40', marginLeft: 8 },
  cardContent: { fontSize: 14, color: '#495057', marginBottom: 8 },
  cardInfo: { fontSize: 12, color: '#6c757d', marginBottom: 4 },
  destinatarioItem: { fontSize: 14, color: '#6c757d', flexWrap: 'wrap' },
  verMaisText: { fontSize: 14, color: '#007BFF', textDecorationLine: 'underline', marginTop: 4 },
  bold: { fontWeight: 'bold' },
  emptyText: { fontSize: 16, color: '#6c757d', textAlign: 'center', marginTop: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 14, color: '#007BFF', marginTop: 10 },
});

export default AlunoComunicadoListScreen;
