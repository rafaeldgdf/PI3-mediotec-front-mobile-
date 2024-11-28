import React from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const LayoutWrapper = ({ children, navigation, handleLogout }) => {
  const confirmLogout = () => {
    Alert.alert(
      'Confirmação',
      'Você deseja realmente sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          onPress: handleLogout, // Garante o reset para a tela de login
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../../assets/logo-sge.png')}
          style={styles.logo}
        />

      </View>

      <View style={styles.content}>{children}</View>

      <View style={styles.navbar}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Menu')}
        >
          <Icon name="home" size={24} color="#007BFF" />
          <Text style={styles.navText}>Início</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Perfil')}
        >
          <Icon name="person" size={24} color="#007BFF" />
          <Text style={styles.navText}>Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Configuracoes')}
        >
          <Icon name="settings" size={24} color="#007BFF" />
          <Text style={styles.navText}>Configurações</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={confirmLogout}>
          <Icon name="exit-to-app" size={24} color="#FF3B30" />
          <Text style={[styles.navText, { color: '#FF3B30' }]}>Sair</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  header: {
    height: 70,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    height: 40,
    resizeMode: 'contain',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  navbar: {
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingHorizontal: 5,
  },
  navItem: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  navText: {
    fontSize: 12,
    marginTop: 5,
    color: '#007BFF',
    fontWeight: 'bold',
  },
});

export default LayoutWrapper;
