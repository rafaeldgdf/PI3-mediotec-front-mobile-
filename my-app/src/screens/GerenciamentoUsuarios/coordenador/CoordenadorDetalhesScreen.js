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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import LayoutWrapper from '../../../components/LayoutWrapper';
import api from '../../../api/api';
import { format } from 'date-fns';

const CoordenadorDetalhesScreen = ({ route, navigation }) => {
  const { coordenador } = route.params;
  const [status, setStatus] = useState(coordenador.status);
  const [detalhesCoordenador, setDetalhesCoordenador] = useState(coordenador);
  const [profileImage, setProfileImage] = useState(null);
  const [coordenacao, setCoordenacao] = useState(null);

  useEffect(() => {
    fetchCoordenadorCompleto();
  }, []);

  useEffect(() => {
    if (detalhesCoordenador.idCoordenacao) {
      fetchCoordenacao(detalhesCoordenador.idCoordenacao);
    }
  }, [detalhesCoordenador]);

  const fetchCoordenadorCompleto = async () => {
    try {
      const response = await api.get(`/coordenadores/${coordenador.cpf}`);
      setDetalhesCoordenador(response.data);
      setStatus(response.data.status);
    } catch (error) {
      console.error('Erro ao buscar coordenador:', error);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes do coordenador.');
    }
  };


  const fetchCoordenacao = async (idCoordenacao) => {
    try {
      const response = await api.get(`/coordenacoes/${idCoordenacao}`);
      setCoordenacao(response.data);
    } catch (error) {
      console.error('Erro ao buscar coordenação:', error);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes da coordenação.');
    }
  };

  const toggleStatus = async () => {
    try {
      const novoStatus = !status;
  
      console.log("Tipo de data_nascimento em Coordenador:", typeof detalhesCoordenador.data_nascimento);
      console.log("Valor de data_nascimento em Coordenador:", detalhesCoordenador.data_nascimento);
      
      const formattedDataNascimento = detalhesCoordenador.data_nascimento
      ? format(new Date(detalhesCoordenador.data_nascimento.replace(/-/g, '/')), 'dd/MM/yyyy')
      : null;
      const payload = {
        ...detalhesCoordenador,
        status: novoStatus,
        data_nascimento: formattedDataNascimento,
      };
  
      console.log('Payload enviado ao backend:', payload); // Para debug
  
      await api.put(`/coordenadores/${detalhesCoordenador.cpf}`, payload);
  
      setStatus(novoStatus);
      Alert.alert('Sucesso', `Status alterado para ${novoStatus ? 'Ativo' : 'Inativo'}.`);
      fetchCoordenadorCompleto();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      Alert.alert('Erro', 'Não foi possível alterar o status do coordenador.');
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
    navigation.navigate('CoordenadorCreateScreen', { coordenador: detalhesCoordenador });
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmação',
      'Tem certeza que deseja deletar este coordenador?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/coordenadores/${detalhesCoordenador.cpf}`);
              Alert.alert('Sucesso', 'Coordenador deletado com sucesso.');
              navigation.goBack();
            } catch (error) {
              console.error('Erro ao deletar coordenador:', error);
              Alert.alert('Erro', 'Falha ao deletar coordenador.');
            }
          },
        },
      ]
    );
  };

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
              {detalhesCoordenador.nome} {detalhesCoordenador.ultimoNome}
            </Text>
            <Text style={styles.profileRole}>Coordenador</Text>
          </View>

          {/* Informações Pessoais */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Icon name="info" size={18} /> Informações Pessoais
            </Text>
            <Text style={styles.infoText}>
              <Icon name="badge" size={16} /> <Text style={styles.bold}>Nome:</Text>{' '}
              {detalhesCoordenador.nome} {detalhesCoordenador.ultimoNome}
            </Text>
            <Text style={styles.infoText}>
              <Icon name="badge" size={16} /> <Text style={styles.bold}>CPF:</Text>{' '}
              {detalhesCoordenador.cpf}
            </Text>
            <Text style={styles.infoText}>
              <Icon name="email" size={16} /> <Text style={styles.bold}>Email:</Text>{' '}
              {detalhesCoordenador.email || 'Não informado'}
            </Text>
            <Text style={styles.infoText}>
              <Icon name="wc" size={16} /> <Text style={styles.bold}>Gênero:</Text>{' '}
              {detalhesCoordenador.genero || 'Não informado'}
            </Text>
            <Text style={styles.infoText}>
              <Icon name="calendar-today" size={16} />{' '}
              <Text style={styles.bold}>Data de Nascimento:</Text>{' '}
              {detalhesCoordenador.data_nascimento
                ? format(new Date(detalhesCoordenador.data_nascimento), 'dd/MM/yyyy')
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
            {detalhesCoordenador.enderecos?.length > 0 ? (
              detalhesCoordenador.enderecos.map((endereco, index) => (
                <View key={index} style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    <Icon name="place" size={16} /> <Text style={styles.bold}>CEP:</Text>{' '}
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
                    {endereco.cidade || 'Não informado'} - {endereco.estado || 'Não informado'}
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
            {detalhesCoordenador.telefones?.length > 0 ? (
              detalhesCoordenador.telefones.map((telefone, index) => (
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
            {coordenacao ? (
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  <Icon name="group" size={16} /> <Text style={styles.bold}>Nome:</Text>{' '}
                  {coordenacao.nome}
                </Text>
                <Text style={styles.infoText}>
                  <Icon name="description" size={16} /> <Text style={styles.bold}>Descrição:</Text>{' '}
                  {coordenacao.descricao}
                </Text>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    navigation.navigate('CoordenacaoDetalhesScreen', { coordenacao })
                  }
                >
                  <Icon name="info" size={16} color="#FFF" />
                  <Text style={styles.buttonText}>Abrir Detalhes</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.infoText}>Nenhuma coordenação associada.</Text>
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
});

export default CoordenadorDetalhesScreen;
