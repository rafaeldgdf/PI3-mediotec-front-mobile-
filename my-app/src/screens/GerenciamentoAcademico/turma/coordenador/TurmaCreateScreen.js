import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Alert,
    StyleSheet,
} from 'react-native';
import { CheckBox } from 'react-native-elements';
import { Picker } from '@react-native-picker/picker';
import api from '../../../../api/api';
import LayoutWrapper from '../../../../components/LayoutWrapper';

const TurmaCreateScreen = ({ navigation }) => {
    const [anoLetivo, setAnoLetivo] = useState('');
    const [anoEscolar, setAnoEscolar] = useState('');
    const [turno, setTurno] = useState('');
    const [status, setStatus] = useState(true);
    const [coordenacaoId, setCoordenacaoId] = useState('');
    const [alunosSelecionados, setAlunosSelecionados] = useState([]);
    const [professoresSelecionados, setProfessoresSelecionados] = useState([]);
    const [associacaoDisciplinasProfessores, setAssociacaoDisciplinasProfessores] = useState([]);
    const [coordenacoes, setCoordenacoes] = useState([]);
    const [professores, setProfessores] = useState([]);
    const [disciplinas, setDisciplinas] = useState([]);
    const [alunos, setAlunos] = useState([]);
    const [professorSearch, setProfessorSearch] = useState('');
    const [alunoSearch, setAlunoSearch] = useState('');
    const [alunosExibidos, setAlunosExibidos] = useState(5);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [coordenacoesRes, professoresRes, disciplinasRes, alunosRes] = await Promise.all([
                api.get('/coordenacoes'),
                api.get('/professores'),
                api.get('/disciplinas'),
                api.get('/alunos'),
            ]);

            setCoordenacoes(coordenacoesRes.data.sort((a, b) => a.nome.localeCompare(b.nome)));
            setProfessores(professoresRes.data.sort((a, b) => a.nome.localeCompare(b.nome)));
            setDisciplinas(disciplinasRes.data.sort((a, b) => a.nome.localeCompare(b.nome)));
            setAlunos(alunosRes.data.sort((a, b) => a.nome.localeCompare(b.nome)));
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            Alert.alert('Erro', 'Falha ao carregar os dados.');
        }
    };

    const toggleSelection = (id, selectedIds, setSelectedIds) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((item) => item !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const associarDisciplinaAProfessor = (professorId, disciplinaId) => {
        setAssociacaoDisciplinasProfessores((prev) => {
            const index = prev.findIndex((assoc) => assoc.professorId === professorId);

            if (index >= 0) {
                const disciplinasAtualizadas = prev[index].disciplinasIds.includes(disciplinaId)
                    ? prev[index].disciplinasIds.filter((id) => id !== disciplinaId) // Desmarca se já está selecionado
                    : [...prev[index].disciplinasIds, disciplinaId]; // Marca a disciplina

                const novaLista = [...prev];
                novaLista[index] = { ...novaLista[index], disciplinasIds: disciplinasAtualizadas };
                return novaLista;
            } else {
                return [...prev, { professorId, disciplinasIds: [disciplinaId] }];
            }
        });
    };



    const handleVerMais = (setExibidos, atual) => {
        setExibidos(atual + 10);
    };

    const handleVerMenos = (setExibidos, atual) => {
        setExibidos(Math.max(atual - 10, 5));
    };
    const handleSave = async () => {
        if (!anoLetivo || !anoEscolar || !turno || !coordenacaoId) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        const payload = {
            anoLetivo: parseInt(anoLetivo, 10),
            anoEscolar,
            turno,
            status,
            coordenacaoId: parseInt(coordenacaoId, 10),
            alunosIds: alunosSelecionados.map((id) => parseInt(id, 10)),
            disciplinasProfessores: associacaoDisciplinasProfessores.map((assoc) => ({
                professorId: assoc.professorId,
                disciplinasIds: assoc.disciplinasIds,
            })),
        };

        console.log('Payload enviado:', payload);

        try {
            await api.post('/turmas', payload);
            Alert.alert('Sucesso', 'Turma criada com sucesso!');
            navigation.navigate('TurmaListScreen');
        } catch (error) {
            console.error('Erro ao criar turma:', error.response?.data || error.message);
            Alert.alert('Erro', 'Falha ao criar a turma. Verifique os dados.');
        }
    };

    return (
        <LayoutWrapper navigation={navigation}>
            <FlatList
                data={professores}
                keyExtractor={(item) => item.cpf}
                ListHeaderComponent={(
                    <View style={styles.container}>
                        <Text style={styles.title}>Cadastro de Turma</Text>
    
                        {/* Ano Letivo */}
                        <Text style={styles.sectionTitle}>Ano Letivo *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Digite o Ano Letivo (ex: 2024)"
                            value={anoLetivo}
                            onChangeText={setAnoLetivo}
                            keyboardType="numeric"
                        />
    
                        {/* Ano Escolar */}
                        <Text style={styles.sectionTitle}>Ano Escolar *</Text>
                        <Picker
                            selectedValue={anoEscolar}
                            style={styles.input}
                            onValueChange={(itemValue) => setAnoEscolar(itemValue)}
                        >
                            <Picker.Item label="Selecione o Ano Escolar" value="" />
                            <Picker.Item label="1º ano" value="1º ano" />
                            <Picker.Item label="2º ano" value="2º ano" />
                            <Picker.Item label="3º ano" value="3º ano" />
                        </Picker>
    
                        {/* Turno */}
                        <Text style={styles.sectionTitle}>Turno *</Text>
                        <Picker
                            selectedValue={turno}
                            style={styles.input}
                            onValueChange={(itemValue) => setTurno(itemValue)}
                        >
                            <Picker.Item label="Selecione o Turno" value="" />
                            <Picker.Item label="Matutino" value="Matutino" />
                            <Picker.Item label="Vespertino" value="Vespertino" />
                            <Picker.Item label="Noturno" value="Noturno" />
                        </Picker>
    
                        {/* Coordenação */}
                        <Text style={styles.sectionTitle}>Selecione uma Coordenação *</Text>
                        <FlatList
                            data={coordenacoes}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <CheckBox
                                    title={item.nome || 'Coordenação não disponível'}
                                    checked={coordenacaoId === item.id.toString()}
                                    onPress={() => setCoordenacaoId(item.id.toString())}
                                />
                            )}
                        />
    
                        {/* Alunos */}
                        <Text style={styles.sectionTitle}>Selecione Alunos</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Buscar Aluno"
                            value={alunoSearch}
                            onChangeText={setAlunoSearch}
                        />
                        <FlatList
                            data={alunos.slice(0, alunosExibidos).filter((aluno) =>
                                `${aluno.nome || ''} ${aluno.ultimoNome || ''}`.toLowerCase().includes(alunoSearch.toLowerCase())
                            )}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <CheckBox
                                    title={`${item.nome || ''} ${item.ultimoNome || ''}` || 'Aluno não disponível'}
                                    checked={alunosSelecionados.includes(item.id.toString())}
                                    onPress={() =>
                                        toggleSelection(item.id.toString(), alunosSelecionados, setAlunosSelecionados)
                                    }
                                />
                            )}
                        />
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={() => handleVerMais(setAlunosExibidos, alunosExibidos)}>
                                <Text style={styles.verMais}>Ver Mais</Text>
                            </TouchableOpacity>
                            {alunosExibidos > 5 && (
                                <TouchableOpacity onPress={() => handleVerMenos(setAlunosExibidos, alunosExibidos)}>
                                    <Text style={styles.verMenos}>Ver Menos</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                )}
                renderItem={({ item }) => (
                    <View>
                        {/* Professores */}
                        <TouchableOpacity
                            style={styles.expandableHeader}
                            onPress={() => {
                                setAssociacaoDisciplinasProfessores((prev) => {
                                    const index = prev.findIndex((assoc) => assoc.professorId === item.cpf);
    
                                    if (index >= 0) {
                                        // Se o professor já está expandido, colapsa sem alterar suas disciplinas
                                        return prev.map((assoc) =>
                                            assoc.professorId === item.cpf
                                                ? { ...assoc, expanded: !assoc.expanded }
                                                : assoc
                                        );
                                    } else {
                                        // Adiciona o professor como expandido com disciplinas vazias
                                        return [...prev, { professorId: item.cpf, disciplinasIds: [], expanded: true }];
                                    }
                                });
                            }}
                        >
                            <Text style={styles.expandableHeaderText}>
                                {item.nome ? `${item.nome} ${item.ultimoNome}` : 'Nome não disponível'}
                            </Text>
                        </TouchableOpacity>
    
                        {/* Disciplinas vinculadas */}
                        {associacaoDisciplinasProfessores.some((assoc) => assoc.professorId === item.cpf && assoc.expanded) && (
                            <FlatList
                                data={disciplinas}
                                keyExtractor={(disciplina) => disciplina.id.toString()}
                                renderItem={({ item: disciplina }) => {
                                    const professorAssociado = associacaoDisciplinasProfessores.find(
                                        (assoc) => assoc.professorId === item.cpf
                                    );
    
                                    return (
                                        <CheckBox
                                            title={disciplina.nome || 'Disciplina não disponível'}
                                            checked={professorAssociado?.disciplinasIds.includes(disciplina.id)}
                                            onPress={() => associarDisciplinaAProfessor(item.cpf, disciplina.id)}
                                        />
                                    );
                                }}
                            />
                        )}
                    </View>
                )}
                ListFooterComponent={(
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>Salvar</Text>
                    </TouchableOpacity>
                )}
            />
        </LayoutWrapper>
    );
    


};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#F4F4F4',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
        color: '#0056b3',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0056b3',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 12,
        height: 50,
        justifyContent: 'center',
        fontSize: 14,
    },
    selectedText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    saveButton: {
        backgroundColor: '#28A745',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    verMais: {
        color: '#007BFF',
        textAlign: 'center',
        marginVertical: 10,
        fontWeight: 'bold',
        fontSize: 14,
    },
    inputMini: {
        width: '48%',
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
        fontSize: 14,
        height: 50,
    },
    picker: {
        width: '100%',
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        paddingVertical: 12,
        marginBottom: 12,
        height: 50,
        justifyContent: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    loadingText: {
        fontSize: 16,
        color: '#007BFF',
        marginTop: 10,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    checkboxLabel: {
        fontSize: 14,
        color: '#333',
    },
    expandableHeader: {
        padding: 12,
        backgroundColor: '#f8f8f8',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    expandableHeaderText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0056b3',
    }
});


export default TurmaCreateScreen;
