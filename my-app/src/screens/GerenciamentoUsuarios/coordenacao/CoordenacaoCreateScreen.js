import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { CheckBox } from 'react-native-elements';
import api from '../../../api/api';
import LayoutWrapper from '../../../components/LayoutWrapper';

const CoordenacaoCreateScreen = ({ route, navigation }) => {
  const { coordenacao } = route.params || {}; // Recebe coordenação para edição, caso exista
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [enderecos, setEnderecos] = useState([{ cep: '', rua: '', numero: '', bairro: '', cidade: '', estado: '' }]);
  const [telefones, setTelefones] = useState([{ ddd: '', numero: '' }]);
  const [turmas, setTurmas] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [coordenadores, setCoordenadores] = useState([]);
  const [turmasIds, setTurmasIds] = useState([]);
  const [professoresIds, setProfessoresIds] = useState([]);
  const [coordenadoresIds, setCoordenadoresIds] = useState([]);
  const [turmaSearch, setTurmaSearch] = useState('');
  const [professorSearch, setProfessorSearch] = useState('');
  const [coordenadorSearch, setCoordenadorSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const estados = [
    'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA', 'PB',
    'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
  ];

  useEffect(() => {
    fetchTurmas();
    fetchProfessores();
    fetchCoordenadores();

    // Preenche os dados ao editar uma coordenação
    if (coordenacao) {
      setNome(coordenacao.nome || '');
      setDescricao(coordenacao.descricao || '');
      setEnderecos(coordenacao.enderecos || [{ cep: '', rua: '', numero: '', bairro: '', cidade: '', estado: '' }]);
      setTelefones(coordenacao.telefones || [{ ddd: '', numero: '' }]);
      setTurmasIds(coordenacao.turmas?.map((turma) => turma.id) || []);
      setProfessoresIds(coordenacao.professores?.map((professor) => professor.cpf) || []);
      setCoordenadoresIds(coordenacao.coordenadores?.map((coordenador) => coordenador.cpf) || []);
    }
  }, [coordenacao]);

  const fetchTurmas = async () => {
    try {
      const response = await api.get('/turmas');
      setTurmas(response.data);
    } catch (error) {
      console.error('Erro ao buscar turmas:', error);
    }
  };

  const fetchProfessores = async () => {
    try {
      const response = await api.get('/professores');
      setProfessores(response.data);
    } catch (error) {
      console.error('Erro ao buscar professores:', error);
    }
  };

  const fetchCoordenadores = async () => {
    try {
      const response = await api.get('/coordenadores');
      setCoordenadores(response.data);
    } catch (error) {
      console.error('Erro ao buscar coordenadores:', error);
    }
  };

  const removeItem = (index, setter, state) => {
    const updated = state.filter((_, i) => i !== index);
    setter(updated);
  };

  const handleSave = async () => {
    // Validação de Campos
    if (!nome || !enderecos.length || enderecos.some((e) => Object.values(e).some((v) => !v)) || telefones.some((t) => Object.values(t).some((v) => !v))) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    // Validação de CEP e DDD
    for (const endereco of enderecos) {
      if (!/^\d{8}$/.test(endereco.cep)) {
        Alert.alert('Erro', 'CEP deve ter 8 dígitos.');
        return;
      }
    }
    for (const telefone of telefones) {
      if (!/^\d{2}$/.test(telefone.ddd)) {
        Alert.alert('Erro', 'DDD deve ter 2 dígitos.');
        return;
      }
    }

    const data = {
      nome,
      descricao,
      enderecos,
      telefones,
      turmasIds: turmasIds.map((id) => parseInt(id, 10)),
      professoresIds,
      coordenadoresIds,
    };

    setLoading(true);
    try {
      if (coordenacao) {
        await api.put(`/coordenacoes/${coordenacao.id}`, data, {
          headers: { 'Content-Type': 'application/json' },
        });
        Alert.alert('Sucesso', 'Coordenação editada com sucesso.');
      } else {
        await api.post('/coordenacoes', data, {
          headers: { 'Content-Type': 'application/json' },
        });
        Alert.alert('Sucesso', 'Coordenação criada com sucesso.');
      }
      navigation.navigate('CoordenacaoListScreen'); // Volta para a lista
    } catch (error) {
      console.error('Erro:', error.response?.data || error.message);
      Alert.alert('Erro', 'Falha ao salvar a coordenação.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id, setIds, ids) => {
    setIds(ids.includes(id) ? ids.filter((selectedId) => selectedId !== id) : [...ids, id]);
  };

  const getSelectedNames = (items, ids, field, extraField) =>
    items
      .filter((item) => ids.includes(item.id || item.cpf))
      .map((item) => `${item[field]} ${item[extraField] || ''}`.trim())
      .join(', ');

      return (
        <LayoutWrapper navigation={navigation} handleLogout={() => navigation.navigate('LoginScreen')}>
          <ScrollView nestedScrollEnabled={true} style={styles.container}>
            <View>
              <Text style={styles.pageTitle}>
                {coordenacao ? 'Editar Coordenação' : 'Cadastro de Coordenação'}
              </Text>
            </View>
      
            {/* Nome da Coordenação */}
            <Text style={styles.sectionTitle}>Nome da Coordenação*</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o nome da coordenação"
              value={nome}
              onChangeText={setNome}
            />
      
            {/* Descrição */}
            <Text style={styles.sectionTitle}>Descrição</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite a descrição"
              value={descricao}
              onChangeText={setDescricao}
            />
      
            {/* Endereços */}
            <Text style={styles.sectionTitle}>Endereços*</Text>
            {enderecos.map((endereco, index) => (
              <View key={index} style={styles.boxContainer}>
                {/* Botão de Remoção */}
                {index > 0 && ( // O botão só aparece a partir do segundo endereço
                  <TouchableOpacity
                    style={styles.removeButtonInside}
                    onPress={() => removeItem(index, setEnderecos, enderecos)}
                  >
                    <Text style={styles.removeButtonText}>X</Text>
                  </TouchableOpacity>
                )}
      
                {/* Linha 1 */}
                <View style={styles.row}>
                  <TextInput
                    style={styles.inputMini}
                    placeholder="CEP *"
                    keyboardType="numeric"
                    value={endereco.cep}
                    onChangeText={(text) => {
                      const updatedEnderecos = [...enderecos];
                      updatedEnderecos[index].cep = text;
                      setEnderecos(updatedEnderecos);
                    }}
                  />
                  <TextInput
                    style={styles.inputMini}
                    placeholder="Rua *"
                    value={endereco.rua}
                    onChangeText={(text) => {
                      const updatedEnderecos = [...enderecos];
                      updatedEnderecos[index].rua = text;
                      setEnderecos(updatedEnderecos);
                    }}
                  />
                </View>
      
                {/* Linha 2 */}
                <View style={styles.row}>
                  <TextInput
                    style={styles.inputMini}
                    placeholder="Número *"
                    keyboardType="numeric"
                    value={endereco.numero}
                    onChangeText={(text) => {
                      const updatedEnderecos = [...enderecos];
                      updatedEnderecos[index].numero = text;
                      setEnderecos(updatedEnderecos);
                    }}
                  />
                  <TextInput
                    style={styles.inputMini}
                    placeholder="Bairro *"
                    value={endereco.bairro}
                    onChangeText={(text) => {
                      const updatedEnderecos = [...enderecos];
                      updatedEnderecos[index].bairro = text;
                      setEnderecos(updatedEnderecos);
                    }}
                  />
                </View>
      
                {/* Linha 3 */}
                <View style={styles.row}>
                  <TextInput
                    style={styles.inputMini}
                    placeholder="Cidade *"
                    value={endereco.cidade}
                    onChangeText={(text) => {
                      const updatedEnderecos = [...enderecos];
                      updatedEnderecos[index].cidade = text;
                      setEnderecos(updatedEnderecos);
                    }}
                  />
                  <Picker
                    selectedValue={endereco.estado}
                    style={styles.inputMini}
                    onValueChange={(value) => {
                      const updatedEnderecos = [...enderecos];
                      updatedEnderecos[index].estado = value;
                      setEnderecos(updatedEnderecos);
                    }}
                  >
                    <Picker.Item label="Estado *" value="" />
                    {estados.map((estado) => (
                      <Picker.Item key={estado} label={estado} value={estado} />
                    ))}
                  </Picker>
                </View>
              </View>
            ))}
            <TouchableOpacity
              style={styles.addButton}
              onPress={() =>
                setEnderecos([...enderecos, { cep: '', rua: '', numero: '', bairro: '', cidade: '', estado: '' }])
              }
            >
              <Text style={styles.addButtonText}>+ Adicionar Endereço</Text>
            </TouchableOpacity>
      
            {/* Telefones */}
            <Text style={styles.sectionTitle}>Telefones*</Text>
            {telefones.map((telefone, index) => (
              <View key={index} style={styles.boxContainer}>
                {/* Botão de Remoção */}
                {index > 0 && ( // O botão só aparece a partir do segundo telefone
                  <TouchableOpacity
                    style={styles.removeButtonInside}
                    onPress={() => removeItem(index, setTelefones, telefones)}
                  >
                    <Text style={styles.removeButtonText}>X</Text>
                  </TouchableOpacity>
                )}
      
                {/* Campos de telefone */}
                <View style={styles.row}>
                  <TextInput
                    style={styles.inputDDD}
                    placeholder="DDD *"
                    keyboardType="numeric"
                    value={telefone.ddd}
                    onChangeText={(text) => {
                      const updatedTelefones = [...telefones];
                      updatedTelefones[index].ddd = text;
                      setTelefones(updatedTelefones);
                    }}
                  />
                  <TextInput
                    style={styles.inputNumero}
                    placeholder="Número *"
                    keyboardType="numeric"
                    value={telefone.numero}
                    onChangeText={(text) => {
                      const updatedTelefones = [...telefones];
                      updatedTelefones[index].numero = text;
                      setTelefones(updatedTelefones);
                    }}
                  />
                </View>
              </View>
            ))}
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setTelefones([...telefones, { ddd: '', numero: '' }])}
            >
              <Text style={styles.addButtonText}>+ Adicionar Telefone</Text>
            </TouchableOpacity>
      
            {/* Coordenadores */}
            <Text style={styles.sectionTitle}>Selecione Coordenadores</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar Coordenador"
              value={coordenadorSearch}
              onChangeText={setCoordenadorSearch}
            />
            <FlatList
              data={coordenadores.filter(
                (coord) =>
                  coord.nome.toLowerCase().includes(coordenadorSearch.toLowerCase()) ||
                  coord.ultimoNome.toLowerCase().includes(coordenadorSearch.toLowerCase()) ||
                  coord.email.toLowerCase().includes(coordenadorSearch.toLowerCase()) ||
                  coord.cpf.includes(coordenadorSearch)
              )}
              keyExtractor={(item) => item.cpf}
              renderItem={({ item }) => (
                <CheckBox
                  title={`${item.nome} ${item.ultimoNome} (${item.email})`}
                  checked={coordenadoresIds.includes(item.cpf)}
                  onPress={() => toggleSelection(item.cpf, setCoordenadoresIds, coordenadoresIds)}
                />
              )}
            />
            <Text style={styles.selectedText}>
              Selecionados: {getSelectedNames(coordenadores, coordenadoresIds, 'nome', 'ultimoNome')}
            </Text>
      
            {/* Turmas */}
            <Text style={styles.sectionTitle}>Selecione Turmas</Text>
            <TextInput
              style={styles.searchInput}
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
                  checked={turmasIds.includes(item.id)}
                  onPress={() => toggleSelection(item.id, setTurmasIds, turmasIds)}
                />
              )}
            />
            <Text style={styles.selectedText}>
              Selecionados: {getSelectedNames(turmas, turmasIds, 'nome', '')}
            </Text>
      
            {/* Professores */}
            <Text style={styles.sectionTitle}>Selecione Professores</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar Professor"
              value={professorSearch}
              onChangeText={setProfessorSearch}
            />
            <FlatList
              data={professores.filter((prof) =>
                prof.nome.toLowerCase().includes(professorSearch.toLowerCase()) ||
                prof.ultimoNome.toLowerCase().includes(professorSearch.toLowerCase())
              )}
              keyExtractor={(item) => item.cpf}
              renderItem={({ item }) => (
                <CheckBox
                  title={`${item.nome} ${item.ultimoNome} (${item.email})`}
                  checked={professoresIds.includes(item.cpf)}
                  onPress={() => toggleSelection(item.cpf, setProfessoresIds, professoresIds)}
                />
              )}
            />
            <Text style={styles.selectedText}>
              Selecionados: {getSelectedNames(professores, professoresIds, 'nome', 'ultimoNome')}
            </Text>
      
            {/* Botão Final */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>{loading ? 'Salvando...' : 'Salvar'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </LayoutWrapper>
      );      
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 16,
    backgroundColor: '#F4F4F4',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
    color: '#0056b3',
    textTransform: 'uppercase',
    borderBottomWidth: 2,
    borderBottomColor: '#E5E5E5',
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
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
  searchInput: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#DDD',
    fontSize: 14,
  },
  addressContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 8,
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  minimizedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  bold: {
    fontWeight: 'bold',
    color: '#333',
  },
  italic: {
    fontStyle: 'italic',
    color: '#666',
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
    justifyContent: 'center',
    marginVertical: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
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
    marginTop: 4,
  },
  boxContainer: {
    position: 'relative', // Necessário para posicionar o botão de remoção
    backgroundColor: '#F9F9F9',
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
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
    zIndex: 10,
    elevation: 5,
  },
  removeButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  inputDDD: {
    width: '25%', // Campo menor para o DDD
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  inputNumero: {
    width: '70%', // Campo maior para o número
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
});

export default CoordenacaoCreateScreen;
