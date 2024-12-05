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
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import api from '../../../api/api';
import LayoutWrapper from '../../../components/LayoutWrapper';
import { Buffer } from 'buffer'; // Importando Buffer da biblioteca

const AlunoHorarioScreen = ({ navigation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [turmas, setTurmas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchTurmas();
  }, []);

  // Buscar turmas associadas ao aluno
  const fetchTurmas = async () => {
    try {
      const response = await api.get('/turmas'); // Verifique se o caminho está correto
      setTurmas(response.data);
    } catch (error) {
      console.error('Erro ao buscar turmas:', error);
      Alert.alert('Erro', 'Falha ao carregar as turmas.');
    }
  };

  // Baixar horário da turma
  const handleDownloadHorario = async (turmaId) => {
    console.log(`[DEBUG] Tentando baixar horário para a turma ID: ${turmaId}`);

    try {
      const response = await api.get(`/turmas/${turmaId}/horario`, {
        responseType: 'arraybuffer', // Configurar como arraybuffer para dados binários
      });

      console.log(`[DEBUG] Resposta recebida do backend:`, response);

      if (response.status === 200) {
        // Extrair nome do arquivo do cabeçalho Content-Disposition
        const contentDisposition = response.headers['content-disposition'];
        const filenameMatch = contentDisposition && contentDisposition.match(/filename="(.+)"/);
        const filename = filenameMatch ? filenameMatch[1] : `horario_${turmaId}.webp`;

        // Caminho completo para salvar o arquivo
        const fileUri = `${FileSystem.documentDirectory}${filename}`;

        // Converter os dados binários para Base64
        const base64 = Buffer.from(response.data, 'binary').toString('base64');

        // Salvar o arquivo no dispositivo
        await FileSystem.writeAsStringAsync(fileUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        console.log(`[DEBUG] Arquivo salvo em: ${fileUri}`);

        // Compartilhar o arquivo usando Expo Sharing
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
        } else {
          Alert.alert('Sucesso', `Arquivo salvo em: ${fileUri}`);
        }
      } else {
        console.error(`[DEBUG] Status inesperado: ${response.status}`);
        Alert.alert('Erro', 'Falha ao baixar o horário.');
      }
    } catch (error) {
      console.error('[DEBUG] Erro ao baixar horário:', error);
      Alert.alert('Erro', 'Falha ao baixar o horário. Verifique sua conexão ou backend.');
    }
  };

  // Filtrar turmas pelo termo de busca
  const filteredTurmas = turmas.filter((turma) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      turma.nome.toLowerCase().includes(searchLower) ||
      turma.anoEscolar.toString().includes(searchLower) ||
      turma.turno.toLowerCase().includes(searchLower)
    );
  });

  return (
    <LayoutWrapper navigation={navigation} handleLogout={() => navigation.navigate('LoginScreen')}>
      {/* Título da Página */}
      <View style={styles.titleContainer}>
        <Text style={styles.pageTitle}>
          <Icon name="file-download" size={24} color="#0056b3" /> Baixar Horários
        </Text>
        <Text style={styles.subtitle}>
          Visualize e baixe os horários das suas turmas.
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

              {/* Botão de Baixar Horário */}
              <TouchableOpacity
                style={[styles.cardButton, styles.downloadButton, downloading && { opacity: 0.5 }]}
                onPress={!downloading ? () => handleDownloadHorario(item.id) : null}
                disabled={downloading}
              >
                <Icon name="cloud-download" size={18} color="#FFF" />
                <Text style={styles.buttonText}>Baixar Horário</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <Text style={styles.emptyText}>Nenhuma turma encontrada.</Text>
      )}

      {/* Indicador de Download */}
      {downloading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={styles.downloadingText}>Baixando horário...</Text>
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
  cardButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3, marginTop: 16 },
  downloadButton: { backgroundColor: '#007BFF' },
  buttonText: { color: '#FFF', fontSize: 14, fontWeight: 'bold', marginLeft: 8 },
  emptyText: { fontSize: 16, textAlign: 'center', color: '#666', marginTop: 20, fontStyle: 'italic' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  loadingText: { fontSize: 16, color: '#007BFF', marginTop: 10 },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  downloadingText: { color: '#FFF', fontSize: 16, marginTop: 10 },
});

export default AlunoHorarioScreen;
