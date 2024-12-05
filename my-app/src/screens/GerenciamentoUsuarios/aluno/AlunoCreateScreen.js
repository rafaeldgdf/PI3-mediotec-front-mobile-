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
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CheckBox } from 'react-native-elements';
import api from '../../../api/api';
import LayoutWrapper from '../../../components/LayoutWrapper';
import moment from 'moment';

const AlunoCreateScreen = ({ route, navigation }) => {

    const { aluno } = route.params || {};

    const [nome, setNome] = useState(aluno?.nome || ''); // Nome do aluno
    const [ultimoNome, setUltimoNome] = useState(aluno?.ultimoNome || ''); // Sobrenome do aluno
    const [genero, setGenero] = useState(aluno?.genero || ''); // Gênero selecionado
    const [data_nascimento, setDataNascimento] = useState(
        aluno?.data_nascimento ? moment(aluno.data_nascimento, 'DD/MM/YYYY').toDate() : null
    ); // Data de nascimento (usando o nome esperado pelo backend)
    const [showDatePicker, setShowDatePicker] = useState(false); // Controle do seletor de data
    const [cpf, setCpf] = useState(aluno?.cpf || ''); // CPF do aluno
    const [email, setEmail] = useState(aluno?.email || ''); // E-mail do aluno

    // Endereços do aluno (inicializa com um endereço vazio)
    const [enderecos, setEnderecos] = useState(
        aluno?.enderecos || [{ cep: '', rua: '', numero: '', bairro: '', cidade: '', estado: '' }]
    );

    // Telefones do aluno (inicializa com um telefone vazio)
    const [telefones, setTelefones] = useState(
        aluno?.telefones || [{ ddd: '', numero: '' }]
    );

    // Responsáveis pelo aluno (inicializa com um responsável vazio)
    const [responsaveis, setResponsaveis] = useState(
        aluno?.responsaveis || [
            { nome: '', ultimoNome: '', cpfResponsavel: '', telefones: [{ ddd: '', numero: '' }], grauParentesco: '' },
        ]
    );

    // ID da coordenação selecionada
    const [coordenacaoId, setCoordenacaoId] = useState(
        aluno?.coordenacaoId ? aluno.coordenacaoId.toString() : ''
    );

    // Lista de coordenações disponíveis
    const [coordenacoes, setCoordenacoes] = useState([]);

    // Turmas selecionadas (armazena IDs das turmas)
    const [turmasSelecionadas, setTurmasSelecionadas] = useState(
        aluno?.turmasIds?.map((id) => id.toString()) || []
    );

    // Lista de todas as turmas disponíveis
    const [turmas, setTurmas] = useState([]);

    // Texto de busca para filtrar coordenações
    const [coordenacaoSearch, setCoordenacaoSearch] = useState('');

    // Texto de busca para filtrar turmas
    const [turmaSearch, setTurmaSearch] = useState('');

    const estados = [
        'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA', 'PB',
        'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const responseCoordenacoes = await api.get('/coordenacoes');
                setCoordenacoes(responseCoordenacoes.data);

                const responseTurmas = await api.get('/turmas');
                setTurmas(responseTurmas.data);

                // Atualiza a coordenação e as turmas selecionadas após carregar os dados
                if (aluno?.coordenacaoId) {
                    setCoordenacaoId(aluno.coordenacaoId.toString());
                }

                if (aluno?.turmasIds) {
                    setTurmasSelecionadas(aluno.turmasIds.map((id) => id.toString()));
                }
            } catch (error) {
                Alert.alert('Erro', 'Não foi possível carregar as coordenações e turmas.');
            }
        };

        fetchData();
    }, [aluno]);


    const fetchCoordenacoes = async () => {
        try {
            const response = await api.get('/coordenacoes');
            setCoordenacoes(response.data);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível carregar as coordenações.');
        }
    };

    const fetchTurmas = async () => {
        try {
            const response = await api.get('/turmas');
            setTurmas(response.data);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível carregar as turmas.');
        }
    };



    const removeItem = (index, setter, state) => {
        const updated = state.filter((_, i) => i !== index);
        setter(updated);
    };


    const handleSave = async () => {
        if (!nome || !ultimoNome || !cpf || !email || !data_nascimento || !coordenacaoId) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        const dataNascimentoFormatada = moment(data_nascimento).format('DD/MM/YYYY');

        const payload = {
            nome,
            ultimoNome,
            genero,
            data_nascimento: dataNascimentoFormatada,
            cpf,
            email,
            coordenacaoId: parseInt(coordenacaoId, 10),
            turmasIds: turmasSelecionadas.map((turmaId) => parseInt(turmaId, 10)),
            enderecos,
            telefones,
            responsaveis,
        };

        try {
            if (aluno?.id) {
                await api.put(`/alunos/${aluno.id}`, payload); // Atualizar aluno existente
                Alert.alert('Sucesso', 'Aluno atualizado com sucesso!');
            } else {
                await api.post('/alunos', payload); // Criar novo aluno
                Alert.alert('Sucesso', 'Aluno criado com sucesso!');
            }

            navigation.navigate('AlunoListScreen');
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Erro ao salvar aluno.';
            Alert.alert('Erro', errorMessage);
        }
    };


    const addEndereco = () => {
        setEnderecos([...enderecos, { cep: '', rua: '', numero: '', bairro: '', cidade: '', estado: '' }]);
    };

    const addTelefone = () => {
        setTelefones([...telefones, { ddd: '', numero: '' }]);
    };

    const addResponsavel = () => {
        setResponsaveis([
            ...responsaveis,
            { nome: '', ultimoNome: '', cpfResponsavel: '', telefones: [{ ddd: '', numero: '' }], grauParentesco: '' },
        ]);
    };

    const addTelefoneResponsavel = (index) => {
        const updatedResponsaveis = [...responsaveis];
        updatedResponsaveis[index].telefones.push({ ddd: '', numero: '' });
        setResponsaveis(updatedResponsaveis);
    };

    const toggleSelection = (id, selectedIds, setSelectedIds) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((item) => item !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    return (
        <LayoutWrapper navigation={navigation} handleLogout={() => navigation.navigate('LoginScreen')}>
            <ScrollView nestedScrollEnabled={true} style={styles.container}>
                <Text style={styles.title}>Cadastro de Aluno</Text>

                {/* Nome */}
                <Text style={styles.sectionTitle}>Nome *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Nome *"
                    value={nome}
                    onChangeText={setNome}
                />
                {/* Último Nome */}
                <Text style={styles.sectionTitle}>Último Nome *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Último Nome *"
                    value={ultimoNome}
                    onChangeText={setUltimoNome}
                />

                {/* CPF */}
                <Text style={styles.sectionTitle}>CPF *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Digite o CPF do Aluno *"
                    value={cpf}
                    onChangeText={setCpf}
                    keyboardType="numeric"
                />

                {/* Email */}
                <Text style={styles.sectionTitle}>E-mail *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Digite o E-mail do Aluno *"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                />


                {/* Genero */}
                <Text style={styles.sectionTitle}>Gênero *</Text>
                <Picker
                    selectedValue={genero}
                    style={styles.input}
                    onValueChange={setGenero}
                >
                    <Picker.Item label="Selecione o Gênero" value="" />
                    <Picker.Item label="Masculino" value="Masculino" />
                    <Picker.Item label="Feminino" value="Feminino" />
                </Picker>

                {/* Data de Nascimento */}
                <Text style={styles.sectionTitle}>Data de Nascimento *</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
                    <Text style={styles.dateButtonText}>
                        {data_nascimento
                            ? moment(data_nascimento).format('DD/MM/YYYY') // Formatar usando Moment.js
                            : 'Selecione a Data de Nascimento'}
                    </Text>
                </TouchableOpacity>
                {showDatePicker && (
                    <DateTimePicker
                        value={data_nascimento || new Date()} // Usando o estado correto
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            setShowDatePicker(false);
                            if (selectedDate) setDataNascimento(selectedDate); // Atualizando o estado correto
                        }}
                    />
                )}


                {/* Coordenação */}
                <Text style={styles.sectionTitle}>Selecione uma Coordenação </Text>
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

                {/* Turmas */}
                <Text style={styles.sectionTitle}>Selecione Turmas </Text>
                <TextInput
                    style={styles.input}
                    placeholder="Buscar Turma"
                    value={turmaSearch}
                    onChangeText={setTurmaSearch}
                />
                <FlatList
                    data={turmas.filter((turma) =>
                        turma.nome.toLowerCase().includes(turmaSearch.toLowerCase())
                    )}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <CheckBox
                            title={item.nome}
                            checked={turmasSelecionadas.includes(item.id.toString())}
                            onPress={() => toggleSelection(item.id.toString(), turmasSelecionadas, setTurmasSelecionadas)}
                        />
                    )}
                />

                <Text style={styles.selectedText}>
                    Selecionadas: {turmas
                        .filter((turma) => turmasSelecionadas.includes(turma.id.toString()))
                        .map((turma) => turma.nome)
                        .join(', ')}
                </Text>

                {/* Endereços */}
                <Text style={styles.sectionTitle}>Endereços *</Text>
                {enderecos.map((endereco, index) => (
                    <View key={index} style={styles.boxContainer}>
                        {/* Botão de Remoção */}
                        {index > 0 && ( // O botão só aparece a partir do segundo endereço
                            <TouchableOpacity
                                style={styles.removeButtonInside}
                                onPress={() => {
                                    const updated = [...enderecos];
                                    updated.splice(index, 1); // Remove o endereço pelo índice
                                    setEnderecos(updated);
                                }}
                            >
                                <Text style={styles.removeButtonText}>X</Text>
                            </TouchableOpacity>
                        )}

                        {/* Inputs para Endereço */}
                        <View style={styles.row}>
                            <TextInput
                                style={styles.inputMini}
                                placeholder="CEP"
                                value={endereco.cep}
                                onChangeText={(text) => {
                                    const updated = [...enderecos];
                                    updated[index].cep = text;
                                    setEnderecos(updated);
                                }}
                            />
                            <TextInput
                                style={styles.inputMini}
                                placeholder="Rua"
                                value={endereco.rua}
                                onChangeText={(text) => {
                                    const updated = [...enderecos];
                                    updated[index].rua = text;
                                    setEnderecos(updated);
                                }}
                            />
                        </View>
                        <View style={styles.row}>
                            <TextInput
                                style={styles.inputMini}
                                placeholder="Número"
                                value={endereco.numero}
                                onChangeText={(text) => {
                                    const updated = [...enderecos];
                                    updated[index].numero = text;
                                    setEnderecos(updated);
                                }}
                            />
                            <TextInput
                                style={styles.inputMini}
                                placeholder="Bairro"
                                value={endereco.bairro}
                                onChangeText={(text) => {
                                    const updated = [...enderecos];
                                    updated[index].bairro = text;
                                    setEnderecos(updated);
                                }}
                            />
                        </View>
                        <View style={styles.row}>
                            <TextInput
                                style={styles.inputMini}
                                placeholder="Cidade"
                                value={endereco.cidade}
                                onChangeText={(text) => {
                                    const updated = [...enderecos];
                                    updated[index].cidade = text;
                                    setEnderecos(updated);
                                }}
                            />
                            <Picker
                                selectedValue={endereco.estado}
                                style={[styles.inputMini, { width: '48%' }]}
                                onValueChange={(value) => {
                                    // Faça uma cópia do array de endereços
                                    const updated = [...enderecos];
                                    // Crie uma cópia do objeto do endereço atual
                                    const updatedEndereco = { ...updated[index] };
                                    // Atualize o estado no objeto copiado
                                    updatedEndereco.estado = value;
                                    // Atualize o array de endereços com o endereço modificado
                                    updated[index] = updatedEndereco;
                                    // Atualize o estado
                                    setEnderecos(updated);
                                }}
                            >
                                <Picker.Item label="Estado" value="" />
                                {estados.map((estado) => (
                                    <Picker.Item key={estado} label={estado} value={estado} />
                                ))}
                            </Picker>

                        </View>
                    </View>
                ))}
                <TouchableOpacity onPress={addEndereco} style={styles.addButton}>
                    <Text style={styles.addButtonText}>Adicionar Endereço</Text>
                </TouchableOpacity>


                {/* Telefones */}
                <Text style={styles.sectionTitle}>Telefones *</Text>
                {telefones.map((telefone, index) => (
                    <View key={index} style={styles.boxContainer}>
                        {/* Botão de Remoção dentro do box (apenas para caixas adicionais) */}
                        {index > 0 && (
                            <TouchableOpacity
                                style={styles.removeButtonInside}
                                onPress={() => removeItem(index, setTelefones, telefones)}
                            >
                                <Text style={styles.removeButtonText}>X</Text>
                            </TouchableOpacity>
                        )}

                        {/* Inputs alinhados */}
                        <View style={styles.row}>
                            <TextInput
                                style={styles.inputDDD}
                                placeholder="DDD"
                                value={telefone.ddd}
                                onChangeText={(text) => {
                                    const updated = [...telefones];
                                    updated[index].ddd = text;
                                    setTelefones(updated);
                                }}
                                keyboardType="numeric"
                            />
                            <TextInput
                                style={styles.inputNumero}
                                placeholder="Número"
                                value={telefone.numero}
                                onChangeText={(text) => {
                                    const updated = [...telefones];
                                    updated[index].numero = text;
                                    setTelefones(updated);
                                }}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>
                ))}
                <TouchableOpacity onPress={addTelefone} style={styles.addButton}>
                    <Text style={styles.addButtonText}>Adicionar Telefone</Text>
                </TouchableOpacity>



                {/* Responsáveis */}
                <Text style={styles.sectionTitle}>Responsáveis*</Text>
                {responsaveis.map((responsavel, index) => (
                    <View key={index} style={styles.boxContainer}>
                        {/* Botão de Remoção do Responsável (apenas para caixas adicionais) */}
                        {index > 0 && (
                            <TouchableOpacity
                                style={styles.removeButtonInside}
                                onPress={() => removeItem(index, setResponsaveis, responsaveis)}
                            >
                                <Text style={styles.removeButtonText}>X</Text>
                            </TouchableOpacity>
                        )}

                        {/* Inputs para Responsável */}
                        <View style={styles.row}>
                            <TextInput
                                style={styles.inputHalf}
                                placeholder="Nome do Responsável"
                                value={responsavel.nome}
                                onChangeText={(text) => {
                                    const updated = [...responsaveis];
                                    updated[index].nome = text;
                                    setResponsaveis(updated);
                                }}
                            />
                            <TextInput
                                style={styles.inputHalf}
                                placeholder="Último Nome"
                                value={responsavel.ultimoNome}
                                onChangeText={(text) => {
                                    const updated = [...responsaveis];
                                    updated[index].ultimoNome = text;
                                    setResponsaveis(updated);
                                }}
                            />
                        </View>
                        <View style={styles.row}>
                            <TextInput
                                style={styles.inputHalf}
                                placeholder="CPF do Responsável"
                                value={responsavel.cpfResponsavel}
                                onChangeText={(text) => {
                                    const updated = [...responsaveis];
                                    updated[index].cpfResponsavel = text;
                                    setResponsaveis(updated);
                                }}
                            />
                            <TextInput
                                style={styles.inputHalf}
                                placeholder="Grau de Parentesco"
                                value={responsavel.grauParentesco}
                                onChangeText={(text) => {
                                    const updated = [...responsaveis];
                                    updated[index].grauParentesco = text;
                                    setResponsaveis(updated);
                                }}
                            />
                        </View>

                        {/* Telefones do Responsável */}
                        <Text style={styles.sectionSubTitle}>Telefones do Responsável</Text>
                        {responsavel.telefones.map((telefone, telIndex) => (
                            <View key={telIndex} style={styles.row}>
                                <TextInput
                                    style={styles.inputDDD}
                                    placeholder="DDD"
                                    value={telefone.ddd}
                                    onChangeText={(text) => {
                                        const updatedResponsaveis = [...responsaveis];
                                        updatedResponsaveis[index].telefones[telIndex].ddd = text;
                                        setResponsaveis(updatedResponsaveis);
                                    }}
                                    keyboardType="numeric"
                                />
                                <TextInput
                                    style={styles.inputNumero}
                                    placeholder="Número"
                                    value={telefone.numero}
                                    onChangeText={(text) => {
                                        const updatedResponsaveis = [...responsaveis];
                                        updatedResponsaveis[index].telefones[telIndex].numero = text;
                                        setResponsaveis(updatedResponsaveis);
                                    }}
                                    keyboardType="numeric"
                                />
                                {/* Botão de Remoção do Telefone */}
                                {telIndex > 0 && (
                                    <TouchableOpacity
                                        style={styles.removeButtonInsideSmall}
                                        onPress={() => {
                                            const updatedResponsaveis = [...responsaveis];
                                            updatedResponsaveis[index].telefones.splice(telIndex, 1);
                                            setResponsaveis(updatedResponsaveis);
                                        }}
                                    >
                                        <Text style={styles.removeButtonText}>X</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}
                        <TouchableOpacity
                            onPress={() => addTelefoneResponsavel(index)}
                            style={styles.addButton}
                        >
                            <Text style={styles.addButtonText}>Adicionar Telefone</Text>
                        </TouchableOpacity>
                    </View>
                ))}
                <TouchableOpacity onPress={addResponsavel} style={styles.addButton}>
                    <Text style={styles.addButtonText}>Adicionar Responsável</Text>
                </TouchableOpacity>



                {/* Botão Salvar */}
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Salvar Aluno</Text>
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
        textTransform: 'uppercase',
        borderBottomWidth: 2,
        borderBottomColor: '#E5E5E5',
        paddingBottom: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0056b3',
        marginTop: 16,
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#DDD',
        paddingBottom: 5,
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
    addressContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 16,
        backgroundColor: '#F9F9F9',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    dateButton: {
        backgroundColor: '#F9F9F9',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#DDD',
    },
    dateButtonText: {
        color: '#444',
        fontSize: 14,
    },
    addButton: {
        backgroundColor: '#0056b3',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 8,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
        elevation: 5,
    },
    addButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    saveButton: {
        backgroundColor: '#28A745',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
        elevation: 5,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    selectedText: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    boxContainer: {
        backgroundColor: '#F9F9F9',
        padding: 16,
        marginBottom: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        position: 'relative',
    },
    removeButtonInside: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#FF4D4D',
        borderRadius: 16,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
        elevation: 3,
        zIndex: 10,
    },
    removeButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    inputHalf: {
        width: '48%',
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
    },
    inputDDD: {
        width: '20%',
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        marginRight: 8,
    },
    inputNumero: {
        width: '70%',
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
    },
    removeButtonInsideSmall: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#FF4D4D',
        borderRadius: 16,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        elevation: 5,
    },
    sectionSubTitle: {
        fontSize: 16, // Menor que os títulos principais
        fontWeight: 'bold',
        color: '#0056b3',
        marginTop: 8,
        marginBottom: 4,
    },
});

export default AlunoCreateScreen;
