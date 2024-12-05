import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CheckBox } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Feather';
import api from '../../../../api/api';
import LayoutWrapper from '../../../../components/LayoutWrapper';

const ProfessorComunicadoCreateScreen = ({ navigation }) => {
  const [professorCpf, setProfessorCpf] = useState(null);
  const [professorNome, setProfessorNome] = useState('');
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [turmaSearch, setTurmaSearch] = useState('');
  const [alunoSearch, setAlunoSearch] = useState('');
  const [turmas, setTurmas] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [selectedTurmas, setSelectedTurmas] = useState([]);
  const [selectedAlunos, setSelectedAlunos] = useState([]);
  const [showAllTurmas, setShowAllTurmas] = useState(false);
  const [showAllAlunos, setShowAllAlunos] = useState(false);

  useEffect(() => {
    const fetchProfessorInfo = async () => {
      try {
        const userInfo = await AsyncStorage.getItem('userInfo');
        if (userInfo) {
          const parsedInfo = JSON.parse(userInfo);
          setProfessorCpf(parsedInfo.usuario.cpf);
          setProfessorNome(`${parsedInfo.usuario.nome} ${parsedInfo.usuario.ultimoNome}`);
        } else {
          Alert.alert('Erro', 'Professor não identificado. Faça login novamente.');
          navigation.navigate('LoginScreen');
        }
      } catch (error) {
        console.error('Erro ao recuperar informações do professor:', error.message);
        Alert.alert('Erro', 'Não foi possível identificar o professor.');
        navigation.navigate('LoginScreen');
      }
    };

    fetchProfessorInfo();
    fetchTurmas();
    fetchAlunos();
  }, []);

  const fetchTurmas = async () => {
    try {
      const response = await api.get('/turmas');
      setTurmas(response.data);
    } catch (error) {
      console.error('Erro ao buscar turmas:', error);
      Alert.alert('Erro', 'Não foi possível carregar as turmas.');
    }
  };

  const fetchAlunos = async () => {
    try {
      const response = await api.get('/alunos');
      setAlunos(response.data);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os alunos.');
    }
  };

  const toggleSelection = (id, selected, setSelected) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((item) => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const toggleSelectAll = (items, selected, setSelected) => {
    if (selected.length === items.length) {
      setSelected([]);
    } else {
      setSelected(items.map((item) => item.id.toString()));
    }
  };

  const handleSave = async () => {
    if (!conteudo.trim()) {
      Alert.alert('Erro', 'Conteúdo é obrigatório.');
      return;
    }
  
    // Construindo o payload apenas com os campos esperados
    const payload = {
      titulo: titulo.trim() || null, // Remover espaços extras no título
      conteudo: conteudo.trim(),    // Remover espaços extras no conteúdo
      turmaIds: selectedTurmas.map((id) => parseInt(id, 10)), // IDs das turmas como números
      alunoIds: selectedAlunos.map((id) => parseInt(id, 10)), // IDs dos alunos como números
    };
  
    try {
      console.log('Enviando payload:', payload); // Log do payload para depuração
      const response = await api.post(`/comunicados/professor/${professorCpf}`, payload);
  
      console.log('Resposta do servidor:', response.data); // Log da resposta
      Alert.alert('Sucesso', 'Comunicado criado com sucesso!');
      navigation.navigate('ProfessorComunicadoListScreen');
    } catch (error) {
      console.error('Erro ao criar comunicado:', error?.response?.data || error.message);
      Alert.alert('Erro', error?.response?.data?.message || 'Não foi possível criar o comunicado.');
    }
  };
  
  const filterTurmas = (turma) => {
    const searchLower = turmaSearch.toLowerCase();
    return (
      turma.nome.toLowerCase().includes(searchLower) ||
      turma.turno.toLowerCase().includes(searchLower) ||
      turma.anoEscolar.toString().includes(searchLower)
    );
  };

  const filterAlunos = (aluno) => {
    const searchLower = alunoSearch.toLowerCase();
    return (
      aluno.nome.toLowerCase().includes(searchLower) ||
      aluno.ultimoNome.toLowerCase().includes(searchLower) ||
      aluno.email.toLowerCase().includes(searchLower) ||
      aluno.telefones.some(
        (tel) =>
          `(${tel.ddd}) ${tel.numero}`.includes(searchLower) || tel.numero.includes(searchLower)
      )
    );
  };

  return (
    <LayoutWrapper navigation={navigation} handleLogout={() => navigation.navigate('LoginScreen')}>
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>Criar Comunicado</Text>
          <Text style={styles.subTitle}>Prof. {professorNome}</Text>
        </View>
        <TouchableOpacity onPress={handleSave} style={styles.saveIconButton}>
          <Icon name="send" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.sectionTitle}>Título</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite o título do comunicado"
          value={titulo}
          onChangeText={setTitulo}
        />

        <Text style={styles.sectionTitle}>Conteúdo *</Text>
        <TextInput
          style={styles.textarea}
          placeholder="Digite o conteúdo do comunicado"
          value={conteudo}
          onChangeText={(text) => {
            if (text.length <= 255) setConteudo(text);
          }}
          multiline
        />
        <Text style={styles.selectedText}>Caracteres: {conteudo.length}/255</Text>

        <Text style={styles.sectionTitle}>Selecionar Turmas</Text>
        <TextInput
          style={styles.input}
          placeholder="Buscar turma"
          value={turmaSearch}
          onChangeText={setTurmaSearch}
        />
        <TouchableOpacity
          onPress={() => toggleSelectAll(turmas, selectedTurmas, setSelectedTurmas)}
          style={styles.centeredButton}
        >
          <Text style={styles.link}>Selecionar Todas</Text>
        </TouchableOpacity>
        <Text style={styles.selectedMinimalText}>
          Selecionados: {turmas.filter((turma) => selectedTurmas.includes(turma.id.toString())).map((turma) => turma.nome).join(', ') || 'Nenhuma turma selecionada'}
        </Text>
        {turmas
          .filter(filterTurmas)
          .slice(0, showAllTurmas ? turmas.length : 5)
          .map((turma) => (
            <CheckBox
              key={turma.id}
              title={
                <Text>
                  <Text style={styles.bold}>{turma.nome}</Text> - {turma.anoEscolar} -{' '}
                  <Text style={styles.italic}>{turma.turno}</Text>
                </Text>
              }
              checked={selectedTurmas.includes(turma.id.toString())}
              onPress={() => toggleSelection(turma.id.toString(), selectedTurmas, setSelectedTurmas)}
            />
          ))}
        {turmas.length > 5 && (
          <TouchableOpacity
            onPress={() => setShowAllTurmas(!showAllTurmas)}
            style={styles.centeredButton}
          >
            <Text style={styles.link}>{showAllTurmas ? 'Ver Menos' : 'Ver Mais'}</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionTitle}>Selecionar Alunos</Text>
        <TextInput
          style={styles.input}
          placeholder="Buscar aluno"
          value={alunoSearch}
          onChangeText={setAlunoSearch}
        />
        <TouchableOpacity
          onPress={() => toggleSelectAll(alunos, selectedAlunos, setSelectedAlunos)}
          style={styles.centeredButton}
        >
          <Text style={styles.link}>Selecionar Todos</Text>
        </TouchableOpacity>
        <Text style={styles.selectedMinimalText}>
          Selecionados: {alunos.filter((aluno) => selectedAlunos.includes(aluno.id.toString()))
            .map((aluno) => `${aluno.nome} ${aluno.ultimoNome}`)
            .join(', ') || 'Nenhum aluno selecionado'}
        </Text>
        {alunos
          .filter(filterAlunos)
          .slice(0, showAllAlunos ? alunos.length : 5)
          .map((aluno) => (
            <CheckBox
              key={aluno.id}
              title={
                <Text>
                  <Text style={styles.bold}>{aluno.nome} {aluno.ultimoNome}</Text>{' '}
                  - <Text style={styles.italic}>{aluno.email}</Text>{' '}
                  - Tel:{' '}
                  {aluno.telefones?.[0]
                    ? `(${aluno.telefones[0].ddd}) ${aluno.telefones[0].numero}`
                    : 'N/A'}
                </Text>
              }
              checked={selectedAlunos.includes(aluno.id.toString())}
              onPress={() => toggleSelection(aluno.id.toString(), selectedAlunos, setSelectedAlunos)}
            />
          ))}
        {alunos.length > 5 && (
          <TouchableOpacity
            onPress={() => setShowAllAlunos(!showAllAlunos)}
            style={styles.centeredButton}
          >
            <Text style={styles.link}>{showAllAlunos ? 'Ver Menos' : 'Ver Mais'}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Salvar Comunicado</Text>
      </TouchableOpacity>
    </LayoutWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F4F4F4',
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFF',
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0056b3',
  },
  subTitle: {
    fontSize: 16,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0056b3',
    marginVertical: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    fontSize: 14,
  },
  textarea: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    height: 100,
    textAlignVertical: 'top',
  },
  selectedText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  selectedMinimalText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    marginBottom: 8,
  },
  bold: {
    fontWeight: 'bold',
  },
  italic: {
    fontStyle: 'italic',
  },
  link: {
    color: '#0056b3',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  saveIconButton: {
    backgroundColor: '#28A745',
    borderRadius: 20,
    padding: 10,
  },
  saveButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#28a745',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  centeredButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    width: '100%',
  },
});

export default ProfessorComunicadoCreateScreen;
