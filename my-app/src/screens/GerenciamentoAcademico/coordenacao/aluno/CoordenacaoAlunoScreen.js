import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LayoutWrapper from "../../../../components/LayoutWrapper";
import api from "../../../../api/api";

const CoordenacaoAlunoScreen = ({ navigation }) => {
  const [detalhesCoordenacao, setDetalhesCoordenacao] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoordenacao();
  }, []);

  const fetchCoordenacao = async () => {
    try {
      setLoading(true);

      // Recuperar o ID do aluno logado do AsyncStorage
      const userInfo = await AsyncStorage.getItem("userInfo");
      const user = JSON.parse(userInfo);
      const idAluno = user?.usuario?.id;

      if (!idAluno) {
        throw new Error("ID do aluno não encontrado.");
      }

      // Buscar a coordenação vinculada ao aluno
      const alunoResponse = await api.get(`/alunos/${idAluno}`);
      const coordenacaoId = alunoResponse.data.turmas[0]?.coordenacao?.id;

      if (!coordenacaoId) {
        throw new Error("Coordenação não vinculada ao aluno.");
      }

      const coordenacaoResponse = await api.get(
        `/coordenacoes/${coordenacaoId}`
      );
      setDetalhesCoordenacao(coordenacaoResponse.data);
    } catch (error) {
      console.error("Erro ao buscar coordenação:", error.message);
      Alert.alert(
        "Erro",
        "Não foi possível carregar as informações da coordenação. Verifique sua conexão e tente novamente."
      );
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

  if (!detalhesCoordenacao) {
    return (
      <LayoutWrapper navigation={navigation}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Nenhuma coordenação encontrada.</Text>
        </View>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper navigation={navigation}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Coordenação</Text>
          <Text style={styles.subtitle}>
            {detalhesCoordenacao.nome || "Sem Nome"}
          </Text>
        </View>

        {/* Descrição */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Icon name="info" size={18} /> Descrição
          </Text>
          <Text style={styles.infoText}>
            {detalhesCoordenacao.descricao || "Nenhuma descrição disponível."}
          </Text>
        </View>

        {/* Coordenadores */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Icon name="group" size={18} /> Coordenador(es)
          </Text>
          {detalhesCoordenacao.coordenadores?.length > 0 ? (
            detalhesCoordenacao.coordenadores.map((coordenador, index) => (
              <View key={`coordenador-${index}`} style={styles.infoBox}>
                <Text style={styles.infoText}>
                  <Icon name="person" size={16} />{" "}
                  <Text style={styles.bold}>Nome:</Text>{" "}
                  {coordenador.nomeCoordenador || "Não informado"}
                </Text>
                <Text style={styles.infoText}>
                  <Icon name="email" size={16} />{" "}
                  <Text style={styles.bold}>Email:</Text>{" "}
                  {coordenador.email || "Não informado"}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyMessage}>
              Nenhum coordenador cadastrado.
            </Text>
          )}
        </View>

        {/* Telefones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Icon name="call" size={18} /> Telefones
          </Text>
          {detalhesCoordenacao.telefones?.length > 0 ? (
            detalhesCoordenacao.telefones.map((telefone, index) => (
              <Text key={`telefone-${index}`} style={styles.infoText}>
                <Icon name="call" size={16} /> ({telefone.ddd || "--"}){" "}
                {telefone.numero || "Não informado"}
              </Text>
            ))
          ) : (
            <Text style={styles.emptyMessage}>Nenhum telefone cadastrado.</Text>
          )}
        </View>

        {/* Endereço */}
        {detalhesCoordenacao.enderecos?.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Icon name="place" size={18} /> Endereço
            </Text>
            {detalhesCoordenacao.enderecos.map((endereco, index) => (
              <View key={`endereco-${index}`} style={styles.infoBox}>
                <Text style={styles.infoText}>
                  <Icon name="location-on" size={16} />{" "}
                  <Text style={styles.bold}>CEP:</Text>{" "}
                  {endereco.cep || "Não informado"}
                </Text>
                <Text style={styles.infoText}>
                  <Icon name="home" size={16} />{" "}
                  <Text style={styles.bold}>Rua:</Text>{" "}
                  {endereco.rua || "Não informado"}, Nº{" "}
                  {endereco.numero || "S/N"}
                </Text>
                <Text style={styles.infoText}>
                  <Icon name="location-city" size={16} />{" "}
                  <Text style={styles.bold}>Bairro:</Text>{" "}
                  {endereco.bairro || "Não informado"}
                </Text>
                <Text style={styles.infoText}>
                  <Icon name="public" size={16} />{" "}
                  <Text style={styles.bold}>Cidade:</Text>{" "}
                  {endereco.cidade || "Não informado"},{" "}
                  {endereco.estado || "Não informado"}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyMessage}>Nenhum endereço cadastrado.</Text>
        )}
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
    paddingVertical: 30,
    alignItems: "center",
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFF",
    textTransform: "uppercase",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#FFF",
    fontStyle: "italic",
  },
  section: {
    backgroundColor: "#FFF",
    padding: 15,
    marginVertical: 10,
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
  infoBox: {
    backgroundColor: "#F9F9F9",
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: "#E5E5E5",
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
    fontSize: 16,
    color: "#6C757D",
  },
  emptyMessage: {
    fontSize: 14,
    color: "#6C757D",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 10,
  },
});

export default CoordenacaoAlunoScreen;
