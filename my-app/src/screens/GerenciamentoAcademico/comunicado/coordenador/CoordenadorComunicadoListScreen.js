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
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../../api/api';
import LayoutWrapper from '../../../../components/LayoutWrapper';

const CoordenadorComunicadoListScreen = ({ navigation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [comunicados, setComunicados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [coordenadorNome, setCoordenadorNome] = useState('');
  const [coordenacaoNome, setCoordenacaoNome] = useState('');
  const [showAllDestinatarios, setShowAllDestinatarios] = useState({});

  // Função para buscar comunicados da API
  const fetchComunicados = async () => {
    setLoading(true);
    try {
      const userInfo = await AsyncStorage.getItem('userInfo');
      if (!userInfo) {
        Alert.alert('Erro', 'Usuário não encontrado. Faça login novamente.');
        navigation.navigate('LoginScreen');
        return;
      }

      const { identificador, nome, coordenacoes } = JSON.parse(userInfo);
      setCoordenadorNome(nome || 'Coordenador');
      setCoordenacaoNome(coordenacoes?.join(', ') || 'Coordenação não informada');

      const response = await api.get(`/comunicados/coordenador/${identificador}`);
      setComunicados(response.data);
    } catch (error) {
      console.error('Erro ao buscar comunicados:', error);
      Alert.alert('Erro', 'Falha ao carregar os comunicados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComunicados();
  }, []);

  // Filtro de busca
  const filteredComunicados = comunicados.filter((comunicado) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      comunicado.titulo?.toLowerCase().includes(searchLower) ||
      comunicado.conteudo?.toLowerCase().includes(searchLower) ||
      comunicado.remetente?.nome?.toLowerCase().includes(searchLower) ||
      comunicado.remetente?.ultimoNome?.toLowerCase().includes(searchLower) ||
      comunicado.destinatarios?.some((dest) => dest.nome?.toLowerCase().includes(searchLower))
    );
  });

  // Formatador de destinatários com "Ver mais..."
  const formatDestinatarios = (destinatarios, comunicadoId) => {
    if (!destinatarios || destinatarios.length === 0) {
      return <Text style={styles.cardInfo}>Nenhum destinatário</Text>;
    }

    const showAll = showAllDestinatarios[comunicadoId];
    const displayed = showAll ? destinatarios : destinatarios.slice(0, 5);

    return (
      <View>
        {displayed.map((dest, index) => (
          <Text key={index} style={styles.destinatarioItem}>
            {index + 1}. {dest.nome}
          </Text>
        ))}
        {destinatarios.length > 5 && (
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

  const handleCreateComunicado = () => {
    navigation.navigate('CoordenadorComunicadoCreateScreen');
  };

  return (
    <LayoutWrapper navigation={navigation} handleLogout={() => navigation.navigate('LoginScreen')}>
      <View style={styles.container}>
        {/* Título */}
        <View style={styles.titleContainer}>
          <Text style={styles.pageTitle}>
            <Icon name="list" size={24} color="#0056b3" /> Comunicados do Coor. {coordenadorNome}
          </Text>
          <Text style={styles.subtitle}>Gerencie os comunicados deste coordenador.</Text>
        </View>

        {/* Campo de Busca */}
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar Comunicado"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />

        {/* Lista de Comunicados */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007BFF" />
            <Text style={styles.loadingText}>Carregando...</Text>
          </View>
        ) : filteredComunicados.length > 0 ? (
          <FlatList
            data={filteredComunicados}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Comunicado #{item.id}</Text>
                <View style={styles.tituloBox}>
                  <Text style={styles.tituloText}>{item.titulo || 'Título não informado'}</Text>
                </View>
                <View style={styles.conteudoBox}>
                  <Text style={styles.conteudoText}>{item.conteudo || 'Conteúdo indisponível'}</Text>
                </View>
                <Text style={styles.cardInfo}>
                  <Icon name="calendar-today" size={16} /> <Text style={styles.bold}>Data:</Text>{' '}
                  {item.dataEnvio
                    ? new Date(item.dataEnvio).toLocaleString()
                    : 'Data não informada'}
                </Text>
                <Text style={styles.cardInfo}>
                  <Icon name="person" size={16} /> <Text style={styles.bold}>Remetente:</Text>
                </Text>
                <View style={styles.remetenteBox}>
                  <Text style={styles.remetenteNome}>
                    {item.remetente?.nome || 'Desconhecido'} {item.remetente?.ultimoNome || ''}
                  </Text>
                  <Text style={styles.remetenteCoordenacao}>
                    {item.remetente?.coordenacao || coordenacaoNome}
                  </Text>
                </View>
                <Text style={styles.cardInfo}>
                  <Icon name="people" size={16} /> <Text style={styles.bold}>Destinatários:</Text>
                </Text>
                {formatDestinatarios(item.destinatarios, item.id)}
              </View>
            )}
          />
        ) : (
          <Text style={styles.emptyText}>Nenhum comunicado encontrado.</Text>
        )}

        {/* Botão para Criar Comunicado */}
        <TouchableOpacity style={styles.createButton} onPress={handleCreateComunicado}>
          <Icon name="add" size={24} color="#FFF" />
          <Text style={styles.createButtonText}>Novo Comunicado</Text>
        </TouchableOpacity>
      </View>
    </LayoutWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  titleContainer: { marginBottom: 16, alignItems: 'center' },
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: '#0056b3', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 4 },
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
  tituloBox: {
    backgroundColor: '#eaf4fc',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  tituloText: { fontSize: 16, fontWeight: 'bold', color: '#0056b3' },
  conteudoBox: {
    backgroundColor: '#f1f8e9',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  conteudoText: { fontSize: 14, color: '#444' },
  cardInfo: { fontSize: 14, color: '#444', marginBottom: 8 },
  bold: { fontWeight: 'bold', color: '#333' },
  destinatarioItem: { fontSize: 14, color: '#444', marginBottom: 4 },
  verMaisText: { fontSize: 14, color: '#007BFF', marginTop: 8, textDecorationLine: 'underline' },
  remetenteBox: { marginBottom: 12 },
  remetenteNome: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  remetenteCoordenacao: { fontSize: 14, color: '#666' },
  emptyText: { fontSize: 16, textAlign: 'center', color: '#666', marginTop: 20, fontStyle: 'italic' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  loadingText: { fontSize: 16, color: '#007BFF', marginTop: 10 },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default CoordenadorComunicadoListScreen;
