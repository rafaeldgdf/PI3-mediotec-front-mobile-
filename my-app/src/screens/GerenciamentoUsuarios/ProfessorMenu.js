import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ScrollView, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LayoutWrapper from '../../components/LayoutWrapper';

const ProfessorMenu = ({ navigation, handleLogout }) => {
  const menuItems = [
    { title: 'Presença', icon: 'check-circle', route: 'SelecaoTurmaDisciplinaScreen' },
    { title: 'Conceitos', icon: 'school', route: 'TurmaDisciplinaListConceitoScreen' },
    { title: 'Turmas', icon: 'class', route: 'TurmaListProfessorScreen' }, 
    { title: 'Comunicados', icon: 'email', route: 'ProfessorComunicadoListScreen' }
  ];

  return (
    <LayoutWrapper navigation={navigation} handleLogout={handleLogout}>
      {/* Título do Menu */}
      <Text style={styles.title}>Menu do Professor</Text>

      {/* Menu de Navegação */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.title}
            style={styles.menuButton}
            onPress={() => {
              if (item.route) {
                navigation.navigate(item.route);
              } else {
                console.warn(`Rota para "${item.title}" não configurada.`);
              }
            }}
          >
            <View style={styles.iconContainer}>
              <Icon name={item.icon} size={28} color="#FFFFFF" />
            </View>
            <Text style={styles.menuButtonText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </LayoutWrapper>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0056b3', // Azul do padrão SGE
    textAlign: 'center',
    marginVertical: 20,
    textTransform: 'uppercase',
    letterSpacing: 1, // Espaçamento entre letras para um toque moderno
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007BFF', // Azul padrão
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0056b3', // Azul escuro para destaque
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuButtonText: {
    fontSize: 18,
    color: '#FFFFFF', // Texto branco no botão
    fontWeight: '600',
    textTransform: 'capitalize', // Deixa o título com a primeira letra maiúscula
  },
});

export default ProfessorMenu;
