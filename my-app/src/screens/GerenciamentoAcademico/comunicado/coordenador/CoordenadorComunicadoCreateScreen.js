import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ScrollView,
    FlatList,
    StyleSheet,
} from 'react-native';
import { CheckBox } from 'react-native-elements';
import api from '../../../../api/api';
import LayoutWrapper from '../../../../components/LayoutWrapper';
import DateTimePicker from '@react-native-community/datetimepicker';

const CoordenadorComunicadoCreateScreen = ({ navigation }) => {
    const [conteudo, setConteudo] = useState('');
    const [dataEnvio, setDataEnvio] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [alunos, setAlunos] = useState([]);
    const [turmas, setTurmas] = useState([]);
    const [alunosSelecionados, setAlunosSelecionados] = useState([]);
    const [turmasSelecionadas, setTurmasSelecionadas] = useState([]);
    const [searchAlunos, setSearchAlunos] = useState('');
    const [searchTurmas, setSearchTurmas] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAlunos();
        fetchTurmas();
    }, []);

    const fetchAlunos = async () => {
        try {
            const response = await api.get('/alunos');
            setAlunos(response.data);
        } catch (error) {
            Alert.alert('Erro', 'Falha ao carregar a lista de alunos.');
        }
    };

    const fetchTurmas = async () => {
        try {
            const response = await api.get('/turmas');
            setTurmas(response.data);
        } catch (error) {
            Alert.alert('Erro', 'Falha ao carregar a lista de turmas.');
        }
    };

    const toggleSelection = (id, selected, setSelected) => {
        if (selected.includes(id)) {
            setSelected(selected.filter((item) => item !== id));
        } else {
            setSelected([...selected, id]);
        }
    };

    const handleSaveComunicado = async () => {
        // Validar se os campos obrigatórios estão preenchidos
        if (!conteudo || (!alunosSelecionados.length && !turmasSelecionadas.length)) {
            Alert.alert('Erro', 'Preencha o conteúdo e selecione pelo menos um destinatário.');
            return;
        }
    
        // Construir o objeto do comunicado
        const comunicado = {
            conteudo,
            dataEnvio,
            alunoIds: alunosSelecionados,
            turmaIds: turmasSelecionadas,
        };
    
        setLoading(true);
        try {
            // Substituir pelo CPF correto do coordenador
            const coordenadorCpf = '123456'; // Use o valor correto aqui ou recupere dinamicamente
    
            // Enviar requisição para o endpoint
            const response = await api.post(`/comunicados/coordenador/${coordenadorCpf}`, comunicado);
    
            Alert.alert('Sucesso', 'Comunicado criado com sucesso.');
            navigation.goBack();
        } catch (error) {
            console.error('Erro ao criar comunicado:', error.response || error);
            Alert.alert('Erro', error.response?.data?.message || 'Falha ao criar o comunicado. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };
    

    return (
        <LayoutWrapper navigation={navigation}>
            <ScrollView style={styles.container}>
                <Text style={styles.title}>Criar Comunicado</Text>

                {/* Campo de Conteúdo */}
                <Text style={styles.label}>Conteúdo do Comunicado</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Digite o conteúdo do comunicado"
                    value={conteudo}
                    onChangeText={setConteudo}
                    multiline
                />

                {/* Data de Envio */}
                <Text style={styles.label}>Data de Envio</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePicker}>
                    <Text style={styles.datePickerText}>
                        {dataEnvio.toLocaleDateString('pt-BR')}
                    </Text>
                </TouchableOpacity>
                {showDatePicker && (
                    <DateTimePicker
                        value={dataEnvio}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            setShowDatePicker(false);
                            if (selectedDate) setDataEnvio(selectedDate);
                        }}
                    />
                )}

                {/* Seleção de Alunos */}
                <Text style={styles.label}>Selecionar Alunos</Text>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar aluno"
                    value={searchAlunos}
                    onChangeText={setSearchAlunos}
                />
                <FlatList
                    data={alunos.filter((aluno) =>
                        aluno.nome.toLowerCase().includes(searchAlunos.toLowerCase())
                    )}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.listItem}>
                            <CheckBox
                                title={item.nome} // Nome do aluno ou turma
                                checked={alunosSelecionados.includes(item.id)} // Verificar se está selecionado
                                onPress={() => toggleSelection(item.id, alunosSelecionados, setAlunosSelecionados)}
                            />
                            <Text>{item.nome}</Text>
                        </View>
                    )}
                />
                <Text style={styles.selectedText}>
                    Alunos Selecionados: {alunosSelecionados.join(', ')}
                </Text>

                {/* Seleção de Turmas */}
                <Text style={styles.label}>Selecionar Turmas</Text>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar turma"
                    value={searchTurmas}
                    onChangeText={setSearchTurmas}
                />
                <FlatList
                    data={turmas.filter((turma) =>
                        turma.nome.toLowerCase().includes(searchTurmas.toLowerCase())
                    )}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.listItem}>
                            <CheckBox
                                value={turmasSelecionadas.includes(item.id)}
                                onValueChange={() => toggleSelection(item.id, turmasSelecionadas, setTurmasSelecionadas)}
                            />
                            <Text>{item.nome}</Text>
                        </View>
                    )}
                />
                <Text style={styles.selectedText}>
                    Turmas Selecionadas: {turmasSelecionadas.join(', ')}
                </Text>

                {/* Botão de Salvar */}
                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSaveComunicado}
                    disabled={loading}
                >
                    <Text style={styles.saveButtonText}>{loading ? 'Salvando...' : 'Salvar Comunicado'}</Text>
                </TouchableOpacity>
            </ScrollView>
        </LayoutWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#F9F9F9',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0056b3',
        marginBottom: 16,
        textAlign: 'center',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#FFF',
        padding: 12,
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        marginBottom: 16,
    },
    datePicker: {
        backgroundColor: '#EEE',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        alignItems: 'center',
    },
    datePickerText: {
        fontSize: 16,
    },
    searchInput: {
        backgroundColor: '#FFF',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#DDD',
        marginBottom: 8,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    selectedText: {
        marginBottom: 16,
        fontStyle: 'italic',
    },
    saveButton: {
        backgroundColor: '#28A745',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default CoordenadorComunicadoCreateScreen;
