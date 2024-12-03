import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
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

const TurmaListProfessorScreen = ({ navigation }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [turmas, setTurmas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [nomeProfessor, setNomeProfessor] = useState('');
    const [ultimoNomeProfessor, setUltimoNomeProfessor] = useState('');

    useEffect(() => {
        recuperarDadosProfessor();
    }, []);

    /**
     * Recuperar dados do professor logado (nome e CPF)
     */
    const recuperarDadosProfessor = async () => {
        setLoading(true);
        try {
            const userInfo = await AsyncStorage.getItem('userInfo');
            const { usuario } = JSON.parse(userInfo);

            // Define o nome e o último nome do professor para o título
            setNomeProfessor(usuario.nome);
            setUltimoNomeProfessor(usuario.ultimoNome);

            await fetchTurmasEDisciplinas(usuario.cpf); // Busca as turmas e disciplinas com base no CPF
        } catch (error) {
            console.error('Erro ao recuperar os dados do professor:', error);
            Alert.alert('Erro', 'Não foi possível carregar as informações do professor.');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Buscar turmas e disciplinas do professor logado
     */
    const fetchTurmasEDisciplinas = async (cpf) => {
        try {
            // Buscar turmas atribuídas ao professor
            const turmasResponse = await api.get(`/turmas/professores/${cpf}/turmas`);
            const turmasData = turmasResponse.data;

            // Buscar disciplinas lecionadas pelo professor
            const disciplinasResponse = await api.get(`/disciplinas/professores/${cpf}/disciplinas`);
            const disciplinasData = disciplinasResponse.data;

            // Mapear as disciplinas para cada turma
            const turmasComDisciplinas = turmasData.map((turma) => {
                const disciplinasDaTurma = disciplinasData
                    .filter((disciplina) => disciplina.turma.id === turma.id) // Filtra disciplinas da turma
                    .map((disciplina) => disciplina.nome); // Extrai o nome da disciplina
                return { ...turma, disciplinas: disciplinasDaTurma };
            });

            setTurmas(turmasComDisciplinas);
        } catch (error) {
            console.error('Erro ao buscar turmas e disciplinas do professor:', error);
            Alert.alert('Erro', 'Falha ao carregar as turmas e disciplinas do professor.');
        }
    };

    /**
     * Filtrar turmas pelo termo de busca
     */
    const filteredTurmas = turmas.filter((turma) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            turma.nome.toLowerCase().includes(searchLower) ||
            turma.anoEscolar.toLowerCase().includes(searchLower) ||
            turma.turno.toLowerCase().includes(searchLower) ||
            turma.anoLetivo.toString().includes(searchLower) || // Busca no ano letivo
            turma.disciplinas.some((disciplina) => disciplina.toLowerCase().includes(searchLower)) // Busca nas disciplinas
        );
    });

    return (
        <LayoutWrapper navigation={navigation} handleLogout={() => navigation.navigate('LoginScreen')}>
            {/* Título da Página */}
            <View style={styles.titleContainer}>
                <Text style={styles.pageTitle}>
                    <Icon name="list" size={24} color="#0056b3" /> Turmas do Prof. {nomeProfessor} {ultimoNomeProfessor}
                </Text>
                <Text style={styles.subtitle}>
                    Visualize as turmas atribuídas a você.
                </Text>
            </View>

            {/* Barra de Pesquisa */}
            <TextInput
                style={styles.searchInput}
                placeholder="Buscar Turma"
                value={searchTerm}
                onChangeText={setSearchTerm}
            />

            {/* Lista de Turmas */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007BFF" />
                    <Text style={styles.loadingText}>Carregando...</Text>
                </View>
            ) : filteredTurmas.length > 0 ? (
                <FlatList
                    data={filteredTurmas}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            {/* Informações da Turma */}
                            <Text style={styles.cardTitle}>{`${item.nome}`}</Text>
                            <Text style={styles.cardInfo}>
                                <Icon name="calendar-today" size={16} /> <Text style={styles.bold}>Ano Escolar:</Text> {item.anoEscolar}
                            </Text>
                            <Text style={styles.cardInfo}>
                                <Icon name="access-time" size={16} /> <Text style={styles.bold}>Turno:</Text> {item.turno}
                            </Text>
                            <Text style={styles.cardInfo}>
                                <Icon name="date-range" size={16} /> <Text style={styles.bold}>Ano Letivo:</Text> {item.anoLetivo}
                            </Text>
                            <Text style={styles.cardInfo}>
                                <Icon name="menu-book" size={16} /> <Text style={styles.bold}>Disciplinas Lecionadas:</Text>{' '}
                                {item.disciplinas.length > 0 ? item.disciplinas.join(', ') : 'Nenhuma'}
                            </Text>

                            {/* Botão de Detalhes */}
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={[styles.cardButton, styles.openButton]}
                                    onPress={() =>
                                        navigation.navigate('TurmaDetalhesProfessorScreen', {
                                            turma: item,
                                        })
                                    }
                                >
                                    <Icon name="open-in-new" size={18} color="#FFF" />
                                    <Text style={styles.buttonText}>Abrir</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            ) : (
                <Text style={styles.emptyText}>Nenhuma turma encontrada.</Text>
            )}
        </LayoutWrapper>
    );
};

const styles = StyleSheet.create({
    titleContainer: {
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
    searchInput: {
        backgroundColor: '#FFF',
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#DDD',
        fontSize: 14,
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
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingBottom: 4,
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
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    cardButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        flex: 1,
        marginHorizontal: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    openButton: {
        backgroundColor: '#28A745',
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

export default TurmaListProfessorScreen;
