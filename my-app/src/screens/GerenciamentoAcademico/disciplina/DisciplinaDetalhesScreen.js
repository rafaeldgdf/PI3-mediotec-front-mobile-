import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LayoutWrapper from '../../../components/LayoutWrapper';
import api from '../../../api/api';

const DisciplinaDetalhesScreen = ({ route, navigation }) => {
  const { disciplina } = route.params;

  const [detalhesDisciplina, setDetalhesDisciplina] = useState(null);
  const [professorDetalhes, setProfessorDetalhes] = useState(null);
  const [turmaDetalhes, setTurmaDetalhes] = useState(null);

  useEffect(() => {
    fetchDisciplinaDetalhes();
  }, []);

  const fetchDisciplinaDetalhes = async () => {
    try {
      // Busca os detalhes da disciplina
      const disciplinaResponse = await api.get(`/disciplinas/${disciplina.id}`);
      const data = disciplinaResponse.data;
      console.log('Dados da disciplina:', data);
      setDetalhesDisciplina(data);

      // Verifica se IDs necessários estão presentes
      const { idProfessor, idTurma } = data;
      if (!idProfessor || !idTurma) {
        throw new Error('Os IDs de Professor ou Turma estão ausentes na resposta.');
      }

      // Busca os detalhes do professor associado
      const professorResponse = await api.get(`/professores/${idProfessor}`);
      setProfessorDetalhes(professorResponse.data);

      // Busca os detalhes da turma associada
      const turmaResponse = await api.get(`/turmas/${idTurma}`);
      setTurmaDetalhes(turmaResponse.data);
    } catch (error) {
      console.error('Erro ao buscar detalhes:', error);
      Alert.alert(
        'Erro',
        'Não foi possível carregar os detalhes da disciplina. Verifique a conexão ou os dados fornecidos.'
      );
    }
  };

  const handleEdit = () => {
    if (detalhesDisciplina) {
      navigation.navigate('DisciplinaCreateScreen', { disciplina: detalhesDisciplina });
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmação',
      'Tem certeza que deseja deletar esta disciplina?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              if (detalhesDisciplina) {
                await api.delete(`/disciplinas/${detalhesDisciplina.id}`);
                Alert.alert('Sucesso', 'Disciplina deletada com sucesso.');
                navigation.goBack();
              }
            } catch (error) {
              console.error('Erro ao deletar disciplina:', error);
              Alert.alert('Erro', 'Não foi possível deletar a disciplina.');
            }
          },
        },
      ]
    );
  };

  if (!detalhesDisciplina || !professorDetalhes || !turmaDetalhes) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Carregando detalhes...</Text>
      </View>
    );
  }

  return (
    <LayoutWrapper navigation={navigation} handleLogout={() => navigation.navigate('LoginScreen')}>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.editIcon} onPress={handleEdit}>
              <Icon name="edit" size={20} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.pageTitle}>{detalhesDisciplina.nome || 'Disciplina'}</Text>
            <Text style={styles.subtitle}>ID: {detalhesDisciplina.id}</Text>
            <Text style={styles.subtitle}>
              Carga Horária: {detalhesDisciplina.carga_horaria} horas
            </Text>
          </View>

          {/* Professor */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Icon name="person" size={18} /> Professor
            </Text>
            <Text style={styles.infoText}>
              <Icon name="badge" size={16} /> <Text style={styles.bold}>Nome:</Text>{' '}
              {professorDetalhes.nome} {professorDetalhes.ultimoNome}
            </Text>
            <Text style={styles.infoText}>
              <Icon name="email" size={16} /> <Text style={styles.bold}>Email:</Text>{' '}
              {professorDetalhes.email || 'Não informado'}
            </Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                navigation.navigate('ProfessorDetalhesScreen', {
                  professor: professorDetalhes,
                })
              }
            >
              <Icon name="info" size={16} color="#FFF" />
              <Text style={styles.buttonText}>Abrir Detalhes</Text>
            </TouchableOpacity>
          </View>

          {/* Turma */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Icon name="class" size={18} /> Turma
            </Text>
            <Text style={styles.infoText}>
              <Icon name="school" size={16} /> <Text style={styles.bold}>Nome:</Text>{' '}
              {turmaDetalhes.nome || 'Não informado'}
            </Text>
            <Text style={styles.infoText}>
              <Icon name="calendar-today" size={16} />{' '}
              <Text style={styles.bold}>Ano Escolar:</Text> {turmaDetalhes.anoEscolar}
            </Text>
            <Text style={styles.infoText}>
              <Icon name="schedule" size={16} /> <Text style={styles.bold}>Turno:</Text>{' '}
              {turmaDetalhes.turno || 'Não informado'}
            </Text>
            <Text style={styles.infoText}>
              <Icon name="event" size={16} /> <Text style={styles.bold}>Ano Letivo:</Text>{' '}
              {turmaDetalhes.anoLetivo || 'Não informado'}
            </Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                navigation.navigate('TurmaDetalhesScreen', {
                  turma: turmaDetalhes,
                })
              }
            >
              <Icon name="info" size={16} color="#FFF" />
              <Text style={styles.buttonText}>Abrir Detalhes</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Botões Fixos */}
        <View style={styles.fixedButtonContainer}>
          <TouchableOpacity style={[styles.button, styles.editButton]} onPress={handleEdit}>
            <Icon name="edit" size={16} color="#FFF" />
            <Text style={styles.buttonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDelete}>
            <Icon name="delete" size={16} color="#FFF" />
            <Text style={styles.buttonText}>Deletar</Text>
          </TouchableOpacity>
        </View>
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
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  editIcon: {
    position: 'absolute',
    top: 10,
    right: 20,
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 50,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#FFF',
    marginTop: 5,
  },
  section: {
    backgroundColor: '#FFF',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0056b3',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#444',
  },
  bold: {
    fontWeight: 'bold',
    color: '#000',
  },
  actionButton: {
    marginTop: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#DDD',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 10,
    width: '45%',
  },
  editButton: {
    backgroundColor: '#28A745',
  },
  deleteButton: {
    backgroundColor: '#DC3545',
  },
});

export default DisciplinaDetalhesScreen;
