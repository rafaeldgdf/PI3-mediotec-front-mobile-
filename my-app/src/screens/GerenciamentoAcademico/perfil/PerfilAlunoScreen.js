import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    Alert,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker'; // Biblioteca para acessar galeria e câmera
import LayoutWrapper from '../../../components/LayoutWrapper';
import api from '../../../api/api';
import { format } from 'date-fns';

const PerfilAlunoScreen = ({ navigation }) => {
    const [detalhesAluno, setDetalhesAluno] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAlunoDetalhes();
    }, []);

    const fetchAlunoDetalhes = async () => {
        try {
            setLoading(true);
            let idAluno;

            // Recuperar ID do aluno do AsyncStorage
            const userInfo = await AsyncStorage.getItem('userInfo');
            if (userInfo) {
                const user = JSON.parse(userInfo);
                idAluno = user?.usuario?.id;
            }

            if (!idAluno) {
                throw new Error('ID do aluno não encontrado.');
            }

            // Chamada para obter detalhes do aluno
            const response = await api.get(`/alunos/${idAluno}`);
            setDetalhesAluno(response.data);

            // Caso o aluno tenha uma imagem de perfil no backend
            if (response.data.profileImageUrl) {
                setProfileImage(response.data.profileImageUrl);
            }
        } catch (error) {
            console.error('Erro ao buscar detalhes do aluno:', error.message);
            Alert.alert('Erro', 'Não foi possível carregar os detalhes do aluno.');
        } finally {
            setLoading(false);
        }
    };

    // Função para selecionar uma imagem da galeria ou câmera
    const handlePickImage = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permissionResult.granted) {
                Alert.alert('Erro', 'Permissão para acessar a galeria foi negada.');
                return;
            }

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
                                await uploadImage(result.assets[0].uri);
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
                                await uploadImage(cameraResult.assets[0].uri);
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

    // Função para fazer upload da imagem para o servidor
    const uploadImage = async (imageUri) => {
        try {
            const formData = new FormData();
            formData.append('file', {
                uri: imageUri,
                name: 'profile.jpg',
                type: 'image/jpeg',
            });

            // Substitua '/upload-profile-image' pelo endpoint correto
            await api.post(`/alunos/${detalhesAluno.id}/profile-image`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            Alert.alert('Sucesso', 'Imagem de perfil atualizada com sucesso.');
        } catch (error) {
            console.error('Erro ao fazer upload da imagem:', error.message);
            Alert.alert('Erro', 'Não foi possível fazer o upload da imagem.');
        }
    };

    if (loading) {
        return (
            <LayoutWrapper navigation={navigation}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0056b3" />
                    <Text style={styles.loadingText}>Carregando informações...</Text>
                </View>
            </LayoutWrapper>
        );
    }

    if (!detalhesAluno) {
        return (
            <LayoutWrapper navigation={navigation}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Nenhum dado encontrado.</Text>
                </View>
            </LayoutWrapper>
        );
    }

    return (
        <LayoutWrapper navigation={navigation}>
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
                        <Icon name="badge" size={16} /> <Text style={styles.bold}>Nome:</Text> {detalhesAluno.nome} {detalhesAluno.ultimoNome}
                    </Text>
                    <Text style={styles.infoText}>
                        <Icon name="fingerprint" size={16} /> <Text style={styles.bold}>CPF:</Text> {detalhesAluno.cpf}
                    </Text>
                    <Text style={styles.infoText}>
                        <Icon name="school" size={16} /> <Text style={styles.bold}>Matrícula:</Text> {detalhesAluno.id}
                    </Text>
                    <Text style={styles.infoText}>
                        <Icon name="email" size={16} /> <Text style={styles.bold}>Email:</Text> {detalhesAluno.email || 'Não informado'}
                    </Text>
                    <Text style={styles.infoText}>
                        <Icon name="wc" size={16} /> <Text style={styles.bold}>Gênero:</Text> {detalhesAluno.genero || 'Não informado'}
                    </Text>
                    <Text style={styles.infoText}>
                        <Icon name="calendar-today" size={16} /> <Text style={styles.bold}>Data de Nascimento:</Text>{' '}
                        {detalhesAluno.data_nascimento
                            ? format(new Date(detalhesAluno.data_nascimento), 'dd/MM/yyyy')
                            : 'Não informado'}
                    </Text>
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
                                    <Icon name="person" size={16} /> <Text style={styles.bold}>Nome:</Text> {responsavel.nome} {responsavel.ultimoNome}
                                </Text>
                                <Text style={styles.infoText}>
                                    <Icon name="fingerprint" size={16} /> <Text style={styles.bold}>CPF:</Text> {responsavel.cpfResponsavel}
                                </Text>
                                <Text style={styles.infoText}>
                                    <Icon name="family-restroom" size={16} />{' '}
                                    <Text style={styles.bold}>Grau de Parentesco:</Text> {responsavel.grauParentesco}
                                </Text>
                                {responsavel.telefones?.map((telefone, idx) => (
                                    <Text key={idx} style={styles.infoText}>
                                        <Icon name="phone" size={16} /> ({telefone.ddd}) {telefone.numero}
                                    </Text>
                                ))}
                            </View>
                        ))
                    ) : (
                        <Text style={styles.infoText}>Nenhum responsável cadastrado.</Text>
                    )}
                </View>
            </ScrollView>
        </LayoutWrapper>
    );
};


const styles = StyleSheet.create({
    scrollContent: {
        padding: 16,
        backgroundColor: '#F4F4F4',
    },
    header: {
        backgroundColor: '#0056b3',
        paddingVertical: 30,
        alignItems: 'center',
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
    },
    infoBox: {
        backgroundColor: '#F9F9F9',
        padding: 15,
        borderRadius: 8,
        marginVertical: 5,
    },
    infoText: {
        fontSize: 14,
        marginBottom: 4,
        color: '#444',
    },
    bold: {
        fontWeight: 'bold',
        color: '#000',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 18,
        color: '#444',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 18,
        color: '#DC3545',
    },
});

export default PerfilAlunoScreen;
