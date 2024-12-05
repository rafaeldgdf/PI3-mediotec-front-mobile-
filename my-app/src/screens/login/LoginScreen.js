import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginScreen = () => {
  const navigation = useNavigation();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [secureText, setSecureText] = useState(true);

  // Função para verificar se o e-mail é válido
  const isEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return regex.test(email);
  };

  // Função de login
  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert("Erro", "Preencha o e-mail e a senha.");
      return;
    }

    if (!isEmail(email)) {
      Alert.alert("Erro", "Por favor, insira um e-mail válido.");
      return;
    }

    try {
      console.log("Enviando dados para o backend...");

      const response = await fetch("http://10.0.0.116:8080/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identificador: email,
          senha: senha,
        }),
      });

      console.log("Resposta recebida:", response);

      // Verificar se a resposta foi bem-sucedida
      if (!response.ok) {
        if (response.status === 401) {
          Alert.alert(
            "Erro",
            "Credenciais inválidas. Verifique seu e-mail e senha."
          );
        } else {
          const errorText = await response.text();
          Alert.alert("Erro", `Erro no servidor: ${errorText}`);
        }
        return;
      }

      // Processar a resposta JSON
      const data = await response.json();
      console.log("Dados processados:", data);

      const { tipoUsuario, usuario } = data;

      // Valida os dados recebidos
      if (!tipoUsuario || !usuario || !usuario.cpf) {
        Alert.alert("Erro", "Resposta inesperada do servidor.");
        return;
      }


      // Armazena as informações no AsyncStorage
      await AsyncStorage.setItem(
        "userInfo",
        JSON.stringify({
          tipoUsuario,
          usuario: {
            id: usuario.id, // Incluído o ID do aluno
            cpf: usuario.cpf,
            nome: usuario.nome,
            ultimoNome: usuario.ultimoNome,
            email: usuario.email,
            turmaId: usuario.turmaId || null, // Salve o ID da turma se aplicável
          },
        })
      );

      // Navega para a tela apropriada com base no tipo de usuário
      switch (tipoUsuario) {
        case "coordenador":
          navigation.reset({ index: 0, routes: [{ name: "CoordenadorMenu" }] });
          break;
        case "professor":
          navigation.reset({ index: 0, routes: [{ name: "ProfessorMenu" }] });
          break;
        case "aluno":
          navigation.reset({ index: 0, routes: [{ name: "AlunoMenu" }] });
          break;
        default:
          Alert.alert("Erro", "Tipo de usuário desconhecido.");
      }
    } catch (error) {
      console.error("Erro ao realizar login:", error.message);
      Alert.alert(
        "Erro",
        "Não foi possível realizar o login. Verifique sua conexão e tente novamente."
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo e título */}
      <Image
        source={require("../../../assets/logo-sge.png")}
        style={styles.logo}
      />
      <Text style={styles.subtitle}>Sistema de Gerenciamento Escolar</Text>

      {/* Campo de e-mail */}
      <TextInput
        style={styles.input}
        placeholder="Digite seu e-mail"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Campo de senha */}
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
          onPress={() => setSecureText(!secureText)}
        >
          <Icon
            name={secureText ? "visibility-off" : "visibility"}
            size={24}
            color="#007BFF"
          />
        </TouchableOpacity>
      </View>

      {/* Botão de login */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f4f4f4",
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
    resizeMode: "contain",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#333",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  inputPassword: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: "#333",
  },
  eyeIconContainer: {
    paddingRight: 10,
  },
  button: {
    width: "100%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#3498db",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default LoginScreen;
