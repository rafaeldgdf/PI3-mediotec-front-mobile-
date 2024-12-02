import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CheckBox } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Feather';
import api from '../../../../api/api';
import LayoutWrapper from '../../../../components/LayoutWrapper';

const CoordenadorComunicadoCreateScreen = ({ navigation }) => {
  const [coordenadorCpf, setCoordenadorCpf] = useState(null);
  const [coordenadorNome, setCoordenadorNome] = useState('');
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
    const fetchCoordenadorInfo = async () => {
      try {
        const userInfo = await AsyncStorage.getItem('userInfo');
        if (userInfo) {
          const parsedInfo = JSON.parse(userInfo);
          setCoordenadorCpf(parsedInfo.usuario.cpf);
          setCoordenadorNome(`${parsedInfo.usuario.nome} ${parsedInfo.usuario.ultimoNome}`);
        } else {
          Alert.alert('Erro', 'Coordenador não identificado. Faça login novamente.');
          navigation.navigate('LoginScreen');
        }
      } catch (error) {
        console.error('Erro ao recuperar informações do coordenador:', error.message);
        Alert.alert('Erro', 'Não foi possível identificar o coordenador.');
        navigation.navigate('LoginScreen');
      }
    };

    fetchCoordenadorInfo();
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
      setSelected([]); // Desmarca todos
    } else {
      setSelected(items.map((item) => item.id.toString())); // Seleciona todos
    }
  };

  const handleSave = async () => {
    if (!conteudo) {
      Alert.alert('Erro', 'Conteúdo é obrigatório.');
      return;
    }

    const payload = {
      titulo: titulo || null,
      conteudo,
      turmaIds: selectedTurmas.map((id) => parseInt(id, 10)),
      alunoIds: selectedAlunos.map((id) => parseInt(id, 10)),
    };

    try {
      await api.post(`/comunicados/coordenador/${coordenadorCpf}`, payload);
      Alert.alert('Sucesso', 'Comunicado criado com sucesso!');
      navigation.navigate('CoordenadorComunicadoListScreen');
    } catch (error) {
      console.error('Erro ao criar comunicado:', error.response?.data || error.message);
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível criar o comunicado.');
    }
  };

  return (
    <LayoutWrapper navigation={navigation} handleLogout={() => navigation.navigate('LoginScreen')}>
      {/* Título da Página */}
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>Criar Comunicado</Text>
          <Text style={styles.subTitle}>Coord. {coordenadorNome}</Text>
        </View>
        <TouchableOpacity onPress={handleSave} style={styles.saveIconButton}>
          <Icon name="send" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        ListHeaderComponent={
          <View style={styles.container}>
            {/* Campo de Título */}
            <Text style={styles.sectionTitle}>Título</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o título do comunicado"
              value={titulo}
              onChangeText={setTitulo}
            />

            {/* Campo de Conteúdo */}
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
            {/* Contador de Caracteres */}
            <Text style={styles.selectedText}>
              Caracteres: {conteudo.length}/255
            </Text>

            {/* Seleção de Turmas */}
            <Text style={styles.sectionTitle}>Selecionar Turmas</Text>
            <TextInput
              style={styles.input}
              placeholder="Buscar turma"
              value={turmaSearch}
              onChangeText={setTurmaSearch}
            />
            <TouchableOpacity
              onPress={() => toggleSelectAll(turmas, selectedTurmas, setSelectedTurmas)}
              style={styles.iconButtonContainer}
            >
              <Icon
                name={selectedTurmas.length === turmas.length ? 'minus-square' : 'check-square'}
                size={18}
                color="#0056b3"
              />
            </TouchableOpacity>
            <Text style={styles.selectedText}>
              Turmas Selecionadas:{' '}
              {turmas
                .filter((turma) => selectedTurmas.includes(turma.id.toString()))
                .map((turma) => turma.nome)
                .join(', ')}
            </Text>
            {turmas
              .filter(
                (turma) =>
                  turma.nome.toLowerCase().includes(turmaSearch.toLowerCase()) ||
                  turma.turno.toLowerCase().includes(turmaSearch.toLowerCase()) ||
                  turma.anoEscolar.toString().includes(turmaSearch)
              )
              .slice(0, showAllTurmas ? turmas.length : 5)
              .map((item) => (
                <CheckBox
                  key={item.id}
                  title={
                    <Text>
                      <Text style={styles.bold}>{item.nome}</Text> - {item.anoEscolar} -{' '}
                      <Text style={styles.italic}>{item.turno}</Text>
                    </Text>
                  }
                  checked={selectedTurmas.includes(item.id.toString())}
                  onPress={() =>
                    toggleSelection(item.id.toString(), selectedTurmas, setSelectedTurmas)
                  }
                />
              ))}
            {turmas.length > 5 && (
              <TouchableOpacity onPress={() => setShowAllTurmas(!showAllTurmas)}>
                <Text style={styles.link}>{showAllTurmas ? 'Ver Menos' : 'Ver Mais'}</Text>
              </TouchableOpacity>
            )}

            {/* Seleção de Alunos */}
            <Text style={styles.sectionTitle}>Selecionar Alunos</Text>
            <TextInput
              style={styles.input}
              placeholder="Buscar aluno"
              value={alunoSearch}
              onChangeText={setAlunoSearch}
            />
            <TouchableOpacity
              onPress={() => toggleSelectAll(alunos, selectedAlunos, setSelectedAlunos)}
              style={styles.iconButtonContainer}
            >
              <Icon
                name={selectedAlunos.length === alunos.length ? 'minus-square' : 'check-square'}
                size={18}
                color="#0056b3"
              />
            </TouchableOpacity>
            <Text style={styles.selectedText}>
              Alunos Selecionados:{' '}
              {alunos
                .filter((aluno) => selectedAlunos.includes(aluno.id.toString()))
                .map((aluno) => `${aluno.nome} ${aluno.ultimoNome}`)
                .join(', ')}
            </Text>
            {alunos
              .filter(
                (aluno) =>
                  aluno.nome.toLowerCase().includes(alunoSearch.toLowerCase()) ||
                  aluno.ultimoNome.toLowerCase().includes(alunoSearch.toLowerCase()) ||
                  aluno.email.toLowerCase().includes(alunoSearch.toLowerCase()) ||
                  aluno.telefones.some((tel) =>
                    `(${tel.ddd}) ${tel.numero}`.includes(alunoSearch) || tel.numero.includes(alunoSearch)
                  )
              )
              .slice(0, showAllAlunos ? alunos.length : 5)
              .map((item) => (
                <CheckBox
                  key={item.id}
                  title={
                    <Text>
                      <Text style={styles.bold}>{item.nome} {item.ultimoNome}</Text>{' '}
                      <Text style={styles.italic}> - {item.email} </Text> - Tel:{' '}
                      {item.telefones?.[0]
                        ? `(${item.telefones[0].ddd}) ${item.telefones[0].numero}`
                        : 'N/A'}
                    </Text>
                  }
                  checked={selectedAlunos.includes(item.id.toString())}
                  onPress={() =>
                    toggleSelection(item.id.toString(), selectedAlunos, setSelectedAlunos)
                  }
                />
              ))}
            {alunos.length > 5 && (
              <TouchableOpacity onPress={() => setShowAllAlunos(!showAllAlunos)}>
                <Text style={styles.link}>{showAllAlunos ? 'Ver Menos' : 'Ver Mais'}</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        ListFooterComponent={
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Salvar Comunicado</Text>
          </TouchableOpacity>
        }
        data={[]} // Dados vazios apenas para ativar o scroll
        keyExtractor={(item, index) => index.toString()}
      />
    </LayoutWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    padding: 8,
    backgroundColor: '#F4F4F4',
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
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 50,
    fontSize: 14,
  },
  textarea: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 100,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#28A745',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
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
  link: {
    color: '#0056b3',
    fontWeight: 'bold',
    marginVertical: 8,
    textAlign: 'center',
  },
  bold: {
    fontWeight: 'bold',
  },
  italic: {
    fontStyle: 'italic',
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
  saveIconButton: {
    backgroundColor: '#28A745',
    borderRadius: 20,
    padding: 10,
  },
  iconButtonContainer: {
    marginVertical: 8,
    alignItems: 'center',
  },
});

export default CoordenadorComunicadoCreateScreen;
