import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import * as Font from 'expo-font';
import MainNavigator from './src/navigation/MainNavigator';

const App = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const loadFonts = async () => {
    try {
      await Font.loadAsync({
        MaterialIcons: require('react-native-vector-icons/Fonts/MaterialIcons.ttf'),
        FontAwesome: require('react-native-vector-icons/Fonts/FontAwesome.ttf'),
        // Adicione outras fontes usadas no app, se necessário.
      });
      setFontsLoaded(true); // Marca as fontes como carregadas
    } catch (err) {
      console.error('Erro ao carregar fontes:', err);
    }
  };

  useEffect(() => {
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return <MainNavigator />;
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F4F4', // Cor de fundo durante o carregamento
  },
});

export default App;
