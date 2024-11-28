import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LayoutWrapper from '../../components/LayoutWrapper';

const ProfessorMenu = ({ navigation, handleLogout }) => {
  return (
    <LayoutWrapper navigation={navigation} handleLogout={handleLogout}>
      <Text style={styles.title}>Menu do Professor</Text>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => navigation.navigate('Presenca')}
      >
        <Icon name="check-circle" size={24} color="#FFF" style={styles.icon} />
        <Text style={styles.menuButtonText}>Presença</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => navigation.navigate('Conceitos')}
      >
        <Icon name="school" size={24} color="#FFF" style={styles.icon} />
        <Text style={styles.menuButtonText}>Conceitos</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => navigation.navigate('Comunicados')}
      >
        <Icon name="email" size={24} color="#FFF" style={styles.icon} />
        <Text style={styles.menuButtonText}>Comunicados</Text>
      </TouchableOpacity>
    </LayoutWrapper>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007BFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
  },
  menuButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  icon: {
    marginRight: 10,
  },
});

export default ProfessorMenu;
