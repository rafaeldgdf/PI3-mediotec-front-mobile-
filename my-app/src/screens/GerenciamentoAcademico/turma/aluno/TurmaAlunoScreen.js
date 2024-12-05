import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LayoutWrapper from '../../../../components/LayoutWrapper';
import api from '../../../../api/api';

const TurmaAlunoScreen = ({ navigation }) => {
  const [turma, setTurma] = useState(null);
  const [alunos, setAlunos] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [filteredAlunos, setFilteredAlunos] = useState([]);
  const [searchAlunos, setSearchAlunos] = useState('');
  const [mostrarTodosAlunos, setMostrarTodosAlunos] = useState(false);
  const [mostrarTodosProfessores, setMostrarTodosProfessores] = useState(false);

  useEffect(() => {
    fetchDadosAluno();
  }, []);

  useEffect(() => {
    filterAlunos();
  }, [searchAlunos, alunos]);

  const fetchDadosAluno = async () => {
    try {
      // ID do aluno logado
      const alunoId = 1; // Substitua pelo ID real do aluno
      const alunoResponse = await api.get(`/alunos/${alunoId}`);
      const turma = alunoResponse.data.turmas[0]; // Assume a primeira turma

      if (!turma) {
        throw new Error('Nenhuma turma associada a este aluno.');
      }

      // Atualiza turma
      setTurma(turma);

      // Mapeia os professores e disciplinas
      const disciplinaProfessores = turma.disciplinaProfessores || [];
      setProfessores(disciplinaProfessores);

      // Obtém alunos da turma
      const turmaResponse = await api.get(`/turmas/${turma.id}`);
      setAlunos(turmaResponse.data.alunos || []);
      setFilteredAlunos(turmaResponse.data.alunos || []);
    } catch (error) {
      console.error('Erro ao buscar informações:', error.message);
      Alert.alert('Erro', 'Não foi possível carregar os dados.');
    }
  };

  const filterAlunos = () => {
    const filtered = alunos.filter((aluno) =>
      `${aluno.nomeAluno || ''} ${aluno.matricula || ''} ${aluno.email || ''}`
        .toLowerCase()
        .includes(searchAlunos.toLowerCase())
    );
    setFilteredAlunos(filtered);
  };

  const toggleMostrarTodosAlunos = () => {
    setMostrarTodosAlunos((prev) => !prev);
  };

  const toggleMostrarTodosProfessores = () => {
    setMostrarTodosProfessores((prev) => !prev);
  };

  if (!turma) {
    return (
      <LayoutWrapper navigation={navigation}>
        <View style={styles.container}>
          <Text style={styles.loadingText}>Carregando informações da turma...</Text>
        </View>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper navigation={navigation}>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.pageTitle}>{turma.nome || 'Sem Nome'}</Text>
            <Text style={styles.subtitle}>
              {turma.anoEscolar || 'Ano Escolar Não Informado'} - {turma.turno || 'Turno Não Informado'}
            </Text>
          </View>

          {/* Informações Básicas */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Icon name="info" size={18} /> Informações Básicas
            </Text>
            <Text style={styles.infoText}>
              <Icon name="badge" size={16} /> <Text style={styles.bold}>Nome:</Text> {turma.nome || 'Não informado'}
            </Text>
            <Text style={styles.infoText}>
              <Icon name="school" size={16} /> <Text style={styles.bold}>Ano Escolar:</Text>{' '}
              {turma.anoEscolar || 'Não informado'}
            </Text>
            <Text style={styles.infoText}>
              <Icon name="schedule" size={16} /> <Text style={styles.bold}>Turno:</Text> {turma.turno || 'Não informado'}
            </Text>
            <Text style={styles.infoText}>
              <Icon name="event" size={16} /> <Text style={styles.bold}>Ano Letivo:</Text> {turma.anoLetivo || 'Não informado'}
            </Text>
          </View>

          {/* Professores e Disciplinas */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Icon name="school" size={18} /> Professores e Disciplinas
            </Text>
            {professores.length > 0 ? (
              <>
                {professores
                  .slice(0, mostrarTodosProfessores ? professores.length : 5)
                  .map((professor, index) => (
                    <View key={index} style={styles.infoBox}>
                      <Text style={styles.infoText}>
                        <Icon name="person" size={16} /> <Text style={styles.bold}>Professor:</Text> {professor.nomeProfessor}
                      </Text>
                      <Text style={styles.infoText}>
                        <Icon name="book" size={16} /> <Text style={styles.bold}>Disciplinas:</Text>{' '}
                        {professor.nomesDisciplinas.join(', ')}
                      </Text>
                    </View>
                  ))}
                {professores.length > 5 && (
                  <TouchableOpacity style={styles.showMoreButton} onPress={toggleMostrarTodosProfessores}>
                    <Text style={styles.showMoreText}>
                      {mostrarTodosProfessores ? 'Ver menos' : `Ver mais (${professores.length - 5})`}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <Text style={styles.infoText}>Nenhum professor ou disciplina cadastrados.</Text>
            )}
          </View>

          {/* Alunos */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Icon name="group" size={18} /> Alunos
            </Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar Alunos..."
              value={searchAlunos}
              onChangeText={setSearchAlunos}
            />
            {filteredAlunos.length > 0 ? (
              <>
                {filteredAlunos.slice(0, mostrarTodosAlunos ? filteredAlunos.length : 5).map((aluno, index) => (
                  <View key={index} style={styles.infoBox}>
                    <Text style={styles.infoText}>
                      <Icon name="person" size={16} /> <Text style={styles.bold}>Nome:</Text> {aluno.nomeAluno}
                    </Text>
                    <Text style={styles.infoText}>
                      <Icon name="badge" size={16} /> <Text style={styles.bold}>Matrícula:</Text> {aluno.id}
                    </Text>
                    <Text style={styles.infoText}>
                      <Icon name="email" size={16} /> <Text style={styles.bold}>Email:</Text> {aluno.email}
                    </Text>
                  </View>
                ))}
                {filteredAlunos.length > 5 && (
                  <TouchableOpacity style={styles.showMoreButton} onPress={toggleMostrarTodosAlunos}>
                    <Text style={styles.showMoreText}>
                      {mostrarTodosAlunos ? 'Ver menos' : `Ver mais (${filteredAlunos.length - 5})`}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <Text style={styles.infoText}>Nenhum aluno cadastrado.</Text>
            )}
          </View>
        </ScrollView>
      </View>
    </LayoutWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    backgroundColor: '#F4F4F4',
  },
  header: {
    backgroundColor: '#0056b3',
    paddingVertical: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFF',
  },
  section: {
    backgroundColor: '#FFF',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0056b3',
    marginBottom: 10,
  },
  infoBox: {
    backgroundColor: '#F9F9F9',
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#444',
  },
  bold: {
    fontWeight: 'bold',
  },
  searchInput: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#CCC',
  },
  showMoreButton: {
    marginTop: 10,
    paddingVertical: 8,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    alignItems: 'center',
  },
  showMoreText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default TurmaAlunoScreen;
