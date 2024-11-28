import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
    Image,
    Switch,
    TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import LayoutWrapper from '../../../components/LayoutWrapper';
import api from '../../../api/api';
import { format } from 'date-fns';


const AlunoDetalhesScreen = ({ route, navigation }) => {
    const { aluno } = route.params;

    const [status, setStatus] = useState(aluno.status);
    const [detalhesAluno, setDetalhesAluno] = useState(aluno);
    const [profileImage, setProfileImage] = useState(null);
    const [searchDisciplinaProfessor, setSearchDisciplinaProfessor] = useState('');
    const [filteredDisciplinaProfessores, setFilteredDisciplinaProfessores] = useState([]);
    const [coordenacao, setCoordenacao] = useState(null);



    useEffect(() => {
        fetchAlunoCompleto();
    }, []);

    useEffect(() => {
        filterDisciplinaProfessores();
    }, [searchDisciplinaProfessor, detalhesAluno]);

    const fetchAlunoCompleto = async () => {
        try {
            const response = await api.get(`/alunos/${aluno.id}`);
            setDetalhesAluno(response.data);
            setStatus(response.data.status);

            // Verifica se existe coordenacaoId e busca os dados da coordenação
            if (response.data.coordenacaoId) {
                const coordenacaoResponse = await api.get(`/coordenacoes/${response.data.coordenacaoId}`);
                setCoordenacao(coordenacaoResponse.data);
            }
        } catch (error) {
            console.error('Erro ao buscar aluno:', error);
            Alert.alert('Erro', 'Não foi possível carregar os detalhes do aluno.');
        }
    };




    const toggleStatus = async () => {
        try {
            const novoStatus = !status;

            // Chamada ao endpoint PATCH
            await api.patch(`/alunos/${detalhesAluno.id}/status`, {
                status: novoStatus, // Envia o novo status
            });

            setStatus(novoStatus); // Atualiza o estado local
            Alert.alert('Sucesso', `Status alterado para ${novoStatus ? 'Ativo' : 'Inativo'}.`);
            fetchAlunoCompleto(); // Atualiza os detalhes do aluno após a alteração
        } catch (error) {
            console.error('Erro ao alterar status:', error.response?.data || error.message);
            Alert.alert('Erro', 'Não foi possível alterar o status do aluno.');
        }
    };


    const handlePickImage = async () => {
        try {
            Alert.alert(
                'Selecionar Imagem',
                'Escolha uma opção:',
                [
                    {
                        text: 'Galeria',
                        onPress: async () => {
                            const result = await ImagePicker.launchImageLibraryAsync({
                                allowsEditing: true,
                                aspect: [1, 1],
                                quality: 1,
                            });
                            if (!result.canceled) {
                                setProfileImage(result.assets[0].uri);
                            }
                        },
                    },
                    {
                        text: 'Câmera',
                        onPress: async () => {
                            const cameraResult = await ImagePicker.launchCameraAsync({
                                allowsEditing: true,
                                aspect: [1, 1],
                                quality: 1,
                            });
                            if (!cameraResult.canceled) {
                                setProfileImage(cameraResult.assets[0].uri);
                            }
                        },
                    },
                    { text: 'Cancelar', style: 'cancel' },
                ],
                { cancelable: true }
            );
        } catch (error) {
            console.error('Erro ao selecionar imagem:', error);
            Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
        }
    };


    const handleEdit = () => {
        navigation.navigate('AlunoCreateScreen', { aluno: detalhesAluno });
    };

    const handleDelete = () => {
        Alert.alert(
            'Confirmação',
            'Tem certeza que deseja deletar este aluno?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Deletar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/alunos/${detalhesAluno.id}`);
                            Alert.alert('Sucesso', 'Aluno deletado com sucesso.');
                            navigation.goBack();
                        } catch (error) {
                            console.error('Erro ao deletar aluno:', error);
                            Alert.alert('Erro', 'Falha ao deletar aluno.');
                        }
                    },
                },
            ]
        );
    };

    const filterDisciplinaProfessores = () => {
        const turmas = detalhesAluno.turmas || [];
        const disciplinaProfessores = turmas.flatMap((turma) => turma.disciplinaProfessores || []);
        const filtered = disciplinaProfessores.filter(
            (item) =>
                item.nomeProfessor.toLowerCase().includes(searchDisciplinaProfessor.toLowerCase()) ||
                item.nomesDisciplinas.some((disciplina) =>
                    disciplina.toLowerCase().includes(searchDisciplinaProfessor.toLowerCase())
                )
        );
        setFilteredDisciplinaProfessores(filtered);
    };

    return (
        <LayoutWrapper navigation={navigation} handleLogout={() => navigation.navigate('LoginScreen')}>
            <View style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.profilePicture} onPress={handlePickImage}>
                            {profileImage ? (
                                <Image source={{ uri: profileImage }} style={styles.profileImage} />
                            ) : (
                                <Icon name="camera-alt" size={40} color="#FFF" />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.editIcon} onPress={handleEdit}>
                            <Icon name="edit" size={20} color="#FFF" />
                        </TouchableOpacity>
                        <Text style={styles.profileName}>
                            {detalhesAluno.nome} {detalhesAluno.ultimoNome}
                        </Text>
                        <Text style={styles.profileRole}>Aluno</Text>
                    </View>

                    {/* Informações Pessoais */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            <Icon name="info" size={18} /> Informações Pessoais
                        </Text>
                        <Text style={styles.infoText}>
                            <Icon name="badge" size={16} /> <Text style={styles.bold}>Nome:</Text> {detalhesAluno.nome}{' '}
                            {detalhesAluno.ultimoNome}
                        </Text>
                        <Text style={styles.infoText}>
                            <Icon name="fingerprint" size={16} /> <Text style={styles.bold}>CPF:</Text> {detalhesAluno.cpf}
                        </Text>
                        <Text style={styles.infoText}>
                            <Icon name="school" size={16} /> <Text style={styles.bold}>Matrícula:</Text>{' '}
                            {detalhesAluno.id}
                        </Text>
                        <Text style={styles.infoText}>
                            <Icon name="email" size={16} /> <Text style={styles.bold}>Email:</Text>{' '}
                            {detalhesAluno.email || 'Não informado'}
                        </Text>
                        <Text style={styles.infoText}>
                            <Icon name="wc" size={16} /> <Text style={styles.bold}>Gênero:</Text>{' '}
                            {detalhesAluno.genero || 'Não informado'}
                        </Text>
                        <Text style={styles.infoText}>
                            <Icon name="calendar-today" size={16} /> <Text style={styles.bold}>Data de Nascimento:</Text>{' '}
                            {detalhesAluno.data_nascimento
                                ? format(new Date(detalhesAluno.data_nascimento), 'dd/MM/yyyy')
                                : 'Não informado'}
                        </Text>
                        <View style={styles.switchContainer}>
                            <Text style={styles.statusText}>
                                <Icon name="toggle-on" size={16} /> Status:{' '}
                                <Text style={{ color: status ? '#28A745' : '#DC3545' }}>{status ? 'Ativo' : 'Inativo'}</Text>
                            </Text>
                            <Switch
                                trackColor={{ false: '#767577', true: '#28A745' }}
                                thumbColor={status ? '#FFF' : '#f4f3f4'}
                                onValueChange={toggleStatus}
                                value={status}
                            />
                        </View>
                    </View>

                    {/* Endereços */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            <Icon name="place" size={18} /> Endereços
                        </Text>
                        {detalhesAluno.enderecos?.length > 0 ? (
                            detalhesAluno.enderecos.map((endereco, index) => (
                                <View key={index} style={styles.infoBox}>
                                    <Text style={styles.infoText}>
                                        <Icon name="location-on" size={16} /> <Text style={styles.bold}>CEP:</Text> {endereco.cep}
                                    </Text>
                                    <Text style={styles.infoText}>
                                        <Icon name="home" size={16} /> <Text style={styles.bold}>Rua:</Text> {endereco.rua}, Nº {endereco.numero}
                                    </Text>
                                    <Text style={styles.infoText}>
                                        <Icon name="location-city" size={16} /> <Text style={styles.bold}>Bairro:</Text> {endereco.bairro}
                                    </Text>
                                    <Text style={styles.infoText}>
                                        <Icon name="public" size={16} /> <Text style={styles.bold}>Cidade:</Text> {endereco.cidade}, {endereco.estado}
                                    </Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.infoText}>Nenhum endereço cadastrado.</Text>
                        )}
                    </View>

                    {/* Telefones */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            <Icon name="phone" size={18} /> Telefones
                        </Text>
                        {detalhesAluno.telefones?.length > 0 ? (
                            detalhesAluno.telefones.map((telefone, index) => (
                                <Text key={index} style={styles.infoText}>
                                    <Icon name="call" size={16} /> ({telefone.ddd}) {telefone.numero}
                                </Text>
                            ))
                        ) : (
                            <Text style={styles.infoText}>Nenhum telefone cadastrado.</Text>
                        )}
                    </View>

                    {/* Responsáveis */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            <Icon name="group" size={18} /> Responsáveis
                        </Text>
                        {detalhesAluno.responsaveis?.length > 0 ? (
                            detalhesAluno.responsaveis.map((responsavel, index) => (
                                <View key={index} style={styles.infoBox}>
                                    <Text style={styles.infoText}>
                                        <Icon name="person" size={16} /> <Text style={styles.bold}>Nome:</Text>{' '}
                                        {responsavel.nome} {responsavel.ultimoNome}
                                    </Text>
                                    <Text style={styles.infoText}>
                                        <Icon name="fingerprint" size={16} /> <Text style={styles.bold}>CPF:</Text>{' '}
                                        {responsavel.cpfResponsavel}
                                    </Text>
                                    <Text style={styles.infoText}>
                                        <Icon name="family-restroom" size={16} />{' '}
                                        <Text style={styles.bold}>Grau de Parentesco:</Text> {responsavel.grauParentesco}
                                    </Text>
                                    {responsavel.telefones?.map((telefone, index) => (
                                        <Text key={index} style={styles.infoText}>
                                            <Icon name="phone" size={16} /> ({telefone.ddd}) {telefone.numero}
                                        </Text>
                                    ))}
                                </View>
                            ))
                        ) : (
                            <Text style={styles.infoText}>Nenhum responsável cadastrado.</Text>
                        )}
                    </View>

                    {/* Coordenação */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            <Icon name="group" size={18} /> Coordenação
                        </Text>
                        {detalhesAluno.turmas?.length > 0 && detalhesAluno.turmas[0].coordenacao ? (
                            <View style={styles.infoBox}>
                                <Text style={styles.infoText}>
                                    <Icon name="badge" size={16} /> <Text style={styles.bold}>Nome:</Text> {detalhesAluno.turmas[0].coordenacao.nome}
                                </Text>
                                {detalhesAluno.turmas[0].coordenacao.coordenadores.map((coordenador, index) => (
                                    <Text key={index} style={styles.infoText}>
                                        <Icon name="person" size={16} /> <Text style={styles.bold}>Coordenador:</Text> {coordenador.nomeCoordenador} ({coordenador.email})
                                    </Text>
                                ))}
                                {/* Botão para abrir os detalhes da coordenação */}
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() =>
                                        navigation.navigate('CoordenacaoDetalhesScreen', {
                                            coordenacao: detalhesAluno.turmas[0].coordenacao, // Passa os dados da coordenação
                                        })
                                    }
                                >
                                    <Icon name="info" size={16} color="#FFF" />
                                    <Text style={styles.buttonText}>Abrir Detalhes</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <Text style={styles.infoText}>Nenhuma coordenação associada.</Text>
                        )}
                    </View>



                    {/* Turmas */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            <Icon name="class" size={18} /> Turmas
                        </Text>
                        {detalhesAluno.turmas?.length > 0 ? (
                            detalhesAluno.turmas.map((turma, index) => (
                                <View key={turma.id || index} style={styles.infoBox}>
                                    <Text style={styles.infoText}>
                                        <Icon name="school" size={16} /> <Text style={styles.bold}>Nome:</Text> {turma.nome || 'Não informado'}
                                    </Text>
                                    <Text style={styles.infoText}>
                                        <Icon name="calendar-today" size={16} /> <Text style={styles.bold}>Ano Escolar:</Text>{' '}
                                        {turma.anoEscolar || 'Não informado'}
                                    </Text>
                                    <Text style={styles.infoText}>
                                        <Icon name="schedule" size={16} /> <Text style={styles.bold}>Turno:</Text> {turma.turno || 'Não informado'}
                                    </Text>
                                    {turma.id ? (
                                        <TouchableOpacity
                                            style={styles.actionButton}
                                            onPress={() =>
                                                navigation.navigate('TurmaDetalhesScreen', {
                                                    turma: turma || {}, // Agora passa apenas o ID da turma
                                                })
                                            }
                                        >
                                            <Icon name="info" size={16} color="#FFF" />
                                            <Text style={styles.buttonText}>Abrir Detalhes</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <Text style={styles.warningText}>ID da turma não disponível.</Text>
                                    )}
                                </View>
                            ))
                        ) : (
                            <Text style={styles.infoText}>Nenhuma turma associada.</Text>
                        )}
                    </View>

                    {/* Disciplinas e Professores */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            <Icon name="school" size={18} /> Disciplinas e Professores
                        </Text>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Buscar por disciplina ou professor..."
                            value={searchDisciplinaProfessor}
                            onChangeText={setSearchDisciplinaProfessor}
                        />
                        {filteredDisciplinaProfessores.length > 0 ? (
                            filteredDisciplinaProfessores.map((item, index) => (
                                <View key={item.professorId || index} style={styles.infoBox}>
                                    <Text style={styles.infoText}>
                                        <Icon name="person" size={16} /> <Text style={styles.bold}>Professor:</Text>{' '}
                                        {item.nomeProfessor || 'Não informado'}
                                    </Text>
                                    <Text style={styles.infoText}>
                                        <Icon name="book" size={16} /> <Text style={styles.bold}>Disciplinas:</Text>{' '}
                                        {item.nomesDisciplinas?.join(', ') || 'Nenhuma disciplina cadastrada'}
                                    </Text>
                                    {item.professorId ? (
                                        <TouchableOpacity
                                            style={styles.actionButton}
                                            onPress={() =>
                                                navigation.navigate('ProfessorDetalhesScreen', {
                                                    cpf: item.professorId,// Envia apenas o ID do professor
                                                })
                                            }
                                        >
                                            <Icon name="info" size={16} color="#FFF" />
                                            <Text style={styles.buttonText}>Abrir Detalhes</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <Text style={styles.warningText}>ID do professor não disponível.</Text>
                                    )}
                                </View>
                            ))
                        ) : (
                            <Text style={styles.infoText}>Nenhuma disciplina ou professor cadastrado.</Text>
                        )}
                    </View>



                </ScrollView>

                {/* Botões de Ação */}
                <View style={styles.fixedButtonContainer}>
                    <TouchableOpacity style={[styles.button, styles.editButton]} onPress={handleEdit}>
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
        paddingBottom: 80, // Evita sobreposição com os botões fixos
    },
    header: {
        backgroundColor: '#0056b3',
        paddingVertical: 30,
        alignItems: 'center',
        position: 'relative',
        marginBottom: 20,
    },
    profilePicture: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#DDD',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    profileName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 5,
    },
    profileRole: {
        fontSize: 16,
        color: '#FFF',
        fontStyle: 'italic',
    },
    editIcon: {
        position: 'absolute',
        top: 10,
        right: 20,
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 50,
    },
    section: {
        backgroundColor: '#FFF',
        marginVertical: 10,
        padding: 20,
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
        lineHeight: 20, // Melhor leitura
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
    buttonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 5,
        textAlign: 'center',
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
    },
    buttonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 5,
    },
});


export default AlunoDetalhesScreen;
