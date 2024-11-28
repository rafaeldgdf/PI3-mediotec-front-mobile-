import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  Switch,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import LayoutWrapper from '../../../components/LayoutWrapper';
import api from '../../../api/api';
import { format } from 'date-fns';

const ProfessorDetalhesScreen = ({ route, navigation }) => {
  const { professor, cpf } = route.params;

  const [status, setStatus] = useState(professor?.status || false);
  const [detalhesProfessor, setDetalhesProfessor] = useState({
    ...professor,
    turmaDisciplinaProfessores: professor?.turmaDisciplinaProfessores || [],
    enderecos: professor?.enderecos || [],
    telefones: professor?.telefones || [],
  });
  const [profileImage, setProfileImage] = useState(null);
  const [coordenacao, setCoordenacao] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTurmas, setFilteredTurmas] = useState([]);

  useEffect(() => {
    console.log('Dados recebidos pelo route.params:', route.params);
  
    if (route.params?.professor) {
      // Use os dados enviados diretamente
      setDetalhesProfessor({
        ...route.params.professor,
        turmaDisciplinaProfessores: route.params.professor.turmaDisciplinaProfessores || [],
        enderecos: route.params.professor.enderecos || [],
        telefones: route.params.professor.telefones || [],
        coordenacao: route.params.professor.coordenacao || null, // Coordenação do professor
      });
  
      setCoordenacao(route.params.professor.coordenacao || null); // Coordenação associada
    } else if (route.params?.cpf) {
      // Caso seja apenas o CPF, faça o fetch
      fetchProfessorCompleto(route.params.cpf);
    } else {
      console.error('Nenhum dado válido foi recebido!');
      Alert.alert('Erro', 'Não foi possível carregar os detalhes do professor.');
    }
  }, [route.params]);


  useEffect(() => {
    if (detalhesProfessor.coordenacao?.id) {
      fetchCoordenacao(detalhesProfessor.coordenacao.id);
    } else {
      console.warn("Nenhuma coordenação associada ao professor.");
    }
  }, [detalhesProfessor]);


  useEffect(() => {
    filterTurmas();
  }, [searchTerm, detalhesProfessor.turmaDisciplinaProfessores]);

  const fetchProfessorCompleto = async (cpf) => {
    try {
      const response = await api.get(`/professores/${cpf}`);
      console.log('Resposta da API:', response.data); // Verificar estrutura no console
      setDetalhesProfessor({
        ...response.data,
        turmaDisciplinaProfessores: response.data.turmaDisciplinaProfessores || [],
        enderecos: response.data.enderecos || [],
        telefones: response.data.telefones || [],
      });
      setStatus(response.data.status || false);
    } catch (error) {
      console.error('Erro ao buscar professor:', error.response?.data || error.message);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes do professor.');
    }
  };


  const fetchCoordenacao = async (idCoordenacao) => {
    try {
      console.log('Buscando coordenação para ID:', idCoordenacao);
      const response = await api.get(`/coordenacoes/${idCoordenacao}`);
      console.log('Coordenacao recebida:', response.data);
      setCoordenacao(response.data);
    } catch (error) {
      console.error('Erro ao buscar coordenação:', error.response?.data || error.message);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes da coordenação.');
    }
  };

  const toggleStatus = async () => {
    try {
      const novoStatus = !status;
      const dataNascimentoFormatada = detalhesProfessor.data_nascimento
        ? format(new Date(detalhesProfessor.data_nascimento), 'dd/MM/yyyy')
        : null;

      const payload = {
        ...detalhesProfessor,
        status: novoStatus,
        data_nascimento: dataNascimentoFormatada,
      };

      await api.put(`/professores/${detalhesProfessor.cpf}`, payload);

      setStatus(novoStatus);
      Alert.alert('Sucesso', `Status alterado para ${novoStatus ? 'Ativo' : 'Inativo'}.`);
      fetchProfessorCompleto();
    } catch (error) {
      console.error('Erro ao alterar status:', error.response?.data || error.message);
      Alert.alert('Erro', 'Não foi possível alterar o status do professor.');
    }
  };

  const handlePickImage = async () => {
    try {
      const options = [
        {
          text: 'Selecionar da Galeria',
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 1,
            });
            if (!result.canceled) {
              setProfileImage(result.assets[0].uri || null);
            }
          },
        },
        {
          text: 'Tirar Foto',
          onPress: async () => {
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 1,
            });
            if (!result.canceled) {
              setProfileImage(result.assets[0].uri || null);
            }
          },
        },
        { text: 'Cancelar', style: 'cancel' },
      ];
      Alert.alert('Imagem do Perfil', 'Selecione uma opção:', options);
    } catch (error) {
      console.error('Erro ao selecionar a imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  const handleEdit = () => {
    navigation.navigate('ProfessorCreateScreen', { professor: detalhesProfessor });
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmação',
      'Tem certeza que deseja deletar este professor?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/professores/${detalhesProfessor.cpf}`);
              Alert.alert('Sucesso', 'Professor deletado com sucesso.');
              navigation.goBack();
            } catch (error) {
              console.error('Erro ao deletar professor:', error);
              Alert.alert('Erro', 'Falha ao deletar professor.');
            }
          },
        },
      ]
    );
  };

  const filterTurmas = () => {
    const turmas = detalhesProfessor?.turmaDisciplinaProfessores || [];
    if (!searchTerm) {
      setFilteredTurmas(turmas);
      return;
    }
    const filtered = turmas.filter((item) => {
      const turma = item.turma || {};
      const disciplina = item.disciplina || {};
      return (
        turma.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        turma.anoEscolar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        turma.turno?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        disciplina.nome?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    setFilteredTurmas(filtered);
  };
  if (!detalhesProfessor || !Array.isArray(detalhesProfessor.turmaDisciplinaProfessores)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Carregando detalhes do professor...</Text>
      </View>
    );
  }

  return (
    <LayoutWrapper navigation={navigation} handleLogout={() => navigation.navigate('LoginScreen')}>
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          style={{ marginBottom: 80 }} // Adiciona espaço para os botões fixos não sobreporem o conteúdo
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.profilePicture} onPress={handlePickImage}>
              {profileImage && typeof profileImage === 'string' ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <Icon name="camera-alt" size={40} color="#FFF" />
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.editIcon} onPress={handleEdit}>
              <Icon name="edit" size={20} color="#FFF" />
            </TouchableOpacity>

            <Text style={styles.profileName}>
              {detalhesProfessor?.nome || 'Nome não disponível'} {detalhesProfessor?.ultimoNome || ''}
            </Text>
            <Text style={styles.profileRole}>Professor</Text>
          </View>

          {/* Informações Pessoais */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Icon name="info" size={18} /> Informações Pessoais
            </Text>
            <Text style={styles.infoText}>
              <Icon name="badge" size={16} /> <Text style={styles.bold}>Nome:</Text>{' '}
              {detalhesProfessor.nome} {detalhesProfessor.ultimoNome}
            </Text>
            <Text style={styles.infoText}>
              <Icon name="badge" size={16} /> <Text style={styles.bold}>CPF:</Text> {detalhesProfessor.cpf}
            </Text>
            <Text style={styles.infoText}>
              <Icon name="email" size={16} /> <Text style={styles.bold}>Email:</Text>{' '}
              {detalhesProfessor.email || 'Não informado'}
            </Text>
            <Text style={styles.infoText}>
              <Icon name="wc" size={16} /> <Text style={styles.bold}>Gênero:</Text>{' '}
              {detalhesProfessor.genero || 'Não informado'}
            </Text>
            <Text style={styles.infoText}>
              <Icon name="calendar-today" size={16} /> <Text style={styles.bold}>Data de Nascimento:</Text>{' '}
              {detalhesProfessor.data_nascimento
                ? format(new Date(detalhesProfessor.data_nascimento), 'dd/MM/yyyy')
                : 'Não informado'}
            </Text>
            <View style={styles.switchContainer}>
              <Text style={styles.statusText}>
                <Icon name="toggle-on" size={16} /> Status:{' '}
                <Text style={{ color: status ? '#28A745' : '#DC3545' }}>
                  {status ? 'Ativo' : 'Inativo'}
                </Text>
              </Text>
              <Switch
                trackColor={{ false: '#767577', true: '#28A745' }}
                thumbColor={status ? '#FFF' : '#f4f3f4'}
                onValueChange={toggleStatus}
                value={status}
              />
            </View>
          </View>

          {/* Endereços */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Icon name="place" size={18} /> Endereços
            </Text>
            {detalhesProfessor.enderecos?.length > 0 ? (
              detalhesProfessor.enderecos.map((endereco, index) => (
                <View key={index} style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    <Icon name="location-on" size={16} /> <Text style={styles.bold}>CEP:</Text>{' '}
                    {endereco.cep}
                  </Text>
                  <Text style={styles.infoText}>
                    <Icon name="home" size={16} /> <Text style={styles.bold}>Rua:</Text>{' '}
                    {endereco.rua}, Nº {endereco.numero}
                  </Text>
                  <Text style={styles.infoText}>
                    <Icon name="location-city" size={16} /> <Text style={styles.bold}>Bairro:</Text>{' '}
                    {endereco.bairro}
                  </Text>
                  <Text style={styles.infoText}>
                    <Icon name="public" size={16} /> <Text style={styles.bold}>Cidade:</Text>{' '}
                    {endereco.cidade}, {endereco.estado}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.infoText}>Nenhum endereço cadastrado.</Text>
            )}
          </View>
          {/* Telefones */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Icon name="phone" size={18} /> Telefones
            </Text>
            {detalhesProfessor.telefones?.length > 0 ? (
              detalhesProfessor.telefones.map((telefone, index) => (
                <Text key={index} style={styles.infoText}>
                  <Icon name="call" size={16} /> ({telefone.ddd}) {telefone.numero}
                </Text>
              ))
            ) : (
              <Text style={styles.infoText}>Nenhum telefone cadastrado.</Text>
            )}
          </View>

          {/* Coordenação Associada */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Icon name="group" size={18} /> Coordenação Associada
            </Text>
            {console.log('Estado de coordenacao:', coordenacao)}
            {coordenacao ? (
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  <Icon name="group" size={16} /> <Text style={styles.bold}>Nome:</Text> {coordenacao.nome}
                </Text>
                <Text style={styles.infoText}>
                  <Icon name="description" size={16} /> <Text style={styles.bold}>Descrição:</Text>{' '}
                  {coordenacao.descricao}
                </Text>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => navigation.navigate('CoordenacaoDetalhesScreen', { coordenacao })}
                >
                  <Icon name="info" size={16} color="#FFF" />
                  <Text style={styles.buttonText}>Abrir Detalhes</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.infoText}>Nenhuma coordenação associada.</Text>
            )}
          </View>


          {/* Turmas e Disciplinas */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Icon name="class" size={18} /> Turmas e Disciplinas
            </Text>

            {/* Campo de Busca */}
            <TextInput
              style={styles.input}
              placeholder="Buscar turma ou disciplina"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
            {filteredTurmas.length > 0 ? (
              filteredTurmas.map((item, index) => (
                <View key={index} style={styles.infoBox}>
                  {/* Nome da Turma */}
                  <Text style={styles.infoText}>
                    <Icon name="school" size={16} />{' '}
                    <Text style={styles.bold}>Turma:</Text> {item.turma?.nome || 'Não informado'}
                  </Text>

                  {/* Ano Escolar */}
                  <Text style={styles.infoText}>
                    <Icon name="calendar-today" size={16} />{' '}
                    <Text style={styles.bold}>Ano Escolar:</Text> {item.turma?.anoEscolar || 'Não informado'}
                  </Text>

                  {/* Turno */}
                  <Text style={styles.infoText}>
                    <Icon name="access-time" size={16} />{' '}
                    <Text style={styles.bold}>Turno:</Text> {item.turma?.turno || 'Não informado'}
                  </Text>

                  {/* Nome da Disciplina */}
                  <Text style={styles.infoText}>
                    <Icon name="book" size={16} />{' '}
                    <Text style={styles.bold}>Disciplina:</Text> {item.disciplina?.nome || 'Não informado'}
                  </Text>

                  {/* Botão para detalhes da turma */}
                  {item.turma && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() =>
                        navigation.navigate('TurmaDetalhesScreen', { turma: item.turma })
                      }
                    >
                      <Icon name="info" size={16} color="#FFF" />
                      <Text style={styles.buttonText}>Abrir Detalhes</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.infoText}>Nenhuma turma ou disciplina associada.</Text>
            )}
          </View>


        </ScrollView>

        {/* Botões de Ação */}
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
    paddingVertical: 30,
    alignItems: 'center',
    position: 'relative',
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  profileRole: {
    fontSize: 16,
    color: '#FFF',
    fontStyle: 'italic',
  },
  editIcon: {
    position: 'absolute',
    top: 10,
    right: 20,
    backgroundColor: '#007BFF',
    padding: 8,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 5,
  },
  section: {
    backgroundColor: '#FFF',
    marginVertical: 10,
    padding: 20,
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
  infoText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#444',
  },
  bold: {
    fontWeight: 'bold',
    color: '#000',
  },
  infoBox: {
    backgroundColor: '#F9F9F9',
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#E5E5E5',
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
    marginLeft: 5,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
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
  input: {
    height: 40,
    borderColor: '#DDD',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#FFF',
  },
});


export default ProfessorDetalhesScreen;
