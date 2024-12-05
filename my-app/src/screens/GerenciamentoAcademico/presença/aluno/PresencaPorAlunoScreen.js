import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../../../api/api";
import LayoutWrapper from "../../../../components/LayoutWrapper";

const PresencaPorAlunoScreen = ({ navigation, route }) => {
  const [aluno, setAluno] = useState(null);
  const [disciplinas, setDisciplinas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mapeamento explícito de meses para garantir consistência
  const meses = [
    { nome: "Jan", key: "jan." },
    { nome: "Fev", key: "fev." },
    { nome: "Mar", key: "mar." },
    { nome: "Abr", key: "abr." },
    { nome: "Mai", key: "mai." },
    { nome: "Jun", key: "jun." },
    { nome: "Jul", key: "jul." },
    { nome: "Ago", key: "ago." },
    { nome: "Set", key: "set." },
    { nome: "Out", key: "out." },
    { nome: "Nov", key: "nov." },
    { nome: "Dez", key: "dez." },
  ];

  useEffect(() => {
    const fetchDados = async () => {
      try {
        let idAluno = route.params?.idAluno;

        if (!idAluno) {
          const userInfo = await AsyncStorage.getItem("userInfo");
          const user = JSON.parse(userInfo);
          idAluno = user?.usuario?.id;
          if (!idAluno) throw new Error("ID do aluno não encontrado.");
        }

        setLoading(true);

        // Fazendo requisições paralelas
        const [alunoResponse, presencasResponse] = await Promise.all([
          api.get(`/alunos/${idAluno}`),
          api.get(`/presencas/aluno/${idAluno}`),
        ]);

        setAluno(alunoResponse.data);

        const disciplinasFormatadas = alunoResponse.data.turmas.flatMap((turma) =>
          turma.disciplinaProfessores.map((dp) => ({
            idDisciplina: dp.disciplinasIds[0],
            nomeDisciplina: dp.nomesDisciplinas[0],
            nomeProfessor: dp.nomeProfessor,
          }))
        );

        const faltas = computarFaltas(presencasResponse.data);
        console.log("Faltas computadas:", faltas);

        setDisciplinas(
          disciplinasFormatadas.map((disciplina) => ({
            ...disciplina,
            faltas: faltas[disciplina.idDisciplina] || {}, // Vincula faltas com a disciplina
          }))
        );
      } catch (error) {
        console.error("Erro ao carregar dados:", error.message);
        Alert.alert("Erro", "Não foi possível carregar os dados do aluno.");
      } finally {
        setLoading(false);
      }
    };

    fetchDados();
  }, [route.params]);

  /**
   * Computa as faltas de todas as presenças agrupadas por disciplina e mês.
   */
  const computarFaltas = (presencas) => {
    const faltas = presencas.reduce((acc, presenca) => {
      if (!presenca.presenca && presenca.disciplina?.id) {
        const mes = new Date(presenca.data)
          .toLocaleString("pt-BR", { month: "short" })
          .toLowerCase(); // Garantir meses em minúsculas
        const idDisciplina = presenca.disciplina.id;

        if (!acc[idDisciplina]) acc[idDisciplina] = {};
        acc[idDisciplina][mes] = (acc[idDisciplina][mes] || 0) + 1;
      }
      return acc;
    }, {});
    return faltas;
  };

  const toggleExpand = (index) => {
    setDisciplinas((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, expanded: !item.expanded } : { ...item, expanded: false }
      )
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Carregando informações...</Text>
      </View>
    );
  }

  if (!aluno || disciplinas.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Nenhum dado encontrado.</Text>
      </View>
    );
  }

  return (
    <LayoutWrapper navigation={navigation}>
      {/* Box com informações do aluno */}
      <View style={styles.alunoBox}>
        <View style={styles.alunoInfoContainer}>
          <Icon name="person" size={40} color="#FFF" />
          <View style={styles.alunoTextContainer}>
            <Text style={styles.alunoName}>{aluno.nome} {aluno.ultimoNome}</Text>
            <Text style={styles.alunoInfo}>
              <Icon name="email" size={16} color="#FFF" /> {aluno.email}
            </Text>
            <Text style={styles.alunoInfo}>
              <Icon name="school" size={16} color="#FFF" /> {aluno.turmas[0]?.nome || "Não informado"}
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={disciplinas}
        keyExtractor={(item, index) => `${item.idDisciplina || "disciplina"}-${index}`}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <TouchableOpacity onPress={() => toggleExpand(index)}>
              <Text style={styles.disciplinaTitle}>{item.nomeDisciplina}</Text>
              <Text style={styles.professorText}>Professor: {item.nomeProfessor}</Text>
            </TouchableOpacity>

            {item.expanded && (
              <View style={styles.boletim}>
                <Text style={styles.sectionTitle}>Total de Faltas por Mês</Text>
                {meses.map(({ nome, key }, idx) => (
                  <View
                    key={key}
                    style={[
                      styles.boletimRow,
                      idx % 2 === 0 ? styles.boletimRowEven : styles.boletimRowOdd,
                    ]}
                  >
                    <Text style={styles.unidade}>{nome}</Text>
                    <Text style={styles.conceito}>
                      {item.faltas[key] || 0}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      />
    </LayoutWrapper>
  );
};



const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8F9FA" },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    loadingText: { fontSize: 16, color: "#6C757D", marginTop: 8 },
    alunoBox: { backgroundColor: "#0056B3", padding: 20, margin: 16, borderRadius: 8 },
    alunoInfoContainer: { flexDirection: "row", alignItems: "center" },
    alunoTextContainer: { marginLeft: 12 },
    alunoName: { fontSize: 20, fontWeight: "bold", color: "#FFF" },
    alunoInfo: { fontSize: 14, color: "#D0E8FF", marginTop: 4 },
    card: {
      backgroundColor: "#FFFFFF",
      padding: 16,
      marginVertical: 8,
      marginHorizontal: 16,
      borderRadius: 8,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      elevation: 2,
      borderWidth: 1,
      borderColor: "#CED4DA",
    },
    disciplinaTitle: { fontSize: 18, fontWeight: "bold", color: "#007BFF" },
    professorText: { fontSize: 14, color: "#6C757D", marginTop: 4 },
    boletim: { marginTop: 16, backgroundColor: "#F8F9FA", padding: 12, borderRadius: 8 },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#343A40",
      marginBottom: 8,
      textAlign: "center",
    },
    boletimRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 },
    boletimRowOdd: { backgroundColor: "#F8F9FA" },
    boletimRowEven: { backgroundColor: "#E9ECEF" },
    unidade: { fontSize: 14, fontWeight: "bold", color: "#495057" },
    conceito: { fontSize: 14, color: "#007BFF" },
  });

  export default PresencaPorAlunoScreen;