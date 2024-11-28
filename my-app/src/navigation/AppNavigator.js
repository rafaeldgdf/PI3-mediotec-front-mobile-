import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/login/LoginScreen';
import AlunoMenu from '../screens/GerenciamentoUsuarios/AlunoMenu';
import AlunoScreen from '../screens/GerenciamentoUsuarios/AlunoScreen';
import ProfessorMenu from '../screens/GerenciamentoUsuarios/ProfessorMenu';
import CoordenadorMenu from '../screens/GerenciamentoUsuarios/CoordenadorMenu';
import CoordenacaoListScreen from '../screens/GerenciamentoUsuarios/coordenacao/CoordenacaoListScreen';
import CoordenacaoCreateScreen from '../screens/GerenciamentoUsuarios/coordenacao/CoordenacaoCreateScreen';

const Stack = createStackNavigator();

const AppNavigator = ({ userType }) => {
  const initialRoute = userType
    ? userType === 'aluno'
      ? 'AlunoMenu'
      : userType === 'professor'
      ? 'ProfessorMenu'
      : 'CoordenadorMenu'
    : 'Login';

  return (
    <Stack.Navigator initialRouteName={initialRoute}>
      {/* Tela de Login */}
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />

      {/* Fluxo do Aluno */}
      <Stack.Screen
        name="AlunoMenu"
        component={AlunoMenu}
        options={{ title: 'Menu do Aluno', headerShown: true }}
      />
      <Stack.Screen
        name="AlunoScreen"
        component={AlunoScreen}
        options={{ title: 'Gerenciamento de Alunos', headerShown: true }}
      />

      {/* Fluxo do Professor */}
      <Stack.Screen
        name="ProfessorMenu"
        component={ProfessorMenu}
        options={{ title: 'Menu do Professor', headerShown: true }}
      />

      {/* Fluxo do Coordenador */}
      <Stack.Screen
        name="CoordenadorMenu"
        component={CoordenadorMenu}
        options={{ title: 'Menu do Coordenador', headerShown: true }}
      />
      <Stack.Screen
        name="CoordenacaoListScreen"
        component={CoordenacaoListScreen}
        options={{ title: 'Lista de Coordenações', headerShown: true }}
      />
      <Stack.Screen
        name="CoordenacaoCreateScreen"
        component={CoordenacaoCreateScreen}
        options={{ title: 'Cadastro de Coordenação', headerShown: true }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
