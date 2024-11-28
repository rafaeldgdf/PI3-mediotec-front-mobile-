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
import { format } from 'date-fns';
import checkRoleInToken from '../../../api/checkRoleInToken';


const getSelectedNames = (items, selectedIds, key) =>
  items
    .filter((item) => selectedIds.includes(item.id.toString()))
    .map((item) => item[key])
    .join(', ');

const ProfessorCreateScreen = ({ navigation, route }) => {
  const [cpf, setCpf] = useState('');
  const [nome, setNome] = useState('');
  const [ultimoNome, setUltimoNome] = useState('');
  const [genero, setGenero] = useState('');
  const [dataNascimento, setDataNascimento] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [email, setEmail] = useState('');
  const [enderecos, setEnderecos] = useState([{ cep: '', rua: '', numero: '', bairro: '', cidade: '', estado: '' }]);
  const [telefones, setTelefones] = useState([{ ddd: '', numero: '' }]);
  const [coordenacaoId, setCoordenacaoId] = useState('');
  const [turmasSelecionadas, setTurmasSelecionadas] = useState([]);
  const [disciplinasSelecionadas, setDisciplinasSelecionadas] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [coordenacoes, setCoordenacoes] = useState([]);
  const [turmaSearch, setTurmaSearch] = useState('');
  const [disciplinaSearch, setDisciplinaSearch] = useState('');
  const [coordenacaoSearch, setCoordenacaoSearch] = useState('');

  const estados = [
    'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA', 'PB',
    'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
  ];


  useEffect(() => {
    if (route.params?.professor) {
      const professor = route.params.professor;
      setCpf(professor.cpf || '');
      setNome(professor.nome || '');
      setUltimoNome(professor.ultimoNome || '');
      setGenero(professor.genero || '');
      setDataNascimento(professor.data_nascimento ? new Date(professor.data_nascimento) : null);
      setEmail(professor.email || '');
      setEnderecos(professor.enderecos || [{ cep: '', rua: '', numero: '', bairro: '', cidade: '', estado: '' }]);
      setTelefones(professor.telefones || [{ ddd: '', numero: '' }]);
      setCoordenacaoId(professor.coordenacaoId || '');
      setTurmasSelecionadas(professor.turmas || []);
      setDisciplinasSelecionadas(professor.disciplinas || []);
    }
  }, [route.params?.professor]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const coordenacoesResponse = await api.get('/coordenacoes');
        setCoordenacoes(coordenacoesResponse.data);

        const turmasResponse = await api.get('/turmas');
        setTurmas(turmasResponse.data);

        const disciplinasResponse = await api.get('/disciplinas');
        setDisciplinas(disciplinasResponse.data);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados.');
      }
    };
    fetchData();
  }, []);

  const removeItem = (index, setter, state) => {
    const updated = state.filter((_, i) => i !== index);
    setter(updated);
  };

  const handleSave = async () => {

    const hasRole = await checkRoleInToken();
    console.log('Usuário tem permissão para cadastrar:', hasRole);

    if (!hasRole) {
      Alert.alert('Acesso Negado', 'Você não tem permissão para cadastrar um professor.');
      return;  // Não continua o processo se não tiver a role correta
    }

    if (!cpf || !nome || !ultimoNome || !email || !dataNascimento || !coordenacaoId) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const formattedDate = format(dataNascimento, 'dd/MM/yyyy');

    const turmasDisciplinas = turmasSelecionadas.length > 0 ?
      turmasSelecionadas.map((turmaId) => ({
        turmaId: parseInt(turmaId, 10),
        disciplinasIds: disciplinasSelecionadas.map((disciplinaId) => parseInt(disciplinaId, 10)),
      }))
      : [];

    const payload = {
      cpf,
      nome,
      ultimoNome,
      genero,
      data_nascimento: formattedDate,
      email,
      status: true,
      enderecos,
      telefones,
      coordenacaoId: parseInt(coordenacaoId, 10),
      turmasDisciplinas,
    };

    console.log('Payload enviado ao backend:', JSON.stringify(payload, null, 2));

    try {
      if (route.params?.professor) {
        await api.put(`/professores/${cpf}`, payload);
        Alert.alert('Sucesso', 'Professor atualizado com sucesso!');
      } else {
        await api.post('/professores', payload);
        Alert.alert('Sucesso', 'Professor cadastrado com sucesso!');
      }
      navigation.navigate('ProfessorListScreen');
    } catch (error) {
      console.error('Erro ao salvar professor:', error.response?.data || error.message);
      let errorMessage = 'Falha ao salvar professor. Verifique os dados.';
      if (error.response?.data?.message?.includes('CPF')) {
        errorMessage = 'O CPF informado já está cadastrado.';
      } else if (error.response?.data?.message?.includes('Email')) {
        errorMessage = 'O email informado já está cadastrado.';
      } else if (error.response?.data?.message?.includes('Coordenacao')) {
        errorMessage = 'A coordenação informada não foi encontrada.';
      } else if (error.response?.data?.message?.includes('Data de nascimento')) {
        errorMessage = 'A data de nascimento está em um formato inválido.';
      }
      Alert.alert('Erro', errorMessage);
    }
  };

  const addEndereco = () => {
    setEnderecos([...enderecos, { cep: '', rua: '', numero: '', bairro: '', cidade: '', estado: '' }]);
  };

  const addTelefone = () => {
    setTelefones([...telefones, { ddd: '', numero: '' }]);
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
        <View>
          <Text style={styles.title}>Cadastro de Professor</Text>
        </View>


        {/* Nome */}
        <Text style={styles.sectionTitle}>Nome *</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite o Nome"
          value={nome}
          onChangeText={setNome}
        />

        {/* Último Nome */}
        <Text style={styles.sectionTitle}>Último Nome *</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite o Último Nome"
          value={ultimoNome}
          onChangeText={setUltimoNome}
        />

        {/* Email */}
        <Text style={styles.sectionTitle}>Email *</Text>
        <TextInput
          style={styles.input}
          placeholder="E-mail *"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        {/* CPF */}
        <Text style={styles.sectionTitle}>CPF *</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite o CPF"
          keyboardType="numeric"
          value={cpf}
          onChangeText={setCpf}
        />

        {/* Data de Nascimento */}
        <Text style={styles.sectionTitle}>Data de Nascimento *</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
          <Text style={styles.dateButtonText}>
            {dataNascimento
              ? new Date(dataNascimento).toLocaleDateString('pt-BR')
              : 'Selecione a Data de Nascimento'}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={dataNascimento || new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDataNascimento(selectedDate);
            }}
          />
        )}

        {/* Gênero */}
        <Text style={styles.sectionTitle}>Gênero *</Text>
        <Picker
          selectedValue={genero}
          style={styles.input}
          onValueChange={(itemValue) => setGenero(itemValue)}
        >
          <Picker.Item label="Selecione o Gênero" value="" />
          <Picker.Item label="Masculino" value="Masculino" />
          <Picker.Item label="Feminino" value="Feminino" />
        </Picker>


        {/* Endereços */}
        <Text style={styles.sectionTitle}>Endereços*</Text>
        {enderecos.map((endereco, index) => (
          <View key={index} style={styles.boxContainer}>
            {index > 0 && (
              <TouchableOpacity
                style={styles.removeButtonInside}
                onPress={() => removeItem(index, setEnderecos, enderecos)}
              >
                <Text style={styles.removeButtonText}>X</Text>
              </TouchableOpacity>
            )}
            <View style={styles.row}>
              <TextInput
                style={styles.inputMini}
                placeholder="CEP *"
                value={endereco.cep}
                onChangeText={(text) => {
                  const updated = [...enderecos];
                  updated[index].cep = text;
                  setEnderecos(updated);
                }}
              />
              <TextInput
                style={styles.inputMini}
                placeholder="Rua *"
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
                placeholder="Número *"
                value={endereco.numero}
                onChangeText={(text) => {
                  const updated = [...enderecos];
                  updated[index].numero = text;
                  setEnderecos(updated);
                }}
              />
              <TextInput
                style={styles.inputMini}
                placeholder="Bairro *"
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
                placeholder="Cidade *"
                value={endereco.cidade}
                onChangeText={(text) => {
                  const updated = [...enderecos];
                  updated[index].cidade = text;
                  setEnderecos(updated);
                }}
              />
              <Picker
                selectedValue={endereco.estado}
                style={styles.inputMini}
                onValueChange={(value) => {
                  const updated = [...enderecos];
                  updated[index].estado = value;
                  setEnderecos(updated);
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
        <TouchableOpacity style={styles.addButton} onPress={addEndereco}>
          <Text style={styles.addButtonText}>+ Adicionar Endereço</Text>
        </TouchableOpacity>

        {/* Telefones */}
        <Text style={styles.sectionTitle}>Telefones*</Text>
        {telefones.map((telefone, index) => (
          <View key={index} style={styles.boxContainer}>
            {index > 0 && (
              <TouchableOpacity
                style={styles.removeButtonInside}
                onPress={() => removeItem(index, setTelefones, telefones)}
              >
                <Text style={styles.removeButtonText}>X</Text>
              </TouchableOpacity>
            )}
            <View style={styles.row}>
              <TextInput
                style={styles.inputDDD}
                placeholder="DDD *"
                value={telefone.ddd}
                onChangeText={(text) => {
                  const updated = [...telefones];
                  updated[index].ddd = text;
                  setTelefones(updated);
                }}
              />
              <TextInput
                style={styles.inputNumero}
                placeholder="Número *"
                value={telefone.numero}
                onChangeText={(text) => {
                  const updated = [...telefones];
                  updated[index].numero = text;
                  setTelefones(updated);
                }}
              />
            </View>
          </View>
        ))}
        <TouchableOpacity style={styles.addButton} onPress={addTelefone}>
          <Text style={styles.addButtonText}>+ Adicionar Telefone</Text>
        </TouchableOpacity>


        {/* Coordenação */}
        <Text style={styles.sectionTitle}>Coordenação *</Text>
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
              title={<Text><Text style={styles.bold}>{item.nome}</Text></Text>}
              checked={coordenacaoId === item.id.toString()}
              onPress={() => setCoordenacaoId(item.id.toString())}
            />
          )}
        />


        {/* Turmas */}
        <Text style={styles.sectionTitle}>Turmas</Text>
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
              onPress={() =>
                toggleSelection(item.id.toString(), turmasSelecionadas, setTurmasSelecionadas)
              }
            />
          )}
        />
        <Text style={styles.selectedText}>
          Selecionados: {getSelectedNames(turmas, turmasSelecionadas, 'nome')}
        </Text>

        {/* Disciplinas */}
        <Text style={styles.sectionTitle}>Disciplinas</Text>
        <TextInput
          style={styles.input}
          placeholder="Buscar Disciplina"
          value={disciplinaSearch}
          onChangeText={setDisciplinaSearch}
        />
        <FlatList
          data={disciplinas.filter((disciplina) =>
            disciplina.nome.toLowerCase().includes(disciplinaSearch.toLowerCase())
          )}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <CheckBox
              title={item.nome}
              checked={disciplinasSelecionadas.includes(item.id.toString())}
              onPress={() =>
                toggleSelection(item.id.toString(), disciplinasSelecionadas, setDisciplinasSelecionadas)
              }
            />
          )}
        />
        <Text style={styles.selectedText}>
          Selecionados: {getSelectedNames(disciplinas, disciplinasSelecionadas, 'nome')}
        </Text>



        {/* Botão Salvar */}
        <View style={styles.saveButtonWrapper}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>{route.params?.professor ? 'Atualizar' : 'Salvar'}</Text>
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
    backgroundColor: '#F4F4F4', // Fundo cinza claro
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
  bold: {
    fontWeight: 'bold',
    color: '#333',
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
  saveButtonWrapper: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    paddingBottom: 16,
  },
  saveButton: {
    backgroundColor: '#28A745',
    paddingVertical: 14,
    borderRadius: 8,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  boxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    position: 'relative', // Necessário para o botão de remoção
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
    width: '25%',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  inputNumero: {
    width: '70%',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  selectedText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    marginBottom: 12,
  },
});




export default ProfessorCreateScreen;
