import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Alert,
    StyleSheet,
    ActivityIndicator,
    TextInput,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../../../../api/api';
import { format } from 'date-fns';

const RegistroPresencaScreen = ({ route, navigation }) => {
    const { turmaId, disciplinaId } = route.params;
    const [alunos, setAlunos] = useState([]);
    const [professor, setProfessor] = useState({});
    const [presencas, setPresencas] = useState({});
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        try {
            setLoading(true);
    
            // Recupera os dados do professor logado
            const userInfo = await AsyncStorage.getItem('userInfo');
            const { usuario } = JSON.parse(userInfo);
    
            if (!usuario || !usuario.cpf) {
                throw new Error("CPF do professor não encontrado.");
            }
    
            setProfessor({
                nome: usuario.nome,
                ultimoNome: usuario.ultimoNome,
                cpf: usuario.cpf, // Adicione o CPF aqui
            });
    
            // Carregar alunos da turma
            const response = await api.get(`/turmas/${turmaId}`);
            const turmaData = response.data;
    
            const alunosOrdenados = turmaData.alunos.sort((a, b) =>
                a.nomeAluno.localeCompare(b.nomeAluno)
            );
    
            // Inicializar presenças como false
            const presencasIniciais = {};
            alunosOrdenados.forEach((aluno) => {
                presencasIniciais[aluno.id] = false;
            });
    
            setAlunos(alunosOrdenados);
            setPresencas(presencasIniciais);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            Alert.alert("Erro", "Não foi possível carregar os dados.");
        } finally {
            setLoading(false);
        }
    };
    

    const togglePresenca = (alunoId) => {
        setPresencas((prevPresencas) => ({
            ...prevPresencas,
            [alunoId]: !prevPresencas[alunoId],
        }));
    };

    const salvarPresencas = async () => {
        try {
            const dataFormatada = format(selectedDate, 'dd/MM/yyyy');
    
            // Iterar sobre cada aluno e enviar a presença individualmente
            for (const alunoId in presencas) {
                const payload = {
                    data: dataFormatada,
                    presenca: presencas[alunoId],
                };
    
                console.log(`Enviando presença do aluno ${alunoId}:`, payload);
    
                await api.post(
                    `/presencas/aluno/${alunoId}/turma/${turmaId}/disciplina/${disciplinaId}/professor/${professor.cpf}`,
                    payload
                );
            }
    
            Alert.alert('Sucesso', 'Presenças salvas com sucesso!');
            navigation.goBack();
        } catch (error) {
            console.error('Erro ao salvar presenças:', error.response?.data || error.message);
            Alert.alert('Erro', 'Não foi possível salvar as presenças.');
        }
    };
    
    

    const filtrarAlunos = () => {
        let alunosFiltrados = alunos;

        if (searchTerm) {
            alunosFiltrados = alunosFiltrados.filter(
                (aluno) =>
                    aluno.nomeAluno.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    aluno.id.toString().includes(searchTerm)
            );
        }

        if (filter === 'presentes') {
            alunosFiltrados = alunosFiltrados.filter((aluno) => presencas[aluno.id]);
        } else if (filter === 'ausentes') {
            alunosFiltrados = alunosFiltrados.filter((aluno) => !presencas[aluno.id]);
        }

        return alunosFiltrados;
    };

    const handleDateChange = (event, selected) => {
        setShowDatePicker(false);
        if (selected) {
            setSelectedDate(selected);
        }
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
                        <Text style={styles.title}>Presenças - Turma {turmaId}</Text>
                        <Text style={styles.subtitle}>
                            Disciplina: Filosofia
                        </Text>
                        <Text style={styles.subtitle}>
                            Professor: {professor.nome} {professor.ultimoNome}
                        </Text>
                    </View>

                    {/* Barra de Busca */}
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Buscar por nome ou matrícula..."
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                        />
                        <TouchableOpacity onPress={carregarDados} style={styles.refreshButton}>
                            <Icon name="refresh" size={20} color="#007bff" />
                        </TouchableOpacity>
                    </View>

                    {/* Filtros */}
                    <View style={styles.filterContainer}>
                        <TouchableOpacity
                            style={[
                                styles.filterButton,
                                filter === 'presentes' && styles.filterButtonActive,
                            ]}
                            onPress={() =>
                                setFilter((prev) => (prev === 'presentes' ? '' : 'presentes'))
                            }
                        >
                            <Icon name="check-circle" size={20} color="#28a745" />
                            <Text style={styles.filterText}>Presentes</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.filterButton,
                                filter === 'ausentes' && styles.filterButtonActive,
                            ]}
                            onPress={() =>
                                setFilter((prev) => (prev === 'ausentes' ? '' : 'ausentes'))
                            }
                        >
                            <Icon name="cancel" size={20} color="#dc3545" />
                            <Text style={styles.filterText}>Ausentes</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Seletor de Data */}
                    <View style={styles.dateContainer}>
                        <Text style={styles.dateLabel}>Selecionar data:</Text>
                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Icon name="event" size={24} color="#007bff" />
                            <Text style={styles.dateText}>
                                {selectedDate.toLocaleDateString()}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Lista de Alunos */}
                    <FlatList
                        data={filtrarAlunos()}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.card}>
                                <Text style={styles.cardTitle}>
                                    <Text style={styles.bold}>{item.nomeAluno}</Text> -{' '}
                                    <Text style={styles.matricula}>
                                        Matrícula: {item.id}
                                    </Text>
                                </Text>
                                <TouchableOpacity
                                    onPress={() => togglePresenca(item.id)}
                                >
                                    <Icon
                                        name={presencas[item.id] ? 'check-circle' : 'cancel'}
                                        size={24}
                                        color={presencas[item.id] ? '#28a745' : '#dc3545'}
                                    />
                                </TouchableOpacity>
                            </View>
                        )}
                    />

                    {/* Botão de Salvar */}
                    <TouchableOpacity style={styles.saveButton} onPress={salvarPresencas}>
                        <Icon name="save" size={24} color="#FFF" />
                        <Text style={styles.saveButtonText}>Salvar Presenças</Text>
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker
                            value={selectedDate}
                            mode="date"
                            display="default"
                            onChange={handleDateChange}
                        />
                    )}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa', // Fundo claro
    },
    header: {
        alignItems: 'center',
        paddingVertical: 16,
        backgroundColor: '#0056b3', // Azul forte
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 4,
        elevation: 3, // Sombra para Android
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff', // Branco para o título
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '400',
        color: '#d1e7fd', // Azul claro para subtítulos
        textAlign: 'center',
        marginTop: 4,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#ced4da', // Cinza claro
        backgroundColor: '#ffffff',
        borderRadius: 10,
        paddingHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3, // Sombra para o Android
    },
    searchInput: {
        flex: 1,
        paddingVertical: 8,
        fontSize: 16,
        color: '#495057', // Cinza mais escuro para o texto
    },
    refreshButton: {
        marginLeft: 8,
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#e9ecef', // Cinza claro para o botão
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginHorizontal: 16,
        marginVertical: 16,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#ced4da', // Borda cinza clara
        backgroundColor: '#e9ecef', // Fundo cinza claro
        borderRadius: 8,
    },
    filterButtonActive: {
        backgroundColor: '#007bff', // Azul para filtros ativos
        borderColor: '#0056b3', // Azul mais escuro para a borda
    },
    filterText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
        color: '#495057', // Cinza escuro para o texto
    },
    filterTextActive: {
        color: '#ffffff', // Texto branco quando ativo
    },
    dateContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 16,
        paddingHorizontal: 16,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#495057', // Cinza escuro
        marginRight: 8,
    },
    dateText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#007bff', // Azul
        textDecorationLine: 'underline',
    },
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        backgroundColor: '#ffffff', // Fundo branco
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#dee2e6', // Cinza claro
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#343a40', // Cinza escuro
    },
    matricula: {
        fontSize: 14,
        fontWeight: '400',
        color: '#6c757d', // Cinza mais claro
    },
    saveButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
        marginHorizontal: 16,
        marginBottom: 16,
        backgroundColor: '#007BFF', // Azul para o botão
        borderRadius: 8,
        elevation: 3, // Sombra para Android
    },
    saveButtonText: {
        marginLeft: 8,
        color: '#FFF', // Texto branco
        fontWeight: 'bold',
        fontSize: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 18,
        color: '#007bff', // Azul claro para o texto
    },
});

export default RegistroPresencaScreen;