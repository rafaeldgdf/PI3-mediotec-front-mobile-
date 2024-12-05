import React from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LayoutWrapper = ({ children, navigation }) => {
  const handleLogout = async () => {
    try {
      // Limpa os dados do AsyncStorage
      await AsyncStorage.removeItem("userInfo");

      // Reseta a navegação para ir à tela de login
      navigation.reset({
        index: 0,
        routes: [{ name: "LoginScreen" }],
      });
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      Alert.alert("Erro", "Não foi possível realizar o logout.");
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      "Confirmação",
      "Você deseja realmente sair?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          onPress: handleLogout, // Chama diretamente o handleLogout
        },
      ],
      { cancelable: true }
    );
  };

  const handleInicioPress = async () => {
    try {
      const userInfo = await AsyncStorage.getItem("userInfo");
      if (userInfo) {
        const { tipoUsuario } = JSON.parse(userInfo);

        // Redireciona para o menu correto com base no tipo de usuário
        switch (tipoUsuario) {
          case "aluno":
            navigation.navigate("AlunoMenu");
            break;
          case "professor":
            navigation.navigate("ProfessorMenu");
            break;
          case "coordenador":
            navigation.navigate("CoordenadorMenu");
            break;
          default:
            Alert.alert("Erro", "Tipo de usuário desconhecido.");
        }
      } else {
        Alert.alert("Erro", "Nenhum usuário logado encontrado.");
        navigation.navigate("LoginScreen"); // Redireciona para o login se necessário
      }
    } catch (error) {
      console.error("Erro ao recuperar informações do usuário:", error);
      Alert.alert("Erro", "Falha ao recuperar informações do usuário.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("../../assets/logo-sge.png")}
          style={styles.logo}
        />
      </View>

      <View style={styles.content}>{children}</View>

      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navItem} onPress={handleInicioPress}>
          <Icon name="home" size={24} color="#007BFF" />
          <Text style={styles.navText}>Início</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={async () => {
            try {
              const userInfo = await AsyncStorage.getItem("userInfo");
              if (userInfo) {
                const { tipoUsuario } = JSON.parse(userInfo);

                // Redireciona para a tela de perfil correta
                switch (tipoUsuario) {
                  case "aluno":
                    navigation.navigate("PerfilAlunoScreen");
                    break;
                  case "professor":
                    navigation.navigate("PerfilProfessorScreen");
                    break;
                  case "coordenador":
                    navigation.navigate("PerfilCoordenadorScreen");
                    break;
                  default:
                    Alert.alert("Erro", "Tipo de usuário desconhecido.");
                }
              } else {
                Alert.alert("Erro", "Nenhum usuário logado encontrado.");
              }
            } catch (error) {
              console.error("Erro ao redirecionar para o perfil:", error);
              Alert.alert("Erro", "Falha ao redirecionar para o perfil.");
            }
          }}
        >
          <Icon name="person" size={24} color="#007BFF" />
          <Text style={styles.navText}>Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Configuracoes")}
        >
          <Icon name="settings" size={24} color="#007BFF" />
          <Text style={styles.navText}>Configurações</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={confirmLogout}>
          <Icon name="exit-to-app" size={24} color="#FF3B30" />
          <Text style={[styles.navText, { color: "#FF3B30" }]}>Sair</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  header: {
    height: 70,
    backgroundColor: "#007BFF",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    height: 40,
    resizeMode: "contain",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  navbar: {
    height: 70,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    paddingHorizontal: 5,
  },
  navItem: {
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
  },
  navText: {
    fontSize: 12,
    marginTop: 5,
    color: "#007BFF",
    fontWeight: "bold",
  },
});

export default LayoutWrapper;
