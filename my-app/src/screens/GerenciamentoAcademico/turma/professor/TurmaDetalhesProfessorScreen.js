import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    TextInput,
    TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LayoutWrapper from '../../../../components/LayoutWrapper';
import api from '../../../../api/api';

const TurmaDetalhesProfessorScreen = ({ route, navigation }) => {
    const { turma } = route.params;

    const [detalhesTurma, setDetalhesTurma] = useState(turma || {});
    const [disciplinasLecionadas, setDisciplinasLecionadas] = useState([]);
    const [mostrarTodasDisciplinas, setMostrarTodasDisciplinas] = useState(false);
    const [searchAlunos, setSearchAlunos] = useState('');
    const [filteredAlunos, setFilteredAlunos] = useState([]);
    const [mostrarTodosAlunos, setMostrarTodosAlunos] = useState(false);
    const [professorCpf, setProfessorCpf] = useState(null);

    useEffect(() => {
        recuperarProfessorCpf();
    }, []);

    useEffect(() => {
        if (professorCpf) {
            fetchTurmaCompleta();
        }
    }, [professorCpf]);

    useEffect(() => {
        filterAlunos();
    }, [searchAlunos, detalhesTurma]);

    /**
     * Recuperar o CPF do professor do AsyncStorage
     */
    const recuperarProfessorCpf = async () => {
        try {
            const userInfo = await AsyncStorage.getItem('userInfo');
            const { usuario } = JSON.parse(userInfo);
            console.log('CPF do professor recuperado:', usuario.cpf);
            setProfessorCpf(usuario.cpf);
        } catch (error) {
            console.error('Erro ao recuperar CPF do professor:', error);
            Alert.alert('Erro', 'Não foi possível recuperar os dados do professor.');
        }
    };

    /**
     * Buscar os detalhes completos da turma
     */
    const fetchTurmaCompleta = async () => {
        try {
            const response = await api.get(`/turmas/${turma.id}`);
            console.log('Dados da turma recebidos:', response.data);

            const dadosTurma = response.data;
            setDetalhesTurma(dadosTurma);

            // Filtrar disciplinas lecionadas na turma pelo professor atual
            const disciplinasDoProfessorNaTurma = dadosTurma.disciplinasProfessores.find(
                (professor) => professor.professorId === professorCpf
            );

            if (disciplinasDoProfessorNaTurma) {
                setDisciplinasLecionadas(disciplinasDoProfessorNaTurma.nomesDisciplinas || []);
            } else {
                setDisciplinasLecionadas([]);
            }
        } catch (error) {
            console.error('Erro ao buscar detalhes da turma:', error);
            Alert.alert('Erro', 'Não foi possível carregar os detalhes da turma.');
        }
    };

    /**
     * Filtrar alunos com base na pesquisa
     */
    const filterAlunos = () => {
        const alunos = detalhesTurma.alunos || [];
        const filtered = alunos.filter((aluno) =>
            [aluno.nomeAluno || '', aluno.email || '', aluno.id || '']
                .join(' ')
                .toLowerCase()
                .includes(searchAlunos.toLowerCase())
        );
        setFilteredAlunos(filtered);
    };

    const disciplinasVisiveis = mostrarTodasDisciplinas
        ? disciplinasLecionadas
        : disciplinasLecionadas.slice(0, 5);

    const alunosVisiveis = mostrarTodosAlunos ? filteredAlunos : filteredAlunos.slice(0, 5);

    return (
        <LayoutWrapper>
            <View style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.pageTitle}>{detalhesTurma.nome || 'Sem Nome'}</Text>
                        <Text style={styles.subtitle}>
                            {detalhesTurma.anoEscolar || 'Ano Escolar Não Informado'} -{' '}
                            {detalhesTurma.turno || 'Turno Não Informado'}
                        </Text>
                    </View>

                    {/* Informações Básicas */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            <Icon name="info" size={18} /> Informações Básicas
                        </Text>
                        <Text style={styles.infoText}>
                            <Icon name="badge" size={16} /> <Text style={styles.bold}>Nome:</Text>{' '}
                            {detalhesTurma.nome || 'Não informado'}
                        </Text>
                        <Text style={styles.infoText}>
                            <Icon name="school" size={16} /> <Text style={styles.bold}>Ano Escolar:</Text>{' '}
                            {detalhesTurma.anoEscolar || 'Não informado'}
                        </Text>
                        <Text style={styles.infoText}>
                            <Icon name="schedule" size={16} /> <Text style={styles.bold}>Turno:</Text>{' '}
                            {detalhesTurma.turno || 'Não informado'}
                        </Text>
                        <Text style={styles.infoText}>
                            <Icon name="event" size={16} /> <Text style={styles.bold}>Ano Letivo:</Text>{' '}
                            {detalhesTurma.anoLetivo || 'Não informado'}
                        </Text>
                    </View>

                    {/* Disciplinas Lecionadas */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            <Icon name="menu-book" size={18} /> Disciplinas Lecionadas
                        </Text>
                        {disciplinasVisiveis.map((disciplina, index) => (
                            <Text key={index} style={styles.infoText}>
                                <Icon name="book" size={16} /> {disciplina}
                            </Text>
                        ))}
                        {disciplinasLecionadas.length > 5 && (
                            <TouchableOpacity
                                onPress={() => setMostrarTodasDisciplinas(!mostrarTodasDisciplinas)}
                                style={styles.showMoreButton}
                            >
                                <Text style={styles.showMoreText}>
                                    {mostrarTodasDisciplinas ? 'Ver Menos' : 'Ver Mais'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Alunos */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            <Icon name="group" size={18} /> Alunos
                        </Text>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Buscar Alunos por Nome, Matrícula ou Email..."
                            value={searchAlunos}
                            onChangeText={setSearchAlunos}
                        />
                        {alunosVisiveis.map((aluno, index) => (
                            <View key={index} style={styles.infoBox}>
                                <Text style={styles.infoText}>
                                    <Icon name="person" size={16} /> <Text style={styles.bold}>Nome:</Text>{' '}
                                    {aluno.nomeAluno}
                                </Text>
                                <Text style={styles.infoText}>
                                    <Icon name="badge" size={16} /> <Text style={styles.bold}>Matrícula:</Text>{' '}
                                    {aluno.id || 'Não informado'}
                                </Text>
                                <Text style={styles.infoText}>
                                    <Icon name="email" size={16} /> <Text style={styles.bold}>Email:</Text>{' '}
                                    {aluno.email}
                                </Text>
                                <TouchableOpacity
                                    style={styles.addButtonMinimalist}
                                    onPress={() =>
                                        navigation.navigate('AlunoTurmaListConceitoScreen', {
                                            alunoId: aluno.id,
                                            turmaId: turma.id,
                                        })
                                    }
                                >
                                    <Text style={styles.addButtonTextMinimalist}>+ Adicionar Conceito</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                        {filteredAlunos.length > 5 && (
                            <TouchableOpacity
                                onPress={() => setMostrarTodosAlunos(!mostrarTodosAlunos)}
                                style={styles.showMoreButton}
                            >
                                <Text style={styles.showMoreText}>
                                    {mostrarTodosAlunos ? 'Ver Menos' : 'Ver Mais'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>
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
        marginBottom: 20,
    },
    pageTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFF',
        textTransform: 'uppercase',
    },
    subtitle: {
        fontSize: 16,
        color: '#FFF',
        fontStyle: 'italic',
        textAlign: 'center',
    },
    section: {
        backgroundColor: '#FFF',
        padding: 15,
        marginVertical: 10,
        borderRadius: 10,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0056b3',
        marginBottom: 10,
    },
    infoBox: {
        backgroundColor: '#F9F9F9',
        padding: 15,
        borderRadius: 8,
        marginVertical: 5,
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    infoText: {
        fontSize: 14,
        marginBottom: 4,
        color: '#444',
    },
    bold: {
        fontWeight: 'bold',
    },
    searchInput: {
        marginBottom: 10,
        backgroundColor: '#FFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#CCC',
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 14,
    },
    showMoreButton: {
        marginTop: 10,
        alignItems: 'center',
    },
    showMoreText: {
        color: '#0056b3',
        fontWeight: 'bold',
    },
    addButton: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 8,
        marginTop: 10,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
    addButtonMinimalist: {
        borderWidth: 1,
        borderColor: '#007bff',
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 10,
        marginTop: 10,
        alignItems: 'center',
        backgroundColor: 'transparent', // Sem preenchimento
    },
    addButtonTextMinimalist: {
        color: '#007bff',
        fontWeight: 'bold',
        fontSize: 14,
    },
});

export default TurmaDetalhesProfessorScreen;
