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

const ConceitosAlunoScreen = ({ navigation, route }) => {
  const [aluno, setAluno] = useState(null);
  const [disciplinas, setDisciplinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { idAluno: idAlunoFromRoute } = route.params || {};

  useEffect(() => {
    const fetchAlunoEDisciplinas = async () => {
      let idAluno = idAlunoFromRoute;

      if (!idAluno) {
        try {
          const userInfo = await AsyncStorage.getItem("userInfo");
          const user = JSON.parse(userInfo);

          if (user?.usuario?.id) {
            idAluno = user.usuario.id;
            console.log(`ID do aluno carregado do AsyncStorage: ${idAluno}`);
          } else {
            Alert.alert("Erro", "ID do aluno não foi encontrado.");
            return;
          }
        } catch (error) {
          console.error("Erro ao acessar o AsyncStorage:", error.message);
          Alert.alert(
            "Erro",
            "Não foi possível carregar as informações do aluno."
          );
          return;
        }
      }

      try {
        setLoading(true);

        // Buscar informações do aluno
        const alunoResponse = await api.get(`/alunos/${idAluno}`);
        setAluno(alunoResponse.data);

        // Buscar conceitos do aluno
        const conceitosResponse = await api.get(
          `/conceitos/${idAluno}/conceitos`
        );
        setDisciplinas(
          conceitosResponse.data.map((disciplina) => ({
            ...disciplina,
            expanded: false, // Estado inicial de cada item
          }))
        );
      } catch (error) {
        console.error("Erro ao carregar dados:", error.message);
        Alert.alert(
          "Erro",
          "Não foi possível carregar os dados do aluno e disciplinas."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAlunoEDisciplinas();
  }, [idAlunoFromRoute]);

  const toggleExpand = (index) => {
    setDisciplinas((prevDisciplinas) =>
      prevDisciplinas.map((item, idx) =>
        idx === index
          ? { ...item, expanded: !item.expanded }
          : { ...item, expanded: false } // Fecha os outros
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
            <Text style={styles.alunoName}>
              {aluno.nome} {aluno.ultimoNome}
            </Text>
            <Text style={styles.alunoInfo}>
              <Icon name="email" size={16} color="#FFF" /> {aluno.email}
            </Text>
            <Text style={styles.alunoInfo}>
              <Icon name="school" size={16} color="#FFF" />{" "}
              {aluno.turmas[0]?.nome || "Não informado"}
            </Text>
            <Text style={styles.alunoInfo}>
              <Icon name="calendar-today" size={16} color="#FFF" /> Ano Escolar:{" "}
              {aluno.turmas[0]?.anoEscolar || "Não informado"}
            </Text>
            <Text style={styles.alunoInfo}>
              <Icon name="schedule" size={16} color="#FFF" /> Turno:{" "}
              {aluno.turmas[0]?.turno || "Não informado"}
            </Text>
            <Text style={styles.alunoInfo}>
              <Icon name="class" size={16} color="#FFF" /> Coordenador:{" "}
              {aluno.turmas[0]?.coordenacao?.coordenadores[0]?.nomeCoordenador ||
                "Não informado"}
            </Text>
          </View>
        </View>
      </View>

      {/* Lista de Disciplinas */}
      <FlatList
        data={disciplinas}
        keyExtractor={(item, index) =>
          `${item.turmaDisciplinaProfessor.idDisciplina || "disciplina"}-${index}`
        } // Garante chaves únicas
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            {/* Cabeçalho da disciplina */}
            <TouchableOpacity onPress={() => toggleExpand(index)}>
              <Text style={styles.disciplinaTitle}>
                {item.turmaDisciplinaProfessor.nomeDisciplina}
              </Text>
              <Text style={styles.professorText}>
                Professor: {item.turmaDisciplinaProfessor.nomeProfessor}
              </Text>
            </TouchableOpacity>

            {/* Detalhes do boletim */}
            {item.expanded && (
              <View style={styles.boletim}>
                <Text style={styles.sectionTitle}>Notas e Conceitos</Text>
                {[1, 2, 3, 4].map((unidade) => (
                  <View
                    key={unidade}
                    style={[
                      styles.boletimRow,
                      unidade % 2 === 0
                        ? styles.boletimRowEven
                        : styles.boletimRowOdd,
                    ]}
                  >
                    <Text style={styles.unidade}>Unidade {unidade}</Text>
                    <Text style={styles.conceito}>
                      {item[`conceitoNota${unidade}`] || "-"}
                    </Text>
                  </View>
                ))}

                <Text style={styles.sectionTitle}>
                  Nova Oportunidade de Aprendizado (NOA)
                </Text>
                {["1º Semestre", "2º Semestre", "Recuperação Final"].map(
                  (label, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.boletimRow,
                        idx % 2 === 0
                          ? styles.boletimRowEven
                          : styles.boletimRowOdd,
                      ]}
                    >
                      <Text style={styles.unidade}>NOA {label}</Text>
                      <Text style={styles.conceito}>
                        {item[`conceitoNoa${idx + 1}`] || "-"}
                      </Text>
                    </View>
                  )
                )}

                <Text style={styles.sectionTitle}>Resultado Final</Text>
                <View style={[styles.boletimRow, styles.boletimRowOdd]}>
                  <Text style={styles.unidade}>Média Final</Text>
                  <Text style={styles.conceito}>
                    {item.conceitoFinal || "-"}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.status,
                    item.aprovado
                      ? styles.statusAprovado
                      : styles.statusReprovado,
                  ]}
                >
                  {item.aprovado ? "Status: Aprovado" : "Status: Reprovado"}
                </Text>
              </View>
            )}
          </View>
        )}
      />
    </LayoutWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6C757D",
    marginTop: 8,
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
  alunoBox: {
    backgroundColor: "#0056B3",
    padding: 20,
    margin: 16,
    borderRadius: 8,
  },
  alunoInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  alunoTextContainer: {
    marginLeft: 12,
  },
  alunoName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
  },
  alunoInfo: {
    fontSize: 14,
    color: "#D0E8FF",
    marginTop: 4,
  },
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
  disciplinaTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007BFF",
  },
  professorText: {
    fontSize: 14,
    color: "#6C757D",
    marginTop: 4,
  },
  boletim: {
    marginTop: 16,
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CED4DA",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#343A40",
    marginBottom: 8,
  },
  boletimRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  boletimRowOdd: {
    backgroundColor: "#F8F9FA",
  },
  boletimRowEven: {
    backgroundColor: "#E9ECEF",
  },
  unidade: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#495057",
  },
  conceito: {
    fontSize: 14,
    color: "#007BFF",
  },
  status: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 16,
    textAlign: "center",
  },
  statusAprovado: {
    color: "#28A745",
  },
  statusReprovado: {
    color: "#DC3545",
  },
});

export default ConceitosAlunoScreen;
