import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LayoutWrapper from '../../components/LayoutWrapper';

const FinanceiroScreen = ({ navigation }) => {
  return (
    <LayoutWrapper navigation={navigation}>
      <View style={styles.container}>
        {/* Imagem de Fundo e Texto */}
        <View style={styles.infoContainer}>
          <Image
            source={{ uri: 'https://img.freepik.com/free-vector/online-payment-concept-illustration_114360-153.jpg' }}
            style={styles.image}
          />
          <Text style={styles.infoText}>
            Para acessar todos os detalhes de suas faturas e realizar pagamentos, utilize o sistema financeiro.
          </Text>
        </View>

        {/* Botão de Redirecionamento */}
        <TouchableOpacity
          style={styles.redirectButton}
          onPress={() => Alert.alert('Redirecionamento', 'Você será direcionado para o sistema financeiro.')}
        >
          <Icon name="open-in-new" size={20} color="#FFF" />
          <Text style={styles.redirectButtonText}>Acessar Sistema Financeiro</Text>
        </TouchableOpacity>
      </View>
    </LayoutWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 300,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
    marginHorizontal: 20,
  },
  redirectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007BFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
  },
  redirectButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default FinanceiroScreen;
