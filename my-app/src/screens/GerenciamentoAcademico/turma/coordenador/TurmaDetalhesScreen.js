import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
    TextInput,
    Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LayoutWrapper from '../../../../components/LayoutWrapper';
import api from '../../../../api/api';

const TurmaDetalhesScreen = ({ route, navigation }) => {
    const { turma } = route.params;

    const [detalhesTurma, setDetalhesTurma] = useState(turma || {});
    const [searchAlunos, setSearchAlunos] = useState('');
    const [searchProfessores, setSearchProfessores] = useState('');
    const [filteredAlunos, setFilteredAlunos] = useState([]);
    const [filteredProfessores, setFilteredProfessores] = useState([]);
    const [status, setStatus] = useState(turma?.status || false);
    const [alunosVisiveis, setAlunosVisiveis] = useState(5);
    const [professoresVisiveis, setProfessoresVisiveis] = useState(5);

    useEffect(() => {
        fetchTurmaCompleta();
    }, []);

    useEffect(() => {
        filterAlunos();
    }, [searchAlunos, detalhesTurma]);

    useEffect(() => {
        filterProfessores();
    }, [searchProfessores, detalhesTurma]);

    const fetchTurmaCompleta = async () => {
        try {
            const response = await api.get(`/turmas/${turma.id}`);
            if (response.data) {
                setDetalhesTurma({
                    ...response.data,
                    alunos: response.data.alunos || [],
                    disciplinasProfessores: response.data.disciplinasProfessores || [],
                });
                setStatus(response.data.status || false);
            }
        } catch (error) {
            console.error('Erro ao buscar turma:', error);
            Alert.alert('Erro', 'Não foi possível carregar os detalhes da turma.');
        }
    };
    const filterAlunos = () => {
        const alunos = detalhesTurma.alunos || [];
        const filtered = alunos
            .filter((aluno) =>
                [aluno.nomeAluno || '', aluno.matricula || '', aluno.email || '']
                    .join(' ')
                    .toLowerCase()
                    .includes(searchAlunos.toLowerCase())
            )
            .sort((a, b) => a.nomeAluno.localeCompare(b.nomeAluno));
        setFilteredAlunos(filtered);
    };

    const filterProfessores = () => {
        const professores = detalhesTurma.disciplinasProfessores || [];
        const filtered = professores
            .filter((professor) =>
                [
                    professor.nomeProfessor || '',
                    ...(professor.nomesDisciplinas || []),
                    professor.email || '',
                ]
                    .join(' ')
                    .toLowerCase()
                    .includes(searchProfessores.toLowerCase())
            )
            .sort((a, b) => a.nomeProfessor.localeCompare(b.nomeProfessor));
        setFilteredProfessores(filtered);
    };

    const toggleStatus = async () => {
        try {
            const novoStatus = !status;
            await api.patch(`/turmas/${detalhesTurma.id}/status`, novoStatus, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            setStatus(novoStatus);
            Alert.alert('Sucesso', `Status alterado para ${novoStatus ? 'Ativo' : 'Inativo'}.`);
        } catch (error) {
            console.error('Erro ao alterar status:', error);
            Alert.alert('Erro', 'Não foi possível alterar o status da turma.');
        }
    };

    const handleVerMaisAlunos = () => {
        setAlunosVisiveis(alunosVisiveis + 5);
    };

    const handleVerMenosAlunos = () => {
        setAlunosVisiveis(Math.max(alunosVisiveis - 5, 5));
    };

    const handleVerMaisProfessores = () => {
        setProfessoresVisiveis(professoresVisiveis + 5);
    };

    const handleVerMenosProfessores = () => {
        setProfessoresVisiveis(Math.max(professoresVisiveis - 5, 5));
    };

    const handleDelete = () => {
        Alert.alert(
            'Confirmação',
            'Tem certeza que deseja deletar esta turma?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Deletar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/turmas/${detalhesTurma.id}`);
                            Alert.alert('Sucesso', 'Turma deletada com sucesso.');
                            navigation.goBack();
                        } catch (error) {
                            console.error('Erro ao deletar turma:', error);
                            Alert.alert('Erro', 'Falha ao deletar turma.');
                        }
                    },
                },
            ]
        );
    };
    return (
        <LayoutWrapper navigation={navigation} handleLogout={() => navigation.navigate('LoginScreen')}>
            <View style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.pageTitle}>{detalhesTurma.nome || 'Sem Nome'}</Text>
                        <Text style={styles.subtitle}>
                            {detalhesTurma.anoEscolar || 'Ano Escolar Não Informado'} - {detalhesTurma.turno || 'Turno Não Informado'}
                        </Text>
                        <TouchableOpacity style={styles.editIcon} onPress={() => navigation.navigate('TurmaCreateScreen', { turma: detalhesTurma })}>
                            <Icon name="edit" size={20} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    {/* Informações Básicas */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            <Icon name="info" size={18} /> Informações Básicas
                        </Text>
                        <Text style={styles.infoText}>
                            <Icon name="badge" size={16} /> <Text style={styles.bold}>Nome:</Text> {detalhesTurma.nome || 'Não informado'}
                        </Text>
                        <Text style={styles.infoText}>
                            <Icon name="school" size={16} /> <Text style={styles.bold}>Ano Escolar:</Text>{' '}
                            {detalhesTurma.anoEscolar || 'Não informado'}
                        </Text>
                        <Text style={styles.infoText}>
                            <Icon name="schedule" size={16} /> <Text style={styles.bold}>Turno:</Text> {detalhesTurma.turno || 'Não informado'}
                        </Text>
                        <Text style={styles.infoText}>
                            <Icon name="event" size={16} /> <Text style={styles.bold}>Ano Letivo:</Text> {detalhesTurma.anoLetivo || 'Não informado'}
                        </Text>
                    </View>

                    {/* Alunos */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            <Icon name="group" size={18} /> Alunos
                        </Text>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Buscar Alunos..."
                            value={searchAlunos}
                            onChangeText={setSearchAlunos}
                        />
                        {filteredAlunos.slice(0, alunosVisiveis).map((aluno, index) => (
                            <View key={index} style={styles.infoBox}>
                                    <Text style={styles.infoText}>
                                        <Icon name="person" size={16} /> <Text style={styles.bold}>Nome:</Text> {aluno.nomeAluno}
                                    </Text>
                                    <Text style={styles.infoText}>
                                        <Icon name="badge" size={16} /> <Text style={styles.bold}>Matrícula:</Text> {aluno.id}
                                    </Text>
                                    <Text style={styles.infoText}>
                                        <Icon name="email" size={16} /> <Text style={styles.bold}>Email:</Text> {aluno.email}
                                    </Text>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => navigation.navigate('AlunoDetalhesScreen', { aluno })}
                                >
                                    <Icon name="info" size={16} color="#FFF" />
                                    <Text style={styles.buttonText}>Abrir Detalhes</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                        {filteredAlunos.length > alunosVisiveis && (
                            <TouchableOpacity onPress={handleVerMaisAlunos}>
                                <Text style={styles.verMais}>Ver Mais Alunos</Text>
                            </TouchableOpacity>
                        )}
                        {alunosVisiveis > 5 && (
                            <TouchableOpacity onPress={handleVerMenosAlunos}>
                                <Text style={styles.verMenos}>Ver Menos Alunos</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Professores e Disciplinas */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            <Icon name="school" size={18} /> Professores e Disciplinas
                        </Text>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Buscar Professores..."
                            value={searchProfessores}
                            onChangeText={setSearchProfessores}
                        />
                        {filteredProfessores.slice(0, professoresVisiveis).map((professor, index) => (
                            <View key={index} style={styles.infoBox}>
                                <Text style={styles.infoText}>
                                    <Icon name="person" size={16} /> <Text style={styles.bold}>Professor:</Text> {professor.nomeProfessor}
                                </Text>
                                <Text style={styles.infoText}>
                                    <Icon name="book" size={16} /> <Text style={styles.bold}>Disciplinas:</Text>{' '}
                                    {professor.nomesDisciplinas ? professor.nomesDisciplinas.join(', ') : 'Nenhuma'}
                                </Text>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => navigation.navigate('ProfessorDetalhesScreen', { cpf: professor.professorId })}
                                >
                                    <Icon name="info" size={16} color="#FFF" />
                                    <Text style={styles.buttonText}>Abrir Detalhes</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                        {filteredProfessores.length > professoresVisiveis && (
                            <TouchableOpacity onPress={handleVerMaisProfessores}>
                                <Text style={styles.verMais}>Ver Mais Professores</Text>
                            </TouchableOpacity>
                        )}
                        {professoresVisiveis > 5 && (
                            <TouchableOpacity onPress={handleVerMenosProfessores}>
                                <Text style={styles.verMenos}>Ver Menos Professores</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>

                {/* Botões de Ação */}
                <View style={styles.fixedButtonContainer}>
                    <TouchableOpacity style={[styles.button, styles.editButton]} onPress={() => navigation.navigate('TurmaCreateScreen', { turma: detalhesTurma })}>
                        <Icon name="edit" size={16} color="#FFF" />
                        <Text style={styles.buttonText}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDelete}>
                        <Icon name="delete" size={16} color="#FFF" />
                        <Text style={styles.buttonText}>Deletar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </LayoutWrapper>
    );

};

const styles = StyleSheet.create({
    scrollContent: {
        padding: 16,
        backgroundColor: '#F4F4F4',
        paddingBottom: 80, // Adiciona espaço para os botões fixos
    },
    header: {
        backgroundColor: '#0056b3',
        paddingVertical: 30,
        alignItems: 'center',
        position: 'relative',
        marginBottom: 20,
    },
    editIcon: {
        position: 'absolute',
        top: 10,
        right: 20,
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 50,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 3,
        elevation: 5,
    },
    pageTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 5,
        textAlign: 'center',
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
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0056b3',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#DDD',
        paddingBottom: 5,
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
        lineHeight: 20, // Melhora a legibilidade
    },
    bold: {
        fontWeight: 'bold',
        color: '#000',
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
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    statusText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#444',
    },
    actionButton: {
        marginTop: 10,
        backgroundColor: '#007BFF',
        borderRadius: 5,
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
        elevation: 5,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    fixedButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 12,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#DDD',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 3 },
        elevation: 5,
        marginHorizontal: 10,
        width: '45%', // Para botões proporcionais e alinhados
    },
    editButton: {
        backgroundColor: '#28A745',
        borderRadius: 12, // Para bordas arredondadas
    },
    deleteButton: {
        backgroundColor: '#DC3545',
        borderRadius: 12,
    },
    verMais: {
        color: '#007BFF',
        textAlign: 'center',
        marginTop: 10,
        fontSize: 14,
        fontWeight: 'bold',
    },
    verMenos: {
        color: '#FF4500',
        textAlign: 'center',
        marginTop: 10,
        fontSize: 14,
        fontWeight: 'bold',
    }
});

export default TurmaDetalhesScreen;
