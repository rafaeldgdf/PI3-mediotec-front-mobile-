import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    ScrollView,
    Alert,
    StyleSheet,
} from 'react-native';
import { CheckBox } from 'react-native-elements';
import { Picker } from '@react-native-picker/picker';
import api from '../../../api/api';
import LayoutWrapper from '../../../components/LayoutWrapper';

const TurmaCreateScreen = ({ navigation }) => {
    const [anoLetivo, setAnoLetivo] = useState('');
    const [anoEscolar, setAnoEscolar] = useState('');
    const [turno, setTurno] = useState('');
    const [status, setStatus] = useState(true);
    const [coordenacaoId, setCoordenacaoId] = useState('');
    const [alunosSelecionados, setAlunosSelecionados] = useState([]);
    const [professoresSelecionados, setProfessoresSelecionados] = useState([]);
    const [disciplinasSelecionadas, setDisciplinasSelecionadas] = useState([]);

    const [coordenacoes, setCoordenacoes] = useState([]);
    const [professores, setProfessores] = useState([]);
    const [disciplinas, setDisciplinas] = useState([]);
    const [alunos, setAlunos] = useState([]);

    const [professorSearch, setProfessorSearch] = useState('');
    const [disciplinaSearch, setDisciplinaSearch] = useState('');
    const [alunoSearch, setAlunoSearch] = useState('');
    const [coordenacaoSearch, setCoordenacaoSearch] = useState('');


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

            setCoordenacoes(coordenacoesRes.data);
            setProfessores(professoresRes.data);
            setDisciplinas(disciplinasRes.data);
            setAlunos(alunosRes.data);
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

    const handleSave = async () => {
        // Verificação apenas dos campos obrigatórios
        if (!anoLetivo || !anoEscolar || !turno || !coordenacaoId) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
            return;
        }
    
        // Construção do payload com listas opcionais
        const payload = {
            anoLetivo: parseInt(anoLetivo, 10),
            anoEscolar,
            turno,
            status,
            coordenacaoId: parseInt(coordenacaoId, 10),
            alunosIds: alunosSelecionados.length > 0 
                ? alunosSelecionados.map((id) => parseInt(id, 10)) 
                : [], // Lista vazia se nenhum aluno foi selecionado
            disciplinasProfessores: professoresSelecionados.length > 0 
                ? professoresSelecionados.map((professorId) => ({
                    professorId,
                    disciplinasIds: disciplinasSelecionadas.length > 0 
                        ? disciplinasSelecionadas.map((id) => parseInt(id, 10)) 
                        : [], // Lista vazia se nenhuma disciplina foi selecionada
                }))
                : [], // Lista vazia se nenhum professor foi selecionado
        };
    
        console.log('Payload enviado para o backend:', JSON.stringify(payload, null, 2));
    
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
            <ScrollView nestedScrollEnabled={true} style={styles.container}>
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
                    onValueChange={setTurno}
                >
                    <Picker.Item label="Selecione o Turno" value="" />
                    <Picker.Item label="Matutino" value="Matutino" />
                    <Picker.Item label="Vespertino" value="Vespertino" />
                    <Picker.Item label="Noturno" value="Noturno" />
                </Picker>
                {/* Coordenação */}
                <Text style={styles.sectionTitle}>Selecione uma Coordenação *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Buscar Coordenação"
                    value={coordenacaoSearch}
                    onChangeText={setCoordenacaoSearch}
                />
                <FlatList
                    data={coordenacoes.filter((coord) =>
                        coord.nome.toLowerCase().includes(coordenacaoSearch.toLowerCase())
                    )}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <CheckBox
                            title={item.nome}
                            checked={coordenacaoId === item.id.toString()}
                            onPress={() => setCoordenacaoId(item.id.toString())}
                        />
                    )}
                />
                <Text style={styles.selectedText}>
                    Selecionada: {coordenacoes.find((coord) => coord.id.toString() === coordenacaoId)?.nome || 'Nenhuma'}
                </Text>


                {/* Alunos */}
                <Text style={styles.sectionTitle}>Alunos</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Buscar Aluno"
                    value={alunoSearch}
                    onChangeText={setAlunoSearch}
                />
                <FlatList
                    data={alunos.filter((aluno) =>
                        `${aluno.nome} ${aluno.ultimoNome} ${aluno.email}`
                            .toLowerCase()
                            .includes(alunoSearch.toLowerCase())
                    )}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <CheckBox
                            title={`${item.nome} ${item.ultimoNome} (${item.email})`}
                            checked={alunosSelecionados.includes(item.id.toString())}
                            onPress={() =>
                                toggleSelection(item.id.toString(), alunosSelecionados, setAlunosSelecionados)
                            }
                        />
                    )}
                />
                <Text style={styles.selectedText}>
                    Selecionados: {alunos
                        .filter((aluno) => alunosSelecionados.includes(aluno.id.toString()))
                        .map((aluno) => `${aluno.nome} ${aluno.ultimoNome}`)
                        .join(', ') || 'Nenhum'}
                </Text>


                {/* Professores */}
                <Text style={styles.sectionTitle}>Professores</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Buscar Professor"
                    value={professorSearch}
                    onChangeText={setProfessorSearch}
                />
                <FlatList
                    data={professores.filter((prof) =>
                        `${prof.nome} ${prof.ultimoNome} ${prof.email}`
                            .toLowerCase()
                            .includes(professorSearch.toLowerCase())
                    )}
                    keyExtractor={(item) => item.cpf}
                    renderItem={({ item }) => (
                        <CheckBox
                            title={`${item.nome} ${item.ultimoNome} (${item.email})`}
                            checked={professoresSelecionados.includes(item.cpf)}
                            onPress={() =>
                                toggleSelection(item.cpf, professoresSelecionados, setProfessoresSelecionados)
                            }
                        />
                    )}
                />
                <Text style={styles.selectedText}>
                    Selecionados: {professores
                        .filter((prof) => professoresSelecionados.includes(prof.cpf))
                        .map((prof) => `${prof.nome} ${prof.ultimoNome}`)
                        .join(', ') || 'Nenhum'}
                </Text>

                {/* Disciplinas */}
                <Text style={styles.sectionTitle}>Disciplinas</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Buscar Disciplina (Nome ou ID)"
                    value={disciplinaSearch}
                    onChangeText={setDisciplinaSearch}
                />
                <FlatList
                    data={disciplinas.filter((disciplina) =>
                        disciplina.nome.toLowerCase().includes(disciplinaSearch.toLowerCase()) ||
                        disciplina.id.toString().includes(disciplinaSearch)
                    )}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <CheckBox
                            title={`${item.nome} (ID: ${item.id})`} // Mostra o nome e o ID na lista
                            checked={disciplinasSelecionadas.includes(item.id.toString())}
                            onPress={() =>
                                toggleSelection(item.id.toString(), disciplinasSelecionadas, setDisciplinasSelecionadas)
                            }
                        />
                    )}
                />
                <Text style={styles.selectedText}>
                    Selecionados: {disciplinas
                        .filter((disciplina) =>
                            disciplinasSelecionadas.includes(disciplina.id.toString())
                        )
                        .map((disciplina) => disciplina.nome) // Apenas o nome nas selecionadas
                        .join(', ') || 'Nenhuma'}
                </Text>

                {/* Botão de Salvar */}
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Salvar</Text>
                </TouchableOpacity>
            </ScrollView>
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
        paddingHorizontal: 12, // Adiciona espaçamento horizontal para evitar corte
        marginBottom: 12,
        height: 50, // Ajusta a altura para comportar o texto adequadamente
        justifyContent: 'center', // Alinha o texto no centro vertical
        fontSize: 14, // Mantém o texto com tamanho legível
    },
    inputMini: {
        width: '48%', // Padroniza a largura
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
        fontSize: 14,
        height: 50, // Padroniza a altura
    },
    picker: {
        width: '100%',
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        paddingVertical: 12,
        marginBottom: 12,
        height: 50, // Altura mínima para o picker
        justifyContent: 'center', // Alinha o texto no centro verticalmente
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
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default TurmaCreateScreen;
