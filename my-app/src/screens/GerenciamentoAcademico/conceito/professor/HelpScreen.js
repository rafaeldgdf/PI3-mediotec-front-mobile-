import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const HelpScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                
                <Icon name="help-outline" size={24} color="#fff" /> <Text style={styles.title}> Ajuda e Tutoriais</Text>
            </View>

            {/* Content */}
            <ScrollView contentContainerStyle={styles.contentContainer}>
                {/* Section 1: Overview */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Visão Geral</Text>
                    <Text style={styles.sectionText}>
                        Este aplicativo foi projetado para gerenciar de forma eficiente as notas e o
                        desempenho acadêmico dos alunos. Professores podem:
                        {'\n\n'}- Visualizar conceitos e notas por unidade.
                        {'\n'}- Editar notas de acordo com critérios estabelecidos.
                        {'\n'}- Filtrar alunos por categorias (aprovados, reprovados, pendentes e NOA).
                        {'\n\n'}O objetivo é tornar o processo mais prático, permitindo foco no
                        acompanhamento pedagógico e nas decisões estratégicas relacionadas ao
                        aprendizado.
                    </Text>
                </View>

                {/* Section 2: Como usar */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Como Usar</Text>
                    <Text style={styles.sectionText}>
                        <Text style={styles.boldText}>1. Buscar Alunos:</Text> Utilize a barra de busca
                        localizada na parte superior para encontrar alunos rapidamente pelo nome ou pela
                        matrícula.{'\n\n'}
                        <Text style={styles.boldText}>2. Filtros:</Text> Os filtros ajudam a organizar os
                        alunos em categorias específicas:
                        {'\n'}- Aprovados
                        {'\n'}- Reprovados
                        {'\n'}- Pendentes
                        {'\n'}- NOA1, NOA2, NOA Final.
                        Basta tocar no botão correspondente para visualizar a lista filtrada.{'\n\n'}
                        <Text style={styles.boldText}>3. Editar Notas:</Text> Para editar as notas de um
                        aluno, toque no nome do aluno. Isso expandirá os detalhes do aluno, incluindo os
                        campos editáveis. Após alterar as notas, clique no botão salvar.{'\n\n'}
                        <Text style={styles.boldText}>4. Detalhes:</Text> Para visualizar detalhes
                        completos do aluno, como desempenho por unidade, clique no ícone de informações ao
                        lado do nome do aluno.
                    </Text>
                </View>

                {/* Section 3: Regras de Negócio */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Regras de Negócio</Text>
                    <Text style={styles.sectionText}>
                        Este sistema acadêmico segue um conjunto de regras claras e objetivas para avaliar o desempenho dos alunos. As regras estão divididas em categorias para facilitar o entendimento:
                        {'\n\n'}

                        {/* Aprovação */}
                        <Text style={styles.boldText}>1. Aprovação:</Text>
                        {'\n'}- Alunos com média final igual ou superior a <Text style={styles.highlight}>7.0</Text> são automaticamente aprovados.
                        {'\n'}- A média final é calculada somando as notas das quatro unidades e ajustando conforme a participação nas avaliações complementares (NOA1 e NOA2, caso aplicáveis).
                        {'\n'}- Se a média for maior ou igual a 7.0 sem a necessidade de NOA, o aluno é aprovado diretamente.
                        {'\n\n'}

                        {/* Reprovação */}
                        <Text style={styles.boldText}>2. Reprovação:</Text>
                        {'\n'}- Alunos com média final inferior a <Text style={styles.highlight}>5.0</Text> são reprovados automaticamente.
                        {'\n'}- Além disso, alunos que não atingem o mínimo de <Text style={styles.highlight}>75% de frequência</Text> no curso também são reprovados, independentemente da média final.
                        {'\n'}- Caso o aluno participe de todas as atividades mas ainda não atinja o limite de 5.0, será considerado reprovado sem possibilidade de recuperação.
                        {'\n\n'}

                        {/* Pendentes */}
                        <Text style={styles.boldText}>3. Pendentes:</Text>
                        {'\n'}- Alunos que obtêm média final entre <Text style={styles.highlight}>5.0</Text> e <Text style={styles.highlight}>6.9</Text> são classificados como pendentes.
                        {'\n'}- Alunos pendentes podem realizar avaliações complementares ou atividades de recuperação, caso autorizados pelo professor ou pela coordenação.
                        {'\n'}- Após a recuperação, a média final será recalculada, considerando as substituições aplicáveis das avaliações de NOA (ver regras abaixo).
                        {'\n\n'}

                        {/* NOA (Nota de Aproveitamento Acadêmico) */}
                        <Text style={styles.boldText}>4. NOA (Nota de Aproveitamento Acadêmico):</Text>
                        {'\n'}A avaliação NOA (Nota de Aproveitamento Acadêmico) é uma oportunidade para alunos que não atingiram a média necessária em algumas unidades. Existem dois tipos de NOA:
                        {'\n\n'}

                        {/* NOA1 */}
                        <Text style={styles.subText}>- NOA1:</Text>
                        {'\n'}  - Alunos que não obtiveram média mínima (7.0) na soma das notas da <Text style={styles.highlight}>1ª</Text> e <Text style={styles.highlight}>2ª unidades</Text> podem realizar o NOA1.
                        {'\n'}  - A nota do NOA1 substituirá a menor nota entre as duas unidades, mas somente se a nota do NOA1 for maior.
                        {'\n'}  - Se a nota do NOA1 for inferior à menor nota anterior, nenhuma substituição será feita.
                        {'\n'}  - Exemplo:
                        {'\n'}    - Nota 1ª Unidade: 6.0
                        {'\n'}    - Nota 2ª Unidade: 5.5
                        {'\n'}    - Nota NOA1: 6.5
                        {'\n'}    - Substituição: A nova média passa a considerar 6.5 no lugar de 5.5.
                        {'\n\n'}

                        {/* NOA2 */}
                        <Text style={styles.subText}>- NOA2:</Text>
                        {'\n'}  - Funciona de forma semelhante ao NOA1, mas é aplicado para alunos que não atingiram a média mínima (7.0) na soma das notas da <Text style={styles.highlight}>3ª</Text> e <Text style={styles.highlight}>4ª unidades</Text>.
                        {'\n'}  - Segue a mesma regra de substituição: a menor nota entre as duas unidades será substituída pela nota do NOA2, caso o NOA2 seja maior.
                        {'\n'}  - Se o NOA2 for inferior, a nota original permanece.
                        {'\n'}  - Exemplo:
                        {'\n'}    - Nota 3ª Unidade: 6.8
                        {'\n'}    - Nota 4ª Unidade: 6.2
                        {'\n'}    - Nota NOA2: 7.0
                        {'\n'}    - Substituição: A nova média passa a considerar 7.0 no lugar de 6.2.
                        {'\n\n'}

                        {/* NOA Final */}
                        <Text style={styles.subText}>- NOA Final:</Text>
                        {'\n'}  - O cálculo da média final após o NOA inclui as substituições feitas no NOA1 e/ou NOA2, caso aplicáveis.
                        {'\n'}  - Fórmula:
                        {'\n'}    <Text style={styles.subText}>
                            Média Final = (Nota 1ª Unidade + Nota 2ª Unidade + Nota 3ª Unidade + Nota 4ª Unidade) ÷ 4
                        </Text>
                        {'\n'}  - Se houver substituições de NOA1 ou NOA2, as novas notas devem ser usadas no lugar das originais.
                        {'\n\n'}

                        {/* Editabilidade */}
                        <Text style={styles.boldText}>5. Controle e Segurança:</Text>
                        {'\n'}- Somente professores autorizados podem registrar ou editar notas no sistema.
                        {'\n'}- Todas as alterações são registradas e auditadas pela instituição, garantindo transparência e confiabilidade nos dados.
                    </Text>
                </View>


                {/* Section 4: Dicas */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Dicas</Text>
                    <Text style={styles.sectionText}>
                        - Sempre clique em <Text style={styles.highlight}>Salvar</Text> após alterar notas
                        para garantir que as mudanças sejam aplicadas.{'\n'}
                        - Use os filtros para encontrar rapidamente os alunos desejados.{'\n'}
                        - Caso perceba inconsistências nas notas, entre em contato com o administrador do
                        sistema.{'\n'}
                        - Revise os conceitos frequentemente para evitar atrasos em ajustes de recuperação
                        ou pendências.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f6f8',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#0056b3',
        elevation: 3,
    },
    backButton: {
        marginRight: 16,
        padding: 8,
        backgroundColor: '#004080',
        borderRadius: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#ffffff',
    },
    contentContainer: {
        padding: 16,
    },
    section: {
        marginBottom: 16,
        padding: 16,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0056b3',
        marginBottom: 8,
    },
    sectionText: {
        fontSize: 16,
        fontWeight: '400',
        color: '#495057',
        lineHeight: 24,
    },
    boldText: {
        fontWeight: 'bold',
        color: '#343a40',
    },
    highlight: {
        color: '#007bff',
        fontWeight: 'bold',
    },
    subText: {
        marginLeft: 8,
        fontWeight: '400',
        color: '#495057',
        lineHeight: 20,
    },
});

export default HelpScreen;
