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
import { CheckBox } from 'react-native-elements';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import api from '../../../api/api';
import LayoutWrapper from '../../../components/LayoutWrapper';
import { format } from 'date-fns';

const CoordenadorCreateScreen = ({ navigation, route }) => {
  const [cpf, setCpf] = useState('');
  const [nome, setNome] = useState('');
  const [ultimoNome, setUltimoNome] = useState('');
  const [genero, setGenero] = useState('');
  const [dataNascimento, setDataNascimento] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [email, setEmail] = useState('');
  const [enderecos, setEnderecos] = useState([{ cep: '', rua: '', numero: '', bairro: '', cidade: '', estado: '' }]);
  const [telefones, setTelefones] = useState([{ ddd: '', numero: '' }]);
  const [coordenacoes, setCoordenacoes] = useState([]);
  const [idCoordenacao, setIdCoordenacao] = useState('');
  const [coordenacaoSearch, setCoordenacaoSearch] = useState('');

  const estados = [
    'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA', 'PB',
    'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
  ];

  useEffect(() => {
    if (route.params?.coordenador) {
      const coordenador = route.params.coordenador;

      setCpf(coordenador.cpf || '');
      setNome(coordenador.nome || '');
      setUltimoNome(coordenador.ultimoNome || '');
      setGenero(coordenador.genero || '');
      setDataNascimento(coordenador.data_nascimento ? new Date(coordenador.data_nascimento) : null);
      setEmail(coordenador.email || '');
      setEnderecos(coordenador.enderecos || [{ cep: '', rua: '', numero: '', bairro: '', cidade: '', estado: '' }]);
      setTelefones(coordenador.telefones || [{ ddd: '', numero: '' }]);
      setIdCoordenacao(coordenador.idCoordenacao || '');
    }
  }, [route.params?.coordenador]);

  useEffect(() => {
    const fetchCoordenacoes = async () => {
      try {
        const response = await api.get('/coordenacoes');
        setCoordenacoes(response.data);
      } catch (error) {
        console.error('Erro ao buscar coordenações:', error);
        Alert.alert('Erro', 'Não foi possível carregar as coordenações.');
      }
    };

    fetchCoordenacoes();
  }, []);

  const removeItem = (index, setter, state) => {
    const updated = state.filter((_, i) => i !== index);
    setter(updated);
  };

  const handleSave = async () => {
    if (!nome || !ultimoNome || !cpf || !email || !dataNascimento) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const formattedDate = format(dataNascimento, 'dd/MM/yyyy');

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
      idCoordenacao: idCoordenacao ? parseInt(idCoordenacao, 10) : null,
    };

    console.log('JSON enviado ao backend:', JSON.stringify(payload, null, 2));

    try {
      if (route.params?.coordenador) {
        await api.put(`/coordenadores/${cpf}`, payload);
        Alert.alert('Sucesso', 'Coordenador atualizado com sucesso!');
      } else {
        await api.post('/coordenadores', payload);
        Alert.alert('Sucesso', 'Coordenador cadastrado com sucesso!');
      }
      navigation.navigate('CoordenadorListScreen');
    } catch (error) {
      console.error('Erro ao salvar coordenador:', error.response?.data || error.message);

      const { message } = error.response?.data || {};
      let errorMessage = 'Erro ao salvar coordenador.';

      if (message?.includes('CPF')) {
        errorMessage = 'O CPF informado já está cadastrado.';
      } else if (message?.includes('Email')) {
        errorMessage = 'O email informado já está cadastrado.';
      } else if (message?.includes('cidade')) {
        errorMessage = 'O nome da cidade deve ter pelo menos 3 caracteres.';
      } else if (message?.includes('endereco')) {
        errorMessage = 'Um ou mais campos do endereço são inválidos.';
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

  const toggleSelection = (id, setId) => {
    setId(id === idCoordenacao ? '' : id);
  };

  return (
    <LayoutWrapper navigation={navigation} handleLogout={() => navigation.navigate('LoginScreen')}>
      <ScrollView style={styles.container}>
        <View>
          <Text style={styles.title}>Cadastro de Coordenador</Text>
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

        {/* CPF */}
        <Text style={styles.sectionTitle}>CPF *</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite o CPF"
          keyboardType="numeric"
          value={cpf}
          onChangeText={setCpf}
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


        {/* Endereços */}
        <Text style={styles.sectionTitle}>Endereços *</Text>
        {enderecos.map((endereco, index) => (
          <View key={index} style={styles.boxContainer}>
            {/* Botão de Remoção */}
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
                  // Atualizando a propriedade "estado" no endereço correto
                  const updatedEnderecos = [...enderecos];
                  updatedEnderecos[index] = {
                    ...updatedEnderecos[index],
                    estado: value,
                  };
                  setEnderecos(updatedEnderecos); // Atualiza o estado
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
        <Text style={styles.sectionTitle}>Telefones *</Text>
        {telefones.map((telefone, index) => (
          <View key={index} style={styles.boxContainer}>
            {/* Botão de Remoção */}
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


        {/* Seletor de Coordenação */}
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
              checked={idCoordenacao === item.id.toString()}
              onPress={() => toggleSelection(item.id.toString(), setIdCoordenacao)}
            />
          )}
        />

        {/* Botão de Salvar */}
        <View style={styles.saveButtonWrapper}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Salvar</Text>
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
  boxContainer: {
    position: 'relative', // Necessário para posicionar o botão de remoção
    backgroundColor: '#F9F9F9',
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
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
  inputDDD: {
    width: '25%', // Campo menor para o DDD
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    marginVertical: 4,
  },
  inputNumero: {
    width: '70%', // Campo maior para o número
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    marginVertical: 4,
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
  searchInput: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#DDD',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
});


export default CoordenadorCreateScreen;
