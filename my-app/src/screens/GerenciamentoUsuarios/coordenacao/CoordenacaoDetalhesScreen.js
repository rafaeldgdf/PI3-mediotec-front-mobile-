import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LayoutWrapper from '../../../components/LayoutWrapper';
import api from '../../../api/api';

const CoordenacaoDetalhesScreen = ({ route, navigation }) => {
  const { coordenacao } = route.params;
  const [detalhesCoordenacao, setDetalhesCoordenacao] = useState(coordenacao);
  const [searchCoordenadores, setSearchCoordenadores] = useState('');
  const [searchProfessores, setSearchProfessores] = useState('');
  const [searchTurmas, setSearchTurmas] = useState('');
  const [filteredCoordenadores, setFilteredCoordenadores] = useState([]);
  const [filteredProfessores, setFilteredProfessores] = useState([]);
  const [filteredTurmas, setFilteredTurmas] = useState([]);
  const [alunos, setAlunos] = useState([]); // Estado para alunos
  const [searchAlunos, setSearchAlunos] = useState(''); // Busca de alunos
  const [filteredAlunos, setFilteredAlunos] = useState([]); // Lista filtrada de alunos

  useEffect(() => {
    if (coordenacao?.id) {
      fetchCoordenacao(coordenacao.id);
    } else {
      Alert.alert('Erro', 'Coordenação não encontrada.');
    }
  }, [coordenacao]);

  useEffect(() => {
    filterCoordenadores();
  }, [searchCoordenadores, detalhesCoordenacao]);

  useEffect(() => {
    filterProfessores();
  }, [searchProfessores, detalhesCoordenacao]);

  useEffect(() => {
    filterTurmas();
  }, [searchTurmas, detalhesCoordenacao]);

  useEffect(() => {
    if (detalhesCoordenacao?.turmas) {
      fetchAlunos();
    }
  }, [detalhesCoordenacao]);

  useEffect(() => {
    filterAlunos();
  }, [searchAlunos, alunos]);

  const fetchCoordenacao = async (id) => {
    try {
      const response = await api.get(`/coordenacoes/${id}`);
      if (response.data) {
        setDetalhesCoordenacao(response.data);
      } else {
        Alert.alert('Erro', 'Dados da coordenação não encontrados.');
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes da coordenação:', error);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes da coordenação.');
    }
  };

  // Método para buscar alunos das turmas vinculadas à coordenação
  const fetchAlunos = async () => {
    try {
      const turmaIds = detalhesCoordenacao.turmas.map((turma) => turma.id); // IDs das turmas
      const alunosPromises = turmaIds.map((id) => api.get(`/turmas/${id}`)); // Requisições por turma
      const turmasResponses = await Promise.all(alunosPromises);

      // Mapeia os alunos adicionando o nome da turma
      const todosAlunos = turmasResponses.flatMap((response) =>
        response.data.alunos.map((aluno) => ({
          ...aluno,
          nomeTurma: response.data.nome, // Adiciona o nome da turma a cada aluno
        }))
      );

      setAlunos(todosAlunos); // Salva os alunos no estado
      setFilteredAlunos(todosAlunos); // Inicializa o filtro de alunos
    } catch (error) {
      console.error('Erro ao buscar alunos:', error.response?.data || error.message);
      Alert.alert(
        'Erro',
        `Não foi possível carregar a lista de alunos. ${error.response?.data?.message || ''}`
      );
    }
  };



  // Método para filtrar alunos pelo termo de busca
  const filterAlunos = () => {
    const searchLower = searchAlunos.toLowerCase();
    const filtered = alunos.filter((aluno) =>
      `${aluno.nome} ${aluno.ultimoNome}`.toLowerCase().includes(searchLower) ||
      aluno.matricula.toLowerCase().includes(searchLower) ||
      aluno.email.toLowerCase().includes(searchLower)
    );
    setFilteredAlunos(filtered);
  };

  // Renderiza a seção de alunos com busca
  const renderAlunos = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        <Icon name="group" size={18} /> Aluno(s)
      </Text>
      {alunos.length > 0 && (
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar Alunos..."
          value={searchAlunos}
          onChangeText={setSearchAlunos}
        />
      )}
      {filteredAlunos.length > 0 ? (
        filteredAlunos.map((aluno, index) => (
          <View key={index} style={styles.infoBox}>
            <Text style={styles.infoText}>
              <Icon name="person" size={16} /> <Text style={styles.bold}>Nome:</Text> {aluno.nomeAluno}
            </Text>
            <Text style={styles.infoText}>
              <Icon name="badge" size={16} /> <Text style={styles.bold}>Matrícula:</Text> {aluno.id}
            </Text>
            <Text style={styles.infoText}>
              <Icon name="class" size={16} /> <Text style={styles.bold}>Turma:</Text> {aluno.nomeTurma}
            </Text>

            {/* Botão para Abrir Detalhes */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('AlunoDetalhesScreen', { aluno })}
            >
              <Icon name="info" size={16} color="#FFF" />
              <Text style={styles.buttonText}>Abrir Detalhes</Text>
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <Text style={styles.emptyMessage}>Nenhum aluno encontrado.</Text>
      )}
    </View>
  );



  const filterCoordenadores = () => {
    const coordenadores = detalhesCoordenacao.coordenadores || [];
    const filtered = coordenadores.filter((item) =>
      item?.nomeCoordenador?.toLowerCase().includes(searchCoordenadores.toLowerCase())
    );
    setFilteredCoordenadores(filtered);
  };

  const filterProfessores = () => {
    const professores = detalhesCoordenacao.professores || [];
    const filtered = professores.filter((item) =>
      item?.nomeProfessor?.toLowerCase().includes(searchProfessores.toLowerCase())
    );
    setFilteredProfessores(filtered);
  };

  const filterTurmas = () => {
    const turmas = detalhesCoordenacao.turmas || [];
    const filtered = turmas.filter((item) =>
      item?.nome?.toLowerCase().includes(searchTurmas.toLowerCase())
    );
    setFilteredTurmas(filtered);
  };

  const handleEdit = () => {
    navigation.navigate('CoordenacaoCreateScreen', { coordenacao: detalhesCoordenacao });
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmação',
      'Tem certeza que deseja deletar esta coordenação?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/coordenacoes/${detalhesCoordenacao.id}`);
              Alert.alert('Sucesso', 'Coordenação deletada com sucesso.');
              navigation.goBack();
            } catch (error) {
              console.error('Erro ao deletar coordenação:', error);
              Alert.alert('Erro', 'Falha ao deletar coordenação.');
            }
          },
        },
      ]
    );
  };

  const renderSection = (title, data, searchValue, setSearchValue, placeholder, onPressDetails, emptyMessage) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        <Icon
          name={
            title === 'Coordenador(es)'
              ? 'group'
              : title === 'Professor(es)'
                ? 'person'
                : title === 'Turma(s)'
                  ? 'class'
                  : 'place'
          }
          size={18}
        />{' '}
        {title}
      </Text>
      {data.length > 0 && (
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          value={searchValue}
          onChangeText={setSearchValue}
        />
      )}
      {data.length > 0 ? (
        data.map((item, index) => (
          <View key={index} style={styles.infoBox}>
            {/* Exibe os detalhes das turmas */}
            {title === 'Turma(s)' ? (
              <>
                <Text style={styles.infoText}>
                  <Icon name="class" size={16} /> <Text style={styles.bold}>Turma:</Text> {item.nome}
                </Text>
                <Text style={styles.infoText}>
                  <Icon name="calendar-today" size={16} /> <Text style={styles.bold}>Ano Escolar:</Text> {item.anoEscolar}
                </Text>
                <Text style={styles.infoText}>
                  <Icon name="access-time" size={16} /> <Text style={styles.bold}>Turno:</Text> {item.turno}
                </Text>
              </>
            ) : (
              <>
                {/* Outras seções, como Coordenadores ou Professores */}
                <Text style={styles.infoText}>
                  <Icon name="person" size={16} /> <Text style={styles.bold}>Nome:</Text>{' '}
                  {item.nome || item.nomeProfessor || item.nomeCoordenador || 'Sem nome'}
                </Text>
                {item.email && (
                  <Text style={styles.infoText}>
                    <Icon name="email" size={16} /> <Text style={styles.bold}>Email:</Text> {item.email}
                  </Text>
                )}
              </>
            )}
            {/* Botão de Detalhes */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onPressDetails(item)}
            >
              <Icon name="info" size={16} color="#FFF" />
              <Text style={styles.buttonText}>Abrir Detalhes</Text>
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <Text style={styles.emptyMessage}>{emptyMessage}</Text>
      )}
    </View>
  );



  return (
    <LayoutWrapper navigation={navigation} handleLogout={() => navigation.navigate('LoginScreen')}>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.editIcon} onPress={handleEdit}>
              <Icon name="edit" size={20} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.pageTitle}>Coordenação: {detalhesCoordenacao.nome || 'Sem Nome'}</Text>
            <Text style={styles.subtitle}>{detalhesCoordenacao.descricao || 'Sem descrição disponível'}</Text>
          </View>
  
          {/* Endereços */}
          {detalhesCoordenacao.enderecos?.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Icon name="place" size={18} /> Endereço(s)
              </Text>
              {detalhesCoordenacao.enderecos.map((endereco, index) => (
                <View key={`endereco-${index}`} style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    <Icon name="location-on" size={16} /> <Text style={styles.bold}>CEP:</Text>{' '}
                    {endereco.cep || 'Não informado'}
                  </Text>
                  <Text style={styles.infoText}>
                    <Icon name="home" size={16} /> <Text style={styles.bold}>Rua:</Text>{' '}
                    {endereco.rua || 'Não informado'}, Nº {endereco.numero || 'S/N'}
                  </Text>
                  <Text style={styles.infoText}>
                    <Icon name="location-city" size={16} /> <Text style={styles.bold}>Bairro:</Text>{' '}
                    {endereco.bairro || 'Não informado'}
                  </Text>
                  <Text style={styles.infoText}>
                    <Icon name="public" size={16} /> <Text style={styles.bold}>Cidade:</Text>{' '}
                    {endereco.cidade || 'Não informado'}, {endereco.estado || 'Não informado'}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyMessage}>Nenhum endereço cadastrado.</Text>
          )}
  
          {/* Telefones */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Icon name="call" size={18} /> Telefones
            </Text>
            {detalhesCoordenacao.telefones?.length > 0 ? (
              detalhesCoordenacao.telefones.map((telefone, index) => (
                <Text key={`telefone-${index}`} style={styles.infoText}>
                  <Icon name="call" size={16} /> ({telefone.ddd || '--'}) {telefone.numero || 'Não informado'}
                </Text>
              ))
            ) : (
              <Text style={styles.emptyMessage}>Nenhum telefone cadastrado.</Text>
            )}
          </View>
  
          {/* Coordenadores */}
          {renderSection(
            'Coordenador(es)',
            filteredCoordenadores,
            searchCoordenadores,
            setSearchCoordenadores,
            'Buscar Coordenadores...',
            (coord) => navigation.navigate('CoordenadorDetalhesScreen', { coordenador: coord }),
            'Nenhum coordenador cadastrado.'
          )}
  
          {/* Professores */}
          {renderSection(
            'Professor(es)',
            filteredProfessores,
            searchProfessores,
            setSearchProfessores,
            'Buscar Professores...',
            async (professor) => {
              try {
                // Verificar se os dados do professor estão completos
                if (!professor?.enderecos || !professor?.telefones) {
                  const response = await api.get(`/professores/${professor.cpf}`);
                  navigation.navigate('ProfessorDetalhesScreen', {
                    professor: { ...response.data, coordenacao: detalhesCoordenacao },
                  });
                } else {
                  navigation.navigate('ProfessorDetalhesScreen', {
                    professor: { ...professor, coordenacao: detalhesCoordenacao },
                  });
                }
              } catch (error) {
                console.error('Erro ao buscar professor:', error);
                Alert.alert('Erro', 'Não foi possível carregar os detalhes do professor.');
              }
            },
            'Nenhum professor cadastrado.'
          )}
  
          {/* Turmas */}
          {renderSection(
            'Turma(s)',
            filteredTurmas,
            searchTurmas,
            setSearchTurmas,
            'Buscar Turmas...',
            (turma) => navigation.navigate('TurmaDetalhesScreen', { turma }),
            'Nenhuma turma cadastrada.'
          )}
  
          {/* Alunos */}
          {renderAlunos()}
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
    paddingBottom: 80, // Espaço para evitar sobreposição com botões fixos
  },
  header: {
    backgroundColor: '#0056b3',
    paddingVertical: 30,
    alignItems: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  editIcon: {
    position: 'absolute',
    top: 10,
    right: 20,
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 5,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
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
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
    paddingBottom: 5,
  },
  infoBox: {
    backgroundColor: '#F9F9F9',
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#444',
    lineHeight: 20, // Melhora a legibilidade
  },
  bold: {
    fontWeight: 'bold',
    color: '#000',
  },
  searchInput: {
    marginBottom: 10,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
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
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8, // Espaçamento entre ícone e texto
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 80, // Espaço para evitar sobreposição com os botões fixos
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
    marginHorizontal: 10,
    width: '45%', // Para botões proporcionais e alinhados
  },
  editButton: {
    backgroundColor: '#28A745',
    borderRadius: 12, // Para bordas arredondadas
  },
  deleteButton: {
    backgroundColor: '#DC3545',
    borderRadius: 12,
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
    marginVertical: 10,
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
  },
});


export default CoordenacaoDetalhesScreen;


