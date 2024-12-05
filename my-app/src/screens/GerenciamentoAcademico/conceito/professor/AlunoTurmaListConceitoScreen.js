import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    Alert,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../../../../api/api';

const AlunoTurmaListConceitoScreen = ({ route, navigation }) => {
    const { turmaId } = route.params;
    const [turma, setTurma] = useState(null);
    const [disciplina, setDisciplina] = useState(null);
    const [professor, setProfessor] = useState(null);
    const [conceitos, setConceitos] = useState({});
    const [expanded, setExpanded] = useState({});
    const [editable, setEditable] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState(''); // Filtro para a listagem

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        try {
            setLoading(true);
            const userInfo = await AsyncStorage.getItem('userInfo');
            const { usuario } = JSON.parse(userInfo);

            const turmaResponse = await api.get(`/turmas/${turmaId}`);
            const turmaData = turmaResponse.data;

            const disciplinaResponse = await api.get(
                `/disciplinas/professores/${usuario.cpf}/disciplinas`
            );
            const disciplinas = disciplinaResponse.data;

            const disciplinaDoProfessor = disciplinas.find((d) => d.turma?.id === turmaId);

            if (!disciplinaDoProfessor) {
                throw new Error('Disciplina atribuída ao professor não encontrada.');
            }

            setTurma({
                ...turmaData,
                alunos: turmaData.alunos.sort((a, b) =>
                    a.nomeAluno.localeCompare(b.nomeAluno)
                ),
            });

            setDisciplina({
                id: disciplinaDoProfessor.idDisciplina,
                nome: disciplinaDoProfessor.nome,
                idTurma: disciplinaDoProfessor.idTurma,
                idProfessor: disciplinaDoProfessor.idProfessor,
            });

            setProfessor({
                nome: usuario.nome,
                ultimoNome: usuario.ultimoNome,
            });
            


            const conceitosIniciais = {};
            const estadoEditableInicial = {};

            for (const aluno of turmaData.alunos) {
                try {
                    const conceitoResponse = await api.get(
                        `/conceitos/conceitos/${disciplinaDoProfessor.idProfessor}/aluno/${aluno.id}/disciplina/${disciplinaDoProfessor.idDisciplina}/turma/${disciplinaDoProfessor.idTurma}`
                    );
                    const conceito = conceitoResponse.data;

                    conceitosIniciais[aluno.id] = {
                        notaUnidade1: conceito.notaUnidade1 ?? '',
                        notaUnidade2: conceito.notaUnidade2 ?? '',
                        notaUnidade3: conceito.notaUnidade3 ?? '',
                        notaUnidade4: conceito.notaUnidade4 ?? '',
                        noa1: conceito.noa1 ?? '',
                        noa2: conceito.noa2 ?? '',
                        noaFinal: conceito.noaFinal ?? '',
                        mediaFinal: conceito.mediaFinal ?? '',
                        aprovado: conceito.aprovado ? 'Aprovado' : 'Reprovado',
                    };
                } catch {
                    conceitosIniciais[aluno.id] = {
                        notaUnidade1: '',
                        notaUnidade2: '',
                        notaUnidade3: '',
                        notaUnidade4: '',
                        noa1: '',
                        noa2: '',
                        noaFinal: '',
                        mediaFinal: '',
                        aprovado: 'Pendente',
                    };
                }

                estadoEditableInicial[aluno.id] = false;
            }

            setConceitos(conceitosIniciais);
            setEditable(estadoEditableInicial);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            Alert.alert('Erro', 'Não foi possível carregar as informações da turma.');
        } finally {
            setLoading(false);
        }
    };

    const atualizarConceito = (alunoId, campo, valor) => {
        setConceitos((prevConceitos) => ({
            ...prevConceitos,
            [alunoId]: {
                ...prevConceitos[alunoId],
                [campo]: valor,
            },
        }));
    };

    const salvarConceitoIndividual = async (alunoId) => {
        try {
            const conceitoAluno = conceitos[alunoId];

            const valoresPreenchidos = Object.values(conceitoAluno).some(
                (valor) => valor && parseFloat(valor) > 0
            );

            if (!valoresPreenchidos) {
                Alert.alert('Erro', 'Por favor, preencha pelo menos um campo antes de salvar.');
                return;
            }

            const payload = {
                notaUnidade1: conceitoAluno.notaUnidade1 || 0,
                notaUnidade2: conceitoAluno.notaUnidade2 || 0,
                notaUnidade3: conceitoAluno.notaUnidade3 || 0,
                notaUnidade4: conceitoAluno.notaUnidade4 || 0,
                noa1: conceitoAluno.noa1 || 0,
                noa2: conceitoAluno.noa2 || 0,
                noaFinal: conceitoAluno.noaFinal || 0,
            };

            const url = `/conceitos/${disciplina.idProfessor}/aluno/${alunoId}/disciplina/${disciplina.id}/turma/${disciplina.idTurma}/conceitos`;

            await api.post(url, payload);

            Alert.alert(
                'Sucesso',
                `Conceito salvo para ${turma.alunos.find((a) => a.id === alunoId).nomeAluno}.`
            );

            setEditable((prevEditable) => ({
                ...prevEditable,
                [alunoId]: false,
            }));
        } catch (error) {
            console.error('Erro ao salvar conceito:', error);
            Alert.alert('Erro', 'Não foi possível salvar o conceito para o aluno.');
        }
    };

    const toggleFilter = (selectedFilter) => {
        setFilter((prevFilter) => (prevFilter === selectedFilter ? '' : selectedFilter));
    };

    const filtrarAlunos = () => {
        let filteredAlunos = turma?.alunos || [];

        if (searchTerm) {
            filteredAlunos = filteredAlunos.filter(
                (aluno) =>
                    aluno.nomeAluno.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    aluno.id.toString().includes(searchTerm)
            );
        }

        switch (filter) {
            case 'aprovados':
                filteredAlunos = filteredAlunos.filter(
                    (aluno) => conceitos[aluno.id]?.aprovado === 'Aprovado'
                );
                break;
            case 'reprovados':
                filteredAlunos = filteredAlunos.filter(
                    (aluno) => conceitos[aluno.id]?.aprovado === 'Reprovado'
                );
                break;
            case 'pendentes':
                filteredAlunos = filteredAlunos.filter(
                    (aluno) => conceitos[aluno.id]?.aprovado === 'Pendente'
                );
                break;
            case 'noa1':
                filteredAlunos = filteredAlunos.filter(
                    (aluno) =>
                        conceitos[aluno.id]?.notaUnidade1 < 7 ||
                        conceitos[aluno.id]?.notaUnidade2 < 7
                );
                break;
            case 'noa2':
                filteredAlunos = filteredAlunos.filter(
                    (aluno) =>
                        conceitos[aluno.id]?.notaUnidade3 < 7 ||
                        conceitos[aluno.id]?.notaUnidade4 < 7
                );
                break;
            case 'noafinal':
                filteredAlunos = filteredAlunos.filter(
                    (aluno) =>
                        conceitos[aluno.id]?.mediaFinal >= 5 &&
                        conceitos[aluno.id]?.mediaFinal < 7
                );
                break;
            default:
                break;
        }

        return filteredAlunos;
    };


    const toggleExpand = (alunoId) => {
        setExpanded((prevExpanded) => ({
            ...prevExpanded,
            [alunoId]: !prevExpanded[alunoId],
        }));
    };

    const refreshPage = () => {
        carregarDados();
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007BFF" />
                    <Text style={styles.loadingText}>Carregando...</Text>
                </View>
            ) : (
                <>
                    {/* Cabeçalho */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>{`Conceitos - ${turma?.nome}`}</Text>
                            <Text style={styles.subtitle}>{`Disciplina: ${disciplina?.nome}`}</Text>
                            <Text style={styles.subtitle}>
                            {`Professor: ${professor?.nome} ${professor?.ultimoNome}`}
                            </Text>

                        </View>
                        <TouchableOpacity
                            style={styles.helpButton}
                            onPress={() => navigation.navigate('HelpScreen')}
                        >
                            <Icon name="help-outline" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    {/* Barra de busca */}
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Buscar por nome ou matrícula..."
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                        />
                        <TouchableOpacity onPress={refreshPage} style={styles.refreshButton}>
                            <Icon name="refresh" size={20} color="#007bff" />
                        </TouchableOpacity>
                    </View>

                    {/* Filtros minimalistas */}
                    <View style={styles.filterContainer}>
                        <View style={styles.filterRow}>
                            <TouchableOpacity
                                style={[
                                    styles.filterBox,
                                    filter === 'aprovados' && styles.filterBoxActive,
                                ]}
                                onPress={() => toggleFilter('aprovados')}
                            >
                                <Icon name="check-circle" size={20} color="#007bff" />
                                <Text style={styles.filterText}>Aprovados</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.filterBox,
                                    filter === 'reprovados' && styles.filterBoxActive,
                                ]}
                                onPress={() => toggleFilter('reprovados')}
                            >
                                <Icon name="cancel" size={20} color="#ff4444" />
                                <Text style={styles.filterText}>Reprovados</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.filterBox,
                                    filter === 'pendentes' && styles.filterBoxActive,
                                ]}
                                onPress={() => toggleFilter('pendentes')}
                            >
                                <Icon name="hourglass-empty" size={20} color="#ffc107" />
                                <Text style={styles.filterText}>Pendentes</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.filterRow}>
                            <TouchableOpacity
                                style={[
                                    styles.filterBox,
                                    filter === 'noa1' && styles.filterBoxActive,
                                ]}
                                onPress={() => toggleFilter('noa1')}
                            >
                                <Icon name="school" size={20} color="#ffc107" />
                                <Text style={styles.filterText}>NOA1</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.filterBox,
                                    filter === 'noa2' && styles.filterBoxActive,
                                ]}
                                onPress={() => toggleFilter('noa2')}
                            >
                                <Icon name="trending-down" size={20} color="#ff9800" />
                                <Text style={styles.filterText}>NOA2</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.filterBox,
                                    filter === 'noafinal' && styles.filterBoxActive,
                                ]}
                                onPress={() => toggleFilter('noafinal')}
                            >
                                <Icon name="bar-chart" size={20} color="#3f51b5" />
                                <Text style={styles.filterText}>NOA Final</Text>
                            </TouchableOpacity>
                        </View>
                    </View>


                    {/* Lista de alunos */}
                    <FlatList
                        data={filtrarAlunos()}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.card}>
                                <TouchableOpacity onPress={() => toggleExpand(item.id)}>
                                    <Text style={styles.cardTitle}>
                                        {item.nomeAluno}{' '}
                                        <Text style={styles.matricula}>
                                            - Matrícula: {item.id}
                                        </Text>
                                    </Text>
                                </TouchableOpacity>
                                {expanded[item.id] && (
                                    <View style={styles.details}>
                                        <Text
                                            style={[
                                                styles.status,
                                                conceitos[item.id]?.aprovado === 'Aprovado'
                                                    ? styles.statusApproved
                                                    : styles.statusFailed,
                                            ]}
                                        >
                                            {conceitos[item.id]?.aprovado}
                                        </Text>
                                        <Text style={styles.media}>
                                            Média Final: {conceitos[item.id]?.mediaFinal}
                                        </Text>
                                        {/* Notas detalhadas */}
                                        <View style={styles.gradeRow}>
                                            <Text style={styles.gradeLabel}>1ª Unid.</Text>
                                            <TextInput
                                                style={[
                                                    styles.input,
                                                    editable[item.id] ? {} : styles.inputDisabled,
                                                ]}
                                                value={conceitos[item.id]?.notaUnidade1?.toString()}
                                                editable={editable[item.id]}
                                                onChangeText={(text) =>
                                                    atualizarConceito(item.id, 'notaUnidade1', text)
                                                }
                                            />
                                        </View>
                                        <View style={styles.gradeRow}>
                                            <Text style={styles.gradeLabel}>2ª Unid.</Text>
                                            <TextInput
                                                style={[
                                                    styles.input,
                                                    editable[item.id] ? {} : styles.inputDisabled,
                                                ]}
                                                value={conceitos[item.id]?.notaUnidade2?.toString()}
                                                editable={editable[item.id]}
                                                onChangeText={(text) =>
                                                    atualizarConceito(item.id, 'notaUnidade2', text)
                                                }
                                            />
                                        </View>
                                        <View style={styles.gradeRow}>
                                            <Text style={styles.gradeLabel}>3ª Unid.</Text>
                                            <TextInput
                                                style={[
                                                    styles.input,
                                                    editable[item.id] ? {} : styles.inputDisabled,
                                                ]}
                                                value={conceitos[item.id]?.notaUnidade3?.toString()}
                                                editable={editable[item.id]}
                                                onChangeText={(text) =>
                                                    atualizarConceito(item.id, 'notaUnidade3', text)
                                                }
                                            />
                                        </View>
                                        <View style={styles.gradeRow}>
                                            <Text style={styles.gradeLabel}>4ª Unid.</Text>
                                            <TextInput
                                                style={[
                                                    styles.input,
                                                    editable[item.id] ? {} : styles.inputDisabled,
                                                ]}
                                                value={conceitos[item.id]?.notaUnidade4?.toString()}
                                                editable={editable[item.id]}
                                                onChangeText={(text) =>
                                                    atualizarConceito(item.id, 'notaUnidade4', text)
                                                }
                                            />
                                        </View>
                                        <View style={styles.gradeRow}>
                                            <Text style={styles.gradeLabel}>NOA1</Text>
                                            <TextInput
                                                style={[
                                                    styles.input,
                                                    editable[item.id] ? {} : styles.inputDisabled,
                                                ]}
                                                value={conceitos[item.id]?.noa1?.toString()}
                                                editable={editable[item.id]}
                                                onChangeText={(text) =>
                                                    atualizarConceito(item.id, 'noa1', text)
                                                }
                                            />
                                        </View>
                                        <View style={styles.gradeRow}>
                                            <Text style={styles.gradeLabel}>NOA2</Text>
                                            <TextInput
                                                style={[
                                                    styles.input,
                                                    editable[item.id] ? {} : styles.inputDisabled,
                                                ]}
                                                value={conceitos[item.id]?.noa2?.toString()}
                                                editable={editable[item.id]}
                                                onChangeText={(text) =>
                                                    atualizarConceito(item.id, 'noa2', text)
                                                }
                                            />
                                        </View>
                                        <View style={styles.gradeRow}>
                                            <Text style={styles.gradeLabel}>NOA Final</Text>
                                            <TextInput
                                                style={[
                                                    styles.input,
                                                    editable[item.id] ? {} : styles.inputDisabled,
                                                ]}
                                                value={conceitos[item.id]?.noaFinal?.toString()}
                                                editable={editable[item.id]}
                                                onChangeText={(text) =>
                                                    atualizarConceito(item.id, 'noaFinal', text)
                                                }
                                            />
                                        </View>

                                        {/* Botões de ação */}
                                        <View style={styles.buttonContainer}>
                                            <TouchableOpacity
                                                style={styles.editButton}
                                                onPress={() =>
                                                    setEditable((prev) => ({
                                                        ...prev,
                                                        [item.id]: true,
                                                    }))
                                                }
                                            >
                                                <Icon name="edit" size={24} color="#FFF" />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.saveButton}
                                                onPress={() => salvarConceitoIndividual(item.id)}
                                            >
                                                <Icon name="save" size={24} color="#FFF" />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.detailsButton}
                                                onPress={() =>
                                                    navigation.navigate('ConceitosDetalhesProfessorScreen', {
                                                        idAluno: item.id, // Identificador do aluno
                                                        idDisciplina: disciplina.id, // Identificador da disciplina
                                                    })
                                                }
                                            >
                                                <Icon name="info" size={24} color="#FFF" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                            </View>
                        )}
                    />
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'column',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#0056b3',
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '400',
        color: '#d1e7fd',
        textAlign: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#ced4da',
        backgroundColor: '#ffffff',
        borderRadius: 10,
        paddingHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 8,
        fontSize: 16,
        color: '#495057',
    },
    refreshButton: {
        marginLeft: 8,
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#e9ecef',
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterContainer: {
        marginHorizontal: 16,
        marginTop: 10,
    },
    filterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    filterBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '30%',
        paddingVertical: 10,
        backgroundColor: '#e9ecef',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ced4da',
        elevation: 2,
    },
    filterBoxActive: {
        backgroundColor: '#007bff',
        borderColor: '#0056b3',
    },
    filterText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
        color: '#495057',
    },
    filterTextActive: {
        color: '#ffffff',
    },
    card: {
        marginHorizontal: 16,
        marginBottom: 8,
        padding: 16,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#dee2e6',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#343a40',
    },
    matricula: {
        fontWeight: '400',
        color: '#6c757d',
    },
    details: {
        marginTop: 12,
    },
    status: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statusApproved: {
        color: '#28a745',
    },
    statusFailed: {
        color: '#dc3545',
    },
    media: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#495057',
    },
    gradeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    gradeLabel: {
        width: '35%',
        fontSize: 14,
        fontWeight: 'bold',
        color: '#495057',
    },
    input: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#ced4da',
        borderRadius: 8,
        padding: 8,
        fontSize: 14,
        color: '#495057',
    },
    inputDisabled: {
        backgroundColor: '#e9ecef',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    editButton: {
        flex: 1,
        backgroundColor: '#ffc107',
        paddingVertical: 10,
        marginRight: 4,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#28a745',
        paddingVertical: 10,
        marginLeft: 4,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    detailsButton: {
        flex: 1,
        backgroundColor: '#007bff',
        paddingVertical: 10,
        marginLeft: 4,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 18,
        color: '#007bff',
    },
});


export default AlunoTurmaListConceitoScreen;
