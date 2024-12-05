import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LayoutWrapper from '../../../components/LayoutWrapper';
import api from '../../../api/api';
import * as ImagePicker from 'expo-image-picker';
import { format } from 'date-fns';

const PerfilCoordenadorScreen = ({ navigation }) => {
  const [detalhesCoordenador, setDetalhesCoordenador] = useState(null);
  const [coordenacao, setCoordenacao] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoordenadorDetalhes();
  }, []);

  // Busca os detalhes do coordenador pelo CPF
  const fetchCoordenadorDetalhes = async () => {
    try {
      setLoading(true);
      let cpfCoordenador;

      // Recupera o CPF do coordenador armazenado no AsyncStorage
      const userInfo = await AsyncStorage.getItem('userInfo');
      if (userInfo) {
        const user = JSON.parse(userInfo);
        cpfCoordenador = user?.usuario?.cpf;
      }

      if (!cpfCoordenador) {
        throw new Error('CPF do coordenador não encontrado.');
      }

      // Chamada para buscar o coordenador
      const response = await api.get(`/coordenadores/${cpfCoordenador}`);
      setDetalhesCoordenador(response.data);

      // Busca os detalhes da coordenação associada
      if (response.data.idCoordenacao) {
        const coordResponse = await api.get(`/coordenacoes/${response.data.idCoordenacao}`);
        setCoordenacao(coordResponse.data);
      }

      // Caso o coordenador tenha uma imagem de perfil no backend
      if (response.data.profileImageUrl) {
        setProfileImage(response.data.profileImageUrl);
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do coordenador:', error.message);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes do coordenador.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LayoutWrapper navigation={navigation}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0056b3" />
          <Text style={styles.loadingText}>Carregando informações...</Text>
        </View>
      </LayoutWrapper>
    );
  }

  if (!detalhesCoordenador) {
    return (
      <LayoutWrapper navigation={navigation}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Nenhum dado encontrado.</Text>
        </View>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper navigation={navigation}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.profilePicture}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <Icon name="camera-alt" size={40} color="#FFF" />
            )}
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
            <Icon name="fingerprint" size={16} /> <Text style={styles.bold}>CPF:</Text>{' '}
            {detalhesCoordenador.cpf}
          </Text>
          <Text style={styles.infoText}>
            <Icon name="email" size={16} /> <Text style={styles.bold}>Email:</Text>{' '}
            {detalhesCoordenador.email || 'Não informado'}
          </Text>
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
                  <Icon name="home" size={16} /> <Text style={styles.bold}>Rua:</Text> {endereco.rua}, Nº{' '}
                  {endereco.numero || 'S/N'}
                </Text>
                <Text style={styles.infoText}>
                  <Icon name="place" size={16} /> <Text style={styles.bold}>CEP:</Text> {endereco.cep}
                </Text>
                <Text style={styles.infoText}>
                  <Icon name="location-city" size={16} /> <Text style={styles.bold}>Bairro:</Text>{' '}
                  {endereco.bairro}
                </Text>
                <Text style={styles.infoText}>
                  <Icon name="public" size={16} /> <Text style={styles.bold}>Cidade:</Text> {endereco.cidade} -{' '}
                  {endereco.estado}
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
                <Icon name="group" size={16} /> <Text style={styles.bold}>Nome:</Text> {coordenacao.nome}
              </Text>
              <Text style={styles.infoText}>
                <Icon name="description" size={16} /> <Text style={styles.bold}>Descrição:</Text> {coordenacao.descricao}
              </Text>
            </View>
          ) : (
            <Text style={styles.infoText}>Nenhuma coordenação associada.</Text>
          )}
        </View>
      </ScrollView>
    </LayoutWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    backgroundColor: "#F4F4F4",
  },
  header: {
    backgroundColor: "#0056b3",
    paddingVertical: 40, // Ajuste para mais espaço ao redor
    alignItems: "center", // Centraliza horizontalmente
    justifyContent: "center", // Centraliza verticalmente
    position: "relative",
  },
  profilePicture: {
    width: 120, // Um pouco maior para ficar mais proporcional
    height: 120,
    borderRadius: 60, // Deve ser metade do width e height
    backgroundColor: "#DDD",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 4, // Adicione uma borda para destaque
    borderColor: "#FFF", // Cor da borda
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 60, // Deve ser igual ao borderRadius do profilePicture
    resizeMode: "cover", // Garante que a imagem preencha o espaço sem distorção
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFF",
    marginTop: 10,
    textAlign: "center",
  },
  profileRole: {
    fontSize: 16,
    color: "#FFF",
    fontStyle: "italic",
    textAlign: "center",
  },
  section: {
    backgroundColor: '#FFF',
    marginVertical: 10,
    padding: 20,
    borderRadius: 10,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#444',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#DC3545',
  },
});

export default PerfilCoordenadorScreen;
