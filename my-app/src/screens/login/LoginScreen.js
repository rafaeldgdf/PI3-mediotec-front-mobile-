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
import { useNavigation } from '@react-navigation/native';  // Importando useNavigation
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ onLogin }) => {
  const navigation = useNavigation(); // Usando o hook useNavigation
  const [userType, setUserType] = useState('aluno');
  const [loginValue, setLoginValue] = useState(''); // Pode ser CPF ou e-mail
  const [senha, setSenha] = useState(''); // Campo para a senha
  const [secureText, setSecureText] = useState(true); // Controla visibilidade da senha

  // Função para verificar se o valor inserido é um e-mail válido
  const isEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/; // Formato de e-mail
    return regex.test(email);
  };

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

  // Lógica para fazer login

  const handleLogin = async () => {
    if (loginValue.trim() === '' || senha.trim() === '') {
      Alert.alert('Erro', 'Preencha o CPF/e-mail e a senha');
      return;
    }
  
    const loginField = isEmail(loginValue) ? 'email' : isCpf(loginValue) ? 'cpf' : null;
    if (!loginField) {
      Alert.alert('Erro', 'Por favor, insira um CPF ou email válido');
      return;
    }
  
    try {
      // Salve o CPF/email no AsyncStorage
      await AsyncStorage.setItem(
        'userInfo',
        JSON.stringify({ tipo: userType, identificador: loginValue })
      );
      Alert.alert('Sucesso', 'Login realizado com sucesso.');
      navigation.reset({ index: 0, routes: [{ name: 'CoordenadorMenu' }] });
    } catch (error) {
      console.error('Erro ao salvar informações do usuário:', error);
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
        placeholder="Digite seu E-mail"
        placeholderTextColor="#888"
        value={loginValue}
        onChangeText={setLoginValue}
      />
      {/* Campo de Senha */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.inputPassword}
          placeholder="Digite sua senha"
          placeholderTextColor="#888"
          secureTextEntry={secureText}
          value={senha}
          onChangeText={setSenha}
        />
        <TouchableOpacity
          style={styles.eyeIconContainer}
          onPress={() => setSecureText(!secureText)} // Alterna a visibilidade da senha
        >
          <Icon
            name={secureText ? 'visibility-off' : 'visibility'} // Alterna entre ícones de olho aberto e fechado
            size={24}
            color="#007BFF"
          />
        </TouchableOpacity>
      </View>

      {/* Picker de Tipo de Usuário */}
      <Text style={styles.label}>Selecione o tipo de usuário:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={userType}
          style={styles.picker}
          onValueChange={(itemValue) => setUserType(itemValue)}
        >
          <Picker.Item
            label="Aluno"
            value="aluno"
            key="aluno"
            style={styles.pickerItem}
          />
          <Picker.Item
            label="Professor"
            value="professor"
            key="professor"
            style={styles.pickerItem}
          />
          <Picker.Item
            label="Coordenador"
            value="coordenador"
            key="coordenador"
            style={styles.pickerItem}
          />
        </Picker>
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  inputPassword: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  eyeIconContainer: {
    paddingRight: 10,
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