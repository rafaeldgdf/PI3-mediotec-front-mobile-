import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../../../../api/api';
import LayoutWrapper from '../../../../components/LayoutWrapper';
import moment from 'moment';
import { GlobalStyles } from '../../../../styles/GlobalStyles';


const CoordenadorComunicadoDetalhesScreen = ({ route, navigation }) => {
    const { comunicado, coordenacaoId } = route.params;
    const [detalhesComunicado, setDetalhesComunicado] = useState(comunicado);


    useEffect(() => {
        fetchComunicadoDetalhes();
    }, []);


    const fetchComunicadoDetalhes = async () => {
        try {
            const response = await api.get(`/comunicados/${comunicado.id}`);
            setDetalhesComunicado(response.data);
        } catch (error) {
            console.error('Erro ao buscar detalhes do comunicado:', error);
            Alert.alert('Erro', 'Não foi possível carregar os detalhes do comunicado.');
        }
    };


    const handleEdit = () => {
        navigation.navigate('ComunicadoCreateScreen', { comunicado: detalhesComunicado, coordenacaoId });
    };


    const handleDelete = () => {
        Alert.alert(
            'Confirmação',
            'Tem certeza que deseja deletar este comunicado?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Deletar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/comunicados/${detalhesComunicado.id}`);
                            Alert.alert('Sucesso', 'Comunicado deletado com sucesso.');
                            navigation.navigate('ComunicadoListScreen', { coordenacaoId });
                        } catch (error) {
                            console.error('Erro ao deletar comunicado:', error);
                            Alert.alert('Erro', 'Falha ao deletar comunicado.');
                        }
                    },
                },
            ]
        );
    };


    return (
        <LayoutWrapper navigation={navigation}>
            <ScrollView style={styles.container}>
                <Text style={[GlobalStyles.title, { marginBottom: 20 }]}>Detalhes do Comunicado</Text>


                {/* Informações do Comunicado */}
                <View style={styles.section}>
                    <Text style={GlobalStyles.sectionTitle}>Conteúdo:</Text>
                    <Text style={styles.comunicadoContent}>{detalhesComunicado.conteudo}</Text>
                </View>


                <View style={styles.section}>
                    <Text style={GlobalStyles.sectionTitle}>Enviado em:</Text>
                    <Text style={styles.comunicadoInfo}>
                        {moment(detalhesComunicado.dataEnvio).format('DD/MM/YYYY HH:mm:ss')}
                    </Text>
                </View>


                <View style={styles.section}>
                    <Text style={GlobalStyles.sectionTitle}>Remetente:</Text>
                    <Text style={styles.comunicadoInfo}>
                        {detalhesComunicado.remetenteProfessor?.nome || detalhesComunicado.remetenteCoordenacao?.nome}
                    </Text>
                </View>



                {/* Receptores */}
                <View style={styles.section}>
                    <Text style={GlobalStyles.sectionTitle}>Receptores:</Text>
                    {detalhesComunicado.alunos?.length > 0 && (
                        <View>
                            <Text style={styles.subtitle}>Alunos:</Text>
                            {detalhesComunicado.alunos.map((aluno) => (
                                <Text key={aluno.id} style={styles.receptorItem}>{aluno.nomeAluno}</Text>
                            ))}
                        </View>
                    )}


                    {detalhesComunicado.turmas?.length > 0 && (
                        <View>
                            <Text style={styles.subtitle}>Turmas:</Text>
                            {detalhesComunicado.turmas.map((turma) => (
                                <Text key={turma.id} style={styles.receptorItem}>{turma.nome}</Text>
                            ))}
                        </View>
                    )}
                </View>



                {/* Botões de Ação */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={[GlobalStyles.button, styles.editButton]} onPress={handleEdit}>
                        <Text style={GlobalStyles.buttonText}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[GlobalStyles.button, styles.deleteButton]} onPress={handleDelete}>
                        <Text style={GlobalStyles.buttonText}>Deletar</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </LayoutWrapper>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    section: {
        marginBottom: 16,
    },
    comunicadoContent: {
        fontSize: 16,
        marginBottom: 16,
    },
    comunicadoInfo: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    receptorItem: {
        fontSize: 14,
        marginBottom: 4,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    editButton: {
        backgroundColor: '#007BFF',
    },
    deleteButton: {
        backgroundColor: '#DC3545',
    },
});


export default CoordenadorComunicadoDetalhesScreen;