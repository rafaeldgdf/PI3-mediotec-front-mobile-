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
import * as DocumentPicker from 'expo-document-picker'; // Biblioteca para selecionar arquivos
import api from '../../../api/api';
import LayoutWrapper from '../../../components/LayoutWrapper';
import * as FileSystem from 'expo-file-system';


const HorarioScreen = ({ navigation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [turmas, setTurmas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

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

  // Adicionar Horário (Carregar Arquivo PDF)
  const handleAddHorario = async (turmaId) => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
  
      if (res.type === 'cancel') {
        console.log('Seleção de arquivo cancelada.');
        return;
      }
  
      console.log('Arquivo selecionado:', res);
  
      // Ler o conteúdo do arquivo diretamente (se necessário)
      const fileUri = res.uri;
  
      const formData = new FormData();
      formData.append('arquivo', {
        uri: fileUri,
        type: 'application/pdf',
        name: res.name,
      });
  
      console.log('FormData criado:', formData);
  
      setUploading(true);
  
      const response = await api.post(`/turmas/${turmaId}/horario`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      console.log('Resposta do backend:', response.data);
  
      Alert.alert('Sucesso', 'Horário adicionado com sucesso!');
    } catch (err) {
      console.error('Erro ao adicionar horário:', err);
      Alert.alert(
        'Erro',
        'Falha ao adicionar o horário. Verifique sua conexão ou backend.'
      );
    } finally {
      setUploading(false);
    }
  };;
  

  // Filtrar Turmas pelo Termo de Busca
  const filteredTurmas = turmas.filter((turma) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      turma.nome.toLowerCase().includes(searchLower) ||
      turma.anoEscolar.toString().includes(searchLower) ||
      turma.turno.toLowerCase().includes(searchLower) ||
      turma.coordenacao?.nome?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <LayoutWrapper navigation={navigation} handleLogout={() => navigation.navigate('LoginScreen')}>
      {/* Título da Página */}
      <View style={styles.titleContainer}>
        <Text style={styles.pageTitle}>
          <Icon name="schedule" size={24} color="#0056b3" /> Horários
        </Text>
        <Text style={styles.subtitle}>
          Visualize e gerencie os horários das turmas.
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
                <Icon name="calendar-today" size={16} />{' '}
                <Text style={styles.bold}>Ano Escolar:</Text> {item.anoEscolar}
              </Text>
              <Text style={styles.cardInfo}>
                <Icon name="access-time" size={16} />{' '}
                <Text style={styles.bold}>Turno:</Text> {item.turno}
              </Text>
              <Text style={styles.cardInfo}>
                <Icon name="date-range" size={16} />{' '}
                <Text style={styles.bold}>Ano Letivo:</Text> {item.anoLetivo}
              </Text>
              <Text style={styles.cardInfo}>
                <Icon name="group" size={16} />{' '}
                <Text style={styles.bold}>Coordenação:</Text>{' '}
                {item.coordenacao?.nome || 'Não informado'}
              </Text>

              {/* Botões de Ação */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.cardButton, styles.addButton, uploading && { opacity: 0.5 }]}
                  onPress={!uploading ? () => handleAddHorario(item.id) : null}
                  disabled={uploading}
                >
                  <Icon name="add" size={18} color="#FFF" />
                  <Text style={styles.buttonText}>Adicionar Horário</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.cardButton, styles.openButton]}
                  onPress={() =>
                    navigation.navigate('TurmaDetalhesScreen', {
                      turma: item,
                    })
                  }
                >
                  <Icon name="open-in-new" size={18} color="#FFF" />
                  <Text style={styles.buttonText}>Abrir Detalhes</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      ) : (
        <Text style={styles.emptyText}>Nenhuma turma encontrada.</Text>
      )}

      {/* Indicador de Upload */}
      {uploading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={styles.uploadingText}>Enviando arquivo...</Text>
        </View>
      )}
    </LayoutWrapper>
  );
};

const styles = StyleSheet.create({
  titleContainer: { alignItems: 'center', marginVertical: 20 },
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: '#0056b3', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center' },
  searchInput: { backgroundColor: '#FFF', marginHorizontal: 16, marginBottom: 16, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#DDD', fontSize: 14 },
  card: { backgroundColor: '#FFF', padding: 16, marginHorizontal: 16, marginBottom: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E5E5E5', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#0056b3', marginBottom: 8, textTransform: 'uppercase', borderBottomWidth: 1, borderBottomColor: '#ccc', paddingBottom: 4 },
  cardInfo: { fontSize: 14, color: '#444', marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  bold: { fontWeight: 'bold', color: '#333' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  cardButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, flex: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3, marginHorizontal: 4 },
  openButton: { backgroundColor: '#28A745' },
  addButton: { backgroundColor: '#007BFF' },
  buttonText: { color: '#FFF', fontSize: 14, fontWeight: 'bold', marginLeft: 8 },
  emptyText: { fontSize: 16, textAlign: 'center', color: '#666', marginTop: 20, fontStyle: 'italic' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  loadingText: { fontSize: 16, color: '#007BFF', marginTop: 10 },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  uploadingText: { color: '#FFF', fontSize: 16, marginTop: 10 },
});

export default HorarioScreen;
