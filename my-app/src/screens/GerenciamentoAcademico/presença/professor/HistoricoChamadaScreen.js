import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../../../../api/api';
import LayoutWrapper from '../../../../components/LayoutWrapper';
import { format } from 'date-fns';

const HistoricoChamadaScreen = ({ route, navigation }) => {
    const { turmaId, disciplinaId, turmaNome, disciplinaNome, anoEscolar, professorNome, professorId } = route.params;
    const [historico, setHistorico] = useState([]);
    const [filteredHistorico, setFilteredHistorico] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState({}); // Controla quais itens estão expandidos
    const [searchQuery, setSearchQuery] = useState(''); // Query de busca

    useEffect(() => {
        console.log('Parâmetros recebidos em HistoricoChamadaScreen:', route.params);
        console.log('ProfessorId recebido:', professorId);
        fetchHistorico();
    }, []);

    /**
     * Busca o histórico de chamadas para a turma e disciplina selecionadas
     */
    const fetchHistorico = async () => {
        setLoading(true);
        try {
            const response = await api.get(
                `/presencas/historico/turma/${turmaId}/disciplina/${disciplinaId}`
            );
    
            // Ordena os alunos por nome em cada registro de data
            const historicoOrdenado = response.data.map((registro) => ({
                ...registro,
                alunos: registro.alunos.sort((a, b) => a.nome.localeCompare(b.nome)),
            }));
    
            setHistorico(historicoOrdenado);
            setFilteredHistorico(historicoOrdenado);
        } catch (error) {
            console.error('Erro ao buscar histórico:', error);
            Alert.alert('Erro', 'Não foi possível carregar o histórico de chamadas.');
        } finally {
            setLoading(false);
        }
    };
    
    

    /**
     * Alterna o estado de expansão de um item específico
     */
    const toggleExpand = (index) => {
        setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
    };

    /**
     * Obtém o dia da semana a partir de uma data
     */
    const getDayOfWeek = (dateString) => {
        const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        const date = new Date(dateString.split('/').reverse().join('-')); // Converte a data para formato válido
        return days[date.getDay()];
    };

    /**
     * Filtra o histórico com base na query de busca
     */
    const handleSearch = (query) => {
        setSearchQuery(query);
        if (query.trim() === '') {
            setFilteredHistorico(historico);
        } else {
            const filtered = historico.filter((item) =>
                item.data.includes(query)
            );
            setFilteredHistorico(filtered);
        }
    };

    /**
     * Converte data para o formato esperado pelo backend
     */
    const formatDate = (dateString) => {
        if (!dateString) {
            console.error("Erro: data inválida recebida.");
            return '';
        }
    
        const date = new Date(dateString);
        if (isNaN(date)) {
            console.error("Erro: data inválida ao criar objeto Date.");
            return '';
        }
    
        const day = String(date.getDate()).padStart(2, '0'); // Garantir 2 dígitos
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Meses começam em 0
        const year = date.getFullYear();
    
        return `${day}/${month}/${year}`; // Retorna o formato dd/MM/yyyy
    };
    

    /**
     * Atualiza a presença do aluno
     */

    const togglePresenca = async (aluno, data) => {
        console.log('Aluno recebido:', aluno);
        console.log('ProfessorId recebido:', professorId);
    
        if (!aluno.idAluno || !aluno.idPresenca) {
            Alert.alert('Erro', 'ID do aluno ou presença não encontrado.');
            return;
        }
    
        const novaPresenca = !aluno.presenca;
        const mensagem = `Deseja trocar presença do aluno ${aluno.nome} de ${aluno.presenca ? 'presente' : 'ausente'} para ${novaPresenca ? 'presente' : 'ausente'}?`;
    
        Alert.alert(
            'Confirmar Alteração',
            mensagem,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar',
                    onPress: async () => {
                        try {
                            // Converte a string de data em um objeto Date, se necessário
                            let parsedDate;
                            if (typeof data === 'string') {
                                const parts = data.split('/'); // Supondo formato dd/MM/yyyy
                                parsedDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`); // yyyy-MM-dd
                            } else {
                                parsedDate = new Date(data);
                            }
    
                            if (isNaN(parsedDate)) {
                                throw new Error('Data inválida.');
                            }
    
                            const dataFormatada = format(parsedDate, 'dd/MM/yyyy');
                            console.log('Parâmetros enviados para atualização:', {
                                idPresenca: aluno.idPresenca,
                                idAluno: aluno.idAluno,
                                turmaId,
                                disciplinaId,
                                professorId,
                                data: dataFormatada,
                                presenca: novaPresenca,
                            });
    
                            await api.put(`/presencas/${aluno.idPresenca}/aluno/${aluno.idAluno}/turma/${turmaId}/disciplina/${disciplinaId}/professor/${professorId}`, {
                                data: dataFormatada,
                                presenca: novaPresenca,
                            });
    
                            Alert.alert('Sucesso', 'Presença atualizada com sucesso!');
                            fetchHistorico(); // Recarrega o histórico
                        } catch (error) {
                            console.error('Erro ao atualizar presença:', error.response || error.message);
                            const errorMessage = error.response?.data?.message || 'Não foi possível atualizar a presença.';
                            Alert.alert('Erro', errorMessage);
                        }
                    },
                },
            ]
        );
    };
      

    return (
        <LayoutWrapper navigation={navigation} handleLogout={() => navigation.navigate('LoginScreen')}>
            {/* Cabeçalho */}
            <View style={styles.header}>
                <Text style={styles.pageTitle}>
                    <Icon name="history" size={24} color="#0056b3" /> Histórico de Chamadas
                </Text>
                <Text style={styles.subtitle}>Veja os registros de presença por data.</Text>
            </View>

            {/* Informações da turma */}
            <View style={styles.infoContainer}>
                <Text style={styles.infoText}><Icon name="school" size={16} /> Turma: <Text style={styles.bold}>{turmaNome}</Text></Text>
                <Text style={styles.infoText}><Icon name="menu-book" size={16} /> Disciplina: <Text style={styles.bold}>{disciplinaNome}</Text></Text>
                <Text style={styles.infoText}><Icon name="person" size={16} /> Professor: <Text style={styles.bold}>{professorNome}</Text></Text>
                <Text style={styles.infoText}><Icon name="calendar-today" size={16} /> Ano Escolar: <Text style={styles.bold}>{anoEscolar}</Text></Text>
            </View>

            {/* Campo de busca */}
            <View style={styles.searchContainer}>
                <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar por data (DD/MM/AAAA)"
                    value={searchQuery}
                    onChangeText={handleSearch}
                />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007BFF" />
                    <Text style={styles.loadingText}>Carregando...</Text>
                </View>
            ) : filteredHistorico.length > 0 ? (
                <FlatList
                    data={filteredHistorico}
                    keyExtractor={(item, index) => `${item.data}-${index}`}
                    renderItem={({ item, index }) => (
                        <View style={styles.card}>
                            {/* Cabeçalho do registro com a data e dia da semana */}
                            <TouchableOpacity onPress={() => toggleExpand(index)} style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>
                                    <Icon name="calendar-today" size={18} color="#0056b3" /> {item.data}
                                </Text>
                                <Text style={styles.cardSubtitle}>
                                    {getDayOfWeek(item.data)}
                                </Text>
                                <Icon
                                    name={expanded[index] ? 'expand-less' : 'expand-more'}
                                    size={20}
                                    color="#666"
                                />
                            </TouchableOpacity>

                            {/* Lista de alunos, visível apenas quando expandido */}
                            {expanded[index] && (
                                <FlatList
                                    data={item.alunos}
                                    keyExtractor={(aluno, alunoIndex) => `${aluno.idAluno}-${alunoIndex}`}
                                    renderItem={({ item: aluno }) => (
                                        <View style={styles.alunoRow}>
                                            <Text style={styles.alunoName}>
                                                {aluno.nome}
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.presencaStatus,
                                                    aluno.presenca ? styles.presente : styles.ausente,
                                                ]}
                                            >
                                                {aluno.presenca ? 'Presente' : 'Ausente'}
                                            </Text>
                                            {/* Botão de editar */}
                                            <TouchableOpacity
                                                onPress={() => togglePresenca(aluno, item.data)}
                                            >
                                                <Icon name="edit" size={20} color="#007BFF" />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                />
                            )}
                        </View>
                    )}
                />
            ) : (
                <Text style={styles.emptyText}>Nenhum registro de chamada encontrado.</Text>
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
    infoContainer: {
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 10,
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        borderColor: '#E5E5E5',
        borderWidth: 1,
    },
    infoText: {
        fontSize: 14,
        color: '#333',
        marginBottom: 4,
    },
    bold: {
        fontWeight: 'bold',
        color: '#0056b3',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 20, // Adicione esta margem inferior
        borderWidth: 1,
        borderColor: '#ced4da', // Cinza claro
        backgroundColor: '#ffffff',
        borderRadius: 10,
        paddingHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3, // Sombra para o Android
    },    
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 8,
        fontSize: 16,
        color: '#495057', // Cinza mais escuro para o texto
    },
    card: {
        backgroundColor: '#FFF',
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
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0056b3',
    },
    cardSubtitle: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
    },
    alunoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomColor: '#E5E5E5',
        borderBottomWidth: 1,
    },
    alunoName: {
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
    presencaStatus: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    presente: {
        color: '#28A745',
    },
    ausente: {
        color: '#DC3545',
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
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        color: '#666',
        marginTop: 20,
        fontStyle: 'italic',
    },
});

export default HistoricoChamadaScreen;
