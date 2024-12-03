import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Alert,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../../../../api/api';
import LayoutWrapper from '../../../../components/LayoutWrapper';

const SelecaoTurmaDisciplinaScreen = ({ navigation }) => {
    const [disciplinas, setDisciplinas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [nomeProfessor, setNomeProfessor] = useState('');
    const [ultimoNomeProfessor, setUltimoNomeProfessor] = useState('');
    const [cpfProfessor, setCpfProfessor] = useState('');


    useEffect(() => {
        const inicializarDados = async () => {
            try {
                await recuperarDadosProfessor();
            } catch (error) {
                console.error('Erro ao inicializar os dados do professor:', error);
                Alert.alert(
                    'Erro',
                    'Não foi possível carregar as informações do professor. Verifique sua conexão e tente novamente.',
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
            }
        };

        inicializarDados();
    }, []);

    const recuperarDadosProfessor = async () => {
        setLoading(true);
        try {
            const userInfo = await AsyncStorage.getItem('userInfo');
            if (!userInfo) {
                throw new Error('Informações do professor não encontradas.');
            }
    
            const parsedUserInfo = JSON.parse(userInfo);
    
            if (!parsedUserInfo.usuario) {
                throw new Error('Estrutura de dados inválida. Propriedade "usuario" não encontrada.');
            }
    
            const { usuario } = parsedUserInfo;
            console.log('Usuário recuperado:', usuario);
    
            setNomeProfessor(usuario.nome || 'Nome não definido');
            setUltimoNomeProfessor(usuario.ultimoNome || '');
            setCpfProfessor(usuario.cpf || ''); // Certifique-se de que cpf está correto
            console.log('CPF do Professor:', usuario.cpf);
    
            await fetchDisciplinas(usuario.cpf);
        } catch (error) {
            console.error('Erro ao recuperar dados do professor:', error.message || error);
            throw error;
        } finally {
            setLoading(false);
        }
    };
    

    const fetchDisciplinas = async (cpf) => {
        try {
            const response = await api.get(`/disciplinas/professores/${cpf}/disciplinas`);
            setDisciplinas(response.data);
        } catch (error) {
            console.error('Erro ao buscar disciplinas:', error);
            Alert.alert('Erro', 'Não foi possível carregar as disciplinas associadas ao professor.');
            throw error; // Lança o erro para tratamento externo
        }
    };

    return (
        <LayoutWrapper navigation={navigation} handleLogout={() => navigation.navigate('LoginScreen')}>
            {/* Cabeçalho */}
            <View style={styles.header}>
                <Text style={styles.pageTitle}>
                    <Icon name="list" size={24} color="#0056b3" /> Seleção de Turmas e Disciplinas
                </Text>
                <Text style={styles.subtitle}>Escolha a turma e disciplina para registrar presenças.</Text>
            </View>

            {/* Carregamento */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007BFF" />
                    <Text style={styles.loadingText}>Carregando...</Text>
                </View>
            ) : disciplinas.length > 0 ? (
                <FlatList
                    data={disciplinas}
                    keyExtractor={(item, index) => `${item.turma.id}-${index}`}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            {/* Nome da Turma */}
                            <Text style={styles.cardTitle}>{item.turma.nome}</Text>
                            {/* Nome da Disciplina */}
                            <Text style={styles.cardInfo}>
                                <Icon name="menu-book" size={16} />{' '}
                                <Text style={styles.bold}>Disciplina:</Text> {item.nome}
                            </Text>
                            {/* Ano Escolar */}
                            <Text style={styles.cardInfo}>
                                <Icon name="calendar-today" size={16} />{' '}
                                <Text style={styles.bold}>Ano Escolar:</Text> {item.turma.anoEscolar}
                            </Text>

                            {/* Botão para abrir o histórico */}
                            <TouchableOpacity
                                style={[styles.cardButton, styles.historyButton]}
                                onPress={() =>
                                    navigation.navigate('HistoricoChamadaScreen', {
                                        turmaId: item.turma.id,
                                        disciplinaId: item.idDisciplina,
                                        turmaNome: item.turma.nome,
                                        disciplinaNome: item.nome,
                                        anoEscolar: item.turma.anoEscolar,
                                        professorNome: `${nomeProfessor} ${ultimoNomeProfessor}`,
                                        professorId: cpfProfessor,
                                    })
                                }
                            >
                                <Icon name="history" size={18} color="#FFF" />
                                <Text style={styles.buttonText}>Abrir Histórico</Text>
                            </TouchableOpacity>

                            {/* Botão para registrar presença */}
                            <TouchableOpacity
                                style={[styles.cardButton, styles.openButton]}
                                onPress={() =>
                                    navigation.navigate('RegistroPresencaScreen', {
                                        turmaId: item.turma.id,
                                        disciplinaId: item.idDisciplina,
                                    })
                                }
                            >
                                <Icon name="arrow-forward" size={18} color="#FFF" />
                                <Text style={styles.buttonText}>Registrar Presenças</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            ) : (
                <Text style={styles.emptyText}>Nenhuma disciplina encontrada.</Text>
            )}
        </LayoutWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        marginVertical: 20,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0056b3',
        textAlign: 'center',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#FFF',
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0056b3',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    cardInfo: {
        fontSize: 14,
        color: '#444',
        marginBottom: 8,
    },
    bold: {
        fontWeight: 'bold',
        color: '#333',
    },
    cardButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    openButton: {
        backgroundColor: '#28A745',
    },
    historyButton: {
        backgroundColor: '#007BFF',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        color: '#666',
        marginTop: 20,
        fontStyle: 'italic',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
    loadingText: {
        fontSize: 16,
        color: '#007BFF',
        marginTop: 10,
    },
});

export default SelecaoTurmaDisciplinaScreen;
