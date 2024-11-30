import React, { useState, useEffect } from 'react'; // IMPORTANTE: Adicionando os imports
import { BackHandler, Alert } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack'; // IMPORTANTE: Corrigindo o import
import { NavigationContainer, CommonActions } from '@react-navigation/native';
import { navigationRef } from './navigationRef';
import LoginScreen from '../screens/login/LoginScreen';
import AlunoMenu from '../screens/GerenciamentoUsuarios/AlunoMenu';
import ProfessorMenu from '../screens/GerenciamentoUsuarios/ProfessorMenu';
import CoordenadorMenu from '../screens/GerenciamentoUsuarios/CoordenadorMenu';
import CoordenacaoListScreen from '../screens/GerenciamentoUsuarios/coordenacao/CoordenacaoListScreen';
import CoordenacaoCreateScreen from '../screens/GerenciamentoUsuarios/coordenacao/CoordenacaoCreateScreen';
import CoordenacaoDetalhesScreen from '../screens/GerenciamentoUsuarios/coordenacao/CoordenacaoDetalhesScreen';
import CoordenadorListScreen from '../screens/GerenciamentoUsuarios/coordenador/CoordenadorListScreen';
import CoordenadorCreateScreen from '../screens/GerenciamentoUsuarios/coordenador/CoordenadorCreateScreen';
import CoordenadorDetalhesScreen from '../screens/GerenciamentoUsuarios/coordenador/CoordenadorDetalhesScreen';
import ProfessorListScreen from '../screens/GerenciamentoUsuarios/professor/ProfessorListScreen';
import ProfessorCreateScreen from '../screens/GerenciamentoUsuarios/professor/ProfessorCreateScreen';
import ProfessorDetalhesScreen from '../screens/GerenciamentoUsuarios/professor/ProfessorDetalhesScreen';
import AlunoListScreen from '../screens/GerenciamentoUsuarios/aluno/AlunoListScreen';
import AlunoCreateScreen from '../screens/GerenciamentoUsuarios/aluno/AlunoCreateScreen';
import AlunoDetalhesScreen from '../screens/GerenciamentoUsuarios/aluno/AlunoDetalhesScreen';
import TurmaListScreen from '../screens/GerenciamentoAcademico/turma/TurmaListScreen';
import TurmaCreateScreen from '../screens/GerenciamentoAcademico/turma/TurmaCreateScreen';
import TurmaDetalhesScreen from '../screens/GerenciamentoAcademico/turma/TurmaDetalhesScreen';
import DisciplinaListScreen from '../screens/GerenciamentoAcademico/disciplina/DisciplinaListScreen';
import DisciplinaCreateScreen from '../screens/GerenciamentoAcademico/disciplina/DisciplinaCreateScreen';
import DisciplinaDetalhesScreen from '../screens/GerenciamentoAcademico/disciplina/DisciplinaDetalhesScreen';
import CoordenadorComunicadoCreateScreen from '../screens/GerenciamentoAcademico/comunicado/coordenador/CoordenadorComunicadoCreateScreen';
import CoordenadorComunicadoListScreen from '../screens/GerenciamentoAcademico/comunicado/coordenador/CoordenadorComunicadoListScreen';
import CoordenadorComunicadoDetalhesScreen from '../screens/GerenciamentoAcademico/comunicado/coordenador/CoordenadorComunicadoDetalhesScreen'; // Adicione os imports para as telas de comunicado


const Stack = createStackNavigator();


const MainNavigator = () => {
  const [userType, setUserType] = useState(null);


  // Função para login
  const handleLogin = (type) => {
    setUserType(type);
    navigationRef.current?.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Menu' }],
      })
    );
  };


  // Função para logout
  const handleLogout = () => {
    setUserType(null); // Reseta o tipo de usuário
    navigationRef.current?.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'LoginScreen' }], // Reseta para a tela de login
      })
    );
  };


  // Configuração do botão "Voltar" do Android
  useEffect(() => {
    const backAction = () => {
      if (!navigationRef.current?.canGoBack()) {
        Alert.alert('Confirmação', 'Deseja realmente sair?', [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Sair', onPress: handleLogout },
        ]);
        return true;
      }
      navigationRef.current?.goBack();
      return true;
    };


    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );


    return () => backHandler.remove();
  }, []);


  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator>
        {/* Tela de Login */}
        <Stack.Screen
          name="LoginScreen"
          options={{ headerShown: false }}
        >
          {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
        </Stack.Screen>


        {/* Tela genérica de Menu */}
        <Stack.Screen
          name="Menu"
          options={{ headerShown: false }}
        >
          {(props) => {
            switch (userType) {
              case 'aluno':
                return <AlunoMenu {...props} handleLogout={handleLogout} />;
              case 'professor':
                return <ProfessorMenu {...props} handleLogout={handleLogout} />;
              case 'coordenador':
                return <CoordenadorMenu {...props} handleLogout={handleLogout} />;
              default:
                // Esse logout aqui pode causar o erro. Substitua para evitar loop
                return (
                  <View>
                    <Text>Erro: tipo de usuário desconhecido.</Text>
                  </View>
                );
            }
          }}
        </Stack.Screen>


        {/* Telas de Menu */}
        <Stack.Screen
          name="CoordenadorMenu"
          component={CoordenadorMenu}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AlunoMenu"
          component={AlunoMenu}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProfessorMenu"
          component={ProfessorMenu}
          options={{ headerShown: false }}
        />


        {/* Telas de Coordenação */}
        <Stack.Screen
          name="CoordenacaoListScreen"
          component={CoordenacaoListScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CoordenacaoCreateScreen"
          component={CoordenacaoCreateScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CoordenacaoDetalhesScreen"
          component={CoordenacaoDetalhesScreen}
          options={{ headerShown: false }}
        />


        {/* Telas de Coordenador */}
        <Stack.Screen
          name="CoordenadorListScreen"
          component={CoordenadorListScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CoordenadorCreateScreen"
          component={CoordenadorCreateScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CoordenadorDetalhesScreen"
          component={CoordenadorDetalhesScreen}
          options={{ headerShown: false }}
        />


        {/* Telas de Professor */}
        <Stack.Screen
          name="ProfessorListScreen"
          component={ProfessorListScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProfessorCreateScreen"
          component={ProfessorCreateScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProfessorDetalhesScreen"
          component={ProfessorDetalhesScreen}
          options={{ headerShown: false }}
        />


        {/* Telas de Aluno */}
        <Stack.Screen
          name="AlunoListScreen"
          component={AlunoListScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AlunoCreateScreen"
          component={AlunoCreateScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AlunoDetalhesScreen"
          component={AlunoDetalhesScreen}
          options={{ headerShown: false }}
        />


        {/* Telas de Turma */}
        <Stack.Screen
          name="TurmaListScreen"
          component={TurmaListScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TurmaCreateScreen"
          component={TurmaCreateScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TurmaDetalhesScreen"
          component={TurmaDetalhesScreen}
          options={{ headerShown: false }}
        />


        {/* Telas de Disciplina */}
        <Stack.Screen
          name="DisciplinaListScreen"
          component={DisciplinaListScreen}
          options={{ headerShown: false }}
        />


        <Stack.Screen
          name="DisciplinaCreateScreen"
          component={DisciplinaCreateScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DisciplinaDetalhesScreen"
          component={DisciplinaDetalhesScreen}
          options={{ headerShown: false }}
        />
        
        {/* Telas de Comunicados */}
        <Stack.Screen
          name="ComunicadoCreateScreen"
          component={CoordenadorComunicadoCreateScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CoordenadorComunicadoListScreen"
          component={CoordenadorComunicadoListScreen}
          initialParams={{ coordenadorCpf: 'cpfPadrao' }}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CoordenadorComunicadoDetalhesScreen"
          component={CoordenadorComunicadoDetalhesScreen}
          options={{ headerShown: false }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );

};

export default MainNavigator;