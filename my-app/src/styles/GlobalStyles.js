import { StyleSheet } from 'react-native';

export const GlobalStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F7F7F7', // Fundo claro para uma aparência limpa
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007BFF', // Azul do SGE
    marginBottom: 15,
    textAlign: 'center',
  },
  menuButton: {
    backgroundColor: '#007BFF', // Azul para botões principais
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  menuButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#F8B400', // Amarelo para destaque
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  buttonSecondary: {
    backgroundColor: '#00C851', // Verde para ações secundárias
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CED4DA', // Cinza claro para inputs
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#495057', // Cinza escuro para texto
    backgroundColor: '#FFF',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#CED4DA', // Cinza claro para barra de pesquisa
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  pickerContainer: {
    marginVertical: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 8,
    backgroundColor: '#FFF',
  },
  card: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007BFF', // Azul para títulos principais
  },
  cardText: {
    fontSize: 16,
    color: '#333', // Texto escuro para legibilidade
  },
  navbar: {
    backgroundColor: '#007BFF', // Azul do SGE para o cabeçalho
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  navbarLogo: {
    width: 40,
    height: 40,
    marginRight: 10,
    resizeMode: 'contain',
  },
  navbarTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  navbarButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navbarIcon: {
    color: '#FFF',
    fontSize: 24,
  },
  cardEmpty: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardEmptyText: {
    fontSize: 16,
    color: '#777',
  },
});

