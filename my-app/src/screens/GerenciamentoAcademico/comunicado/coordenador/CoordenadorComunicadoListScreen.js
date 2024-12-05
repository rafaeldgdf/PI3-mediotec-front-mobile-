import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Alert,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Ícones modernos
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../../api/api';
import LayoutWrapper from '../../../../components/LayoutWrapper';

const CoordenadorComunicadoListScreen = ({ navigation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [comunicados, setComunicados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [coordenadorNome, setCoordenadorNome] = useState('');
  const [coordenacaoNome, setCoordenacaoNome] = useState('Coordenação não informada');
  const [showAllDestinatarios, setShowAllDestinatarios] = useState({});

  const fetchComunicados = async () => {
    setLoading(true);
    try {
      const userInfo = await AsyncStorage.getItem('userInfo');
      if (!userInfo) {
        Alert.alert('Erro', 'Usuário não encontrado. Faça login novamente.');
        navigation.navigate('LoginScreen');
        return;
      }

      const parsedUserInfo = JSON.parse(userInfo);
      const { usuario } = parsedUserInfo;

      if (!usuario?.cpf) {
        Alert.alert('Erro', 'CPF do usuário não encontrado. Faça login novamente.');
        navigation.navigate('LoginScreen');
        return;
      }

      setCoordenadorNome(`${usuario.nome} ${usuario.ultimoNome}`);
      setCoordenacaoNome('Coordenação Associada');

      const response = await api.get(`/comunicados/coordenador/${usuario.cpf}`);
      setComunicados(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar comunicados:', error);
      Alert.alert(
        'Erro',
        'Falha ao carregar os comunicados. Verifique sua conexão ou tente novamente mais tarde.'
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteComunicado = async (id) => {
    Alert.alert(
      'Excluir Comunicado',
      'Tem certeza que deseja excluir este comunicado?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/comunicados/${id}`);
              Alert.alert('Sucesso', 'Comunicado excluído com sucesso.');
              setComunicados((prev) => prev.filter((comunicado) => comunicado.id !== id));
            } catch (error) {
              console.error('Erro ao excluir comunicado:', error);
              Alert.alert('Erro', 'Falha ao excluir o comunicado.');
            }
          },
        },
      ]
    );
  };

  const handleSearch = (comunicado) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      comunicado.id.toString().includes(searchLower) ||
      comunicado.titulo?.toLowerCase().includes(searchLower) ||
      comunicado.conteudo?.toLowerCase().includes(searchLower) ||
      comunicado.turmas?.some((turma) => turma.nome.toLowerCase().includes(searchLower)) ||
      comunicado.alunos?.some((aluno) =>
        `${aluno.nome} ${aluno.ultimoNome}`.toLowerCase().includes(searchLower)
      ) ||
      new Date(comunicado.dataEnvio)
        .toLocaleDateString()
        .toLowerCase()
        .includes(searchLower)
    );
  };

  const formatDestinatarios = (alunos, turmas, comunicadoId) => {
    const allDestinatarios = [
      ...(turmas || []).map((turma) => ({ type: 'turma', name: turma.nome, id: turma.id })),
      ...(alunos || []).map((aluno) => ({ type: 'aluno', name: `${aluno.nome} ${aluno.ultimoNome}`, id: aluno.id })),
    ];

    const showAll = showAllDestinatarios[comunicadoId];
    const displayed = showAll ? allDestinatarios : allDestinatarios.slice(0, 5);

    return (
      <View>
        {displayed.map((dest, index) => (
          <TouchableOpacity
            key={index}
            onPress={() =>
              navigation.navigate(dest.type === 'turma' ? 'TurmaDetalhes' : 'AlunoDetalhes', {
                id: dest.id,
              })
            }
          >
            <Text style={styles.destinatarioItem}>
              {index + 1}. {dest.type === 'turma' ? 'Turma:' : 'Aluno:'} {dest.name}
            </Text>
          </TouchableOpacity>
        ))}
        {allDestinatarios.length > 5 && (
          <TouchableOpacity
            onPress={() =>
              setShowAllDestinatarios((prev) => ({
                ...prev,
                [comunicadoId]: !prev[comunicadoId],
              }))
            }
          >
            <Text style={styles.verMaisText}>{showAll ? 'Ver menos...' : 'Ver mais...'}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  useEffect(() => {
    fetchComunicados();
  }, []);

  return (
    <LayoutWrapper navigation={navigation} handleLogout={() => navigation.navigate('LoginScreen')}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Icon name="mail-outline" size={28} color="#0056b3" style={styles.headerIcon} />
          <Text style={styles.headerTitle}>Comunicados de Coord. {coordenadorNome}</Text>
        </View>
        <Text style={styles.headerSubtitle}>Visualize e gerencie os comunicados abaixo.</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar comunicado"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
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
                  <TouchableOpacity onPress={() => deleteComunicado(item.id)}>
                    <Icon name="trash-bin" size={20} color="#d9534f" />
                  </TouchableOpacity>
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
                  <Icon name="people" size={16} />{' '}
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
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CoordenadorComunicadoCreateScreen')}
        >
          <Icon name="add" size={24} color="#FFF" />
          <Text style={styles.createButtonText}>Novo Comunicado</Text>
        </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#343a40' },
  cardContent: { fontSize: 14, color: '#495057', marginBottom: 8 },
  cardInfo: { fontSize: 12, color: '#6c757d', marginBottom: 4 },
  bold: { fontWeight: 'bold' },
  destinatarioItem: { fontSize: 14, color: '#007BFF', marginBottom: 4 },
  verMaisText: { fontSize: 14, color: '#007BFF', textDecorationLine: 'underline', marginTop: 4 },
  emptyText: { fontSize: 16, color: '#6c757d', textAlign: 'center', marginTop: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 14, color: '#007BFF', marginTop: 10 },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 8,
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  createButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
});

export default CoordenadorComunicadoListScreen;
