import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LayoutWrapper from "../../../components/LayoutWrapper";
import api from "../../../api/api";
import { format } from "date-fns";

const PerfilProfessorScreen = ({ navigation }) => {
  const [detalhesProfessor, setDetalhesProfessor] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [coordenacao, setCoordenacao] = useState(null);
  const [filteredTurmas, setFilteredTurmas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfessorDetalhes();
  }, []);

  useEffect(() => {
    filterTurmas();
  }, [searchTerm, detalhesProfessor]);

  const fetchProfessorDetalhes = async () => {
    try {
      setLoading(true);
      let cpfProfessor;

      // Recupera o CPF do professor do AsyncStorage
      const userInfo = await AsyncStorage.getItem("userInfo");
      if (userInfo) {
        const user = JSON.parse(userInfo);
        cpfProfessor = user?.usuario?.cpf;
      }

      if (!cpfProfessor) {
        throw new Error("CPF do professor não encontrado.");
      }

      // Busca detalhes do professor
      const response = await api.get(`/professores/${cpfProfessor}`);
      const professor = response.data;

      setDetalhesProfessor(professor);

      // Busca informações completas da coordenação
      if (professor.coordenacao?.id) {
        const coordResponse = await api.get(
          `/coordenacoes/${professor.coordenacao.id}`
        );
        setCoordenacao(coordResponse.data);
      }

      // Configura imagem de perfil (se existir)
      if (professor.profileImageUrl) {
        setProfileImage(professor.profileImageUrl);
      }
    } catch (error) {
      console.error("Erro ao buscar detalhes do professor:", error.message);
      Alert.alert(
        "Erro",
        "Não foi possível carregar os detalhes do professor."
      );
    } finally {
      setLoading(false);
    }
  };

  const filterTurmas = () => {
    if (!detalhesProfessor) return;
    const turmas = detalhesProfessor.turmaDisciplinaProfessores || [];
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

  const handlePickImage = async () => {
    try {
      const options = [
        {
          text: "Selecionar da Galeria",
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
          text: "Tirar Foto",
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
        { text: "Cancelar", style: "cancel" },
      ];
      Alert.alert("Imagem do Perfil", "Selecione uma opção:", options);
    } catch (error) {
      console.error("Erro ao selecionar a imagem:", error);
      Alert.alert("Erro", "Não foi possível selecionar a imagem.");
    }
  };
  const uploadImage = async (imageUri) => {
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        name: "profile.jpg",
        type: "image/jpeg",
      });

      await api.post(
        `/professores/${detalhesProfessor.cpf}/profile-image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Alert.alert("Sucesso", "Imagem de perfil atualizada com sucesso.");
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error.message);
      Alert.alert("Erro", "Não foi possível fazer o upload da imagem.");
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

  return (
    <LayoutWrapper navigation={navigation}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.profilePicture}
            onPress={handlePickImage}
          >
            {profileImage && typeof profileImage === "string" ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <Icon name="camera-alt" size={40} color="#FFF" />
            )}
          </TouchableOpacity>

          <Text style={styles.profileName}>
            {detalhesProfessor?.nome || "Nome não disponível"}{" "}
            {detalhesProfessor?.ultimoNome || ""}
          </Text>
          <Text style={styles.profileRole}>Professor</Text>
        </View>

        {/* Informações Pessoais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Icon name="info" size={18} /> Informações Pessoais
          </Text>
          <Text style={styles.infoText}>
            <Icon name="badge" size={16} />{" "}
            <Text style={styles.bold}>Nome:</Text> {detalhesProfessor.nome}{" "}
            {detalhesProfessor.ultimoNome}
          </Text>
          <Text style={styles.infoText}>
            <Icon name="badge" size={16} />{" "}
            <Text style={styles.bold}>CPF:</Text> {detalhesProfessor.cpf}
          </Text>
          <Text style={styles.infoText}>
            <Icon name="email" size={16} />{" "}
            <Text style={styles.bold}>Email:</Text>{" "}
            {detalhesProfessor.email || "Não informado"}
          </Text>
          <Text style={styles.infoText}>
            <Icon name="wc" size={16} />{" "}
            <Text style={styles.bold}>Gênero:</Text>{" "}
            {detalhesProfessor.genero || "Não informado"}
          </Text>
          <Text style={styles.infoText}>
            <Icon name="calendar-today" size={16} />{" "}
            <Text style={styles.bold}>Data de Nascimento:</Text>{" "}
            {detalhesProfessor.data_nascimento
              ? format(
                  new Date(detalhesProfessor.data_nascimento),
                  "dd/MM/yyyy"
                )
              : "Não informado"}
          </Text>
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
                  <Icon name="location-on" size={16} />{" "}
                  <Text style={styles.bold}>CEP:</Text> {endereco.cep}
                </Text>
                <Text style={styles.infoText}>
                  <Icon name="home" size={16} />{" "}
                  <Text style={styles.bold}>Rua:</Text> {endereco.rua}, Nº{" "}
                  {endereco.numero}
                </Text>
                <Text style={styles.infoText}>
                  <Icon name="location-city" size={16} />{" "}
                  <Text style={styles.bold}>Bairro:</Text> {endereco.bairro}
                </Text>
                <Text style={styles.infoText}>
                  <Icon name="public" size={16} />{" "}
                  <Text style={styles.bold}>Cidade:</Text> {endereco.cidade},{" "}
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
          {detalhesProfessor.telefones?.length > 0 ? (
            detalhesProfessor.telefones.map((telefone, index) => (
              <Text key={index} style={styles.infoText}>
                <Icon name="call" size={16} /> ({telefone.ddd}){" "}
                {telefone.numero}
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
          {console.log("Estado de coordenacao:", coordenacao)}
          {coordenacao ? (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                <Icon name="group" size={16} />{" "}
                <Text style={styles.bold}>Nome:</Text> {coordenacao.nome}
              </Text>
              <Text style={styles.infoText}>
                <Icon name="description" size={16} />{" "}
                <Text style={styles.bold}>Descrição:</Text>{" "}
                {coordenacao.descricao}
              </Text>
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
                  <Icon name="school" size={16} />{" "}
                  <Text style={styles.bold}>Turma:</Text>{" "}
                  {item.turma?.nome || "Não informado"}
                </Text>

                {/* Ano Escolar */}
                <Text style={styles.infoText}>
                  <Icon name="calendar-today" size={16} />{" "}
                  <Text style={styles.bold}>Ano Escolar:</Text>{" "}
                  {item.turma?.anoEscolar || "Não informado"}
                </Text>

                {/* Turno */}
                <Text style={styles.infoText}>
                  <Icon name="access-time" size={16} />{" "}
                  <Text style={styles.bold}>Turno:</Text>{" "}
                  {item.turma?.turno || "Não informado"}
                </Text>

                {/* Nome da Disciplina */}
                <Text style={styles.infoText}>
                  <Icon name="book" size={16} />{" "}
                  <Text style={styles.bold}>Disciplina:</Text>{" "}
                  {item.disciplina?.nome || "Não informado"}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.infoText}>
              Nenhuma turma ou disciplina associada.
            </Text>
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
    backgroundColor: "#FFF",
    marginVertical: 10,
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0056b3",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
    paddingBottom: 5,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
    color: "#444",
  },
  bold: {
    fontWeight: "bold",
    color: "#000",
  },
  infoBox: {
    backgroundColor: "#F9F9F9",
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  actionButton: {
    marginTop: 10,
    backgroundColor: "#007BFF",
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 5,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  fixedButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#DDD",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 80, // Espaço para evitar sobreposição com os botões fixos
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
    marginHorizontal: 10,
    width: "45%", // Para botões proporcionais e alinhados
  },
  editButton: {
    backgroundColor: "#28A745",
    borderRadius: 12, // Para bordas arredondadas
  },
  deleteButton: {
    backgroundColor: "#DC3545",
    borderRadius: 12,
  },
  input: {
    height: 40,
    borderColor: "#DDD",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: "#FFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#444",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "#DC3545",
  },
});

export default PerfilProfessorScreen;
