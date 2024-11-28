import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  BackHandler,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [userType, setUserType] = useState('aluno');

  // Bloqueia o botão "Voltar" para impedir o retorno a telas anteriores
  useEffect(() => {
    const backAction = () => {
      Alert.alert('Sair', 'Deseja fechar o aplicativo?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Fechar', onPress: () => BackHandler.exitApp() }, // Fecha o aplicativo
      ]);
      return true; // Impede o comportamento padrão do botão voltar
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove(); // Remove o listener quando o componente desmontar
  }, []);

  // Função de login
// Função de login
const handleLogin = async () => {
  try {
    // Enviar as credenciais para o back-end
    const response = await axios.post('http://10.0.0.103:8080/auth/login', {
      email,
      senha,
      role: userType  // Passa a role (aluno, professor ou coordenador)
    });

    const { token } = response.data; // O token será retornado pela API

    // Armazenar o token JWT no AsyncStorage
    await AsyncStorage.setItem('jwtToken', token);

    // Navegar para a tela apropriada com base no tipo de usuário
    if (userType === 'aluno') {
      navigation.reset({
        index: 0,
        routes: [{ name: 'AlunoMenu' }],
      });
    } else if (userType === 'professor') {
      navigation.reset({
        index: 0,
        routes: [{ name: 'ProfessorMenu' }],
      });
    } else if (userType === 'coordenador') {
      navigation.reset({
        index: 0,
        routes: [{ name: 'CoordenadorMenu' }],
      });
    }
  } catch (error) {
    Alert.alert('Erro', 'Credenciais inválidas ou erro na requisição.');
  }
};


  return (
    <View style={styles.container}>
      {/* Logo e Título */}
      <Image source={require('../../../assets/logo-sge.png')} style={styles.logo} />
      <Text style={styles.subtitle}>Sistema de Gerenciamento Escolar</Text>

      {/* Campos de Entrada */}
      <TextInput
        style={styles.input}
        placeholder="Digite seu login"
        placeholderTextColor="#888"
        value={email}
        onChangeText={(text) => setEmail(text)} // Guardar o email
      />
      <TextInput
        style={styles.input}
        placeholder="Digite sua senha"
        placeholderTextColor="#888"
        secureTextEntry
        value={senha}
        onChangeText={(text) => setSenha(text)} // Guardar a senha
      />

      {/* Picker de Tipo de Usuário */}
      <Text style={styles.label}>Selecione o tipo de usuário:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={userType}
          style={styles.picker}
          onValueChange={(itemValue) => setUserType(itemValue)}
        >
          <Picker.Item label="Aluno" value="aluno" key="aluno" style={styles.pickerItem} />
          <Picker.Item label="Professor" value="professor" key="professor" style={styles.pickerItem} />
          <Picker.Item label="Coordenador" value="coordenador" key="coordenador" style={styles.pickerItem} />
        </Picker>
        {/* Ícones Representativos */}
        <View style={styles.iconsContainer}>
          <Icon
            name={
              userType === 'aluno' ? 'person' :
              userType === 'professor' ? 'school' : 'supervisor-account'
            }
            size={24}
            color="#007BFF"
          />
        </View>
      </View>

      {/* Botão de Entrar */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    alignSelf: 'flex-start',
    color: '#2c3e50',
  },
  pickerContainer: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#ccc',
    marginBottom: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  picker: {
    flex: 1,
    height: 50,
  },
  pickerItem: {
    fontSize: 16,
    color: '#000',
  },
  iconsContainer: {
    marginLeft: 10,
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#3498db',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
