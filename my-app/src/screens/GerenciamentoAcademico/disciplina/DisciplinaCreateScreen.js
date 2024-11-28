import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { CheckBox } from 'react-native-elements';
import api from '../../../api/api';
import LayoutWrapper from '../../../components/LayoutWrapper';

const DisciplinaCreateScreen = ({ navigation, route }) => {
  const { disciplina } = route.params || {}; // Recebe a disciplina para edição, se disponível
  const [nome, setNome] = useState('');
  const [cargaHoraria, setCargaHoraria] = useState('');
  const [professores, setProfessores] = useState([]);
  const [professorSelecionado, setProfessorSelecionado] = useState(''); // Apenas um professor pode ser selecionado
  const [turmas, setTurmas] = useState([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState(''); // Apenas uma turma pode ser selecionada
  const [professorSearch, setProfessorSearch] = useState('');
  const [turmaSearch, setTurmaSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfessores();
    fetchTurmas();

    // Preenche os campos se for edição
    if (disciplina) {
      setNome(disciplina.nome || '');
      setCargaHoraria(String(disciplina.cargaHoraria || ''));
      setProfessorSelecionado(disciplina.professorId || '');
      setTurmaSelecionada(String(disciplina.turmaId || ''));
    }
  }, [disciplina]);

  const fetchProfessores = async () => {
    try {
      const response = await api.get('/professores');
      setProfessores(response.data);
    } catch (error) {
      console.error('Erro ao buscar professores:', error);
      Alert.alert('Erro', 'Falha ao carregar professores.');
    }
  };

  const fetchTurmas = async () => {
    try {
      const response = await api.get('/turmas');
      setTurmas(response.data);
    } catch (error) {
      console.error('Erro ao buscar turmas:', error);
      Alert.alert('Erro', 'Falha ao carregar turmas.');
    }
  };

  const handleSave = async () => {
    if (!nome || !cargaHoraria || !professorSelecionado || !turmaSelecionada) {
      Alert.alert('Erro', 'Todos os campos são obrigatórios.');
      return;
    }

    const data = {
      nome,
      cargaHoraria: parseInt(cargaHoraria, 10),
      professorId: professorSelecionado,
      turmaId: parseInt(turmaSelecionada, 10),
    };

    setLoading(true);
    try {
      if (disciplina) {
        await api.put(`/disciplinas/${disciplina.id}`, data);
        Alert.alert('Sucesso', 'Disciplina editada com sucesso.');
      } else {
        await api.post('/disciplinas', data);
        Alert.alert('Sucesso', 'Disciplina criada com sucesso.');
      }
      navigation.navigate('DisciplinaListScreen'); // Retorna para a lista de disciplinas
    } catch (error) {
      console.error('Erro ao salvar disciplina:', error.response?.data || error.message);
      Alert.alert('Erro', 'Falha ao salvar a disciplina.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutWrapper navigation={navigation} handleLogout={() => navigation.navigate('LoginScreen')}>
      <ScrollView nestedScrollEnabled={true} style={styles.container}>
        <Text style={styles.title}>
          {disciplina ? 'Editar Disciplina' : 'Cadastro de Disciplina'}
        </Text>

        {/* Nome da Disciplina */}
        <Text style={styles.sectionTitle}>Nome *</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite o nome da disciplina"
          value={nome}
          onChangeText={setNome}
        />

        {/* Carga Horária */}
        <Text style={styles.sectionTitle}>Carga Horária (horas) *</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite a carga horária"
          keyboardType="numeric"
          value={cargaHoraria}
          onChangeText={setCargaHoraria}
        />

        {/* Professor */}
        <Text style={styles.sectionTitle}>Selecione o Professor </Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar professor"
          value={professorSearch}
          onChangeText={setProfessorSearch}
        />
        <FlatList
          data={professores.filter(
            (professor) =>
              `${professor.nome} ${professor.ultimoNome}`
                .toLowerCase()
                .includes(professorSearch.toLowerCase())
          )}
          keyExtractor={(item) => item.cpf}
          renderItem={({ item }) => (
            <CheckBox
              title={`${item.nome} ${item.ultimoNome}`}
              checked={professorSelecionado === item.cpf}
              onPress={() => setProfessorSelecionado(item.cpf)}
            />
          )}
        />
        <Text style={styles.selectedText}>
          Selecionado:{' '}
          {professores.find((professor) => professor.cpf === professorSelecionado)
            ? `${professores.find((professor) => professor.cpf === professorSelecionado).nome} ${professores.find((professor) => professor.cpf === professorSelecionado).ultimoNome}`
            : 'Nenhum'}
        </Text>


        {/* Turma */}
        <Text style={styles.sectionTitle}>Selecione a Turma</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar turma"
          value={turmaSearch}
          onChangeText={setTurmaSearch}
        />
        <FlatList
          data={turmas.filter((turma) =>
            turma.nome.toLowerCase().includes(turmaSearch.toLowerCase())
          )}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <CheckBox
              title={item.nome}
              checked={turmaSelecionada === item.id.toString()}
              onPress={() => setTurmaSelecionada(item.id.toString())}
            />
          )}
        />
        <Text style={styles.selectedText}>
          Selecionada:{' '}
          {turmas.find((turma) => turma.id.toString() === turmaSelecionada)?.nome || 'Nenhuma'}
        </Text>

        {/* Botão Salvar */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
          <Text style={styles.saveButtonText}>{loading ? 'Salvando...' : 'Salvar'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </LayoutWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F4F4F4',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#0056b3',
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0056b3',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12, // Adiciona espaçamento horizontal para evitar corte
    marginBottom: 12,
    height: 50, // Ajusta a altura para comportar o texto adequadamente
    justifyContent: 'center', // Alinha o texto no centro vertical
    fontSize: 14, // Mantém o texto com tamanho legível
  },
  inputMini: {
    width: '48%', // Padroniza a largura
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 14,
    height: 50, // Padroniza a altura
  },
  picker: {
    width: '100%',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 12,
    height: 50, // Altura mínima para o picker
    justifyContent: 'center', // Alinha o texto no centro verticalmente
  },
  searchInput: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  saveButton: {
    backgroundColor: '#28A745',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    marginBottom: 12,
  },
});

export default DisciplinaCreateScreen;
